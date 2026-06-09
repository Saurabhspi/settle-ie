const { Pinecone } = require('@pinecone-database/pinecone');
const { scrapeAll } = require('./scraper');
require('dotenv').config();

// Initialise Pinecone client
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

let embedder = null;

/**
 * Loads the local embedding model (downloads on first run ~25MB)
 * Uses all-MiniLM-L6-v2 — a fast, lightweight model perfect for RAG
 * Produces 384-dimension vectors
 */
const loadEmbedder = async () => {
  if (embedder) return embedder;

  console.log('📦 Loading local embedding model...');
  console.log('(First run downloads ~25MB — please wait)\n');

  const { pipeline } = await import('@xenova/transformers');
  embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

  console.log('✅ Local embedding model loaded!\n');
  return embedder;
};

/**
 * Converts text to a vector using the local model
 * Returns an array of 384 numbers
 */
const embedText = async (text) => {
  const pipe = await loadEmbedder();
  const output = await pipe(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
};

/**
 * Splits array into batches
 */
const batchArray = (arr, size) => {
  const batches = [];
  for (let i = 0; i < arr.length; i += size) {
    batches.push(arr.slice(i, i + size));
  }
  return batches;
};

/**
 * Main ingestion function
 * Scrapes → Embeds locally → Stores in Pinecone
 */
const ingest = async () => {
  try {
    console.log('🚀 Starting ingestion pipeline...\n');

    // Step 1 — Scrape all Irish gov pages
    console.log('📡 Step 1: Scraping Irish government websites...');
    const chunks = await scrapeAll();

    if (chunks.length === 0) {
      console.error('❌ No chunks scraped. Check your internet connection.');
      return;
    }

    // Step 2 — Connect to Pinecone index
    console.log('\n🔌 Step 2: Connecting to Pinecone...');
    const index = pinecone.index(process.env.PINECONE_INDEX);
    console.log('✅ Connected to Pinecone index:', process.env.PINECONE_INDEX);

    // Step 3 — Embed each chunk locally
    console.log('\n🧠 Step 3: Generating embeddings locally...');
    const vectors = [];

    for (const chunk of chunks) {
      try {
        const embedding = await embedText(chunk.text);
        vectors.push({
          id: chunk.id,
          values: embedding,
          metadata: {
            text: chunk.text,
            topic: chunk.topic,
            source_url: chunk.source_url,
          },
        });
        process.stdout.write('.');
      } catch (err) {
        console.error(`\n❌ Failed to embed chunk ${chunk.id}:`, err.message);
      }
    }

    console.log(`\n✅ Generated ${vectors.length} embeddings`);

    // Step 4 — Upload to Pinecone in batches
    console.log('\n📤 Step 4: Uploading to Pinecone...');
    const batches = batchArray(vectors, 100);

    for (const batch of batches) {
      await index.upsert(batch);
      console.log(`✅ Uploaded batch of ${batch.length} vectors`);
    }

    console.log('\n🎉 Ingestion complete!');
    console.log(`📊 Total vectors stored: ${vectors.length}`);

  } catch (err) {
    console.error('❌ Ingestion failed:', err.message);
    console.error(err);
  }
};

ingest();
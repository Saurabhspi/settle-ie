const { Pinecone } = require('@pinecone-database/pinecone');
const Groq = require('groq-sdk');
require('dotenv').config();

// Initialise Groq client — free and fast
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Initialise Pinecone client
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

let embedder = null;

/**
 * Loads the local embedding model
 * Must match the model used during ingestion
 */
const loadEmbedder = async () => {
  if (embedder) return embedder;
  const { pipeline } = await import('@xenova/transformers');
  embedder = await pipeline(
    'feature-extraction',
    'Xenova/all-MiniLM-L6-v2'
  );
  return embedder;
};

/**
 * Converts the user's question into a vector
 */
const embedQuery = async (text) => {
  const pipe = await loadEmbedder();
  const output = await pipe(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
};

/**
 * Searches Pinecone for the most relevant chunks
 */
const searchKnowledgeBase = async (query) => {
  const index = pinecone.index(process.env.PINECONE_INDEX);
  const queryEmbedding = await embedQuery(query);

  const results = await index.query({
    vector: queryEmbedding,
    topK: 5,
    includeMetadata: true,
  });

  return results.matches;
};

/**
 * Main RAG function — answers a question using the knowledge base
 */
const askQuestion = async (question, chatHistory = []) => {
  try {
    // Step 1 — Find relevant chunks from Pinecone
    console.log('🔍 Searching knowledge base...');
    const relevantChunks = await searchKnowledgeBase(question);

    if (relevantChunks.length === 0) {
      return {
        answer: "I couldn't find relevant information about that. Please try rephrasing your question or visit citizensinformation.ie directly.",
        sources: [],
      };
    }

    // Step 2 — Build context from retrieved chunks
    const context = relevantChunks
      .map((match, i) => `[Source ${i + 1}]: ${match.metadata.text}`)
      .join('\n\n');

    // Step 3 — Get unique source URLs
    const sources = [
      ...new Set(
        relevantChunks.map(match => match.metadata.source_url)
      )
    ].filter(Boolean);

    console.log(`📚 Found ${relevantChunks.length} relevant chunks`);
    console.log(`🔗 Sources: ${sources.join(', ')}`);

    // Step 4 — Build the system prompt
    const systemPrompt = `You are Fáilte, a friendly AI assistant helping people relocate to Ireland.
Your name "Fáilte" means "Welcome" in Irish — and that is exactly what you do, welcome people to Ireland.
You answer questions about Irish bureaucracy, government services, and relocation.

IMPORTANT RULES:
- Answer ONLY using the provided context below
- If the context does not contain enough information say so honestly
- Keep answers clear, helpful and concise
- Be encouraging and supportive
- Use numbered lists and bold text where appropriate to make answers easy to read

CONTEXT FROM IRISH GOVERNMENT SOURCES:
${context}`;

    // Step 5 — Build messages array
    const messages = [
      { role: 'system', content: systemPrompt },
      ...chatHistory.slice(-6),
      { role: 'user', content: question },
    ];

    // Step 6 — Generate answer using Groq (free and fast)
    console.log('🤖 Generating answer with Groq...');
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant', // free Llama 3 model via Groq
      messages,
      max_tokens: 500,
      temperature: 0.3,
    });

    const answer = completion.choices[0].message.content;
    console.log('✅ Answer generated');

    return { answer, sources };

  } catch (err) {
    console.error('RAG error:', err.message);
    throw err;
  }
};

module.exports = { askQuestion };
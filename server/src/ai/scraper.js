const axios = require('axios');
const cheerio = require('cheerio');

// Irish government pages to scrape
const SOURCES = [
  {
    url: 'https://www.citizensinformation.ie/en/social-welfare/irish-social-welfare-system/personal-public-service-number/',
    topic: 'pps_number',
  },
  {
    url: 'https://www.citizensinformation.ie/en/moving-country/moving-to-ireland/rights-of-residence-in-ireland/registration-of-non-eea-nationals-in-ireland/',
    topic: 'irp_card',
  },
  {
    url: 'https://www.citizensinformation.ie/en/money-and-tax/tax/income-tax/how-your-tax-is-calculated/',
    topic: 'tax_registration',
  },
  {
    url: 'https://www.citizensinformation.ie/en/health/medical-cards-and-gp-visit-cards/medical-card/',
    topic: 'medical_card',
  },
  {
    url: 'https://www.citizensinformation.ie/en/travel-and-recreation/motoring/driver-licensing/full-driving-licence/',
    topic: 'driving_licence',
  },
  {
    url: 'https://www.citizensinformation.ie/en/education/primary-and-post-primary-education/going-to-primary-school/choosing-a-primary-school/',
    topic: 'school_enrolment',
  },
];

/**
 * Fetches a single URL and extracts clean text from it
 */
const scrapePage = async (source) => {
  try {
    console.log(`Scraping: ${source.url}`);

    const response = await axios.get(source.url, {
      headers: {
        // Pretend to be a browser so the site doesn't block us
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 10000, // 10 second timeout
    });

    // Load the HTML into cheerio (like jQuery for Node.js)
    const $ = cheerio.load(response.data);

    // Remove elements we don't want
    $('nav').remove();
    $('header').remove();
    $('footer').remove();
    $('script').remove();
    $('style').remove();
    $('.cookie-banner').remove();

    // Extract the main content text
    const text = $('main, article, .article-body, body')
      .first()
      .text()
      .replace(/\s+/g, ' ')  // collapse multiple spaces into one
      .replace(/\n+/g, ' ')  // collapse newlines into spaces
      .trim();

    console.log(`✅ Scraped ${text.length} characters from ${source.topic}`);

    return {
      topic: source.topic,
      url: source.url,
      text,
    };
  } catch (err) {
    console.error(`❌ Failed to scrape ${source.url}:`, err.message);
    return null;
  }
};

/**
 * Splits a long text into smaller overlapping chunks
 * Each chunk is ~500 words with 50 word overlap
 */
const chunkText = (text, chunkSize = 500, overlap = 50) => {
  const words = text.split(' ');
  const chunks = [];

  let i = 0;
  while (i < words.length) {
    // Take chunkSize words starting from position i
    const chunk = words.slice(i, i + chunkSize).join(' ');
    if (chunk.trim().length > 50) { // skip tiny chunks
      chunks.push(chunk);
    }
    // Move forward by chunkSize minus overlap
    // This means chunks share 50 words with the next chunk
    // So we never cut a thought in half at a chunk boundary
    i += chunkSize - overlap;
  }

  return chunks;
};

/**
 * Main function — scrapes all sources and returns chunks
 */
const scrapeAll = async () => {
  const allChunks = [];

  for (const source of SOURCES) {
    const result = await scrapePage(source);
    if (!result) continue;

    const chunks = chunkText(result.text);
    console.log(`📄 ${result.topic}: ${chunks.length} chunks`);

    chunks.forEach((chunk, index) => {
      allChunks.push({
        id: `${result.topic}_${index}`,
        text: chunk,
        topic: result.topic,
        source_url: result.url,
      });
    });
  }

  console.log(`\n✅ Total chunks ready: ${allChunks.length}`);
  return allChunks;
};

module.exports = { scrapeAll };
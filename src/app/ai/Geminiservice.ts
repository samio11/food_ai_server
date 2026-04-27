import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../config';

// ── Client setup ─────────────────────────────────────────────────────────────

if (!config.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is missing in .env');
}

const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

// ── Table schema context ──────────────────────────────────────────────────────

const TABLE_SCHEMA = `
Table name: food (in PostgreSQL)
Columns:
  - id                INT (primary key)
  - name              VARCHAR  (e.g. "Beef Tenderloin", "Margherita Pizza")
  - category          VARCHAR  (e.g. "Main Course", "Appetizer", "Dessert", "Pizza", "Burger", "Sushi")
  - cuisine           VARCHAR  (e.g. "Italian", "Indian", "Chinese", "Thai", "American")
  - description       TEXT
  - price             DECIMAL
  - discount_percent  INT      (0, 5, 10, 15, 20)
  - discounted_price  DECIMAL
  - calories          INT
  - prep_time_minutes INT
  - spice_level       VARCHAR  ("None" | "Mild" | "Medium" | "Hot" | "Extra Hot")
  - dietary_tag       VARCHAR  ("Vegan" | "Vegetarian" | "Gluten-Free" | "Halal" | "Keto" | "Low-Carb" | "None")
  - rating            DECIMAL  (3.5 to 5.0)
  - review_count      INT
  - is_available      VARCHAR  ("Available" | "Sold Out")
  - is_featured       VARCHAR  ("Yes" | "No")
  - is_new            VARCHAR  ("Yes" | "No")
  - image_url         TEXT
  - created_at        DATE
`;

// ── Types ─────────────────────────────────────────────────────────────────────

export interface GeminiSQLResult {
    sql: string;
    isValid: boolean;
}

// ── Helper: Retry logic for 429s ──────────────────────────────────────────────
async function generateWithRetry(prompt: string, retries = 3, delay = 2000): Promise<any> {
    for (let i = 0; i < retries; i++) {
        try {
            return await model.generateContent(prompt);
        } catch (error: any) {
            if (error?.message?.includes('429') && i < retries - 1) {
                console.warn(`⚠️ Gemini 429 detected. Retrying in ${delay}ms... (Attempt ${i + 1}/${retries})`);
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2; // Exponential backoff
                continue;
            }
            throw error;
        }
    }
}

// ── Step 1: Natural language → SQL ────────────────────────────────────────────

export async function generateSQL(userMessage: string): Promise<GeminiSQLResult> {
    const prompt = `
You are a PostgreSQL expert. Convert the user's natural language question into a valid PostgreSQL SELECT query.

${TABLE_SCHEMA}

Rules:
- Only generate SELECT queries (no INSERT, UPDATE, DELETE)
- Use ILIKE for case-insensitive name/text searches
- Always add LIMIT 20 unless user asks for all or specifies a number
- Return ONLY the raw SQL query, no explanation, no markdown, no backticks
- If the question is not related to food data, return exactly: NOT_FOOD_QUERY

User question: "${userMessage}"

SQL:`;

    const result = await generateWithRetry(prompt);
    const sql = result.response.text().trim();

    return {
        sql,
        isValid: sql !== 'NOT_FOOD_QUERY',
    };
}

// ── Step 2: DB results → human-friendly answer ────────────────────────────────

export async function generateAnswer(
    userMessage: string,
    sqlQuery: string,
    dbResults: object[]
): Promise<string> {
    const hasResults = dbResults.length > 0;

    const prompt = `
You are a helpful restaurant assistant. The user asked a question about food items.

User question: "${userMessage}"

SQL that was run: ${sqlQuery}

Database results (${dbResults.length} rows found):
${hasResults ? JSON.stringify(dbResults, null, 2) : 'No results found.'}

Instructions:
- Answer the user's question naturally and helpfully based on the database results
- If results were found, summarize the key details (name, price, availability, rating, calories etc.)
- If no results were found, say so clearly and suggest similar alternatives if possible
- Keep the tone friendly and concise
- Format prices with $ sign and 2 decimal places
- Do not mention SQL or databases in your response
`;

    const result = await generateWithRetry(prompt);
    return result.response.text().trim();
}
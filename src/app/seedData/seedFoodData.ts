import { Client } from 'pg';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse';

// ── Types ─────────────────────────────────────────────────
interface FoodRow {
    id: string;
    name: string;
    category: string;
    cuisine: string;
    description: string;
    price: string;
    discount_percent: string;
    discounted_price: string;
    calories: string;
    prep_time_minutes: string;
    spice_level: string;
    dietary_tag: string;
    rating: string;
    review_count: string;
    is_available: string;
    is_featured: string;
    is_new: string;
    image_url: string;
    created_at: string;
}

// ── Create table SQL ──────────────────────────────────────
const CREATE_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS food (
  id                INT           PRIMARY KEY,
  name              VARCHAR(150)  NOT NULL,
  category          VARCHAR(50),
  cuisine           VARCHAR(50),
  description       TEXT,
  price             DECIMAL(10,2),
  discount_percent  INT           DEFAULT 0,
  discounted_price  DECIMAL(10,2),
  calories          INT,
  prep_time_minutes INT,
  spice_level       VARCHAR(20),
  dietary_tag       VARCHAR(30),
  rating            DECIMAL(3,1),
  review_count      INT           DEFAULT 0,
  is_available      VARCHAR(20)   DEFAULT 'Available',
  is_featured       VARCHAR(5)    DEFAULT 'No',
  is_new            VARCHAR(5)    DEFAULT 'No',
  image_url         TEXT,
  created_at        DATE
);
`;

// ── Helpers ───────────────────────────────────────────────
const parseCSV = (filePath: string): Promise<FoodRow[]> => {
    return new Promise((resolve, reject) => {
        const rows: FoodRow[] = [];
        fs.createReadStream(filePath)
            .pipe(parse({ columns: true, trim: true, skip_empty_lines: true }))
            .on('data', (row: FoodRow) => rows.push(row))
            .on('end', () => resolve(rows))
            .on('error', reject);
    });
};

const val = (v: string | undefined): string | null =>
    v === '' || v === undefined ? null : v;

const num = (v: string | undefined): number | null =>
    v === '' || v === undefined || v === null ? null : Number(v);

// ── Exported seed function ────────────────────────────────
export const seedData = async (): Promise<void> => {
    const DATABASE_URL = process.env.DATABASE_URL;

    if (!DATABASE_URL) {
        console.warn('⚠️  DATABASE_URL not set — skipping seed');
        return;
    }

    const CSV_PATH = path.join(__dirname, 'food_items.csv');

    // Skip silently if CSV doesn't exist (production safe)
    if (!fs.existsSync(CSV_PATH)) {
        console.warn('⚠️  food_items.csv not found — skipping seed');
        return;
    }

    const client = new Client({
        connectionString: DATABASE_URL,
        ssl: { rejectUnauthorized: false },
    });

    try {
        console.log('\n🌱 Starting seed...');
        await client.connect();

        // Create table
        await client.query(CREATE_TABLE_SQL);
        console.log('✅ Table ready');

        // Check if already seeded
        const { rows: existing } = await client.query<{ count: string }>(
            'SELECT COUNT(*) FROM food'
        );
        if (parseInt(existing[0].count) > 0) {
            console.log(`ℹ️  Table already has ${existing[0].count} rows — skipping seed\n`);
            return;
        }

        // Parse CSV
        const rows = await parseCSV(CSV_PATH);
        console.log(`📂 ${rows.length} rows found in CSV`);

        // Insert in batches
        const BATCH_SIZE = 50;
        let inserted = 0;
        let skipped = 0;

        for (let i = 0; i < rows.length; i += BATCH_SIZE) {
            const batch = rows.slice(i, i + BATCH_SIZE);

            for (const row of batch) {
                try {
                    await client.query(
                        `INSERT INTO food (
              id, name, category, cuisine, description,
              price, discount_percent, discounted_price,
              calories, prep_time_minutes, spice_level, dietary_tag,
              rating, review_count, is_available, is_featured, is_new,
              image_url, created_at
            ) VALUES (
              $1,$2,$3,$4,$5,
              $6,$7,$8,
              $9,$10,$11,$12,
              $13,$14,$15,$16,$17,
              $18,$19
            )
            ON CONFLICT (id) DO NOTHING`,
                        [
                            num(row.id), val(row.name),
                            val(row.category), val(row.cuisine),
                            val(row.description), num(row.price),
                            num(row.discount_percent), num(row.discounted_price),
                            num(row.calories), num(row.prep_time_minutes),
                            val(row.spice_level), val(row.dietary_tag),
                            num(row.rating), num(row.review_count),
                            val(row.is_available), val(row.is_featured),
                            val(row.is_new), val(row.image_url),
                            val(row.created_at) ?? null,
                        ]
                    );
                    inserted++;
                } catch (err: unknown) {
                    const message = err instanceof Error ? err.message : String(err);
                    console.warn(`⚠️  Skipped row id=${row.id}: ${message}`);
                    skipped++;
                }
            }

            const done = Math.min(i + BATCH_SIZE, rows.length);
            process.stdout.write(`\r   Progress: ${done}/${rows.length} rows...`);
        }

        console.log(`\n✅ Seed complete — inserted: ${inserted}, skipped: ${skipped}\n`);

    } finally {
        // Always disconnect, even if something throws
        await client.end();
    }
};
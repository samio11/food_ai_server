"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedData = void 0;
const pg_1 = require("pg");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const csv_parse_1 = require("csv-parse");
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
const parseCSV = (filePath) => {
    return new Promise((resolve, reject) => {
        const rows = [];
        fs_1.default.createReadStream(filePath)
            .pipe((0, csv_parse_1.parse)({ columns: true, trim: true, skip_empty_lines: true }))
            .on('data', (row) => rows.push(row))
            .on('end', () => resolve(rows))
            .on('error', reject);
    });
};
const val = (v) => v === '' || v === undefined ? null : v;
const num = (v) => v === '' || v === undefined || v === null ? null : Number(v);
// ── Exported seed function ────────────────────────────────
const seedData = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const DATABASE_URL = process.env.DATABASE_URL;
    if (!DATABASE_URL) {
        console.warn('⚠️  DATABASE_URL not set — skipping seed');
        return;
    }
    const CSV_PATH = path_1.default.join(__dirname, 'food_items.csv');
    // Skip silently if CSV doesn't exist (production safe)
    if (!fs_1.default.existsSync(CSV_PATH)) {
        console.warn('⚠️  food_items.csv not found — skipping seed');
        return;
    }
    const client = new pg_1.Client({
        connectionString: DATABASE_URL,
        ssl: { rejectUnauthorized: false },
    });
    try {
        console.log('\n🌱 Starting seed...');
        yield client.connect();
        // Create table
        yield client.query(CREATE_TABLE_SQL);
        console.log('✅ Table ready');
        // Check if already seeded
        const { rows: existing } = yield client.query('SELECT COUNT(*) FROM food');
        if (parseInt(existing[0].count) > 0) {
            console.log(`ℹ️  Table already has ${existing[0].count} rows — skipping seed\n`);
            return;
        }
        // Parse CSV
        const rows = yield parseCSV(CSV_PATH);
        console.log(`📂 ${rows.length} rows found in CSV`);
        // Insert in batches
        const BATCH_SIZE = 50;
        let inserted = 0;
        let skipped = 0;
        for (let i = 0; i < rows.length; i += BATCH_SIZE) {
            const batch = rows.slice(i, i + BATCH_SIZE);
            for (const row of batch) {
                try {
                    yield client.query(`INSERT INTO food (
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
            ON CONFLICT (id) DO NOTHING`, [
                        num(row.id), val(row.name),
                        val(row.category), val(row.cuisine),
                        val(row.description), num(row.price),
                        num(row.discount_percent), num(row.discounted_price),
                        num(row.calories), num(row.prep_time_minutes),
                        val(row.spice_level), val(row.dietary_tag),
                        num(row.rating), num(row.review_count),
                        val(row.is_available), val(row.is_featured),
                        val(row.is_new), val(row.image_url),
                        (_a = val(row.created_at)) !== null && _a !== void 0 ? _a : null,
                    ]);
                    inserted++;
                }
                catch (err) {
                    const message = err instanceof Error ? err.message : String(err);
                    console.warn(`⚠️  Skipped row id=${row.id}: ${message}`);
                    skipped++;
                }
            }
            const done = Math.min(i + BATCH_SIZE, rows.length);
            process.stdout.write(`\r   Progress: ${done}/${rows.length} rows...`);
        }
        console.log(`\n✅ Seed complete — inserted: ${inserted}, skipped: ${skipped}\n`);
    }
    finally {
        // Always disconnect, even if something throws
        yield client.end();
    }
});
exports.seedData = seedData;

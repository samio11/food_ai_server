import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
  PORT: process.env.PORT,
  DATABASE: process.env.DATABASE_URL,
  NODE_ENV: process.env.NODE_ENV,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
};
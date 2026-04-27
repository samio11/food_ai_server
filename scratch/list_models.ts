import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

async function listModels() {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
        // This is a bit tricky since the SDK doesn't have a direct listModels in the same way the REST API does easily
        // But we can try to hit the REST API directly
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        const data = await response.json();
        console.log(data.models.map((m: any) => m.name));
    } catch (error) {
        console.error(error);
    }
}

listModels();

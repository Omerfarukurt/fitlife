import { GoogleGenAI } from "@google/genai";
import fs from 'fs';
import path from 'path';

async function checkModels() {
    let apiKey = process.env.GEMINI_API_KEY || process.env.VITE_API_KEY;

    if (!apiKey) {
        // Try to read from .env.local or .env
        const envFiles = ['.env.local', '.env'];
        for (const file of envFiles) {
            try {
                const content = fs.readFileSync(path.resolve(process.cwd(), file), 'utf-8');
                const lines = content.split('\n');
                for (const line of lines) {
                    if (line.startsWith('VITE_API_KEY=') || line.startsWith('GEMINI_API_KEY=')) {
                        apiKey = line.split('=')[1].trim().replace(/"/g, '');
                        break;
                    }
                }
            } catch (e) {
                // Ignore missing files
            }
            if (apiKey) break;
        }
    }

    if (!apiKey) {
        console.error("Could not find API KEY in environment or .env files.");
        return;
    }

    console.log("Using API Key ending in: ..." + apiKey.slice(-4));

    try {
        const ai = new GoogleGenAI({ apiKey: apiKey });
        // Note: The new SDK structure might differ, checking standard listModels or similar
        // The previous error message suggested "models/... is not found... Call ListModels"

        // For @google/genai, it seems we use models.list()
        const response = await ai.models.list();

        console.log("Available Models:");
        // response might be an async iterable or contain a list
        // Check structure based on SDK version, assuming it returns an object with models property or is iterable

        // If response is iterable (common in google sdks)
        for await (const model of response) {
            console.log(`- ${model.name} (${model.displayName})`);
        }

    } catch (error) {
        console.error("Error listing models:", error);
        if (error.response) {
            console.error("Response:", await error.response.text());
        }
    }
}

checkModels();

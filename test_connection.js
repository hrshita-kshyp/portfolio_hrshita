require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function test() {
    const models = ['gemini-1.5-flash', 'gemini-1.5-flash-001', 'gemini-pro', 'gemini-1.0-pro'];

    for (const modelName of models) {
        try {
            console.log(`Testing ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello");
            console.log(`!! SUCCESS with ${modelName}`);
            return;
        } catch (e) {
            console.log(`-- Fail: ${modelName}`);
        }
    }
}

test();

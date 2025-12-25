const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        // There isn't a direct listModels method in the helper, 
        // but often we can try to guess or use the REST API manually if needed.
        // However, the SDK does have typical behavior.

        // Let's just try to hit 'models' endpoint via raw fetch if SDK doesn't expose it easily
        // actually SDK likely has it hidden
        console.log("Checking commonly used models...");

        const candidates = [
            "gemini-2.0-flash-exp",
            "gemini-1.5-flash",
            "gemini-1.5-flash-001",
            "gemini-1.5-pro",
            "gemini-1.0-pro",
            "gemini-pro"
        ];

        for (const m of candidates) {
            try {
                const mod = genAI.getGenerativeModel({ model: m });
                await mod.generateContent("test");
                console.log(`✅ AVAILABLE: ${m}`);
            } catch (e) {
                console.log(`❌ UNAVAILABLE: ${m} (${e.message.split(':')[0]})`);
            }
        }

    } catch (error) {
        console.error("Error:", error);
    }
}

listModels();

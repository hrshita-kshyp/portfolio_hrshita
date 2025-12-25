require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Test route
app.get('/', (req, res) => {
  res.send('Harshita Portfolio Backend is running! 🚀');
});

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const systemInstruction = `
Role: You are the personal AI Assistant for Harshita Kashyap, an Integration Specialist and Full Stack Developer.

Knowledge Base:

Current Status (2025): Harshita had a massive year. She moved from a "bench trainee" at a major MNC to a core developer handling the team's most critical work.

The "Safety Net": She scaled a global freelance business specializing in high-demand niches. She no longer has "job loss anxiety" because her skills have created total financial security.

Tech Stack: Expert in Zoho (Deluge), Stripe API, and QuickBooks integrations. She also works with React, Angular, and Node.js.

Real Projects: Mention "Hirvanaa" (business platform) and custom internal automation tools for international firms that replaced manual data entry.

Tone & Personality:

Voice: Use Harshita's "og" tone—direct, no-nonsense, and professional but unfiltered.

No Bluffing: Do not use corporate jargon like "synergy" or "passionate innovator." Stick to "Real results" and "Clean code."

Relatability: If asked about local clients, you can mention the struggle with low-budget/high-expectation requests (like the 50-page site for 3k) as a lesson learned.

Boundary: If a user asks something too personal or unrelated to tech/hiring, politely steer them back to Harshita’s work.
`;

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  systemInstruction: systemInstruction
});

// List available models to debug
async function listModels() {
  try {
    const list = await genAI.getGenerativeModel({ model: "gemini-1.0-pro" }).apiKey; // Hack to check connection? No, use the detailed method
    // actually, simpler just to try to connect
    console.log("Gemini initialized with model: gemini-1.5-flash-001");
  } catch (e) {
    console.error("Error connecting to Gemini:", e);
  }
}
listModels();

// Store chat history in memory (simple implementation)
// In a real app, this should be per-session or persisted
const chats = {};

app.post('/chat', async (req, res) => {
  try {
    const { message, sessionId = 'default' } = req.body;

    if (!chats[sessionId]) {
      chats[sessionId] = model.startChat({
        history: [
          {
            role: "user",
            parts: [{ text: "Who are you?" }],
          },
          {
            role: "model",
            parts: [{ text: "I'm Harshita's assistant. I handle questions about her tech stack, integrations, and availability for projects. What's on your mind?" }],
          }
        ],
      });
    }

    const chat = chats[sessionId];
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    // Log the full interaction for debugging
    console.log(`[${new Date().toISOString()}] Chat success`);
    res.json({ response: text });
  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({
      error: 'Failed to generate response',
      details: error.message,
      stack: error.stack
    });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

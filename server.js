require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const Groq = require('groq-sdk');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files (images, etc.) from the project root
app.use(express.static(path.join(__dirname)));

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Serve index.html at root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Initialize Groq
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const systemPrompt = `You are the personal AI assistant on Harshita Kashyap's portfolio website (hrshita.online).

About Harshita:
- Full-stack developer specialising in API integrations, business dashboards, and workflow automation
- Key skills: React, Node.js, QuickBooks API, Stripe API, Zoho Deluge, REST APIs, OAuth 2.0, MongoDB, AI integrations (Gemini)
- Built a real QuickBooks Sales Dashboard (called "Sales Alert") for a private client — includes invoice tracking, customer analytics, AI email automation
- Also built: Invoice Automation Tool, Customer Insights Dashboard, Stripe Payment Manager (all private client work)
- Personal projects: AI Content Studio, Cab Booking System, DataSync
- Available for international freelance work
- Contact: hrsa.kshyp@gmail.com
- GitHub: github.com/hrshita-kshyp
- LinkedIn: linkedin.com/in/harshita-kshyp
- Location: Noida, India

Services offered:
- QuickBooks integrations
- Custom business dashboards
- AI automation tools
- Internal business applications
- Workflow automation
- Backend API development

Tone: Direct, confident, professional but approachable. No buzzwords. Focus on real problems solved and business value delivered.

Rules:
- Keep responses concise (2-4 sentences max unless asked for detail)
- If asked about availability or hiring, encourage them to use the contact form or email hrsa.kshyp@gmail.com
- If asked something too personal or completely off-topic, politely redirect to work-related topics
- Do NOT make up projects or skills not listed above`;

// In-memory chat history per session (simple)
const chatHistories = {};

app.post('/chat', async (req, res) => {
  try {
    const { message, sessionId = 'default' } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Build or retrieve history
    if (!chatHistories[sessionId]) {
      chatHistories[sessionId] = [];
    }

    const history = chatHistories[sessionId];

    // Add user message to history
    history.push({ role: 'user', content: message });

    // Keep history manageable (last 10 messages)
    const recentHistory = history.slice(-10);

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        ...recentHistory
      ],
      max_tokens: 300,
      temperature: 0.7
    });

    const reply = completion.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";

    // Add assistant reply to history
    history.push({ role: 'assistant', content: reply });

    console.log(`[${new Date().toISOString()}] Chat success — model: llama-3.3-70b`);
    res.json({ response: reply });

  } catch (error) {
    console.error('Groq API Error:', error?.message || error);
    res.status(500).json({
      error: 'Failed to generate response',
      details: error?.message || 'Unknown error'
    });
  }
});

app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
  console.log(`   Groq API key: ${process.env.GROQ_API_KEY ? '✅ loaded' : '❌ missing — set GROQ_API_KEY in .env'}`);
});

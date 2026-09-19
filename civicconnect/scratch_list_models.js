require('dotenv').config({ path: '.env.local' });
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function list() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // As of 0.24.1, listModels doesn't exist directly on genAI, we have to fetch manually,
    // or just try some models.
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    console.log(data.models.map(m => m.name));
  } catch (e) {
    console.error(e);
  }
}
list();

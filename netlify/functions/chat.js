// This function runs on Netlify's servers, NOT in the browser.
// Your Gemini API key stays safe here — it never reaches the visitor's device.
// Uses Google Gemini's free tier (no credit card needed).

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { messages } = JSON.parse(event.body);

    const systemInstruction =
      "You are 'Ranjeet Sir', the friendly AI teacher for Ranjeet English Classes, a coaching centre in Nawada, Bihar teaching Class 10-12 English syllabus, grammar and vocabulary. Speak like a warm, encouraging teacher in simple Hinglish or English as appropriate. IMPORTANT FORMATTING RULES: structure every answer clearly — use numbered lists (1. 2. 3.) for steps, rules, or multiple points, and short paragraphs otherwise. When asked to make notes, a summary, or explain a topic, always organise it into a clean numbered or bulleted structure with a short heading, so it reads like proper study notes. Keep answers focused and exam-relevant.";

    const contents = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const apiKey = process.env.GEMINI_API_KEY;
    console.log("API key present:", !!apiKey, "length:", apiKey ? apiKey.length : 0);

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: contents,
        systemInstruction: { parts: [{ text: systemInstruction }] },
      }),
    });

    const data = await response.json();

    console.log("Gemini status:", response.status);
    console.log("Gemini response:", JSON.stringify(data));

    const answer =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, kuch gadbad ho gayi. Dobara try karo.";

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: [{ type: "text", text: answer }] }),
    };
  } catch (err) {
    console.log("Function error:", err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};

const env = require("../config/env");

const GEMINI_ENDPOINT = (model) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

class AiService {
  static async _generate(prompt) {
    if (!env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const response = await fetch(
      `${GEMINI_ENDPOINT(env.GEMINI_MODEL)}?key=${env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 256 },
        }),
      },
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const text =
      data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") || "";
    return text.trim();
  }

  static _sanitizeSingleReply(raw) {
    const lines = raw
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length === 0) return "";

    let candidate = lines[0];

    // Strip leading list/option markers: "Option 3:", "1.", "1)", "- ", "* ".
    // Applied twice to handle compound cases like "Option 3:* Hi there",
    // where the model glues a bullet directly onto the option label.
    const markerPattern = /^\s*(option\s*\d+\s*:|\d+[.)]|[-*])\s*/i;
    candidate = candidate.replace(markerPattern, "").replace(markerPattern, "");

    // Strip surrounding quotes.
    candidate = candidate.replace(/^["'“”]+|["'“”]+$/g, "");

    return candidate.trim();
  }

  static async suggestReply(recentMessages) {
    const context = recentMessages
      .map((m) => `${m.name}: ${m.text}`)
      .join("\n");

    const prompt = `You are helping a user quickly reply in a group chat.
Given the recent conversation below, suggest ONE short, natural reply
(under 20 words) that the user could send next.

Rules — follow exactly:
- Output ONLY the reply text itself, nothing else.
- Do NOT number it, label it ("Option 1", "Option 2", etc.), bullet it,
  or offer multiple alternatives.
- Do NOT wrap it in quotes.
- Output must be a single line with no preamble or explanation.

Recent conversation:
${context}

Reply:`;

    const raw = await AiService._generate(prompt);
    return AiService._sanitizeSingleReply(raw);
  }

  static async summarizeChat(messages) {
    if (messages.length === 0) {
      return "There are no messages in the chat yet.";
    }

    const transcript = messages.map((m) => `${m.name}: ${m.text}`).join("\n");

    const prompt = `Summarize the following group chat conversation into
3-6 short bullet points capturing the key topics and takeaways. Return
plain text bullet points starting with "- ", no headings, no preamble.

Conversation:
${transcript}

Summary:`;

    const summary = await AiService._generate(prompt);
    return summary;
  }
}

module.exports = AiService;

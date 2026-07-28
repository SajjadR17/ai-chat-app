const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

export async function askAI(message) {
  try {
    const response = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",

        messages: [
          {
            role: "user",
            content: message,
          },
        ],

        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();

      throw new Error(errorData.error?.message || "AI request failed");
    }

    const data = await response.json();

    return data.choices[0].message.content;
  } catch (error) {
    console.error("AI Error:", error);
    throw error;
  }
}

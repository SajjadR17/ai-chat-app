const IMAGE_URL = "https://image-worker.nightline-ai.workers.dev";

export async function generateImage(prompt) {
  try {
    const response = await fetch(IMAGE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
      }),
    });

    const text = await response.text();

    if (!response.ok) {
      throw new Error(text);
    }

    const data = JSON.parse(text);

    return data.url;
  } catch (error) {
    console.error("generateImage error:", error);
    throw error;
  }
}

const TAVILY_URL = "https://api.tavily.com/search";

export const searchWeb = async (query) => {
  try {
    const response = await fetch(TAVILY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: import.meta.env.VITE_TAVILY_API_KEY,
        query,
        search_depth: "basic",
        max_results: 3,
        include_answer: true,
        include_images: true,
        include_raw_content: false,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Web search failed");
    }

    const data = await response.json();
    return {
      answer: data.answer,
      searchTime: data.response_time,
      images: data.images,
      results: data.results.map((item) => ({
        title: item.title,
        url: item.url,
        content: item.content.slice(0, 700),
      })),
    };
  } catch (error) {
    console.error("Search Error:", error);
    throw error;
  }
};

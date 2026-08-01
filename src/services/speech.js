let utterance = null;

export const speak = (text, lang) => {
  speechSynthesis.cancel();

  const  deleteMarkdown = (text) => {
    return text
      .replace(/```[\s\S]*?```/g, "")
      .replace(/`([^`]*)`/g, "$1")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/#+\s/g, "")
      .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
      .replace(/>\s/g, "")
      .replace(/[-*]\s/g, "")
      .trim();
  };

  const hasVoice = speechSynthesis
    .getVoices()
    .some((v) => v.lang.startsWith(lang.split("-")[0]));

  if (!hasVoice) {
    const utterance = new SpeechSynthesisUtterance(
      "Sorry, I don't support this language.",
    );

    utterance.lang = "en-US";

    speechSynthesis.speak(utterance);
    return;
  }

  utterance = new SpeechSynthesisUtterance(deleteMarkdown(text));
  utterance.lang = lang;

  speechSynthesis.speak(utterance);
};

export const stopSpeaking = () => {
  speechSynthesis.cancel();
};

export const isSpeaking = () => {
  return speechSynthesis.speaking;
};

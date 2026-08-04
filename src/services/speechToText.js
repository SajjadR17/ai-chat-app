let recognition = null;

export const startListening = ({
  lang = "en-US",
  onResult,
  onEnd,
  onError,
}) => {
  recognition?.stop();
  recognition = new SpeechRecognition();

  recognition.lang = lang;
  recognition.interimResults = true;
  recognition.continuous = false;

  recognition.onresult = (event) => {
    let transcript = "";

    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
    }

    onResult?.(transcript);
  };

  recognition.onerror = onError;

  recognition.onend = () => {
    onEnd?.();
  };

  recognition.start();
};

export const stopListening = () => {
  recognition?.stop();
};

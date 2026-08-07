import { createContext, useContext, useEffect, useState } from "react";

const AiContext = createContext();

const DEFAULT_MODEL = "openai/gpt-oss-120b";

export const AiProvider = ({ children }) => {
  const [selectedModel, setSelectedModel] = useState(
    localStorage.getItem("nightline-ai-model") || DEFAULT_MODEL,
  );

  useEffect(() => {
    localStorage.setItem("nightline-ai-model", selectedModel);
  }, [selectedModel]);

  return (
    <AiContext.Provider value={{ selectedModel, setSelectedModel }}>
      {children}
    </AiContext.Provider>
  );
};

export const useAi = () => useContext(AiContext);

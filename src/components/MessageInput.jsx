import React, { useRef, useState } from "react";
import { LuSendHorizontal } from "react-icons/lu";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../contexts/authContext";
import { sendUserMessage } from "../lib/chat";
import { ClipLoader } from "react-spinners";
import {
  BiMicrophone,
  BiMicrophoneOff,
  BiPlus,
  BiSearch,
} from "react-icons/bi";
import { ImImage } from "react-icons/im";
import { CgClose } from "react-icons/cg";
import { startListening, stopListening } from "../services/speechToText";
import { BsPauseBtn } from "react-icons/bs";
import toast from "react-hot-toast";
import { useAi } from "../contexts/aiContext";

function MessageInput({
  sending,
  answering,
  setError,
  setAnswering,
  setSearching,
  setSending,
  setCreatingImg,
  selectedTool,
  setSelectedTool,
}) {
  const { chatId } = useParams();
  const { user } = useAuth();
  const { selectedModel } = useAi();
  const [message, setMessage] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const messageRef = useRef("");
  const navigate = useNavigate();

  const hasSpeechRecognition =
    "SpeechRecognition" in window || "webkitSpeechRecognition" in window;

  const stopSpeechToText = () => {
    stopListening();
    setListening(false);
  };

  const startSpeechToText = () => {
    messageRef.current = message;
    setListening(true);
    startListening({
      lang: "en-US",
      onResult: (text) => {
        setMessage(messageRef.current ? `${messageRef.current} ${text}` : text);
      },

      onEnd: () => {
        setListening(false);
      },

      onError: (event) => {
        setListening(false);

        switch (event.error) {
          case "not-allowed":
            toast.error("Microphone permission denied.");
            break;

          case "service-not-allowed":
            toast.error("Speech recognition service is not allowed.");
            break;

          case "no-speech":
            toast.error("No speech detected.");
            break;

          case "audio-capture":
            toast.error("No microphone found.");
            break;

          case "network":
            toast.error("Network error.");
            break;

          case "language-not-supported":
            toast.error("Language is not supported.");
            break;

          default:
            toast.error("Speech recognition failed.");
        }
      },
    });
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    const text = message.trim();
    if (!text) return;

    setSending(true);
    setError(false);
    if (listening) {
      stopSpeechToText();
    }

    try {
      await sendUserMessage({
        uid: user.uid,
        selectedTool,
        setSelectedTool,
        chatId,
        message: text,
        navigate,
        setAnswering,
        setSearching,
        setMessage,
        setCreatingImg,
        retry: false,
        selectedModel,
      });
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setSending(false);
    }
  };

  const placeholders = {
    "create-image": "Describe image...",
    "web-search": "Search the web...",
  };

  const toolNames = {
    "create-image": "Create image",
    "web-search": "Web search",
  };

  const placeholder = placeholders[selectedTool] || "Ask Nightline...";
  const toolName = toolNames[selectedTool];

  return (
    <div className="message-input-container">
      <form className="message-input" onSubmit={submitHandler}>
        <textarea
          id="msg-input"
          maxLength={8000}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();

              if (message.trim() && !sending && !answering) {
                submitHandler(e);
              }
            }
          }}
          rows={1}
          placeholder={listening ? "Listening..." : placeholder}
        />
        {menuOpen && (
          <div className="message-input-menu mono">
            <div
              className="message-input-menu-card"
              onClick={() => {
                if (sending) return;
                setMenuOpen(false);
                setSelectedTool("create-image");
              }}
            >
              <ImImage size={15} />
              Create image
            </div>
            <div
              className="message-input-menu-card"
              onClick={() => {
                if (sending) return;
                setMenuOpen(false);
                setSelectedTool("web-search");
              }}
            >
              <BiSearch size={15} />
              Web search
            </div>
          </div>
        )}
        <div className="message-input-action-btns">
          <div className="message-input-action-btns-left">
            <button
              type="button"
              className="message-input-action-btn"
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              <BiPlus size={20} />
            </button>
            {selectedTool !== "auto" && (
              <div className="active-tool mono">
                {toolName}
                <CgClose
                  size={15}
                  cursor={"pointer"}
                  onClick={() => {
                    sending ? null : setSelectedTool("auto");
                  }}
                />
              </div>
            )}
          </div>
          <div className="message-input-action-btns-right">
            {hasSpeechRecognition && (
              <button
                className="speech-to-text-btn"
                type="button"
                disabled={answering || sending}
                aria-label="Speak"
                onClick={listening ? stopSpeechToText : startSpeechToText}
              >
                {listening ? <BiMicrophoneOff /> : <BiMicrophone />}
              </button>
            )}
            <button
              type="submit"
              disabled={message.trim().length === 0 || sending || answering}
              className="send-btn"
              aria-label="Send message"
            >
              {sending ? <ClipLoader size={15} /> : <LuSendHorizontal />}
            </button>
          </div>
        </div>
      </form>
      <div className="message-input-hint mono">
        Enter to send · Shift+Enter for a new line
      </div>
    </div>
  );
}

export default MessageInput;

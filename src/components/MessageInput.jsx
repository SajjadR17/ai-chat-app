import React, { useState } from "react";
import { LuSendHorizontal } from "react-icons/lu";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../contexts/authContext";
import { sendUserMessage } from "../lib/chat";
import { ClipLoader } from "react-spinners";
import { BiPlus } from "react-icons/bi";
import { ImImage } from "react-icons/im";
import { CgClose } from "react-icons/cg";

function MessageInput({
  sending,
  answering,
  setError,
  setAnswering,
  setSending,
  setCreatingImg,
  setLastUserMessage,
  selectedTool,
  setSelectedTool,
}) {
  const { chatId } = useParams();
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();

    const text = message.trim();
    if (!text) return;

    setSending(true);
    setError(false);
    setLastUserMessage(message.trim());

    try {
      await sendUserMessage({
        uid: user.uid,
        selectedTool,
        setSelectedTool,
        chatId,
        message: text,
        navigate,
        setAnswering,
        setMessage,
        setCreatingImg,
        retry: false,
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
          placeholder={placeholder}
        />
        {menuOpen && (
          <div className="message-input-menu mono">
            <div
              className="message-input-menu-card"
              onClick={() => {
                setMenuOpen(false);
                setSelectedTool("create-image");
              }}
            >
              <ImImage size={15} />
              Create image
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
                  onClick={() => setSelectedTool("auto")}
                />
              </div>
            )}
          </div>
          <div className="message-input-action-btns-right">
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

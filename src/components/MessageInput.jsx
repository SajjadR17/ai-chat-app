import React, { useEffect, useRef, useState } from "react";
import { LuSendHorizontal } from "react-icons/lu";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../contexts/authContext";
import { sendUserMessage } from "../lib/chat";
import { ClipLoader } from "react-spinners";

function MessageInput({
  sending,
  answering,
  setError,
  setAnswering,
  setSending,
  setLastUserMessage,
}) {
  const { chatId } = useParams();
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const inputRef = useRef(null);

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
        chatId,
        message: text,
        navigate,
        setAnswering,
        setMessage,
        retry: false,
      });
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    inputRef.current.focus();
  }, [chatId]);

  return (
    <div className="message-input-container">
      <form className="message-input" onSubmit={submitHandler}>
        <textarea
          id="msg-input"
          ref={inputRef}
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
          placeholder="Ask Nightline…"
        />
        <button
          type="submit"
          disabled={message.trim().length === 0 || sending || answering}
          className="send-btn"
          aria-label="Send message"
        >
          {sending ? <ClipLoader size={15} /> : <LuSendHorizontal />}
        </button>
      </form>
      <div className="message-input-hint mono">
        Enter to send · Shift+Enter for a new line
      </div>
    </div>
  );
}

export default MessageInput;

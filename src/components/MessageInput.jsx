import React, { useState } from "react";
import { LuSendHorizontal } from "react-icons/lu";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../contexts/authContext";
import {
  addMessage,
  createConversation,
  getConversationHistory,
  updateConversation,
} from "../lib/chat";
import { ClipLoader } from "react-spinners";
import { askAI } from "../services/ai";

function MessageInput({ sending, setAnswering, setSending }) {
  const { chatId } = useParams();
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    try {
      let currentChatId = chatId;

      if (!currentChatId || currentChatId === "new") {
        currentChatId = await createConversation(
          user.uid,
          message.trim().slice(0, 40),
        );
      }

      await addMessage(user.uid, currentChatId, "user", message.trim());
      await updateConversation(user.uid, currentChatId);
      const newChatId = currentChatId;

      setMessage("");

      setAnswering(true);

      if (chatId === "new") {
        navigate(`/chat/${newChatId}`, {
          replace: true,
        });
      }

      const history = await getConversationHistory(user.uid, currentChatId);
      const answer = await askAI(history);
      await addMessage(user.uid, currentChatId, "assistant", answer);
      await updateConversation(user.uid, currentChatId);
    } catch (err) {
      console.log(err);
      await addMessage(
        user.uid,
        chatId,
        "assistant",
        "Sorry, I couldn't generate a response.",
      );
    } finally {
      setAnswering(false);
      setSending(false);
    }
  };

  return (
    <div className="message-input-container">
      <form className="message-input" onSubmit={submitHandler}>
        <textarea
          id="msg-input"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={1}
          placeholder="Message Nightline…"
        />

        <button
          type="submit"
          disabled={message.trim().length === 0 || sending}
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

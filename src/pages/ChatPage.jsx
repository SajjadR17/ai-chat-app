import { LuSendHorizontal } from "react-icons/lu";
import { useParams } from "react-router-dom";
import "../styles/chatPage.css";
import MessageInput from "../components/MessageInput";
import { useEffect, useState } from "react";
import { ClipLoader } from "react-spinners";
import {
  collection,
  limitToLast,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../contexts/authContext";
import { formatMessageTime } from "../lib/chat";
import { ThinkingOrb } from "thinking-orbs";

function ChatPage() {
  const { chatId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [answering, setAnswering] = useState(false);

  useEffect(() => {
    if (!user || chatId === "new") {
      setMessages([]);
      return;
    }

    setLoading(true);

    const messagesRef = collection(
      db,
      "users",
      user.uid,
      "conversations",
      chatId,
      "messages",
    );

    const q = query(messagesRef, orderBy("createdAt", "asc", limitToLast(50)));

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        setMessages(
          snap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })),
        );

        setLoading(false);
      },
      (err) => {
        console.error(err);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [user, chatId]);

  if (loading) {
    return (
      <div className="loading-chat">
        <ClipLoader color="var(--text-secondary)" size={30} />
        <span className="mono" style={{ color: "var(--text-secondary)" }}>
          LOADING CHAT
        </span>
      </div>
    );
  }

  return (
    <>
      <div className="chat-scroll">
        {chatId === "new" ? (
          <div className="empty-state">
            <div className="empty-state-dot"></div>
            <h2>Start the conversation</h2>
            <span>Send a message below so Nightline will reply</span>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div key={message.id} className={`msg-row ${message.role}`}>
                <div className="msg-avatar mono">
                  {message.role === "assistant" ? "NL" : "YOU"}
                </div>
                <div className="msg-body">
                  <div className="msg-meta mono">
                    <span className="who">
                      {message.role === "assistant" ? "Nightline" : "You"}
                    </span>
                    <span>{formatMessageTime(message.createdAt)}</span>
                  </div>
                  <div className="bubble">{message.content}</div>
                </div>
              </div>
            ))}
            {answering && (
              <div className={`msg-row bot`}>
                <div className="msg-avatar mono">NL</div>
                <div className="msg-body">
                  <div className="msg-meta mono">
                    <span className="who">Nightline</span>
                    <span>Now</span>
                  </div>
                  <div className="bubble">
                    <ThinkingOrb state="searching" size={20} speed={1.15} />
                    Thinking...
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        {messages.length > 0 && (
          <div className="ai-hint mono">
            Nightline can make mistakes. check important info.
          </div>
        )}
      </div>
      <MessageInput
        setSending={setSending}
        setAnswering={setAnswering}
        sending={sending}
      />
    </>
  );
}

export default ChatPage;

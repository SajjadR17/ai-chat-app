import { LuRotateCw, LuSendHorizontal } from "react-icons/lu";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/chatPage.css";
import MessageInput from "../components/MessageInput";
import { useEffect, useRef, useState } from "react";
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
import { formatMessageTime, sendUserMessage } from "../lib/chat";
import { ThinkingOrb } from "thinking-orbs";
import MarkdownRenderer from "../components/MarkdownRenderer";
import { BsArrowDown } from "react-icons/bs";
import { BiCopy, BiDownload, BiStopCircle, BiVolumeFull } from "react-icons/bi";
import { isSpeaking, speak, stopSpeaking } from "../services/speech";
import { FiCheck } from "react-icons/fi";
import toast from "react-hot-toast";

function ChatPage() {
  const { chatId } = useParams();
  const { user, userProfile } = useAuth();
  const chatRef = useRef(null);
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTool, setSelectedTool] = useState("auto");
  const [speakingId, setSpeakingId] = useState(null);
  const [error, setError] = useState(false);
  const [lastUserMessage, setLastUserMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [answering, setAnswering] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [creatingImg, setCreatingImg] = useState(false);
  const [copyId, setCopyId] = useState(null);

  useEffect(() => {
    const cancelTextToSpeech = () => {
      speechSynthesis.cancel();
      setSpeakingId("");
    };
    cancelTextToSpeech();

    if (!user || chatId === "new") {
      setMessages([]);
      setLoading(false);
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

    const q = query(messagesRef, orderBy("createdAt", "asc"), limitToLast(50));

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

  const scrollToBottom = () => {
    if (!chatRef.current) return;
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const copyMessage = async (id, text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyId(id);
      setTimeout(() => {
        setCopyId(null);
      }, 2000);
    } catch (err) {
      console.log(err);
      toast.error("Copy failed.");
    }
  };

  const retry = async () => {
    if (retrying) return;
    setRetrying(true);
    setError(false);

    try {
      await sendUserMessage({
        uid: user.uid,
        chatId,
        message: lastUserMessage,
        navigate,
        setAnswering,
        retry: true,
      });
    } catch {
      setError(true);
    } finally {
      setRetrying(false);
      setError(false);
    }
  };

  const downloadImage = async (url) => {
    try {
      const match = url.match(/!\[.*?\]\((.*?)\)/);

      const imageUrl = match?.[1];
      const response = await fetch(imageUrl);
      const blob = await response.blob();

      const objectUrl = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = "nightline-image.png";
      document.body.appendChild(a);

      a.click();

      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      console.log(err);
      toast.error("Download failed.");
    }
  };

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
      <div className="chat-scroll" ref={chatRef}>
        {chatId === "new" ? (
          <div className="empty-state">
            <div className="empty-state-dot"></div>
            <h2>
              {userProfile?.username
                ? `Hi ${userProfile?.username}`
                : "Start the conversation"}
            </h2>
            <span>Send a message below so Nightline will reply</span>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div key={message.id} className={`msg-row ${message.role}`}>
                <div className="msg-avatar mono">
                  {message.role === "assistant" ? "NL" : userProfile?.shortName}
                </div>
                <div className="msg-body">
                  <div className="msg-meta mono">
                    <span className="who">
                      {message.role === "assistant" ? "Nightline" : "You"}
                    </span>
                    <span>{formatMessageTime(message.createdAt)}</span>
                    {message.type === "image" ? (
                      <button
                        className="download-img-btn"
                        onClick={() => downloadImage(message.content)}
                      >
                        <BiDownload />
                      </button>
                    ) : (
                      <button
                        className="copy-msg-btn"
                        onClick={() => copyMessage(message.id, message.content)}
                      >
                        {copyId === message.id ? <FiCheck /> : <BiCopy />}
                      </button>
                    )}
                    {"speechSynthesis" in window && message.type === "text" ? (
                      isSpeaking() && speakingId === message.id ? (
                        <BiStopCircle
                          className="cancel-read-msg-btn"
                          onClick={() => {
                            stopSpeaking();
                            setSpeakingId(null);
                          }}
                        />
                      ) : (
                        <BiVolumeFull
                          className="read-msg-btn"
                          onClick={() => {
                            speak(message.content, message.lang);
                            setSpeakingId(message.id);
                          }}
                        />
                      )
                    ) : null}
                  </div>
                  <div className="bubble">
                    <MarkdownRenderer content={message.content} />
                  </div>
                </div>
              </div>
            ))}
            {answering && (
              <div className={`msg-row assistant`}>
                <div className="msg-avatar mono">NL</div>
                <div className="msg-body">
                  <div className="msg-meta mono">
                    <span className="who">Nightline</span>
                    <span>Now</span>
                  </div>
                  <div className="bubble thinking">
                    <ThinkingOrb theme="light" state="working" size={20} speed={1.3} />
                    Thinking...
                  </div>
                </div>
              </div>
            )}
            {creatingImg && (
              <div className={`msg-row assistant`}>
                <div className="msg-avatar mono">NL</div>
                <div className="msg-body">
                  <div className="msg-meta mono">
                    <span className="who">Nightline</span>
                    <span>Now</span>
                  </div>
                  <div className="bubble thinking">
                    <ThinkingOrb theme="light" state="shaping" size={20} speed={1.3} />
                    Creating image ...
                  </div>
                </div>
              </div>
            )}
            {error && (
              <div className={`msg-row assistant error`}>
                <div className="msg-avatar mono">NL</div>
                <div className="msg-body">
                  <div className="msg-meta mono">
                    <span className="who">Nightline</span>
                    <span>Now</span>
                  </div>
                  <div className="bubble error">
                    An error occurred.
                    <button
                      className="retry-btn mono"
                      onClick={retry}
                      disabled={answering}
                    >
                      <LuRotateCw />
                      Retry
                    </button>
                  </div>
                </div>
              </div>
            )}
            {messages.length > 1 && (
              <div className="ai-hint mono">
                Nightline can make mistakes. Check important info.
              </div>
            )}
            <button className="scroll-to-bottom" onClick={scrollToBottom}>
              <BsArrowDown size={14} />
            </button>
          </>
        )}
      </div>
      <MessageInput
        setSending={setSending}
        setAnswering={setAnswering}
        sending={sending}
        setError={setError}
        answering={answering}
        setCreatingImg={setCreatingImg}
        setLastUserMessage={setLastUserMessage}
        selectedTool={selectedTool}
        setSelectedTool={setSelectedTool}
      />
    </>
  );
}

export default ChatPage;

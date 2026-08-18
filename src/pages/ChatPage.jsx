import { LuRotateCw, LuSendHorizontal } from "react-icons/lu";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/chatPage.css";
import MessageInput from "../components/MessageInput";
import { useEffect, useRef, useState } from "react";
import { ClipLoader } from "react-spinners";
import {
  collection,
  deleteDoc,
  doc,
  limitToLast,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../contexts/authContext";
import { formatMessageTime, sendUserMessage } from "../lib/chat";
import { ThinkingOrb } from "thinking-orbs";
import MarkdownRenderer from "../components/MarkdownRenderer";
import { BsArrowDown } from "react-icons/bs";
import {
  BiCopy,
  BiDownload,
  BiPencil,
  BiStopCircle,
  BiVolumeFull,
} from "react-icons/bi";
import { isSpeaking, speak, stopSpeaking } from "../services/speech";
import { FiCheck } from "react-icons/fi";
import toast from "react-hot-toast";
import { useAi } from "../contexts/aiContext";
import { FaCheck, FaTimes } from "react-icons/fa";

function ChatPage() {
  const { chatId } = useParams();
  const { user, userProfile } = useAuth();
  const { selectedModel } = useAi();
  const chatRef = useRef(null);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [answering, setAnswering] = useState(false);
  const [searching, setSearching] = useState(false);
  const [creatingImg, setCreatingImg] = useState(false);
  const [error, setError] = useState(false);

  const [messages, setMessages] = useState([]);
  const [selectedTool, setSelectedTool] = useState("auto");
  const [speakingId, setSpeakingId] = useState(null);
  const [copyId, setCopyId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editingMsg, setEditingMsg] = useState("");

  useEffect(() => {
    const cancelTextToSpeech = () => {
      speechSynthesis.cancel();
      setSpeakingId("");
    };
    cancelTextToSpeech();

    const cancelEditing = () => {
      setEditingId(null);
    };
    cancelEditing();

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

  const getLastUserMessage = () => {
    return [...messages].reverse().find((m) => m.role === "user");
  };

  const retry = async () => {
    if (sending || !user?.uid) return;

    const userLastMessage = getLastUserMessage();

    if (!userLastMessage?.content) return;

    setSending(true);
    setError(false);

    try {
      await sendUserMessage({
        uid: user.uid,
        selectedTool,
        setSelectedTool,
        chatId,
        message: userLastMessage.content,
        navigate,
        setAnswering,
        setSearching,
        setCreatingImg,
        retry: true,
        selectedModel,
        userProfile,
      });
    } catch {
      setError(true);
    } finally {
      setSending(false);
    }
  };

  const regenerateMsg = async (message) => {
    if (sending || !user?.uid || !message) return;

    const lastMessage = messages[messages.length - 1];

    if (lastMessage?.id !== message.id || message.role !== "assistant") {
      return;
    }

    const userLastMessage = getLastUserMessage();

    if (!userLastMessage?.content) return;

    const assistantMessageRef = doc(
      db,
      "users",
      user.uid,
      "conversations",
      chatId,
      "messages",
      message.id,
    );

    setError(false);

    try {
      await deleteDoc(assistantMessageRef);
      setSending(true);
      await sendUserMessage({
        uid: user.uid,
        selectedTool,
        setSelectedTool,
        chatId,
        message: userLastMessage.content,
        navigate,
        setAnswering,
        setSearching,
        setCreatingImg,
        retry: true,
        selectedModel,
        userProfile,
      });
    } catch {
      setError(true);
    } finally {
      setSending(false);
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

  const saveEditedMsg = async (message) => {
    if (sending || !user?.uid || !message) return;

    const trimmedMsg = editingMsg.trim();

    if (!trimmedMsg) {
      toast.error("Message cannot be empty.");
      return;
    }

    if (trimmedMsg === message.content.trim()) {
      toast.error("No changes were made.");
      return;
    }

    const lastUserMessage = getLastUserMessage();

    if (!lastUserMessage || lastUserMessage.id !== message.id) {
      toast.error("Only the latest message can be edited.");
      return;
    }

    const messageIndex = messages.findIndex((m) => m.id === message.id);
    const assistantMessage = messages[messageIndex + 1];

    if (!assistantMessage || assistantMessage.role !== "assistant") {
      toast.error("The previous AI response could not be found.");
      return;
    }

    setError(false);
    setSending(true);

    try {
      const assistantMessageRef = doc(
        db,
        "users",
        user.uid,
        "conversations",
        chatId,
        "messages",
        assistantMessage.id,
      );

      await deleteDoc(assistantMessageRef);

      const userMessageRef = doc(
        db,
        "users",
        user.uid,
        "conversations",
        chatId,
        "messages",
        message.id,
      );

      await updateDoc(userMessageRef, {
        content: trimmedMsg,
        createdAt: serverTimestamp(),
      });

      setEditingId(null);
      setEditingMsg("");

      await sendUserMessage({
        uid: user.uid,
        selectedTool,
        setSelectedTool,
        chatId,
        message: trimmedMsg,
        navigate,
        setAnswering,
        setSearching,
        setCreatingImg,
        retry: true,
        selectedModel,
        userProfile,
      });
    } catch (err) {
      console.error("Failed to edit and regenerate message:", err);
      setError(true);
    } finally {
      setSending(false);
    }
  };

  const getTextDirection = (text) => {
    const firstStrongChar = text.match(/[\u0600-\u06FF]|[A-Za-z]/);

    if (!firstStrongChar) return "ltr";

    return /[\u0600-\u06FF]/.test(firstStrongChar[0]) ? "rtl" : "ltr";
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
            {userProfile ? (
              <>
                <h2>
                  {userProfile?.username
                    ? `Hi ${userProfile?.username}`
                    : "Start the conversation"}
                </h2>
                <span>Send a message below so Nightline will reply</span>
              </>
            ) : (
              <>
                <h2>You are offline</h2>
                <span>Check your connection and try again</span>
              </>
            )}
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
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
                    {"speechSynthesis" in window &&
                    message.type === "text" &&
                    message.role === "assistant" ? (
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
                    {index === messages.length - 1 &&
                      message.role === "assistant" && (
                        <LuRotateCw
                          className="regenerate-msg-btn"
                          onClick={() => regenerateMsg(message)}
                        />
                      )}
                    {index === messages.length - 2 &&
                      message.role === "user" && (
                        <BiPencil
                          className="edit-msg-btn"
                          onClick={() => {
                            setEditingId(message.id);
                            setEditingMsg(message.content);
                          }}
                        />
                      )}
                  </div>
                  <div
                    className={`bubble ${getTextDirection(message.content)}`}
                  >
                    {message.searchTime && (
                      <div className="search-time mono">
                        Searched in {message.searchTime}s
                      </div>
                    )}
                    {message.id === editingId ? (
                      <div className="edit-input-container">
                        <input
                          type="text"
                          className="edit-msg-input"
                          value={editingMsg}
                          maxLength={8000}
                          autoFocus
                          placeholder="Message"
                          disabled={sending}
                          onChange={(e) => setEditingMsg(e.target.value)}
                        />
                        <div className="edit-msg-action-btn">
                          <button
                            className="edit-msg-save-btn"
                            onClick={() => saveEditedMsg(message)}
                            disabled={sending}
                          >
                            <FaCheck size={12} />
                          </button>
                          <button
                            className="edit-msg-cancel-btn"
                            onClick={() => {
                              setEditingId(null);
                              setEditingMsg("");
                            }}
                            disabled={sending}
                          >
                            <FaTimes size={12} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <MarkdownRenderer content={message.content} />
                    )}
                    {message.sources?.length > 0 && (
                      <span className="msg-sources">
                        {message.sources.map((s) => (
                          <a
                            key={s.siteName}
                            href={s.url}
                            target="_blank"
                            className="mono"
                            rel="noopener noreferrer"
                          >
                            {s.siteName}
                          </a>
                        ))}
                      </span>
                    )}
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
                    <ThinkingOrb
                      theme="dark"
                      state="composing"
                      size={20}
                      speed={1.3}
                    />
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
                  <div className="bubble creating-img">
                    <ThinkingOrb
                      theme="dark"
                      state="shaping"
                      size={20}
                      speed={1.3}
                    />
                    Creating image ...
                  </div>
                </div>
              </div>
            )}
            {searching && (
              <div className={`msg-row assistant`}>
                <div className="msg-avatar mono">NL</div>
                <div className="msg-body">
                  <div className="msg-meta mono">
                    <span className="who">Nightline</span>
                    <span>Now</span>
                  </div>
                  <div className="bubble searching">
                    <ThinkingOrb
                      theme="dark"
                      state="searching"
                      size={20}
                      speed={1.3}
                    />
                    Searching ...
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
                      disabled={sending}
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
        setSearching={setSearching}
        sending={sending}
        setError={setError}
        answering={answering}
        setCreatingImg={setCreatingImg}
        selectedTool={selectedTool}
        setSelectedTool={setSelectedTool}
      />
    </>
  );
}

export default ChatPage;

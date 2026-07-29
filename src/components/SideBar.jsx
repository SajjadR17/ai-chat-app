import React, { useEffect, useState } from "react";
import { BiPlus, BiTrash } from "react-icons/bi";
import "../styles/sideBar.css";

import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../contexts/authContext";
import { FiMessageSquare } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import { deleteConversation } from "../lib/chat";

function SideBar({ menuOpen }) {
  const [conversations, setConversations] = useState([]);
  const { user } = useAuth();
  const location = useLocation();
  const chatId = location.pathname.replace("/chat/", "");
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const conversationsRef = collection(db, "users", user.uid, "conversations");
    const q = query(conversationsRef, orderBy("updatedAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chats = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setConversations(chats);
      if (
        chatId &&
        chatId !== "new" &&
        !chats.some((chat) => chat.id === chatId)
      ) {
        navigate("/chat/new", { replace: true });
      }
    });

    return () => unsubscribe();
  }, [user, chatId, navigate]);

  const deleteHandler = async (e, chat) => {
    e.stopPropagation();
    try {
      await deleteConversation(user.uid, chat.id);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <aside className={`${menuOpen ? "open" : ""}`}>
      <button className="new-chat-btn" onClick={() => navigate("/chat/new")}>
        <BiPlus />
        New chat
      </button>
      <div className="conversations">
        <span className="conversations-title mono">CONVERSATIONS</span>
        <div className="conversations-list">
          {chatId === "new" && (
            <div className="conversation-card new-chat active">
              <div className="conversation-dot"></div>
              <span className="conversation-name">New chat</span>
            </div>
          )}
          {conversations.map((chat) => (
            <div
              key={chat.id}
              className={`conversation-card ${chatId === chat.id ? "active" : ""}`}
              onClick={() => navigate(`/chat/${chat.id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  navigate(`/chat/${chat.id}`);
                }
              }}
            >
              <div className="conversation-info">
                <div className="conversation-dot"></div>
                <span className="conversation-name">{chat.title}</span>
              </div>
              <div className="conversation-action-btns">
                <button
                  className="conversation-action-btn"
                  onClick={(e) => {
                    deleteHandler(e, chat);
                  }}
                >
                  <BiTrash size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

export default SideBar;

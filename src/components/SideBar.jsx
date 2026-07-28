import React, { useEffect, useState } from "react";
import { BiPlus } from "react-icons/bi";
import "../styles/sideBar.css";

import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../contexts/authContext";
import { PiEmpty } from "react-icons/pi";
import { FiMessageSquare } from "react-icons/fi";

function SideBar({ menuOpen }) {
  const [conversations, setConversations] = useState([]);
  const { user } = useAuth();

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
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <aside className={`${menuOpen ? "open" : ""}`}>
      <button className="new-chat-btn">
        <BiPlus />
        New chat
      </button>
      <div className="conversations">
        <span className="conversations-title mono">CONVERSATIONS</span>
        <div className="conversations-list">
          {conversations.length === 0 ? (
            <button className="conversation-card active">
              <div className="conversation-dot"></div>
              <span className="conversation-name">New chat</span>
            </button>
          ) : (
            conversations.map((chat) => (
              <button key={chat.id} className="conversation-card">
                <div className="conversation-dot"></div>
                <span className="conversation-name">{chat.title}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </aside>
  );
}

export default SideBar;

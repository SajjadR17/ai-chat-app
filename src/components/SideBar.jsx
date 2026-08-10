import React, { useEffect, useRef, useState } from "react";
import { BiLogOut, BiPencil, BiPlus, BiSearch, BiTrash } from "react-icons/bi";
import "../styles/sideBar.css";

import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../contexts/authContext";
import { FiMessageSquare } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import { HiDotsHorizontal } from "react-icons/hi";
import DeleteChatModal from "./DeleteChatModal";
import EditChatModal from "./EditChatModal";
import SearchModal from "./SearchModal";
import { CiSettings } from "react-icons/ci";
import SettingsModal from "./SettingsModal";

function SideBar({ menuOpen, setMenuOpen }) {
  const [conversations, setConversations] = useState([]);
  const [conversationMenuOpenId, setConversationMenuOpenId] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const { user, userProfile } = useAuth();
  const location = useLocation();
  const chatId = location.pathname.replace("/chat/", "");
  const navigate = useNavigate();
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setConversationMenuOpenId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const closeCovMenu = () => {
      if (!menuOpen) {
        setConversationMenuOpenId(null);
      }
    };

    closeCovMenu();
  }, [menuOpen]);

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

  const convMenuOpenHandler = (e, chat) => {
    e.stopPropagation();
    if (conversationMenuOpenId === chat.id) {
      setConversationMenuOpenId(null);
      return;
    }
    setConversationMenuOpenId(chat.id);
  };

  return (
    <aside className={`${menuOpen ? "open" : ""}`}>
      <div className="sidebar-action-btns">
        <button
          className="new-chat-btn"
          onClick={() => {
            navigate("/chat/new");
            setMenuOpen(false);
          }}
        >
          <BiPlus />
          New chat
        </button>
        <button
          className="search-btn"
          onClick={() => {
            setSearchModalOpen(true);
          }}
        >
          <BiSearch />
          Search
        </button>
      </div>
      <div className="conversations">
        <div className="conversations-list">
          {conversations.length === 0 && (
            <div className="empty-conversations">
              <FiMessageSquare size={40} />
              <span className="mono">No conversations</span>
            </div>
          )}
          {conversations.map((chat) => (
            <div
              key={chat.id}
              className={`conversation-card ${chatId === chat.id ? "active" : ""}`}
              onClick={() => {
                navigate(`/chat/${chat.id}`);
                setMenuOpen(false);
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  navigate(`/chat/${chat.id}`);
                }
                setMenuOpen(false);
              }}
            >
              <div className="conversation-info">
                <div className="conversation-dot"></div>
                <span className="conversation-name">{chat.title}</span>
              </div>
              <button
                className="conversation-menu-btn"
                onClick={(e) => convMenuOpenHandler(e, chat)}
              >
                <HiDotsHorizontal size={15} />
              </button>
              {conversationMenuOpenId === chat.id && (
                <div className="conversation-menu mono" ref={menuRef}>
                  <div
                    className="conversation-menu-edit-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedChat(chat);
                      setEditModalOpen(true);
                      setConversationMenuOpenId(null);
                    }}
                  >
                    <BiPencil size={15} />
                    Edit
                  </div>
                  <div
                    className="conversation-menu-delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedChat(chat);
                      setDeleteModalOpen(true);
                      setConversationMenuOpenId(null);
                    }}
                  >
                    <BiTrash size={15} />
                    Delete
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      {user && userProfile && (
        <div className="user-profile-card">
          <div className="user-profile-content">
            <div className="user-profile-avatar mono">
              {userProfile.shortName}
            </div>
            <div className="user-profile-info">
              <span className="username">{userProfile.username}</span>
              <span className="user-role mono">{userProfile.role}</span>
            </div>
          </div>
          <CiSettings
            size={18}
            onClick={() => setSettingsModalOpen((prev) => !prev)}
            color="var(--text-secondary)"
            cursor={"pointer"}
          />
        </div>
      )}
      {deleteModalOpen && (
        <DeleteChatModal
          chat={selectedChat}
          setDeleteModalOpen={setDeleteModalOpen}
          setSelectedChat={setSelectedChat}
        />
      )}
      {editModalOpen && (
        <EditChatModal
          chat={selectedChat}
          setEditModalOpen={setEditModalOpen}
          setSelectedChat={setSelectedChat}
        />
      )}
      {searchModalOpen && (
        <SearchModal
          setMenuOpen={setMenuOpen}
          setSearchModalOpen={setSearchModalOpen}
        />
      )}
      {settingsModalOpen && (
        <SettingsModal setSettingsModalOpen={setSettingsModalOpen} />
      )}
    </aside>
  );
}

export default SideBar;

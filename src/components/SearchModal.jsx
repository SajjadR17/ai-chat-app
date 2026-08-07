import { useEffect, useRef, useState } from "react";
import { CgClose } from "react-icons/cg";
import { useAuth } from "../contexts/authContext";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../../firebase";
import { useNavigate } from "react-router-dom";
import { FiMessageSquare } from "react-icons/fi";
import { createPortal } from "react-dom";

function SearchModal({ setSearchModalOpen, setMenuOpen }) {
  const [searchValue, setSearchValue] = useState("");
  const [conversations, setConversations] = useState([]);
  const [displayConversations, setDisplayConversations] = useState([]);
  const inputRef = useRef(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchConversations = async () => {
      try {
        const conversationsRef = collection(
          db,
          "users",
          user.uid,
          "conversations",
        );
        const q = query(conversationsRef, orderBy("updatedAt", "desc"));
        const snapshot = await getDocs(q);
        const chats = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setConversations(chats);
        setDisplayConversations(chats);
      } catch (err) {
        console.log(err);
      }
    };

    fetchConversations();
  }, [user]);

  const inputChange = (e) => {
    setSearchValue(e.target.value);
    const filteredConversations = conversations.filter((c) =>
      c.title.toLowerCase().includes(e.target.value.toLowerCase()),
    );
    setDisplayConversations(filteredConversations);
  };

  return createPortal(
    <>
      <div
        className="modal-overlay"
        onClick={() => setSearchModalOpen(false)}
      ></div>
      <div className="chat-modal">
        <div className="search-modal-header">
          <input
            type="text"
            className="search-input"
            value={searchValue}
            ref={inputRef}
            onChange={(e) => inputChange(e)}
            placeholder="Search..."
          />
          <button
            className="search-modal-close-btn"
            onClick={() => setSearchModalOpen(false)}
          >
            <CgClose size={15} />
          </button>
        </div>
        <div className="search-result-list">
          {displayConversations.map((c) => (
            <div
              className="search-modal-conversation-card"
              onClick={() => {
                navigate(`/chat/${c.id}`);
                setSearchModalOpen(false);
                setMenuOpen(false);
              }}
            >
              <FiMessageSquare />
              {c.title}
            </div>
          ))}
          {displayConversations.length === 0 && (
            <div className="empty-convs-search">
              <FiMessageSquare size={30} />
              No Conversations
            </div>
          )}
        </div>
      </div>
    </>,
    document.body,
  );
}

export default SearchModal;

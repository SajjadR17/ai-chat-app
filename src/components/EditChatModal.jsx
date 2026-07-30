import React, { useEffect, useRef, useState } from "react";
import { updateConversationTitle } from "../lib/chat";
import { useAuth } from "../contexts/authContext";
import { ClipLoader } from "react-spinners";
import { createPortal } from "react-dom";

function EditChatModal({ chat, setEditModalOpen, setSelectedChat }) {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [editInputValue, setEditInputValue] = useState(chat.title || "");
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    const setInputValue = () => {
      setEditInputValue(chat.title);
    };
    setInputValue();
    inputRef.current?.focus();
  }, [chat]);

  const closeModal = () => {
    if (editing) return;

    setEditModalOpen(false);
    setSelectedChat(null);
  };

  const editHandler = async () => {
    const title = editInputValue.trim();
    if (!title) {
      setError("Title required");
      return;
    }
    if (title === chat.title) {
      setError("Title must be diffrent");
      return;
    }
    setEditing(true);
    try {
      await updateConversationTitle(user.uid, chat.id, title);
      closeModal();
    } catch (err) {
      console.log(err);
    } finally {
      setEditing(false);
    }
  };

  return createPortal(
    <>
      <div className="modal-overlay" onClick={closeModal}></div>
      <div className="chat-modal">
        <span className="modal-content">Edit Chat Title</span>
        <input
          type="text"
          value={editInputValue}
          maxLength={40}
          spellCheck={false}
          onChange={(e) => {
            setEditInputValue(e.target.value);
            setError("");
          }}
          ref={inputRef}
          className="edit-chat-title-input"
        />
        {error && <span className="edit-input-err mono">{error}</span>}
        <div className="modal-action-btns mono">
          <button
            className="cancel-btn"
            disabled={editing}
            onClick={closeModal}
          >
            Cancel
          </button>
          <button
            className="confirm-btn"
            disabled={editing}
            onClick={editHandler}
          >
            {editing ? (
              <ClipLoader size={15} color="var(--text-primary)" />
            ) : (
              "Edit"
            )}
          </button>
        </div>
      </div>
    </>,
    document.body,
  );
}

export default EditChatModal;

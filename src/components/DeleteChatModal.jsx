import React, { useState } from "react";
import { deleteConversation } from "../lib/chat";
import { useAuth } from "../contexts/authContext";
import { ClipLoader } from "react-spinners";
import { createPortal } from "react-dom";

function DeleteChatModal({ chat, setDeleteModalOpen, setSelectedChat }) {
  const { user } = useAuth();
  const [deleting, setDeleting] = useState(false);

  const closeModal = () => {
    if (deleting) return;

    setDeleteModalOpen(false);
    setSelectedChat(null);
  };

  const deleteHandler = async () => {
    setDeleting(true);
    try {
      await deleteConversation(user.uid, chat.id);
      closeModal();
    } catch (err) {
      console.log(err);
    } finally {
      setDeleting(false);
    }
  };

  return createPortal(
    <>
      <div className="modal-overlay" onClick={closeModal}></div>
      <div className="chat-modal">
        <span className="modal-content">Delete this conversation?</span>
        <div className="modal-action-btns mono">
          <button
            className="cancel-btn"
            disabled={deleting}
            onClick={closeModal}
          >
            No
          </button>
          <button
            className="confirm-btn"
            disabled={deleting}
            onClick={deleteHandler}
          >
            {deleting ? (
              <ClipLoader size={15} color="var(--text-primary)" />
            ) : (
              "Yes"
            )}
          </button>
        </div>
      </div>
    </>,
    document.body,
  );
}

export default DeleteChatModal;

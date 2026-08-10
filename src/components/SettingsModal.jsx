import React, { useState } from "react";
import { createPortal } from "react-dom";
import { doc, updateDoc } from "firebase/firestore";
import { useAuth } from "../contexts/authContext";
import { db } from "../../firebase";
import toast from "react-hot-toast";
import { CgClose } from "react-icons/cg";

function SettingsModal({ setSettingsModalOpen }) {
  const { user, userProfile } = useAuth();
  const [username, setUsername] = useState(userProfile?.username || "");
  const [aiInfo, setAiInfo] = useState(userProfile?.aiInfo || "");
  const [saving, setSaving] = useState(false);

  const closeModal = () => {
    if (saving) return;
    setSettingsModalOpen(false);
  };

  const handleSave = async () => {
    if (!user || saving) return;

    const usernameRegex = /^[A-Za-z]+(?: [A-Za-z]+)*$/;

    const cleanUsername = username.trim();
    const cleanAiInfo = aiInfo.trim();

    if (!cleanUsername) {
      toast.error("Please enter your name.");
      return;
    }

    if (cleanUsername.length < 2) {
      toast.error("Name must be at least 2 characters.");
      return;
    }

    if (cleanUsername.length > 40) {
      toast.error("Name must be 40 characters or less.");
      return;
    }

    if (!usernameRegex.test(cleanUsername)) {
      toast.error("Name can only contain English letters and spaces.");
      return;
    }

    if (cleanAiInfo.length > 1000) {
      toast.error("Information must be 1000 characters or less.");
      return;
    }

    const originalUsername = (userProfile?.username || "").trim();
    const originalAiInfo = (userProfile?.aiInfo || "").trim();

    if (cleanUsername === originalUsername && cleanAiInfo === originalAiInfo) {
      toast.error("You haven't made any changes.");
      return;
    }

    setSaving(true);

    try {
      await updateDoc(doc(db, "users", user.uid), {
        username: cleanUsername,
        aiInfo: cleanAiInfo,
      });

      toast.success("Settings updated successfully.");
      setSettingsModalOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update settings.");
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <>
      <div className="modal-overlay" onClick={closeModal}></div>
      <div className="chat-modal">
        <div className="settings-header">
          <h2>Settings</h2>
          <button type="button" className="modal-close" onClick={closeModal}>
            <CgClose />
          </button>
        </div>
        <div className="settings-field">
          <label htmlFor="username" className="mono">
            Name
          </label>
          <input
            id="username"
            type="text"
            spellCheck="false"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            maxLength={40}
          />
        </div>
        <div className="settings-field">
          <label htmlFor="aiInfo" className="mono">
            Information
          </label>
          <textarea
            id="aiInfo"
            spellCheck="false"
            value={aiInfo}
            onChange={(e) => setAiInfo(e.target.value)}
            maxLength={1000}
            rows={5}
          />
        </div>
        <div className="modal-action-btns">
          <button
            type="button"
            className="cancel-btn"
            onClick={closeModal}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="button"
            className="confirm-btn"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>
    </>,
    document.body,
  );
}

export default SettingsModal;

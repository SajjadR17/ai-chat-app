import {
  addDoc,
  collection,
  doc,
  getDocs,
  limitToLast,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from "firebase/firestore";

import { db } from "../../firebase";
import { askAI } from "../services/ai";
import { generateImage } from "../services/imgAi";

const createConversation = async (uid) => {
  const docRef = await addDoc(collection(db, "users", uid, "conversations"), {
    title: "New Chat",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
};

const updateConversation = async (uid, chatId) => {
  await updateDoc(doc(db, "users", uid, "conversations", chatId), {
    updatedAt: serverTimestamp(),
  });
};

const addMessage = async (
  uid,
  chatId,
  role,
  content,
  type = "text",
  lang = "en-US",
) => {
  await addDoc(
    collection(db, "users", uid, "conversations", chatId, "messages"),
    {
      role,
      content,
      type,
      createdAt: serverTimestamp(),
      lang,
    },
  );
};

export const formatMessageTime = (timestamp) => {
  if (!timestamp) return "";

  const date = timestamp.toDate();
  const now = new Date();

  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }

  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
};

const getConversationHistory = async (uid, chatId) => {
  const messagesRef = collection(
    db,
    "users",
    uid,
    "conversations",
    chatId,
    "messages",
  );

  const q = query(messagesRef, orderBy("createdAt", "asc"), limitToLast(6));

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data();

    return {
      role: data.role,
      content: data.content,
    };
  });
};

export const updateConversationTitle = async (uid, chatId, title) => {
  await updateDoc(doc(db, "users", uid, "conversations", chatId), {
    title: title || "New Conversation",
  });
};

export const deleteConversation = async (uid, chatId) => {
  const messagesRef = collection(
    db,
    "users",
    uid,
    "conversations",
    chatId,
    "messages",
  );

  const snapshot = await getDocs(messagesRef);

  const batch = writeBatch(db);

  snapshot.forEach((messageDoc) => {
    batch.delete(messageDoc.ref);
  });

  batch.delete(doc(db, "users", uid, "conversations", chatId));

  await batch.commit();
};

export const sendUserMessage = async ({
  uid,
  chatId,
  selectedTool,
  setSelectedTool,
  message,
  navigate,
  setAnswering,
  setMessage,
  setCreatingImg,
  retry,
}) => {
  let currentChatId = chatId;

  if (!currentChatId || currentChatId === "new") {
    currentChatId = await createConversation(uid);
  }

  if (!retry) {
    await addMessage(uid, currentChatId, "user", message, "text");
  }

  setMessage?.("");

  if (chatId === "new") {
    navigate(`/chat/${currentChatId}`, {
      replace: true,
    });
  }

  try {
    setAnswering?.(true);
    const history = await getConversationHistory(uid, currentChatId);
    const data = await askAI(message, history, chatId === "new", selectedTool);

    if (chatId === "new") {
      await updateConversationTitle(uid, currentChatId, data.title);
    }

    if (data.type === "image") {
      setAnswering(false);
      setCreatingImg(true);
      const imageUrl = await generateImage(data.prompt);
      setCreatingImg(false);
      await addMessage(
        uid,
        currentChatId,
        "assistant",
        `![generated image](${imageUrl})`,
        "image",
      );

      return;
    } else {
      setAnswering?.(false);
      await addMessage(
        uid,
        currentChatId,
        "assistant",
        data.answer,
        data.type,
        data.lang,
      );
    }

    await updateConversation(uid, currentChatId);
  } finally {
    setAnswering?.(false);
    setCreatingImg(false);
    setSelectedTool("auto");
  }
};

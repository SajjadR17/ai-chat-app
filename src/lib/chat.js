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
import { generateImage } from "../services/imgAi";
import { searchWeb } from "../services/search";
import { aiRouter } from "../services/aiRouter";
import { aiAnswer } from "../services/aiAnswer";

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
  sources = [],
  searchTime = 0,
) => {
  await addDoc(
    collection(db, "users", uid, "conversations", chatId, "messages"),
    {
      role,
      content,
      type,
      createdAt: serverTimestamp(),
      lang,
      ...(sources.length > 0 && { sources }),
      ...(searchTime > 0 && { searchTime }),
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

const getConversationHistory = async (uid, chatId, limit) => {
  const messagesRef = collection(
    db,
    "users",
    uid,
    "conversations",
    chatId,
    "messages",
  );

  const q = query(messagesRef, orderBy("createdAt", "asc"), limitToLast(limit));

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
    title: title || "New Chat",
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
  setSearching,
  setMessage,
  setCreatingImg,
  retry,
  selectedModel,
  userProfile,
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

    const history = await getConversationHistory(uid, currentChatId, 6);

    const route = await aiRouter(
      message,
      history,
      selectedTool,
      chatId === "new",
    );

    if (route.type === "blocked") {
      await addMessage(
        uid,
        currentChatId,
        "assistant",
        route.answer,
        route.type,
      );

      return;
    }

    let data;
    let searchData;

    if (route.type === "image") {
      data = route;
    } else if (route.type === "search") {
      setAnswering?.(false);
      setSearching?.(true);

      searchData = await searchWeb(route.searchQuery);

      setSearching?.(false);
      setAnswering?.(true);

      data = await aiAnswer(
        message,
        history,
        searchData,
        selectedModel,
        userProfile,
      );
    } else {
      data = await aiAnswer(message, history, null, selectedModel, userProfile);
    }

    if (chatId === "new" && route.title) {
      await updateConversationTitle(uid, currentChatId, route.title);
    }

    if (data.type === "image") {
      setAnswering?.(false);
      setCreatingImg?.(true);

      const imageUrl = await generateImage(data.prompt);

      setCreatingImg?.(false);

      await addMessage(
        uid,
        currentChatId,
        "assistant",
        `![generated image](${imageUrl})`,
        data.type,
      );

      setSelectedTool?.("auto");
      return;
    }

    setAnswering?.(false);

    await addMessage(
      uid,
      currentChatId,
      "assistant",
      data.answer,
      data.type,
      data.lang,
      data.sources || [],
      searchData?.searchTime || 0,
    );

    await updateConversation(uid, currentChatId);
    setSelectedTool?.("auto");
  } finally {
    setAnswering?.(false);
    setSearching?.(false);
    setCreatingImg?.(false);
  }
};

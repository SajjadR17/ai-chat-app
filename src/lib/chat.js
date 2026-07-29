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

export async function createConversation(uid) {
  const docRef = await addDoc(collection(db, "users", uid, "conversations"), {
    title: "New Chat",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function updateConversation(uid, chatId) {
  await updateDoc(doc(db, "users", uid, "conversations", chatId), {
    updatedAt: serverTimestamp(),
  });
}

export async function addMessage(uid, chatId, role, content) {
  await addDoc(
    collection(db, "users", uid, "conversations", chatId, "messages"),
    {
      role,
      content,
      createdAt: serverTimestamp(),
    },
  );
}

export function formatMessageTime(timestamp) {
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
}

export async function getConversationHistory(uid, chatId) {
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
      role: data.role === "bot" ? "assistant" : "user",
      content: data.content,
    };
  });
}

export async function updateConversationTitle(uid, chatId, title) {
  await updateDoc(doc(db, "users", uid, "conversations", chatId), {
    title,
  });
}

export async function deleteConversation(uid, chatId) {
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
}

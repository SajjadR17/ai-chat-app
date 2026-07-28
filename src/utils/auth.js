import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth, db } from "../../firebase";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";

function buildShortName(fullName) {
  const words = fullName.trim().split(/\s+/);

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  const first = words[0][0];
  const last = words[words.length - 1][0];

  return (first + last).toUpperCase();
}

export async function login(email, password) {
  return await signInWithEmailAndPassword(auth, email, password);
}

export function logout() {
  return signOut(auth);
}

export async function signup(email, password, username) {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password,
  );

  const user = userCredential.user;

  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    email: user.email,
    username: username || "New User",
    shortName: buildShortName(username || "New User"),
    role: "user",
    createdAt: serverTimestamp(),
  });

  return user;
}

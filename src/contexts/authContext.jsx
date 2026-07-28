import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../firebase";
import { ClipLoader } from "react-spinners";
import { doc, onSnapshot } from "firebase/firestore";
import { BsWifiOff } from "react-icons/bs";

const AuthContext = createContext(undefined);

const WATCHDOG_MS = 10000;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [authError, setAuthError] = useState("");
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );

  useEffect(() => {
    const online = () => setIsOnline(true);
    const offline = () => setIsOnline(false);

    window.addEventListener("online", online);
    window.addEventListener("offline", offline);

    return () => {
      window.removeEventListener("online", online);
      window.removeEventListener("offline", offline);
    };
  }, []);

  useEffect(() => {
    let unsubscribeProfile = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setCheckingAuth(true);

      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (!currentUser) {
        setAuthError("");
        setUserProfile(null);
        setCheckingAuth(false);
        return;
      }

      unsubscribeProfile = onSnapshot(
        doc(db, "users", currentUser.uid),
        (snap) => {
          setAuthError("");
          setUserProfile(snap.exists() ? snap.data() : null);
          setCheckingAuth(false);
        },
        (error) => {
          console.error(error);

          if (error.code === "unavailable") {
            setAuthError("firebase-unreachable");
          } else if (error.code === "permission-denied") {
            setAuthError("permission-denied");
            setUserProfile(null);
          } else {
            setAuthError("unknown-error");
          }

          setCheckingAuth(false);
        },
      );
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) {
        unsubscribeProfile();
      }
    };
  }, []);

  if (checkingAuth) {
    return (
      <div className="app-loading">
        <ClipLoader color="var(--text-secondary)" size={30} />
        <span className="mono" style={{ color: "var(--text-secondary)" }}>
          LOADING APP
        </span>
      </div>
    );
  }

  if (!isOnline) {
    return (
      <div className="app-no-internet-err">
        <BsWifiOff size={40} color="var(--text-secondary)" />
        <span className="mono" style={{ color: "var(--text-secondary)" }}>
          NO INTERNET CONNECTION
        </span>
      </div>
    );
  }

  if (authError === "firebase-unreachable") {
    return (
      <div className="app-no-internet-err">
        <BsWifiOff size={40} color="var(--text-secondary)" />
        <span className="mono" style={{ color: "var(--text-secondary)" }}>
          Unable to connect to the server.
          <br />
          Please check your internet connection.
          <br />
          If Firebase is restricted in your region, you may need to use a VPN.
        </span>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, userProfile, authError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error("useAuth() must be used within an AuthProvider");
  }
  return ctx;
}

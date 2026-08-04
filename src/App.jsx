import { useState } from "react";
import Header from "./components/Header";
import { useAuth } from "./contexts/authContext";
import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import SideBar from "./components/SideBar";
import ChatPage from "./pages/ChatPage";
import { Toaster } from "react-hot-toast";

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: "var(--bg-card)",
            color: "var(--text-primary)",
            borderRadius: "5px",
            fontSize: "12px",
            fontFamily: "IBM Plex Mono",
            padding: "15px",
            border: "1px solid var(--border)",
          },
          success: {
            iconTheme: {
              primary: "var(--violet)",
              secondary: "var(--bg-primary)",
            },
          },
          error: {
            iconTheme: {
              primary: "var(--danger)",
              secondary: "var(--text-primary)",
            },
          },
        }}
      />
      {!user ? (
        <>
          <Routes>
            <Route
              path="*"
              element={<Navigate to={"/login"} replace={true} />}
            />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
          </Routes>
        </>
      ) : (
        <div className="layout">
          <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
          <div className="app">
            <SideBar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
            <main>
              <Routes>
                <Route path="/" element={<Navigate to="/chat/new" replace />} />
                <Route path="/chat/:chatId" element={<ChatPage />} />
              </Routes>
            </main>
          </div>
        </div>
      )}
    </>
  );
}

export default App;

import { useState } from "react";
import Header from "./components/Header";
import { useAuth } from "./contexts/authContext";
import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import SideBar from "./components/SideBar";

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();

  return (
    <>
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
            <SideBar menuOpen={menuOpen} />
            <main>
              <Routes>
                <Route path="/" element={<Navigate to="/chat/new" replace />} />
                <Route path="/chat/:chatId" element={null} />
              </Routes>
            </main>
          </div>
        </div>
      )}
    </>
  );
}

export default App;

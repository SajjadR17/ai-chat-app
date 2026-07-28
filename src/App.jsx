import { useState } from "react";
import Header from "./components/Header";
import { useAuth } from "./contexts/authContext";
import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();

  return (
    <>
      <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <Routes>
        {!user ? (
          <>
            <Route
              path="*"
              element={<Navigate to={"/login"} replace={true} />}
            />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
          </>
        ) : (
          <>
            <Route path="/" element={<Navigate to="/chat/new" replace />} />
            <Route path="/chat/:chatId" element={null} />
          </>
        )}
      </Routes>
    </>
  );
}

export default App;

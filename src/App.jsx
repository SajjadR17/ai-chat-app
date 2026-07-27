import { useState } from "react";
import Header from "./components/Header";

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <>
      <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
    </>
  );
}

export default App;

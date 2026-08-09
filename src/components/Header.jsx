import { BiMenu } from "react-icons/bi";
import "../styles//header.css";
import { IoChevronDown, IoChevronUp, IoClose } from "react-icons/io5";
import { useAuth } from "../contexts/authContext";
import { LuLogOut, LuUser } from "react-icons/lu";
import { useAi } from "../contexts/aiContext";
import { useEffect, useRef, useState } from "react";

function Header({ menuOpen, setMenuOpen }) {
  const { user, userProfile } = useAuth();
  const { selectedModel, setSelectedModel } = useAi();
  const [selectModelMenuOpen, setSelectModelMenuOpen] = useState(false);
  const models = [
    { name: "openai/gpt-oss-120b", power: "Best Quality" },
    { name: "openai/gpt-oss-20b", power: "Fast Response" },
    { name: "llama-3.1-8b-instant", power: "Fastest" },
    { name: "qwen/qwen3.6-27b", power: "Coding" },
  ];

  const modelNames = {
    "openai/gpt-oss-120b": "GPT OSS 120B",
    "openai/gpt-oss-20b": "GPT OSS 20B",
    "llama-3.1-8b-instant": "Llama 3.1 8B",
    "qwen/qwen3.6-27b": "Qwen 3.6 27B",
  };

  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setSelectModelMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header>
      <nav className="nav">
        <div className="brand">
          {menuOpen ? (
            <IoClose
              className="close-menu-icon"
              onClick={() => setMenuOpen(false)}
              size={20}
            />
          ) : (
            <BiMenu
              className="menu-icon"
              onClick={() => setMenuOpen(true)}
              size={20}
            />
          )}
          <div className="logo">
            <div className="logo-circle"></div>
            <span>Nightline</span>
          </div>
        </div>
        <div className="nav-right">
          <div className="user-status mono">
            <div
              className={`status-circle ${!user || !userProfile ? "offline" : "online"}`}
            ></div>
            <span className="badge-content">
              {!user || !userProfile ? "offline" : "online"}
            </span>
          </div>
          <div
            ref={menuRef}
            className="model-type-selector mono"
            onClick={() => setSelectModelMenuOpen((prev) => !prev)}
          >
            {modelNames[selectedModel]}
            {selectModelMenuOpen ? <IoChevronUp /> : <IoChevronDown />}
            {selectModelMenuOpen && (
              <div className="model-select-menu">
                {models.map((m) => (
                  <button
                    className="model-select-card"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedModel(m.name);
                      setSelectModelMenuOpen(false);
                    }}
                  >
                    <span>{modelNames[m.name]}</span>
                    <span>{`(${m.power})`}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Header;

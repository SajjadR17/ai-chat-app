import { BiMenu } from "react-icons/bi";
import "../styles//header.css";
import { IoClose } from "react-icons/io5";
import { useAuth } from "../contexts/authContext";
import { LuLogOut, LuUser } from "react-icons/lu";
import { useState } from "react";
import { logout } from "../utils/auth";
import { useNavigate } from "react-router-dom";

function Header({ menuOpen, setMenuOpen }) {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

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
          {user && userProfile && (
            <>
              <div
                className="user-profile-card mono"
                onClick={() => setProfileMenuOpen((prev) => !prev)}
              >
                {userProfile?.shortName}
              </div>
              {profileMenuOpen && (
                <div className="profile-card-menu mono">
                  <div className="profile-card-menu-username">
                    <LuUser size={15} color="var(--text-primary)" />
                    {userProfile?.username}
                  </div>
                  <button
                    className="profile-card-menu-logout-btn"
                    onClick={async () => {
                      await logout();
                      navigate("/login");
                    }}
                  >
                    <LuLogOut size={15} color="var(--text-primary)" /> Logout
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Header;

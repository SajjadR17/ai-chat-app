import { BiMenu } from "react-icons/bi";
import "../styles//header.css";
import { IoClose } from "react-icons/io5";
import { useAuth } from "../contexts/authContext";

function Header({ menuOpen, setMenuOpen }) {
  const { user, userProfile } = useAuth();

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
            <div className="user-profile-card mono">
              {userProfile.shortName}
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Header;

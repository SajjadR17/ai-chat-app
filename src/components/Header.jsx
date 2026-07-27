import { BiMenu } from "react-icons/bi";
import "../styles//header.css";
import { IoClose } from "react-icons/io5";

function Header({menuOpen,setMenuOpen}) {

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
            <div className="status-circle"></div>
            <span className="badge-content">online</span>
          </div>
          <div className="user-profile-card mono">SR</div>
        </div>
      </nav>
    </header>
  );
}

export default Header;

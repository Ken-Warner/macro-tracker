import { useEffect, useRef, useState } from "react";
import { useUser } from "../context/useUser";

export default function Banner({
  navItems,
  selectedNavItem,
  onClick,
  isLoggedIn,
}: {
  navItems: string[];
  selectedNavItem: string;
  onClick: (navItem: string) => void;
  isLoggedIn: boolean;
}) {
  const { user, logout } = useUser();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (
        bannerRef.current &&
        !bannerRef.current.contains(event.target as Node)
      ) {
        setIsNavOpen(false);
        setIsUserMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsNavOpen(false);
        setIsUserMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function handleNavClick(navItem: string) {
    onClick(navItem);
    setIsNavOpen(false);
  }

  function toggleNav() {
    setIsNavOpen((open) => !open);
    setIsUserMenuOpen(false);
  }

  function toggleUserMenu() {
    setIsUserMenuOpen((open) => !open);
    setIsNavOpen(false);
  }

  return (
    <header className="header-banner" ref={bannerRef}>
      <div className="header-banner-start">
        {isLoggedIn && (
          <button
            type="button"
            className="banner-hamburger"
            aria-label="Open navigation menu"
            aria-expanded={isNavOpen}
            onClick={toggleNav}
          >
            <span className="banner-hamburger-bar" />
            <span className="banner-hamburger-bar" />
            <span className="banner-hamburger-bar" />
          </button>
        )}
        <div className="banner-brand">
          <img
            className="banner-brand-icon"
            src="/favicon.svg"
            alt="Macro Tracker"
          />
          <div className="banner-brand-text">
            <h1>Macro-Tracker</h1>
            <h2>Track your daily macros!</h2>
          </div>
        </div>
      </div>

      {isLoggedIn && (
        <nav
          className={`banner-nav${isNavOpen ? " banner-nav--open" : ""}`}
          aria-label="Main"
        >
          {navItems.map((navItem) => (
            <span
              key={navItem}
              className={navItem === selectedNavItem ? "active" : ""}
              onClick={() => handleNavClick(navItem)}
            >
              {navItem}
            </span>
          ))}
        </nav>
      )}

      {isLoggedIn && (
        <div className="banner-user">
          <button
            type="button"
            className="banner-user-button"
            aria-label="Open user menu"
            aria-expanded={isUserMenuOpen}
            onClick={toggleUserMenu}
          >
            <img src="/user.svg" alt="" className="banner-user-icon" />
          </button>
          {isUserMenuOpen && (
            <div className="banner-user-menu">
              <p className="banner-user-menu-name">
                Logged in as {user!.username}
              </p>
              <button
                type="button"
                className="banner-user-logout"
                onClick={() => {
                  setIsUserMenuOpen(false);
                  logout();
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

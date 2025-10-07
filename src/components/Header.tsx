import { useEffect, useRef, useState, type FC } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

interface HeaderProps {
  onToggleSidebar: () => void;
  onOpenProfile: () => void;
}

const Header: FC<HeaderProps> = ({ onToggleSidebar, onOpenProfile }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const languageMenuRef = useRef<HTMLDivElement>(null);
  const { logout } = useAuth();
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage, isRTL } = useLanguage();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
      if (
        languageMenuRef.current &&
        !languageMenuRef.current.contains(event.target as Node)
      ) {
        setIsLanguageMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex items-center lg:justify-end justify-between w-full">
      {/* Mobile 3-dot menu button */}
      <div
        className="w-[40px] h-[40px] sm:w-[45px] sm:h-[45px] rounded-[50px] lg:hidden transition-colors duration-300"
        style={{ backgroundColor: "var(--button-secondary)" }}
      >
        <button
          onClick={onToggleSidebar}
          className="w-full h-full flex items-center justify-center leading-normal text-[18px] sm:text-[20px] transition-colors duration-300"
          style={{ color: "var(--accent-primary)" }}
        >
          <i className="fa-solid fa-bars"></i>
        </button>
      </div>

      <div className="flex gap-5 items-center">
        {/* Search bar */}
        <div className=" w-full sm:w-[300px] lg:w-[400px] relative border rounded-full border-[#0d0d78]">
          <input
            type="text"
            placeholder={t("header.searchPlaceholder")}
            className="w-full outline-none font-medium text-sm sm:text-base lg:text-[16px] px-3 sm:px-4 lg:px-[25px] py-2 sm:py-2.5 lg:py-[12px] rounded-full transition-colors duration-300"
            style={{
              backgroundColor: "var(--input-bg)",
              color: "var(--text-primary)",
            }}
          />
          <a
            href="javascript:;"
            className="flex w-fit h-fit items-center absolute top-0 bottom-0 right-3 sm:right-4 lg:right-5 m-auto text-[14px] sm:text-[16px] lg:text-[18px] transition-colors duration-300"
            style={{ color: "var(--accent-primary)" }}
          >
            <i className="fa-solid fa-magnifying-glass"></i>
          </a>
        </div>

        {/* Language dropdown */}
        <div
          className="relative inline-block text-left flex-shrink-0"
          ref={languageMenuRef}
        >
          <button
            type="button"
            onClick={() => setIsLanguageMenuOpen((prev) => !prev)}
            className="inline-flex gap-1 sm:gap-2 justify-center items-center w-full rounded-full border border-transparent shadow-sm px-2 sm:px-3 py-1.5 sm:py-2 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-150 ease-in-out"
            style={{
              backgroundColor: "var(--button-secondary)",
              color: "var(--accent-primary)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--button-primary)";
              e.currentTarget.style.color = "var(--sidebar-text)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "var(--button-secondary)";
              e.currentTarget.style.color = "var(--accent-primary)";
            }}
            id="language-button"
            aria-expanded="true"
            aria-haspopup="true"
          >
            <i className="fa-solid fa-globe text-sm sm:text-base"></i>
            <span className="hidden sm:inline text-sm">
              {currentLanguage.toUpperCase()}
            </span>
            <svg
              className="h-3 w-3 sm:h-4 sm:w-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {isLanguageMenuOpen && (
            <div
              className="origin-top-right absolute right-0 mt-2 w-32 sm:w-40 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 transition-colors duration-300"
              style={{
                backgroundColor: "var(--card-bg)",
                boxShadow: "var(--card-shadow)",
              }}
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="language-button"
              tabIndex={-1}
              id="language-dropdown-menu"
            >
              <div className="py-1" role="none">
                <button
                  onClick={() => {
                    changeLanguage("en");
                    setIsLanguageMenuOpen(false);
                  }}
                  className={`block px-4 py-2 text-sm w-full text-left transition-colors duration-200 ${
                    currentLanguage === "en" ? "font-semibold" : ""
                  }`}
                  style={{
                    color:
                      currentLanguage === "en"
                        ? "var(--accent-primary)"
                        : "var(--text-primary)",
                    backgroundColor:
                      currentLanguage === "en"
                        ? "var(--bg-tertiary)"
                        : "transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (currentLanguage !== "en") {
                      e.currentTarget.style.backgroundColor =
                        "var(--bg-tertiary)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentLanguage !== "en") {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }
                  }}
                  role="menuitem"
                  tabIndex={-1}
                  id="language-item-en"
                >
                  🇺🇸 English
                </button>
                <button
                  onClick={() => {
                    changeLanguage("ar");
                    setIsLanguageMenuOpen(false);
                  }}
                  className={`block px-4 py-2 text-sm w-full text-left transition-colors duration-200 ${
                    currentLanguage === "ar" ? "font-semibold" : ""
                  }`}
                  style={{
                    color:
                      currentLanguage === "ar"
                        ? "var(--accent-primary)"
                        : "var(--text-primary)",
                    backgroundColor:
                      currentLanguage === "ar"
                        ? "var(--bg-tertiary)"
                        : "transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (currentLanguage !== "ar") {
                      e.currentTarget.style.backgroundColor =
                        "var(--bg-tertiary)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentLanguage !== "ar") {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }
                  }}
                  role="menuitem"
                  tabIndex={-1}
                  id="language-item-ar"
                >
                  🇸🇦 العربية
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Notification icon */}
        <div
          className="salva-noti-head-main w-[40px] h-[40px] sm:w-[45px] sm:h-[45px] rounded-[50px] flex-shrink-0 transition-colors duration-300"
          style={{ backgroundColor: "var(--button-secondary)" }}
        >
          <a className="flex items-center justify-center w-full h-full">
            <img
              src="/img/header-noti.png"
              alt="Notifications"
              className="w-4 h-4 sm:w-5 sm:h-5"
            />
          </a>
        </div>

        {/* Profile dropdown */}
        <div
          className="relative inline-block text-left flex-shrink-0"
          ref={menuRef}
        >
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="inline-flex gap-1 sm:gap-2 justify-center items-center w-full rounded-full border border-transparent shadow-sm px-2 sm:px-3 py-1.5 sm:py-2 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-150 ease-in-out"
            style={{
              backgroundColor: "var(--button-secondary)",
              color: "var(--accent-primary)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--button-primary)";
              e.currentTarget.style.color = "var(--sidebar-text)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "var(--button-secondary)";
              e.currentTarget.style.color = "var(--accent-primary)";
            }}
            id="menu-button"
            aria-expanded="true"
            aria-haspopup="true"
          >
            <img
              src="/img/profile-ahemda.png"
              alt="Profile"
              className="w-5 h-5 sm:w-6 sm:h-6 rounded-full"
            />
            <span className="hidden sm:inline text-sm">
              {localStorage.getItem("adminName")}
            </span>
            <svg
              className="h-3 w-3 sm:h-4 sm:w-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {isMenuOpen && (
            <div
              className="origin-top-right absolute right-0 mt-2 w-48 sm:w-56 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 transition-colors duration-300"
              style={{
                backgroundColor: "var(--card-bg)",
                boxShadow: "var(--card-shadow)",
              }}
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="menu-button"
              tabIndex={-1}
              id="dropdown-menu"
            >
              <div className="py-1" role="none">
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenProfile();
                  }}
                  className="block px-4 py-2 text-sm w-full text-left transition-colors duration-200"
                  style={{ color: "var(--text-primary)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "var(--bg-tertiary)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                  role="menuitem"
                  tabIndex={-1}
                  id="menu-item-0"
                >
                  {t("header.accountSettings")}
                </button>
                <a
                  href="#"
                  className="block px-4 py-2 text-sm transition-colors duration-200"
                  style={{ color: "var(--text-primary)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "var(--bg-tertiary)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                  role="menuitem"
                  tabIndex={-1}
                  id="menu-item-1"
                >
                  {t("header.support")}
                </a>
                <a
                  href="#"
                  className="block px-4 py-2 text-sm transition-colors duration-200"
                  style={{ color: "var(--text-primary)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "var(--bg-tertiary)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                  role="menuitem"
                  tabIndex={-1}
                  id="menu-item-2"
                >
                  {t("header.license")}
                </a>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    logout();
                  }}
                  className="block w-full text-left px-4 py-2 text-sm transition-colors duration-200"
                  style={{ color: "var(--text-primary)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "var(--bg-tertiary)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                  role="menuitem"
                  tabIndex={-1}
                  id="menu-item-3"
                >
                  {t("header.signOut")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;

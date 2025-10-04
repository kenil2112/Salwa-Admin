import { useEffect, useRef, useState, type FC } from "react";
import { useAuth } from "../context/AuthContext";

interface HeaderProps {
  onToggleSidebar: () => void;
  onOpenProfile: () => void;
}

const Header: FC<HeaderProps> = ({ onToggleSidebar, onOpenProfile }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { logout } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white px-6">
      <button
        type="button"
        onClick={onToggleSidebar}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-gray-600 transition hover:border-primary hover:text-primary lg:hidden"
        aria-label="Toggle sidebar"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.6}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      {/* <div className="flex flex-1 items-center justify-end gap-3">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-textMedium text-gray-600 transition hover:border-primary hover:text-primary"
        >
          English
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 0 1 1.08 1.04l-4.24 4.5a.75.75 0 0 1-1.08 0l-4.24-4.5a.75.75 0 0 1 .02-1.06Z" clipRule="evenodd" />
          </svg>
        </button>
        <button
          type="button"
          className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-gray-500 transition hover:border-primary hover:text-primary"
          aria-label="Notifications"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.6}
            className="h-5 w-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6.002 6.002 0 0 0-4-5.659V4a2 2 0 1 0-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 1 1-6 0v-1"
            />
          </svg>
          <span className="absolute -top-1 -right-1 inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
        </button>
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="flex items-center gap-3 rounded-full border border-slate-200 px-3 py-1.5 text-gray-600 transition hover:border-primary/60 hover:text-primary"
          >
            <div className="grid h-9 w-9 place-items-center rounded-full bg-primary text-white font-helveticaBold">SA</div>
            <div className="hidden text-left text-xs leading-4 sm:block">
              <p className="font-helveticaBold text-primary">Sara Ahmed</p>
              <p className="font-textMedium text-gray-400">Administrator</p>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4 text-gray-400"
            >
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.171l3.71-3.94a.75.75 0 0 1 1.08 1.04l-4.24 4.5a.75.75 0 0 1-1.08 0l-4.24-4.5a.75.75 0 0 1 .02-1.06Z" clipRule="evenodd" />
            </svg>
          </button>
          {isMenuOpen && (
            <div className="absolute right-0 z-10 mt-3 w-40 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
              <button
                type="button"
                className="flex w-full items-center gap-3 px-4 py-2 text-sm font-textMedium text-gray-600 transition hover:bg-primary/10"
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenProfile();
                }}
              >
                <ProfileIcon />
                Profile
              </button>
              <button
                type="button"
                className="flex w-full items-center gap-3 px-4 py-2 text-sm font-textMedium text-red-500 transition hover:bg-red-50"
                onClick={() => {
                  setIsMenuOpen(false);
                  logout();
                }}
              >
                <LogoutIcon />
                Logout
              </button>
            </div>
          )}
        </div>
      </div> */}
      <div
                    className="w-fit ml-auto flex flex-wrap gap-5 max-[767px]:w-[100%] items-center">

                    <div className="w-[400px] max-[480px]:w-[100%] relative max-[767px]:w-[100%] ">
                        <input type="text" placeholder="Search here"
                            className="bg-[#ECF0F6] w-full outline-none font-medium text-[17px] px-[30px] py-[15px] rounded-full" />
                        <p
                            className="text-[#1B1787] flex w-fit h-fit items-center absolute top-0 bottom-0 right-6 m-auto text-[20px]"><i
                                className="fa-solid fa-magnifying-glass"></i></p>
                    </div>

                    <div className="w-[55px] h-[55px] rounded-[50px] bg-[#ECF0F6] relative">
                        <p className="flex items-center justify-center w-full h-full"><img
                                src="./img/header-noti.png"/></p>
                                <span className="absolute -top-1 -right-1 inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
                    </div>

                    <div className="relative inline-block text-left" ref={menuRef}>
                        <div>
                            <button type="button"
                            onClick={() => setIsMenuOpen((prev) => !prev)}
                                className="inline-flex gap-2 justify-center items-center w-full rounded-full border border-transparent shadow-sm px-4 py-2 bg-[#ECF0F6] font-medium text-[#1B1787] hover:bg-[#15159b] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#15159b] hover:text-[#ffffff] transition duration-150 ease-in-out"
                                id="menu-button" aria-expanded="true" aria-haspopup="true">
                                <img src="./img/profile-ahemda.png"/>
                                Ahmed
                                <svg className="-mr-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
                                    fill="currentColor" aria-hidden="true">
                                    <path fill-rule="evenodd"
                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                        clip-rule="evenodd" />
                                </svg>
                            </button>
                        </div>
{isMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                            role="menu" aria-orientation="vertical" aria-labelledby="menu-button"
                            id="dropdown-menu">
                                <button onClick={() => {
                  setIsMenuOpen(false);
                  onOpenProfile();
                }} className="text-gray-700 flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100 w-full text-left"
                                    role="menuitem" id="menu-item-0"><ProfileIcon /> Profile</button>
                                    <button
                                    onClick={() => {
                  setIsMenuOpen(false);
                  logout();
                }}
                                        className="text-gray-700 items-center gap-3 w-full text-left px-4 py-2 text-sm flex hover:bg-gray-100"
                                        role="menuitem" id="menu-item-3"><LogoutIcon /> Sign out</button>
                                        
                            </div>
          )}
                      </div>

                </div>

    </header>
  );
};

const ProfileIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-4 w-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 20a6 6 0 0 1 12 0" />
  </svg>
);

const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-4 w-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H3" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7L3 12l5 5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 5h4a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-4" />
  </svg>
);

export default Header;



import clsx from "clsx";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import type { FC } from "react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const getMenuItems = (t: any) => [
  { label: t('sidebar.analysis'), href: "/dashboard", icon: "/theme-icons/analysis.png" },
  {
    label: t('sidebar.serviceDashboard'),
    href: "/service-dashboard",
    icon: "/theme-icons/providers.png",
  },
  { label: t('sidebar.reports'), href: "/reports", icon: "/theme-icons/report.png" },
  {
    label: t('sidebar.statementAnalysis'),
    href: "/statement-analysis",
    icon: "/theme-icons/wallet.png",
  },
  {
    label: t('sidebar.subscribers'),
    href: "/subscribers",
    icon: "/theme-icons/subscription-details.png",
  },
  {
    label: t('sidebar.agents'),
    href: "/agents",
    icon: "/theme-icons/employee-database.png",
  },
  {
    label: t('sidebar.promocodeSettings'),
    href: "/promocode-settings",
    icon: "/theme-icons/invoice.png",
  },
  {
    label: t('sidebar.nonMedicalCompanies'),
    href: "/non-medical-companies",
    icon: "/theme-icons/providers.png",
  },
  {
    label: t('sidebar.subscriptionSettings'),
    href: "/subscription-settings",
    icon: "/theme-icons/subscription-details.png",
  },
  {
    label: t('sidebar.serviceManagement'),
    href: "/service-management",
    icon: "/theme-icons/orders-icon.png",
  },
  {
    label: t('sidebar.supervisorManagement'),
    href: "/supervisor-management",
    icon: "/theme-icons/messages.png",
  },
  {
    label: t('sidebar.employeeCategory'),
    href: "/employee-category",
    icon: "/theme-icons/requests.png",
  },
  {
    label: t('sidebar.termsMaster'),
    href: "/terms-master",
    icon: "/theme-icons/requests.png",
  },
  {
    label: t('sidebar.advancedOptions'),
    href: "/advanced-options",
    icon: "/theme-icons/settings.png",
  },
];

const Sidebar: FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const menuItems = getMenuItems(t);

  return (
    <div
      className={clsx(
        "salva-sidebar-left-main w-[280px] sm:w-[320px] lg:w-[400px] min-w-[280px] sm:min-w-[320px] lg:min-w-[400px] lg:rounded-[20px] z-50 transition-all duration-300 ease-in-out flex flex-col",
        "fixed lg:sticky top-0 left-0 h-full lg:h-full",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
      style={{
        backgroundColor: "var(--sidebar-bg)",
        zIndex: 50,
      }}
    >
      <div
        className="salva-sidebar-head-logo w-full p-[40px] rounded-[20px] relative transition-colors duration-300"
        style={{
          backgroundColor: "var(--sidebar-accent)",
          boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.4)",
        }}
      >
        <img src="/img/salva-logo.png" alt="Salwa" />
        <button
          onClick={onClose}
          className="salva-toggle-bars absolute top-1 right-1 w-[30px] h-30 bg-white m-auto text-[#15159b] text-[18px] lg:hidden hover:bg-gray-100 transition-colors"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>

      <div className="service-sidebar-insd-mn flex flex-col flex-1 overflow-y-auto sidebar-scroll">
        {/* Scrollable navigation area */}
        <div className="flex-1 lg:px-[30px] px-5 pt-[20px]">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.label}>
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    clsx(
                      "group my-[6px] mx-0 p-3 rounded-[10px] flex items-center gap-2 transition-all duration-200 relative",
                      isActive ? "active-nav-item" : "inactive-nav-item"
                    )
                  }
                  style={({ isActive }) => ({
                    backgroundColor: isActive
                      ? "var(--sidebar-hover)"
                      : "transparent",
                    color: isActive
                      ? "var(--sidebar-hover-text)"
                      : "var(--sidebar-text)",
                  })}
                  onMouseEnter={(e) => {
                    const isActive =
                      e.currentTarget.classList.contains("active-nav-item");
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor =
                        "var(--sidebar-hover)";
                      e.currentTarget.style.color = "var(--sidebar-hover-text)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    const isActive =
                      e.currentTarget.classList.contains("active-nav-item");
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = "var(--sidebar-text)";
                    }
                  }}
                >
                  {({ isActive }) => (
                    <>
                      <img
                        src={item.icon}
                        alt=""
                        className={clsx(
                          "w-6 h-6 transition",
                          isActive
                            ? "filter brightness-0 saturate-100 invert-15 sepia-92 saturate-2087 hue-rotate-225 brightness-94 contrast-112"
                            : ""
                        )}
                      />
                      <span className="font-medium transition">
                        {item.label}
                      </span>
                      {/* Active indicator */}
                      {isActive && (
                        <div
                          className="absolute right-2 w-1 h-6 rounded-full"
                          style={{ backgroundColor: "var(--accent-primary)" }}
                        />
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Fixed bottom section */}
        <div className="flex-shrink-0">
          <div className="salva-sidebar-button-main lg:px-[40px] px-5 py-0 flex justify-between gap-[8px] w-full max-[800px]:flex-col">
            <a
              href="javascript:;"
              className="group w-full flex items-center justify-center gap-1  font-medium text-[17px] rounded-[12px] py-4 px-4 transition-all duration-200"
              style={{
                color: "var(--sidebar-text)",
                backgroundColor: "var(--sidebar-accent)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--sidebar-hover)";
                e.currentTarget.style.color = "var(--sidebar-hover-text)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "var(--sidebar-accent)";
                e.currentTarget.style.color = "var(--sidebar-text)";
              }}
            >
              <img src="./img/settings.png" className="w-6 h-6 transition" />
              <span className="transition">{t('common.settings')}</span>
            </a>
            <button
              onClick={toggleTheme}
              className="group w-full flex items-center justify-center gap-1  font-medium text-[17px] rounded-[12px] py-4 px-4 transition-all duration-200"
              style={{
                color: "var(--sidebar-text)",
                backgroundColor: "var(--sidebar-accent)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--sidebar-hover)";
                e.currentTarget.style.color = "var(--sidebar-hover-text)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "var(--sidebar-accent)";
                e.currentTarget.style.color = "var(--sidebar-text)";
              }}
            >
              <img
                src={
                  theme === "dark" ? "./img/darkmode.png" : "./img/darkmode.png"
                }
                className="w-6 h-6 transition"
              />
              <span className="font-medium leading-none transition">
                {theme === "dark" ? t('common.lightMode') : t('common.darkMode')}
              </span>
            </button>
          </div>

          <div className="salva-sidebar-app-store-play-store-button px-[40px] py-0 mt-[24px] mb-[24px] flex items-center justify-between w-full">
            <a
              href="javascript:;"
              className="flex items-center gap-[12px] w-[42%] max-[480px]:flex-col"
            >
              <img src="./img/apple-store.png" className="w-[30px]" />
              <p
                className="text-[12px] transition-colors duration-300"
                style={{ color: "var(--text-tertiary)" }}
              >
                Download it from <span className="font-medium">APP STORE</span>
              </p>
            </a>
            <span
              className="w-[2px] h-[39px] transition-colors duration-300"
              style={{ backgroundColor: "var(--text-tertiary)" }}
            ></span>
            <a
              href="javascript:;"
              className="flex items-center gap-[12px] w-[42%] max-[480px]:flex-col"
            >
              <img src="./img/play-store.png" className="w-[30px]" />
              <p
                className="text-[12px] transition-colors duration-300"
                style={{ color: "var(--text-tertiary)" }}
              >
                Download it from{" "}
                <span className="font-medium">GOOGLE PLAY</span>
              </p>
            </a>
          </div>

          <div className="salva-sidebar-cpooy-right w-full px-[40px] py-0 pb-[30px]">
            <p
              className="text-[14px] transition-colors duration-300"
              style={{ color: "var(--text-tertiary)" }}
            >
              © 2025 Bridge Health Business Service.
            </p>
            <p
              className="text-[14px] transition-colors duration-300"
              style={{ color: "var(--text-tertiary)" }}
            >
              All Rights Reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

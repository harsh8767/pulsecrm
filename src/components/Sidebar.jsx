import { NavLink } from "react-router-dom";

const navigationItems = [
  {
    id: 1,
    label: "Dashboard",
    path: "/",
    icon: (
      <>
        <rect x="3" y="3" width="7" height="9" rx="1" />
        <rect x="14" y="3" width="7" height="5" rx="1" />
        <rect x="14" y="12" width="7" height="9" rx="1" />
        <rect x="3" y="16" width="7" height="5" rx="1" />
      </>
    ),
  },
  {
    id: 2,
    label: "Customers",
    path: "/customers",
    icon: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
  },
  {
    id: 3,
    label: "Deals",
    path: "/deals",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M14.5 9a2.5 2.5 0 0 0-2.5-1.5c-1.4 0-2.5.8-2.5 2s1 1.7 2.5 2 2.5.8 2.5 2-1.1 2-2.5 2A2.5 2.5 0 0 1 9.5 15" />
        <path d="M12 6v1.5M12 16.5V18" />
      </>
    ),
  },
  {
    id: 4,
    label: "Reports",
    path: "/reports",
    icon: (
      <>
        <path d="M3 3v18h18" />
        <path d="M8 17v-6" />
        <path d="M13 17V7" />
        <path d="M18 17v-3" />
      </>
    ),
  },
];

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-mark">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M3 12h4l3-8 4 16 3-8h4" />
          </svg>
        </span>
        <h2 className="sidebar-logo">PulseCRM</h2>
      </div>

      <nav>
        {navigationItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) =>
              isActive ? "sidebar-link active" : "sidebar-link"
            }
          >
            <svg
              className="nav-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {item.icon}
            </svg>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
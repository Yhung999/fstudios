import {
  Home,
  Compass,
  Tv,
  BookOpen,
  Heart,
  History,
  Settings,
  Download,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAppStore } from "../store/appStore";

export default function Sidebar() {
  const { appName } = useAppStore();

  const links = [
    { name: "Home", icon: Home, path: "/" },
    { name: "Discover", icon: Compass, path: "/discover" },
    { name: "Anime", icon: Tv, path: "/anime" },
    { name: "Manga", icon: BookOpen, path: "/manga" },
    { name: "My Library", icon: Heart, path: "/library" },
    { name: "History", icon: History, path: "/history" },
    { name: "Downloads", icon: Download, path: "/downloads" },
  ];

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-logo">F</div>
        <span>{appName}</span>
      </div>

      <nav>
        {links.map((link) => {
          const Icon = link.icon;

          return (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              <Icon size={20} />
              <span>{link.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-bottom">
        <NavLink to="/settings" className="nav-link">
          <Settings size={20} />
          <span>Settings</span>
        </NavLink>
      </div>
    </aside>
  );
}
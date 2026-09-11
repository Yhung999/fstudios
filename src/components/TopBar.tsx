import { Bell } from "lucide-react";
import SearchBar from "./SearchBar";

export default function TopBar() {
  return (
    <header className="topbar">
      <SearchBar />

      <button className="icon-button">
        <Bell size={20} />
      </button>

      <div className="avatar">F</div>
    </header>
  );
}
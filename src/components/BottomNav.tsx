import { Home, Search, Heart, User } from "lucide-react";
import { NavLink } from "react-router-dom";

export default function BottomNav() {
  return (
    <div className="bottom-nav">
      <NavLink to="/">
        <Home size={21} />
        <span>Home</span>
      </NavLink>

      <NavLink to="/search">
        <Search size={21} />
        <span>Search</span>
      </NavLink>

      <NavLink to="/library">
        <Heart size={21} />
        <span>Library</span>
      </NavLink>

      <NavLink to="/settings">
        <User size={21} />
        <span>Profile</span>
      </NavLink>
    </div>
  );
}
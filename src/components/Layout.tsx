import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";
import TopBar from "./TopBar";
import { useAppStore } from "../store/appStore";
import { useEffect } from "react";

export default function Layout() {
  const darkMode = useAppStore((state) => state.darkMode);

  useEffect(() => {
    document.documentElement.classList.toggle("light", !darkMode);
  }, [darkMode]);

  return (
    <div className="app">
      <Sidebar />

      <main className="main">
        <TopBar />

        <div className="page">
          <Outlet />
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
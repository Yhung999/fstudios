import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Layout from "./components/Layout";

import Home from "./pages/Home";
import AnimePage from "./pages/AnimePage";
import AnimeDetails from "./pages/AnimeDetails";
import MangaPage from "./pages/MangaPage";
import Search from "./pages/Search";
import Library from "./pages/Library";
import Settings from "./pages/Settings";
import Watch from "./pages/Watch";
import Discover from "./pages/Discover";
import ModuleDetails from "./pages/ModuleDetails";
import History from "./pages/History";
import Downloads from "./pages/Downloads";
import MangaReader from "./pages/MangaReader";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/discover/:moduleId" element={<ModuleDetails />} />
          <Route path="/anime" element={<AnimePage />} />
          <Route path="/anime/:id" element={<AnimeDetails />} />
          <Route path="/watch/:id" element={<Watch />} />
          <Route path="/manga" element={<MangaPage />} />
          <Route path="/manga/:mangaId/read" element={<MangaReader />} />
          <Route path="/search" element={<Search />} />
          <Route path="/library" element={<Library />} />
          <Route path="/history" element={<History />} />
          <Route path="/downloads" element={<Downloads />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Home />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
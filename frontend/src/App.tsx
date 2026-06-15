import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { Navbar } from "./components/Navbar";
import { PostsPage } from "./pages/PostsPage";
import { PostDetailPage } from "./pages/PostDetailPage";
import { UsersPage } from "./pages/UsersPage";
import { UserDetailPage } from "./pages/UserDetailPage";

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Navbar />
        <main className="mx-auto max-w-5xl px-4 py-8">
          <Routes>
            <Route path="/" element={<PostsPage />} />
            <Route path="/posts/:id" element={<PostDetailPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/users/:id" element={<UserDetailPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <footer className="mx-auto max-w-5xl px-4 py-8 text-center text-xs text-gray-400">
          Data from the JSONPlaceholder API
        </footer>
      </BrowserRouter>
    </ThemeProvider>
  );
}

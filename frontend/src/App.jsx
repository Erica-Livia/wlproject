import React, { useState, useEffect } from "react";
import NavBar from "./components/NavBar";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import WelcomePage from "./pages/WelcomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Footer from "./components/Footer";

function App() {
  const [theme, setTheme] = useState("dark");

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <Router>
      <div className={`min-h-screen ${theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-black"}`}>
        <NavBar theme={theme} toggleTheme={toggleTheme} />
        <Routes>
          <Route path="/" element={<WelcomePage theme={theme} toggleTheme={toggleTheme} />} />
          <Route path="/login" element={<LoginPage theme={theme} />} />
          <Route path="/register" element={<RegisterPage theme={theme} />} />
        </Routes>
        <Footer theme={theme} />
      </div>
    </Router>
  );
}

export default App;

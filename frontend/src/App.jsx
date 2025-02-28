import React, { useState, useEffect } from "react";
import NavBar from "./components/NavBar";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { auth } from './firebase';
import WelcomePage from "./pages/WelcomePage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import Footer from "./components/Footer";
import UserSettings from "./pages/UserSettings";
import ADashboard from "./pages/adminview/Dashboard";
import GDashboard from "./pages/guideview/Dashboard";
import QuizPage from "./pages/QuizPage";
import DestinationPage from "./pages/DestinationsPage";
import DestinationDetailsPage from "./pages/DestinationDetailsPage";
// import ProtectedRoute from "./ProtectedRoute"; 

function App() {
  const [theme, setTheme] = useState("dark");
  // const [user, setUser] = useState(null);

  // useEffect(() => {
  //   const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
  //     setUser(currentUser);
  //   });
  //   return unsubscribe;
  // }, []);

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
        {/* <NavBar theme={theme} toggleTheme={toggleTheme} /> */}
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<WelcomePage theme={theme} toggleTheme={toggleTheme} />} />
          <Route path="/login" element={<LoginPage theme={theme} />} />
          <Route path="/signup" element={<SignUpPage theme={theme}  />} />
          <Route path="/settings" element={<UserSettings theme={theme} toggleTheme={toggleTheme} />} />
          <Route path="/quizz" element={<QuizPage theme={theme} toggleTheme={toggleTheme} />} />
          <Route path="/admin-dashboard" element={<ADashboard />} />
          <Route path="/guide-dashboard" element={<GDashboard />} />
          <Route path="/destinations" element={<DestinationPage theme={theme} toggleTheme={toggleTheme} />} />
          <Route path="/destination-details/:id" element={<DestinationDetailsPage theme={theme} toggleTheme={toggleTheme}/>} />


          {/* Protected routes */}
          <Route path="/settings" element={<UserSettings />} />
          {/* <Route 
          path="/admin-dashboard" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/guide-dashboard" 
          element={
            <ProtectedRoute allowedRoles={['guide']}>
              <GuideDashboard />
            </ProtectedRoute>
          } 
        />*/}
        </Routes> 
        {/* <Footer theme={theme} /> */}
      </div>
    </Router>
  );
}

export default App;

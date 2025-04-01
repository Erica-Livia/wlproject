import React, { useState, useEffect } from "react";
import NavBar from "./components/NavBar";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { auth } from './firebase';
import { onAuthStateChanged } from "firebase/auth"; // Add this import
import WelcomePage from "./pages/WelcomePage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import Footer from "./components/Footer";
import UserSettings from "./pages/UserSettings";
import ADashboard from "./pages/adminview/ADashboard";
import GDashboard from "./pages/guideview/Dashboard";
import QuizPage from "./pages/QuizPage";
import DestinationPage from "./pages/DestinationsPage";
import DestinationDetailsPage from "./pages/DestinationDetailsPage";
import GuidesPage from "./pages/GuidesPage";
import GuideProfileSetting from "./pages/guideview/GuideProfileSetting";
import GuideDetailsPage from "./pages/GuideDetailsPage";
import UsersList from "./pages/adminview/UsersList";
import DestinationsList from "./pages/adminview/DestinationsList";
import GuideBookingPage from "./pages/GuideBookingPage";
import GuideReviewsPage from "./pages/guideview/GuideReviewsList";
import GuideBookingsPage from "./pages/guideview/Bookings";
import Bookings from "./pages/Bookings";
import UserProfileSetting from "./pages/UserProfile";
import GuideRevenueDashboard from "./pages/guideview/GuideRevenueDashboard";
import AdminPayoutApproval from "./pages/adminview/AdminPayoutApproval";
import AdminRevenueTracking from "./pages/adminview/AdminRevenueTracking";
import AddDestination from "./pages/adminview/AddDestination";
import LegalPolicies from "./pages/LegalPolicies";

function App() {
  const [theme, setTheme] = useState("dark");
  const [user, setUser] = useState(null); // Track the user's authentication state

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // Update the user state
    });
    return unsubscribe; // Cleanup the observer on unmount
  }, []);

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
      <div className={`min-h-screen ${theme === "light" ? "bg-gray-900 text-white" : "bg-white text-black"}`}>
        {/* <NavBar theme={theme} toggleTheme={toggleTheme} /> */}
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<WelcomePage theme={theme} toggleTheme={toggleTheme} />} />
          <Route path="/login" element={<LoginPage theme={theme} />} />
          <Route path="/signup" element={<SignUpPage theme={theme} />} />
          <Route path="/settings" element={<UserSettings theme={theme} toggleTheme={toggleTheme} />} />
          <Route path="/quizz" element={<QuizPage theme={theme} toggleTheme={toggleTheme} />} />
          <Route path="/admin-dashboard" element={<ADashboard />} />
          <Route path="/destinations" element={<DestinationPage theme={theme} toggleTheme={toggleTheme} />} />
          <Route path="/guides" element={<GuidesPage theme={theme} toggleTheme={toggleTheme} />} />
          <Route path="/guide-profile-setting" element={<GuideProfileSetting theme={theme} toggleTheme={toggleTheme} />} />
          <Route path="/profile" element={<UserProfileSetting theme={theme} toggleTheme={toggleTheme} />} />
          <Route path="/destination-details/:id" element={<DestinationDetailsPage theme={theme} toggleTheme={toggleTheme} />} />
          <Route path="/guide-details/:guideId" element={<GuideDetailsPage theme={theme} toggleTheme={toggleTheme} />} />
          <Route path="/terms-and-conditions" element={<LegalPolicies theme={theme} toggleTheme={toggleTheme} />} />
          

          {/* Guides Routes */}
          <Route path="/guide-dashboard" element={<GDashboard />} />
          <Route path="/guide-earnings" element={<GuideRevenueDashboard/>} />
          <Route path="/guide-reviews" element={<GuideReviewsPage />} />
          <Route path="/guide-profile-setting" element={<GuideProfileSetting />} />

          {/* Admin Routes */}
          <Route path="/admin-users-list" element={<UsersList />} />
          <Route path="/admin-destinations-list" element={<DestinationsList />} />
          <Route path="/admin-payout-request" element={<AdminPayoutApproval />} />
          <Route path="/admin-revenue" element={<AdminRevenueTracking />} />
          <Route path="/admin-add-destination" element={<AddDestination />} />

          {/* Other Routes */}
          <Route path="/guide-bookings/" element={<GuideBookingsPage theme={theme} toggleTheme={toggleTheme} />} />
          <Route path="/guide-book/:guideId/:destinationId" element={<GuideBookingPage theme={theme} toggleTheme={toggleTheme} />} />
          <Route path="/mybookings/" element={<Bookings theme={theme} toggleTheme={toggleTheme} />} />


          {/* Protected routes */}
          <Route path="/settings" element={<UserSettings />} />
        </Routes>
        {/* <Footer theme={theme} /> */}
      </div>
    </Router>
  );
}

export default App;
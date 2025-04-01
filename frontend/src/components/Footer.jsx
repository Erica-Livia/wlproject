import React from "react";
import { Link } from "react-router-dom";

function Footer({ theme }) {
  return (
    <footer className={`py-6 font-poppins ${theme === "dark" ? "bg-khaki text-white" : "bg-khaki text-white"}`}>
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm">&copy; {new Date().getFullYear()} Wanderlust. All rights reserved.</p>
        <div className="flex justify-center space-x-4 mt-4">
          <Link to="/terms-and-conditions">Privacy Policy</Link>
          <Link to="/terms-and-conditions" className="hover:underline">Terms of Service</Link>
          <a href="mailto:contact@wanderlust.bi" className="hover:underline">Contact</a>
        </div>
        <div className="flex justify-center space-x-4 mt-4">
          <a href="#" className="hover:text-gray-400" aria-label="Facebook">
            <i className="fab fa-facebook"></i>
          </a>
          <a href="#" className="hover:text-gray-400" aria-label="Twitter">
            <i className="fab fa-twitter"></i>
          </a>
          <a href="#" className="hover:text-gray-400" aria-label="Instagram">
            <i className="fab fa-instagram"></i>
          </a>
        </div>
        <div className="mt-4 text-xs opacity-75">
          <p>Designed with ❤️ by Erica-Livia</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
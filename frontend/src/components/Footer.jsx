import React from "react";

function Footer({theme}) {
    return (
        <footer className={`py-6 font-poppins ${theme === "dark" ? "bg-khaki text-white " : "bg-khaki text-white"}`}>
            <div className="container mx-auto px-4 text-center">
                <p className="text-sm">&copy; {new Date().getFullYear()} Wanderlust. All rights reserved.</p>
                <div className="flex justify-center space-x-4 mt-4">
                    <a href="#" className="hover:underline">Privacy Policy</a>
                    <a href="#" className="hover:underline">Terms of Service</a>
                    <a href="#" className="hover:underline">Contact</a>
                </div>
                <div className="flex justify-center space-x-4 mt-4">
                    <a href="#" className="hover:text-gray-400">Facebook</a>
                    <a href="#" className="hover:text-gray-400">Twitter</a>
                    <a href="#" className="hover:text-gray-400">Instagram</a>
                </div>
                <div className="mt-4 text-xs opacity-75">
                    <p>Designed with ❤️ by Erica-Livia</p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;

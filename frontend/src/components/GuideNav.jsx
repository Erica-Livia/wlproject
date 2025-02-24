import React from "react";
import { RxDashboard } from "react-icons/rx";
import { FaStarHalfStroke } from "react-icons/fa6";
import { PiUserCircleCheck } from "react-icons/pi";
import { BsCalendar4Week } from "react-icons/bs";
import { PiUserBold } from "react-icons/pi";

function GuideNav() {
    return (
        <>
        <div className="font-poppins h-screen space-y-8 pl-8 py-8 w-80 bg-guidebg ">
            <div className="text-24px font-bold pb-4">
                <a href=" guide-dashboard">Wanderlust Guide</a>
            </div>

            <div className="text-18px ">
                <ul className="space-y-8">
                    <li><a href="/users-list"  className="flex items-center"><RxDashboard className="text-24px mr-2" /> Dashboard</a></li>
                    <li><a href="/users-list"  className="flex items-center"><BsCalendar4Week className="text-24px mr-2" /> Bookings</a></li>
                    <li><a href="/users-list"  className="flex items-center"><FaStarHalfStroke className="text-24px mr-2" /> Reviews</a></li>
                    <li><a href="/users-list"  className="flex items-center"><PiUserBold className="text-24px mr-2" /> Profile Settings</a></li>
                </ul>
            </div>
            
    
        </div>
        </>
    )
}

export default GuideNav;
import React from "react";
import { RxDashboard } from "react-icons/rx";
import { PiUsersThreeLight } from "react-icons/pi";
import { PiUserCircleCheck } from "react-icons/pi";
import { GoReport } from "react-icons/go";
import { PiUserBold } from "react-icons/pi";
import { Link } from "react-router-dom";

function AdminNav() {
    return (
        <>
            <div className="font-poppins h-screen space-y-8 pl-8 py-8 w-80 bg-adminbg ">
                <div className="text-24px font-bold pb-4">
                    <a href="/admin-dashboard">Wanderlust Admin</a>
                </div>

                <div className="text-18px ">
                    <ul className="space-y-8">
                        <li>
                            <Link to="/admin-dashboard" className="flex items-center underline">
                                <RxDashboard className="text-24px mr-2" /> Dashboard
                            </Link>
                        </li>
                        <li>
                            <Link to="/admin-users-list" className="flex items-center">
                                <PiUsersThreeLight className="text-24px mr-2" /> Users
                            </Link>
                        </li>
                        <li>
                            <Link to="/admin-guides-list" className="flex items-center">
                                <PiUserCircleCheck className="text-24px mr-2" /> Guides
                            </Link>
                        </li>
                        <li>
                            <Link to="/admin-reports-list" className="flex items-center">
                                <GoReport className="text-24px mr-2" /> Reports
                            </Link>
                        </li>
                        <li>
                            <Link to="/users-list" className="flex items-center">
                                <PiUserBold className="text-24px mr-2" /> Profile Settings
                            </Link>
                        </li>
                    </ul>
                </div>


            </div>
        </>
    )
}

export default AdminNav;
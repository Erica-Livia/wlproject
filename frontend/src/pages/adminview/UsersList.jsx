import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase";
import { getFirestore, doc, getDoc, collection, getDocs, deleteDoc, updateDoc } from "firebase/firestore";
import AdminNav from "../../components/AdminNav";
import { User, Edit, Trash2, Search, UserX, Mail, Shield, UserCheck, Eye, Download } from "lucide-react";
import { saveAs } from "file-saver";

const UsersList = () => {
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRole, setSelectedRole] = useState("all");
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const navigate = useNavigate();
    const db = getFirestore();

    useEffect(() => {
        const checkAdmin = async () => {
            const user = auth.currentUser;
            if (!user) {
              navigate("/login");
              return;
            }
          
            const userDoc = await getDoc(doc(db, "users", user.uid));
            const userData = userDoc.data();
          
            if (!userData || userData.role !== "admin") {
              navigate("/");
              return;
            }

            await fetchUsers();
            setLoading(false);
        };

        checkAdmin();
    }, [navigate, db]);

    const fetchUsers = async () => {
        try {
            const usersSnapshot = await getDocs(collection(db, "users"));
            const usersData = usersSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate().toLocaleDateString() || "N/A"
            }));
            setUsers(usersData);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const handleDeleteUser = async () => {
        if (!userToDelete) return;
        
        try {
            await deleteDoc(doc(db, "users", userToDelete.id));
            setUsers(users.filter(user => user.id !== userToDelete.id));
            setIsConfirmModalOpen(false);
            setUserToDelete(null);
        } catch (error) {
            console.error("Error deleting user:", error);
        }
    };

    const handleRoleUpdate = async (userId, newRole) => {
        try {
            await updateDoc(doc(db, "users", userId), {
                role: newRole
            });
            
            setUsers(users.map(user => 
                user.id === userId ? { ...user, role: newRole } : user
            ));
        } catch (error) {
            console.error("Error updating user role:", error);
        }
    };

    const handleViewUser = (user) => {
        setSelectedUser(user); // Open modal with user info
    };

    const handleExportData = () => {
        const headers = ["Name", "Email", "Role", "Joined Date", "Status"];
        const data = filteredUsers.map(user => [
            user.name || "Anonymous User",
            user.email,
            user.role || "user",
            user.createdAt,
            user.isActive ? "Active" : "Inactive"
        ]);

        const csvContent = [
            headers.join(","),
            ...data.map(row => row.join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
        saveAs(blob, `users_${selectedRole === "all" ? "all" : selectedRole}.csv`);
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = 
            user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
            user.email?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesRole = selectedRole === "all" || user.role === selectedRole;
        
        return matchesSearch && matchesRole;
    });

    const getRoleBadgeColor = (role) => {
        switch(role) {
            case "admin": return "bg-red-100 text-red-800";
            case "guide": return "bg-blue-100 text-blue-800";
            case "premium": return "bg-purple-100 text-purple-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    if (loading) return (
        <div className="flex flex-row bg-gray-50 min-h-screen">
            <div className="w-1/4">
                <AdminNav />
            </div>
            <p className="text-lg text-gray-600 p-6 ml-64 w-full">Loading List..</p>
        </div>
    );

    return (
        <div className="flex flex-row bg-gray-50 min-h-screen">
            {/* Left Sidebar - Admin Navigation */}
            <div className="">
                <AdminNav />
            </div>

            {/* Right Side - Users List */}
            <div className="p-6 w-full">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Users Management</h1>
                            <p className="text-gray-500">Manage your platform users</p>
                        </div>
                        <button 
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center"
                            onClick={handleExportData}
                        >
                            <Download size={16} className="mr-2" />
                            Export Data
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex items-center relative flex-1">
                                <Search size={20} className="absolute left-3 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search users by name or email..."
                                    className="pl-10 pr-4 py-2 border rounded-lg w-full"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center">
                                <label className="mr-2 text-gray-700">Role:</label>
                                <select
                                    className="border rounded-lg px-3 py-2"
                                    value={selectedRole}
                                    onChange={(e) => setSelectedRole(e.target.value)}
                                >
                                    <option value="all">All Roles</option>
                                    <option value="user">User</option>
                                    <option value="guide">Guide</option>
                                    <option value="premium">Premium</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Users Table */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredUsers.length > 0 ? (
                                        filteredUsers.map((user) => (
                                            <tr key={user.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleViewUser(user)}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="h-10 w-10 flex-shrink-0">
                                                            {user.photoURL ? (
                                                                <img className="h-10 w-10 rounded-full" src={user.photoURL} alt={user.name} />
                                                            ) : (
                                                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                                    <User size={20} className="text-gray-500" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">{user.name || "Anonymous User"}</div>
                                                            <div className="text-sm text-gray-500">ID: {user.id.slice(0, 8)}...</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900 flex items-center">
                                                        <Mail size={16} className="text-gray-400 mr-2" />
                                                        {user.email}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                                                        {user.role || "user"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {user.createdAt}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                                        {user.isActive ? "Active" : "Inactive"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex space-x-2">
                                                        <button 
                                                            onClick={(e) => {
                                                                e.stopPropagation(); // Prevent row click
                                                                navigate(`/admin/users/edit/${user.id}`);
                                                            }}
                                                            className="text-indigo-600 hover:text-indigo-900"
                                                            title="Edit user"
                                                        >
                                                            <Edit size={18} />
                                                        </button>
                                                        {user.role !== "admin" && (
                                                            <button 
                                                                onClick={(e) => {
                                                                    e.stopPropagation(); // Prevent row click
                                                                    setUserToDelete(user);
                                                                    setIsConfirmModalOpen(true);
                                                                }}
                                                                className="text-red-600 hover:text-red-900"
                                                                title="Delete user"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        )}
                                                        {user.role !== "admin" ? (
                                                            <button 
                                                                onClick={(e) => {
                                                                    e.stopPropagation(); // Prevent row click
                                                                    handleRoleUpdate(user.id, "admin");
                                                                }}
                                                                className="text-gray-600 hover:text-gray-900"
                                                                title="Promote to admin"
                                                            >
                                                                <Shield size={18} />
                                                            </button>
                                                        ) : (
                                                            <button 
                                                                onClick={(e) => {
                                                                    e.stopPropagation(); // Prevent row click
                                                                    handleRoleUpdate(user.id, "user");
                                                                }}
                                                                className="text-gray-600 hover:text-gray-900"
                                                                title="Demote to regular user"
                                                            >
                                                                <UserX size={18} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                                                No users found matching your criteria
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="bg-gray-50 px-6 py-3 flex justify-between items-center">
                            <span className="text-sm text-gray-700">
                                Showing <span className="font-medium">{filteredUsers.length}</span> users
                            </span>
                            <div className="flex space-x-2">
                                <button className="px-3 py-1 border rounded-md text-sm text-gray-600">Previous</button>
                                <button className="px-3 py-1 border rounded-md bg-blue-600 text-sm text-white">Next</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {isConfirmModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <div className="flex items-center justify-center mb-4">
                            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                                <UserX size={24} className="text-red-600" />
                            </div>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 text-center">Delete User</h3>
                        <p className="text-gray-500 text-center mt-2">
                            Are you sure you want to delete the user <span className="font-semibold">{userToDelete?.displayName || userToDelete?.email}</span>? This action cannot be undone.
                        </p>
                        <div className="mt-6 flex justify-end space-x-3">
                            <button 
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg"
                                onClick={() => {
                                    setIsConfirmModalOpen(false);
                                    setUserToDelete(null);
                                }}
                            >
                                Cancel
                            </button>
                            <button 
                                className="px-4 py-2 bg-red-600 text-white rounded-lg"
                                onClick={handleDeleteUser}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* User Info Modal */}
            {selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <div className="flex items-center justify-center mb-4">
                            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                <User size={24} className="text-blue-600" />
                            </div>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 text-center">User Details</h3>
                        <div className="mt-4 space-y-2">
                            <p><span className="font-semibold">Name:</span> {selectedUser.displayName || "Anonymous User"}</p>
                            <p><span className="font-semibold">Email:</span> {selectedUser.email}</p>
                            <p><span className="font-semibold">Role:</span> {selectedUser.role || "user"}</p>
                            <p><span className="font-semibold">Joined Date:</span> {selectedUser.createdAt}</p>
                            <p><span className="font-semibold">Status:</span> {selectedUser.isActive ? "Active" : "Inactive"}</p>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button 
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                                onClick={() => setSelectedUser(null)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsersList;
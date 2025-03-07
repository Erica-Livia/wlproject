import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebase";
import { getFirestore, doc, getDoc, collection, getDocs } from "firebase/firestore";
import AdminNav from "../../components/AdminNav";
import { BookOpen, Users, Flag, MapPin, TrendingUp } from "lucide-react";

// Updated Reusable Card Component
const StatCard = ({ title, count, icon: Icon, color = "bg-blue-500" }) => (
  <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-all">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-lg font-semibold text-gray-700">{title}</h2>
      <div className={`${color} p-2 rounded-full text-white`}>
        <Icon size={18} />
      </div>
    </div>
    <p className="text-3xl font-bold text-gray-900">{count}</p>
    <p className="text-green-500 text-sm mt-2 flex items-center">
      <TrendingUp size={14} className="mr-1" />
      <span>+10% from last month</span>
    </p>
  </div>
);

const AdminDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        users: 0,
        guides: 0,
        reports: 0,
        destinations: 0,
    });

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

            // Fetch statistics
            await fetchStats();
            setLoading(false);
        };

        const fetchStats = async () => {
            try {
                const usersSnapshot = await getDocs(collection(db, "users"));
                const guidesSnapshot = await getDocs(collection(db, "guides"));
                const reportsSnapshot = await getDocs(collection(db, "reports"));
                const destinationsSnapshot = await getDocs(collection(db, "destinations"));

                setStats({
                    users: usersSnapshot.size,
                    guides: guidesSnapshot.size,
                    reports: reportsSnapshot.size,
                    destinations: destinationsSnapshot.size,
                });
            } catch (error) {
                console.error("Error fetching statistics:", error);
            }
        };

        checkAdmin();
    }, [navigate, db]);

    if (loading) return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg text-gray-600">Loading dashboard...</p>
      </div>
    );

    return (
        <div className="flex flex-row bg-gray-50 min-h-screen">
            {/* Left Sidebar - Admin Navigation */}
            <div className="w-1/4">
                <AdminNav />
            </div>

            {/* Right Side - Dashboard Stats */}
            <div className="p-6 ml-64 w-full"> 
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold mb-2 text-gray-800">Admin Dashboard</h1>
                    <p className="text-gray-500 mb-8">Welcome to your admin control panel</p>

                    {/* Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Card 1: Total Users */}
                        <StatCard 
                          title="Total Users" 
                          count={stats.users} 
                          icon={Users}
                          color="bg-blue-500"
                        />

                        {/* Card 2: Total Guides */}
                        <StatCard 
                          title="Total Guides" 
                          count={stats.guides} 
                          icon={BookOpen}
                          color="bg-purple-500"
                        />

                        {/* Card 3: Total Reports */}
                        <StatCard 
                          title="Total Reports" 
                          count={stats.reports} 
                          icon={Flag}
                          color="bg-red-500"
                        />

                        {/* Card 4: Total Destinations */}
                        <StatCard 
                          title="Total Destinations" 
                          count={stats.destinations} 
                          icon={MapPin}
                          color="bg-green-500"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
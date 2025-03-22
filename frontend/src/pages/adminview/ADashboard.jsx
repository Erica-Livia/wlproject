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
    </p>
  </div>
);

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    visitors: 0,
    guides: 0,
    totalGuides: 0,
    reports: 0,
    destinations: 0,
  });
  const [topDestination, setTopDestination] = useState(null);
  const [topGuide, setTopGuide] = useState(null);

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

      await fetchStats();
      setLoading(false);
    };

    const fetchStats = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, "users"));
        const guidesSnapshot = await getDocs(collection(db, "guides"));
        // const reviewSnapshot = await getDoc(collection(db, "guideReview"));
        const reportsSnapshot = await getDocs(collection(db, "reports"));
        const destinationsSnapshot = await getDocs(collection(db, "destinations"));

        const visitors = usersSnapshot.docs.filter(doc => doc.data().role === "user").length;
        const guides = usersSnapshot.docs.filter(doc => doc.data().role === "guide").length;

        setStats({
          visitors,
          guides,
          totalGuides: guidesSnapshot.size,
          reports: reportsSnapshot.size,
          destinations: destinationsSnapshot.size,
        });

        const destinations = destinationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const sortedDestinations = destinations.sort((a, b) => b.rating - a.rating);
        setTopDestination(sortedDestinations[0]);

        const guidesData = guidesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const sortedGuides = guidesData.sort((a, b) => b.rating - a.rating);
        setTopGuide(sortedGuides[0]);
      } catch (error) {
        console.error("Error fetching statistics:", error);
      }
    };

    checkAdmin();
  }, [navigate, db]);

  if (loading) return (
    <div className="flex flex-row bg-gray-50 min-h-screen">
      <div className="">
        <AdminNav />
      </div>
      <p className="text-lg text-gray-600 p-6 ml-64 w-full">Loading dashboard...</p>
    </div>
  );

  return (
    <div className="flex flex-row bg-gray-50 min-h-screen">
      <div className="">
        <AdminNav />
      </div>

      <div className="p-6 w-full">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2 text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-500 mb-8">Welcome to your admin control panel</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Visitors" count={stats.visitors} icon={Users} color="bg-blue-500" />
            <StatCard title="Guides" count={stats.guides} icon={Users} color="bg-purple-500" />
            <StatCard title="Reports" count={stats.reports} icon={Flag} color="bg-red-500" />
            <StatCard title="Destinations" count={stats.destinations} icon={MapPin} color="bg-green-500" />
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Top Destination</h2>
              {topDestination ? (
                <div>
                  <p className="text-xl font-bold text-gray-900">{topDestination.title}</p>
                  <p className="text-gray-500">Rating: {topDestination.rating}</p>
                </div>
              ) : (
                <p className="text-gray-500">No data available</p>
              )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Top Guide</h2>
              {topGuide ? (
                <div>
                  <p className="text-xl font-bold text-gray-900">{topGuide.name}</p>
                  <p className="text-gray-500">Rating: {topGuide.averageRating}</p>
                </div>
              ) : (
                <p className="text-gray-500">No data available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
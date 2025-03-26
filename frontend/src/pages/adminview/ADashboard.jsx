import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebase";
import { getFirestore, doc, getDoc, collection, getDocs } from "firebase/firestore";
import AdminNav from "../../components/AdminNav";
import { Users, Flag, MapPin } from "lucide-react";
import { GiMoneyStack } from "react-icons/gi";

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    visitors: 0,
    guides: 0,
    reports: 0,
    destinations: 0,
    totalRevenue: 0,
    commission: 0,
    guidesRevenue: 0,
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
        const reportsSnapshot = await getDocs(collection(db, "reports"));
        const destinationsSnapshot = await getDocs(collection(db, "destinations"));
        const bookingsSnapshot = await getDocs(collection(db, "bookings"));

        const visitors = usersSnapshot.docs.filter((doc) => doc.data().role === "user").length;
        const guides = usersSnapshot.docs.filter((doc) => doc.data().role === "guide").length;

        // Calculate total revenue from bookings
        const totalRevenue = bookingsSnapshot.docs.reduce((sum, doc) => {
          const price = parseFloat(doc.data().price) || 0; // Convert price to a number
          return sum + price;
        }, 0);

        // Calculate commission (20%) and guides' revenue (80%)
        const commission = totalRevenue * 0.2;
        const guidesRevenue = totalRevenue - commission;

        setStats({
          visitors,
          guides,
          reports: reportsSnapshot.size,
          destinations: destinationsSnapshot.size,
          totalRevenue,
          commission,
          guidesRevenue,
        });

        // Fetch destinations and sort by rating
        const destinations = destinationsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          rating: doc.data().rating || 0, // Default to 0 if rating is missing
        }));

        // Sort destinations by rating (descending)
        const sortedDestinations = destinations.sort((a, b) => b.rating - a.rating);

        // Set the top destination
        setTopDestination(sortedDestinations[0]);

        // Fetch guides and sort by rating
        const guidesData = guidesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          averageRating: doc.data().averageRating || 0, // Default to 0 if rating is missing
        }));

        // Sort guides by averageRating (descending)
        const sortedGuides = guidesData.sort((a, b) => b.averageRating - a.averageRating);

        // Set the top guide
        setTopGuide(sortedGuides[0]);
      } catch (error) {
        console.error("Error fetching statistics:", error);
      }
    };

    checkAdmin();
  }, [navigate, db]);

  if (loading)
    return (
      <div className="flex flex-row bg-white min-h-screen">
        <div className="">
          <AdminNav />
        </div>
        <p className="text-lg text-gray-600 p-6 ml-64 w-full">Loading dashboard...</p>
      </div>
    );

  return (
    <div className="flex flex-row bg-white min-h-screen font-poppins">
      <div className="">
        <AdminNav />
      </div>

      <div className="p-6 w-full">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2 text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-500 mb-8">Welcome to your admin control panel</p>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            {/* Card 1: Visitors */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 text-center">
              <div className="flex justify-center">
                <Users className="text-2xl text-adminbg mr-2" />
                <h2 className="text-xl font-bold text-gray-700">Visitors</h2>
              </div>
              <p className="text-3xl mt-4">{stats.visitors}</p>
            </div>

            {/* Card 2: Guides */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 text-center">
              <div className="flex justify-center">
                <Users className="text-2xl text-adminbg mr-2" />
                <h2 className="text-xl font-bold text-gray-700">Guides</h2>
              </div>
              <p className="text-3xl mt-4">{stats.guides}</p>
            </div>

            {/* Card 3: Reports */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 text-center">
              <div className="flex justify-center">
                <Flag className="text-2xl text-adminbg mr-2" />
                <h2 className="text-xl font-bold text-gray-700">Reports</h2>
              </div>
              <p className="text-3xl mt-4">{stats.reports}</p>
            </div>

            {/* Card 4: Destinations */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 text-center">
              <div className="flex justify-center">
                <MapPin className="text-2xl text-adminbg mr-2" />
                <h2 className="text-xl font-bold text-gray-700">Destinations</h2>
              </div>
              <p className="text-3xl mt-4">{stats.destinations}</p>
            </div>

            {/* Card 5: Revenue */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <div className="flex justify-center">
                <GiMoneyStack className="text-2xl text-adminbg mr-2" />
                <h2 className="text-xl font-bold text-gray-700">Revenue</h2>
              </div>
              <div className="mt-4">
                {/* <div className="flex justify-between">
                  <p className="text-gray-600">Total Revenue</p>
                  <p className="font-semibold">{stats.totalRevenue.toFixed(2)} BIF</p>
                </div> */}
                <div className="flex justify-between mt-2">
                  <p className="text-gray-600">Commission</p>
                  <p className="font-semibold">{stats.commission.toFixed(2)} BIF</p>
                </div>
                <div className="flex justify-between mt-2">
                  <p className="text-gray-600">Guides' Revenue</p>
                  <p className="font-semibold"> {stats.guidesRevenue.toFixed(2)} BIF</p>
                </div>
              </div>
            </div>
          </div>

          {/* Top Destination and Top Guide Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Top Destination</h2>
              {topDestination ? (
                <div>
                  <p className="text-2xl font-bold text-gray-900">{topDestination.title}</p>
                  <p className="text-gray-500">Rating: {topDestination.rating}</p>
                </div>
              ) : (
                <p className="text-gray-500">No data available</p>
              )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Top Guide</h2>
              {topGuide ? (
                <div>
                  <p className="text-2xl font-bold text-gray-900">{topGuide.name}</p>
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
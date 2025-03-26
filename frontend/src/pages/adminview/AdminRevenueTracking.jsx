import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import AdminNav from '../../components/AdminNav';
import { formatBIF } from '../../utils/currency';
import { FaFileExport, FaSearch, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AdminRevenueTracking = () => {
    const [revenueData, setRevenueData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGuide, setSelectedGuide] = useState(null);
    const [showModal, setShowModal] = useState(false);

    // Parse dates from Firestore
    const parseFirestoreDate = (dateValue) => {
        if (dateValue?.toDate) return dateValue.toDate();
        if (dateValue instanceof Date) return dateValue;
        if (typeof dateValue === 'string') return new Date(dateValue);
        return new Date();
    };

    // Prepare data for pie chart
    const getPieChartData = () => {
        // Define your color palette
        const colorPalette = [
            '#283226', // Dark green
            '#666048', // Khaki
            '#3a4a3a', // Medium dark green
            '#4d6a4d', // Medium green
            '#5c8a5c', // Light green
            '#6aaa6a', // Lighter green
            '#7aca7a', // Very light green
            '#151515'  // Black (for contrast)
        ];

        return revenueData.map((guide, index) => ({
            name: guide.guideName,
            value: guide.totalEarned,
            color: colorPalette[index % colorPalette.length] // Cycle through palette
        }));
    };

    // Calculate summary totals
    const getSummaryTotals = () => {
        return revenueData.reduce((acc, guide) => {
            acc.totalEarned += guide.totalEarned;
            acc.totalPaid += guide.totalPaid;
            return acc;
        }, { totalEarned: 0, totalPaid: 0 });
    };

    useEffect(() => {
        const fetchRevenueData = async () => {
            try {
                // Fetch paid bookings
                const bookingsQuery = query(
                    collection(db, 'bookings'),
                    where('status', '==', 'Paid')
                );
                const bookingsSnapshot = await getDocs(bookingsQuery);
                const bookings = bookingsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    date: parseFirestoreDate(doc.data().date)
                }));

                // Fetch payouts
                const payoutsQuery = query(
                    collection(db, 'guidePayouts'),
                    orderBy('date', 'desc')
                );
                const payoutsSnapshot = await getDocs(payoutsQuery);
                const payouts = payoutsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    date: parseFirestoreDate(doc.data().date)
                }));

                // Aggregate data by guide
                const guideMap = new Map();

                bookings.forEach(booking => {
                    if (!booking.guideId) return;

                    if (!guideMap.has(booking.guideId)) {
                        guideMap.set(booking.guideId, {
                            guideId: booking.guideId,
                            guideName: booking.guideName || 'Unknown Guide',
                            totalEarned: 0,
                            totalPaid: 0,
                            bookings: [],
                            payouts: []
                        });
                    }
                    const guideData = guideMap.get(booking.guideId);
                    const guideShare = parseFloat(booking.price) * 0.8 || 0;
                    guideData.totalEarned += guideShare;
                    guideData.bookings.push({
                        amount: guideShare,
                        date: booking.date,
                        tour: booking.destinationName,
                        client: booking.userName
                    });
                });

                payouts.forEach(payout => {
                    if (!payout.guideId) return;

                    if (!guideMap.has(payout.guideId)) {
                        guideMap.set(payout.guideId, {
                            guideId: payout.guideId,
                            guideName: payout.guideName || 'Unknown Guide',
                            totalEarned: 0,
                            totalPaid: 0,
                            bookings: [],
                            payouts: []
                        });
                    }
                    const guideData = guideMap.get(payout.guideId);
                    const amount = parseFloat(payout.amount) || 0;
                    if (payout.status === 'approved') {
                        guideData.totalPaid += amount;
                    }
                    guideData.payouts.push(payout);
                });

                const data = Array.from(guideMap.values()).sort((a, b) => b.totalEarned - a.totalEarned);
                setRevenueData(data);

            } catch (error) {
                console.error('Error fetching revenue data:', error);
                toast.error('Failed to load revenue data');
            } finally {
                setLoading(false);
            }
        };

        fetchRevenueData();
    }, []);

    const exportToCSV = () => {
        const headers = ['Guide Name', 'Total Earned (BIF)', 'Total Paid (BIF)', 'Balance (BIF)'];
        const rows = revenueData.map(guide => [
            guide.guideName,
            guide.totalEarned,
            guide.totalPaid,
            guide.totalEarned - guide.totalPaid
        ]);

        let csvContent = headers.join(',') + '\n';
        rows.forEach(row => {
            csvContent += row.join(',') + '\n';
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `revenue_report_${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredData = revenueData.filter(guide =>
        guide.guideName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const pieChartData = getPieChartData();
    const summaryTotals = getSummaryTotals();

    if (loading) {
        return (
            <div className="flex flex-row bg-gray-50 min-h-screen">
                <AdminNav />
                <p className="text-lg text-gray-600 p-6 ml-64 w-full">Loading Revenue Data...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-row bg-white min-h-screen font-poppins">
            <AdminNav />

            <div className="p-6 w-full ml-24">
                <div className="max-w-6xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold">Revenue Tracking</h1>
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search guides..."
                                    className="pl-10 pr-4 py-2 border rounded-lg"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                            </div>
                            <button
                                onClick={exportToCSV}
                                className="flex items-center gap-2 bg-adminbg text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                            >
                                <FaFileExport /> Export Data
                            </button>
                        </div>
                    </div>

                    {/* Revenue Summary Section */}
                    <div className="bg-white p-6 rounded-lg shadow mb-6">
                        <h2 className="text-xl font-semibold mb-4">Revenue Summary</h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <h3 className="text-blue-800 font-medium">Total Revenue</h3>
                                <p className="text-2xl font-bold">{formatBIF(summaryTotals.totalEarned)}</p>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg">
                                <h3 className="text-green-800 font-medium">Total Paid Out</h3>
                                <p className="text-2xl font-bold">{formatBIF(summaryTotals.totalPaid)}</p>
                            </div>
                            <div className="bg-purple-50 p-4 rounded-lg">
                                <h3 className="text-purple-800 font-medium">Outstanding Balance</h3>
                                <p className="text-2xl font-bold">
                                    {formatBIF(summaryTotals.totalEarned - summaryTotals.totalPaid)}
                                </p>
                            </div>
                        </div>

                        {/* Pie Chart */}
                        <div className="h-64 m-8">
                            <h3 className="text-lg font-medium mb-2">Revenue Distribution by Guide</h3>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieChartData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {pieChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value) => [formatBIF(value), 'Amount']}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Guides Table */}
                    <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guide</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Earned</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Paid</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredData.map((guide) => (
                                    <tr key={guide.guideId}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-medium">{guide.guideName}</div>
                                            <div className="text-sm text-gray-500">ID: {guide.guideId}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {formatBIF(guide.totalEarned)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {formatBIF(guide.totalPaid)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`font-medium ${(guide.totalEarned - guide.totalPaid) > 0
                                                ? 'text-adminbg'
                                                : 'text-gray-600'
                                                }`}>
                                                {formatBIF(guide.totalEarned - guide.totalPaid)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                                                onClick={() => {
                                                    setSelectedGuide(guide);
                                                    setShowModal(true);
                                                }}
                                            >
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredData.length === 0 && searchTerm && (
                        <div className="text-center py-8 text-gray-500">
                            No guides found matching "{searchTerm}"
                        </div>
                    )}
                </div>
            </div>

            {/* Guide Details Modal */}
            {showModal && selectedGuide && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center border-b p-4">
                            <h2 className="text-xl font-bold">{selectedGuide.guideName}'s Revenue Details</h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <h3 className="text-blue-800 font-medium">Total Earned</h3>
                                    <p className="text-xl font-bold">{formatBIF(selectedGuide.totalEarned)}</p>
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg">
                                    <h3 className="text-green-800 font-medium">Total Paid</h3>
                                    <p className="text-xl font-bold">{formatBIF(selectedGuide.totalPaid)}</p>
                                </div>
                                <div className="bg-purple-50 p-4 rounded-lg">
                                    <h3 className="text-purple-800 font-medium">Balance</h3>
                                    <p className="text-xl font-bold">
                                        {formatBIF(selectedGuide.totalEarned - selectedGuide.totalPaid)}
                                    </p>
                                </div>
                            </div>

                            <div className="mb-6">
                                <h3 className="text-lg font-medium mb-2">Recent Earnings</h3>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    {selectedGuide.bookings.length > 0 ? (
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead>
                                                <tr>
                                                    <th className="px-4 py-2 text-left">Date</th>
                                                    <th className="px-4 py-2 text-left">Tour</th>
                                                    <th className="px-4 py-2 text-left">Client</th>
                                                    <th className="px-4 py-2 text-left">Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedGuide.bookings.slice(0, 5).map((booking, index) => (
                                                    <tr key={index}>
                                                        <td className="px-4 py-2">{booking.date.toLocaleDateString()}</td>
                                                        <td className="px-4 py-2">{booking.tour}</td>
                                                        <td className="px-4 py-2">{booking.client}</td>
                                                        <td className="px-4 py-2">{formatBIF(booking.amount)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <p className="text-gray-500">No earnings recorded</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-medium mb-2">Payout History</h3>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    {selectedGuide.payouts.length > 0 ? (
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead>
                                                <tr>
                                                    <th className="px-4 py-2 text-left">Date</th>
                                                    <th className="px-4 py-2 text-left">Amount</th>
                                                    <th className="px-4 py-2 text-left">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedGuide.payouts.slice(0, 5).map((payout, index) => (
                                                    <tr key={index}>
                                                        <td className="px-4 py-2">{payout.date.toLocaleDateString()}</td>
                                                        <td className="px-4 py-2">{formatBIF(payout.amount)}</td>
                                                        <td className="px-4 py-2">
                                                            <span className={`px-2 py-1 rounded-full text-xs ${payout.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                                payout.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                                    'bg-red-100 text-red-800'
                                                                }`}>
                                                                {payout.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <p className="text-gray-500">No payout history</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminRevenueTracking;
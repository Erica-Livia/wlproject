import { useState, useEffect } from 'react';
import { db, auth } from '../../firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import BankDetailsForm from '../../components/BankDetailsForm';
import PayoutHistory from '../../components/PayoutHistory';
import GuideNav from '../../components/GuideNav';
import { FaFileExport } from 'react-icons/fa';
import { formatBIF } from '../../utils/currency';

const GuideRevenueDashboard = () => {
  const [totalEarned, setTotalEarned] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);
  const [loading, setLoading] = useState(true);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [showBankForm, setShowBankForm] = useState(false);
  const [bankDetails, setBankDetails] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [payouts, setPayouts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!auth.currentUser) return;

      try {
        // 1. Fetch all paid bookings for this guide
        const bookingsQuery = query(
          collection(db, 'bookings'),
          where('guideId', '==', auth.currentUser.uid),
          where('status', '==', 'Paid')
        );
        const bookingsSnapshot = await getDocs(bookingsQuery);
        const bookingsData = bookingsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setBookings(bookingsData);
        
        // Calculate total earned (20% commission deducted)
        const earned = bookingsData.reduce((sum, booking) => sum + (booking.price * 0.8), 0);
        setTotalEarned(earned);

        // 2. Fetch payout history (from a temporary payouts collection)
        const payoutsQuery = query(
          collection(db, 'guidePayouts'),
          where('guideId', '==', auth.currentUser.uid)
        );
        const payoutsSnapshot = await getDocs(payoutsQuery);
        const payoutsData = payoutsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date?.toDate()
        }));
        
        setPayouts(payoutsData);
        
        // Calculate total paid out
        const paid = payoutsData
          .filter(p => p.status === 'approved')
          .reduce((sum, payout) => sum + payout.amount, 0);
        setTotalPaid(paid);

        // 3. Check for existing bank details
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists() && userDoc.data().bankDetails) {
          setBankDetails(userDoc.data().bankDetails);
        }

      } catch (error) {
        toast.error('Failed to load data');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const requestPayout = async () => {
    if (!payoutAmount || isNaN(payoutAmount) || !bankDetails) return;

    const amount = parseFloat(payoutAmount);
    const balance = totalEarned - totalPaid;
    
    if (amount <= 0 || amount > balance) {
      toast.error(`Invalid amount. Maximum payout is ${formatBIF(balance)}`);
      return;
    }

    try {
      // Create payout request
      await addDoc(collection(db, 'guidePayouts'), {
        guideId: auth.currentUser.uid,
        guideName: auth.currentUser.displayName,
        amount,
        status: 'pending',
        bankDetails,
        date: new Date(),
        createdAt: new Date()
      });

      toast.success('Payout request submitted for admin approval!');
      setPayoutAmount('');
    } catch (error) {
      toast.error('Failed to request payout');
      console.error(error);
    }
  };

  const exportToCSV = () => {
    // Prepare CSV content
    const headers = ['Date', 'Tour', 'Client', 'Amount (BIF)', 'Status'];
    const bookingRows = bookings.map(booking => [
      booking.date,
      booking.destinationName,
      booking.userName,
      booking.price * 0.8, // Guide's 80% share
      'Earned'
    ]);
    
    const payoutRows = payouts.map(payout => [
      payout.date.toLocaleDateString(),
      'Payout',
      '-',
      payout.amount,
      payout.status
    ]);

    const rows = [...bookingRows, ...payoutRows];
    
    // Convert to CSV
    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.join(',') + '\n';
    });

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `guide_earnings_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex flex-row bg-gray-50 min-h-screen font-poppins">
        <GuideNav />
        <p className="text-lg text-gray-600 p-6 ml-64 w-full">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-row bg-gray-50 min-h-screen font-poppins">
      <GuideNav />
      
      <div className="p-6 ml-24 w-full">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">My Earnings & Payouts</h1>
            <button 
              onClick={exportToCSV}
              className="flex items-center gap-2 bg-guidebg text-white px-4 py-2 rounded"
            >
              <FaFileExport /> Export Data
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-500">Total Earned</h3>
              <p className="text-2xl font-bold">{formatBIF(totalEarned)}</p>
              <p className="text-sm text-gray-500">(80% of tour payments)</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-500">Total Paid Out</h3>
              <p className="text-2xl font-bold">{formatBIF(totalPaid)}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-500">Available Balance</h3>
              <p className="text-2xl font-bold text-guidebg">
                {formatBIF(totalEarned - totalPaid)}
              </p>
            </div>
          </div>

          {/* Payout Request Section */}
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h2 className="text-xl font-bold mb-4">Request Payout</h2>
            
            {!bankDetails ? (
              <button
                onClick={() => setShowBankForm(true)}
                className="bg-guidebg text-white px-4 py-2 rounded"
              >
                Add Bank Details
              </button>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block mb-2">Amount to Withdraw (BIF)</label>
                  <input
                    type="number"
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder={`Max ${formatBIF(totalEarned - totalPaid)}`}
                  />
                </div>
                <div>
                  <h4 className="font-medium">Bank Details</h4>
                  <p>{bankDetails.accountName}</p>
                  <p>{bankDetails.accountNumber} • {bankDetails.bankName}</p>
                  <button
                    onClick={() => setShowBankForm(true)}
                    className="text-blue-500 text-sm"
                  >
                    Update
                  </button>
                </div>
                <button
                  onClick={requestPayout}
                  className="bg-guidebg text-white px-4 py-2 rounded disabled:bg-gray-300"
                  disabled={!payoutAmount || payoutAmount <= 0}
                >
                  Request Payout
                </button>
              </div>
            )}
          </div>

          {/* Payout History */}
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h2 className="text-xl font-bold mb-4">Payout History</h2>
            {payouts.length === 0 ? (
              <p className="text-gray-500">No payout history yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bank Details</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {payouts.map((payout) => (
                      <tr key={payout.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {payout.date?.toLocaleDateString() || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {formatBIF(payout.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            payout.status === 'approved' ? 'bg-green-100 text-green-800' :
                            payout.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {payout.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {payout.bankDetails.accountName} ({payout.bankDetails.bankName})
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Recent Earnings */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Recent Earnings</h2>
            {bookings.length === 0 ? (
              <p className="text-gray-500">No earnings yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tour</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Your Earnings</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bookings.slice(0, 10).map((booking) => (
                      <tr key={booking.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {new Date(booking.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {booking.destinationName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {booking.userName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {formatBIF(booking.price * 0.8)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {showBankForm && (
          <BankDetailsForm
            onClose={() => setShowBankForm(false)}
            onSave={(details) => {
              setBankDetails(details);
              setShowBankForm(false);
            }}
            initialData={bankDetails}
          />
        )}
      </div>
    </div>
  );
};

export default GuideRevenueDashboard;
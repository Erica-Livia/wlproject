import { useState, useEffect } from 'react';
import { db, auth } from '../../firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import AdminNav from '../../components/AdminNav';
import { formatBIF } from '../../utils/currency';

const AdminPayoutApproval = () => {
    const [payouts, setPayouts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPendingPayouts = async () => {
            try {
                // Query the temporary guidePayouts collection we created earlier
                const payoutsRef = collection(db, 'guidePayouts');
                const q = query(
                    payoutsRef,
                    where('status', '==', 'pending')
                );
                
                const snapshot = await getDocs(q);
                const payoutData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    requestedAt: doc.data().date?.toDate()
                }));

                setPayouts(payoutData);
            } catch (error) {
                toast.error('Failed to load payout requests');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchPendingPayouts();
    }, []);

    const handlePayoutAction = async (payoutId, action) => {
        try {
            // Update payout status
            await updateDoc(doc(db, 'guidePayouts', payoutId), {
                status: action,
                processedAt: new Date(),
                processedBy: auth.currentUser.uid
            });

            if (action === 'approved') {
                // Here you would integrate with your payment gateway to send money
                toast.success('Payout approved!');
            } else {
                toast.success('Payout request rejected');
            }

            // Remove from local state
            setPayouts(payouts.filter(p => p.id !== payoutId));
        } catch (error) {
            toast.error(`Failed to ${action} payout`);
            console.error(error);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-row bg-gray-50 min-h-screen">
                <AdminNav />
                <p className="text-lg text-gray-600 p-6 ml-64 w-full">Loading Requests...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-row bg-gray-50 min-h-screen font-poppins">
            <AdminNav />
            
            <div className="p-6 w-full ml-24">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-2xl font-bold mb-6">Payout Approvals</h1>

                    {payouts.length === 0 ? (
                        <div className="bg-white p-6 rounded-lg shadow text-center">
                            <p>No pending payout requests</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guide</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bank Details</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {payouts.map((payout) => (
                                        <tr key={payout.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {payout.guideName}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {formatBIF(payout.amount)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm">
                                                    <p className="font-medium">{payout.bankDetails.accountName}</p>
                                                    <p>{payout.bankDetails.accountNumber}</p>
                                                    <p>{payout.bankDetails.bankName}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {payout.requestedAt?.toLocaleDateString() || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap space-x-2">
                                                <button
                                                    onClick={() => handlePayoutAction(payout.id, 'approved')}
                                                    className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handlePayoutAction(payout.id, 'rejected')}
                                                    className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition"
                                                >
                                                    Reject
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminPayoutApproval;
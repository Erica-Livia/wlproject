import { useState } from "react";

const PaymentForm = ({ onPaymentSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setError(null);

    try {
      // Simulate a payment process
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate a 2-second delay

      // Simulate a successful payment
      setSuccess(true);
      onPaymentSuccess(); // Call the success callback
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Payment Details</h2>

      {success ? (
        <div className="bg-green-100 text-green-800 p-4 rounded mb-4">
          Payment successful! Thank you for your purchase.
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Card Number
            </label>
            <input
              type="text"
              placeholder="1234 5678 9012 3456"
              className="w-full border border-gray-300 rounded-md p-2"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expiration Date
            </label>
            <input
              type="text"
              placeholder="MM/YY"
              className="w-full border border-gray-300 rounded-md p-2"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CVC
            </label>
            <input
              type="text"
              placeholder="CVC"
              className="w-full border border-gray-300 rounded-md p-2"
              required
            />
          </div>

          {error && (
            <div className="bg-red-100 text-red-800 p-3 rounded-md mb-4">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onCancel}
              className="bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-khaki text-white font-medium py-2 px-4 rounded-md disabled:opacity-50"
            >
              {loading ? "Processing..." : "Pay Now"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default PaymentForm;
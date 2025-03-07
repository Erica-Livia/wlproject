import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const PaymentForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      
      const mockClientSecret = "mock_client_secret";
      
      // Create a payment method
      const result = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement),
      });
      
      if (result.error) {
        setError(result.error.message);
      } else {
        
        setSuccess(true);
      }
    } catch (err) {
      setError('An unexpected error occurred.');
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
              Card Details
            </label>
            <div className="border border-gray-300 rounded-md p-3">
              <CardElement options={cardElementOptions} />
            </div>
          </div>
          
          {error && (
            <div className="bg-red-100 text-red-800 p-3 rounded-md mb-4">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={!stripe || loading}
            className="w-full bg-khaki text-white font-medium py-2 px-4 rounded-md disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Pay Now'}
          </button>
        </form>
      )}
    </div>
  );
};

export default PaymentForm;
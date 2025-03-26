import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { FaSpinner, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';

// Currency formatting function
const formatBIF = (amount) => {
  try {
    return new Intl.NumberFormat('bi-BI', {
      style: 'currency',
      currency: 'BIF',
      minimumFractionDigits: 0
    }).format(amount);
  } catch (error) {
    console.error('Currency formatting error:', error);
    return `${amount} BIF`; // Fallback formatting
  }
};

const PaymentForm = ({ onPaymentSuccess, onCancel, booking }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // 1. Create payment intent
      const response = await fetch('http://localhost:5000/create-payment-intent', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Add auth header
        },
        body: JSON.stringify({
          amount: booking.price,
          currency: 'usd',
          bookingId: booking.id,
          isBIF: !!booking.originalPrice // Send conversion flag
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const { clientSecret } = await response.json();

      // 2. Confirm payment
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: booking.userName,
            email: booking.userEmail || '',
            address: {
              line1: booking.userAddress || '',
              city: booking.userCity || '',
            }
          },
        },
        receipt_email: booking.userEmail || undefined,
      });

      if (stripeError) {
        throw stripeError;
      }

      if (paymentIntent.status === 'succeeded') {
        toast.success('Payment successful!');
        onPaymentSuccess(paymentIntent);
      }
    } catch (err) {
      console.error('Payment error:', err);
      const errorMessage = err.message || 'Payment failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Complete Payment</h2>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700 transition-colors"
          disabled={processing}
          aria-label="Close payment form"
        >
          <FaTimes size={20} />
        </button>
      </div>

      <div className="mb-4 space-y-2">
        <p className="text-gray-600">
          <span className="font-medium">Destination:</span> {booking.destinationName}
        </p>
        <p className="text-gray-600">
          <span className="font-medium">Amount:</span> {booking.originalPrice ? 
            `${formatBIF(booking.originalPrice)} (≈ $${booking.price} USD)` : 
            `$${booking.price} USD`}
        </p>
        {booking.description && (
          <p className="text-gray-600">
            <span className="font-medium">Details:</span> {booking.description}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                  ':-webkit-autofill': {
                    color: '#fce883',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
              hidePostalCode: true
            }}
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={!stripe || processing}
          className={`w-full py-3 px-4 rounded-md text-white font-medium transition-colors ${
            processing ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
          aria-busy={processing}
        >
          {processing ? (
            <span className="flex items-center justify-center">
              <FaSpinner className="animate-spin mr-2" />
              Processing...
            </span>
          ) : (
            `Pay $${booking.price} USD`
          )}
        </button>
      </form>

      <div className="mt-4 text-xs text-gray-500">
        <p>Payments are processed securely by Stripe.</p>
        {booking.originalPrice && (
          <p>Exchange rate: 1 USD ≈ 2,500 BIF</p>
        )}
      </div>
    </div>
  );
};

export default PaymentForm;
import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { FaSpinner, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';

const formatBIF = (amount) => {
  try {
    return new Intl.NumberFormat('bi-BI', {
      style: 'currency',
      currency: 'BIF',
      minimumFractionDigits: 0
    }).format(amount);
  } catch (error) {
    return `${amount} BIF`;
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
      toast.error('Payment system not ready');
      return;
    }
  
    setProcessing(true);
    setError(null);
  
    try {
      // Important change: Pass the original price in BIF if it exists
      const amountToCharge = booking.originalPrice || booking.price;
      const isBIF = !!booking.originalPrice;

      console.log('Submitting payment with:', {
        amount: amountToCharge,
        bookingId: booking.id,
        isBIF: isBIF
      });
  
      // First check Stripe connection
      try {
        await fetch('https://r.stripe.com/b', { mode: 'no-cors' });
      } catch (e) {
        throw new Error('Cannot connect to Stripe servers. Please check your internet connection.');
      }
  
      // Then proceed with payment intent
      const response = await fetch('http://localhost:5000/create-payment-intent', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          amount: amountToCharge,
          bookingId: booking.id,
          isBIF: isBIF
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Backend error:', errorData);
        throw new Error(errorData.error || 'Failed to create payment intent');
      }
  
      const paymentIntentData = await response.json();
      
      // Complete the payment
      const cardElement = elements.getElement(CardElement);
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        paymentIntentData.clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: localStorage.getItem('userName') || 'Anonymous'
            }
          }
        }
      );

      if (error) {
        throw new Error(error.message);
      }

      if (paymentIntent.status === 'succeeded') {
        onPaymentSuccess(paymentIntent);
        toast.success('Payment successful!');
      }
  
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message);
      toast.error(err.message.includes('Stripe servers') ? 
        'Payment service unavailable. Please try again later.' : 
        err.message || 'Payment failed. Please try again.');
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
          className="text-gray-500 hover:text-gray-700"
          disabled={processing}
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
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': { color: '#aab7c4' }
                },
                invalid: { color: '#9e2146' }
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
          className={`w-full py-3 px-4 rounded-md text-white font-medium ${processing ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
            }`}
        >
          {processing ? (
            <span className="flex items-center justify-center">
              <FaSpinner className="animate-spin mr-2" />
              Processing...
            </span>
          ) : (
            `Pay ${booking.originalPrice ? formatBIF(booking.originalPrice) : `$${booking.price} USD`}`
          )}
        </button>
      </form>

      <div className="mt-4 text-xs text-gray-500">
        <p>Payments processed securely by Stripe</p>
        {booking.originalPrice && <p>Exchange rate: 1 USD ≈ 2,500 BIF</p>}
      </div>
    </div>
  );
};

export default PaymentForm;
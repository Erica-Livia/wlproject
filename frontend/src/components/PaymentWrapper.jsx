import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import PaymentForm from './PaymentForm';


const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
const PaymentWrapper = ({ onPaymentSuccess, onCancel, booking }) => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm 
        onPaymentSuccess={onPaymentSuccess} 
        onCancel={onCancel} 
        booking={booking} 
      />
    </Elements>
  );
};

export default PaymentWrapper;
import React from "react";
import { loadStripe } from "@stripe/stripe-js"; // Install: npm install @stripe/stripe-js
import { Elements } from "@stripe/react-stripe-js"; // Install: npm install @stripe/react-stripe-js
import CheckoutForm from "./CheckoutForm"; // Create a CheckoutForm component

const stripePromise = loadStripe("your-publishable-key"); // Replace with your Stripe key

function PaymentPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8">Payment</h1>
      <Elements stripe={stripePromise}>
        <CheckoutForm />
      </Elements>
    </div>
  );
}

export default PaymentPage;
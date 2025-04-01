import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import policies from '../data/policies.json';

const LegalPolicies = () => {
  const [activePolicy, setActivePolicy] = useState('termsAndConditions');

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-poppins">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900">
            {activePolicy === 'termsAndConditions' ? 'Terms & Conditions' : 'Privacy Policy'}
          </h1>
          <p className="text-gray-500 mt-2">
            Last Updated: {policies[activePolicy].lastUpdated}
          </p>
        </div>

        {/* Policy Navigation */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-md shadow-sm">
            <button
              onClick={() => setActivePolicy('termsAndConditions')}
              className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                activePolicy === 'termsAndConditions'
                  ? 'bg-khaki text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Terms & Conditions
            </button>
            <button
              onClick={() => setActivePolicy('privacyPolicy')}
              className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                activePolicy === 'privacyPolicy'
                  ? 'bg-khaki text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Privacy Policy
            </button>
          </div>
        </div>

        {/* Policy Content */}
        <div className="bg-white shadow rounded-lg p-6 md:p-8">
          {policies[activePolicy].sections.map((section, index) => (
            <div key={index} className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                {index + 1}. {section.title}
              </h2>
              <p className="text-gray-600 leading-relaxed">{section.content}</p>
            </div>
          ))}

          {/* Contact Information */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Contact Us</h3>
            <p className="text-gray-600">
              Email:{' '}
              <a
                href={`mailto:$
                  ingabireericalivia@gmail.com ingabireericalivia@gmail.com
                `}
                className="text-blue-600 hover:underline"
              >
                {activePolicy === 'termsAndConditions' ? 'legal' : 'privacy'}@wanderlust.bi
              </a>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-khaki hover:bg-khaki-dark"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LegalPolicies;
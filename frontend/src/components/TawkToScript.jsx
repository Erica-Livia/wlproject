import React, { useEffect } from 'react';

const TawkToScript = () => {
  useEffect(() => {
    // Create the script element
    const s1 = document.createElement('script');
    s1.async = true;
    s1.src = 'https://embed.tawk.to/67becb145710c5190bd5e4bb/1il0kiit2';
    s1.charset = 'UTF-8';
    s1.setAttribute('crossorigin', '*');

    // Append the script to the document body
    document.body.appendChild(s1);

    // Cleanup function to remove the script when the component unmounts
    return () => {
      document.body.removeChild(s1);
    };
  }, []);

  return null; // This component doesn't render anything
};

export default TawkToScript;
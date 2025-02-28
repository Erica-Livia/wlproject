import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Step 1: Firebase Authentication
      console.log('Attempting Firebase authentication...');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Firebase authentication successful');

      // Step 2: Get Firebase ID token
      const idToken = await userCredential.user.getIdToken();
      console.log('Got Firebase ID token');

      // Step 3: Backend Authentication
      console.log('Sending request to backend...');
      try {
        const response = await axios.post('http://localhost:5000/api/login', {
          email,
          password
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
          },
          timeout: 10000 // 10 second timeout
        });
        console.log('Backend response:', response.data);

        // Step 4: Handle successful login
        const { role, uid } = response.data;

        // Store authentication data
        localStorage.setItem('authToken', idToken);
        localStorage.setItem('userRole', role);
        localStorage.setItem('userId', uid);
        localStorage.setItem('userEmail', email);
        localStorage.setItem('isLoggedIn', 'true'); // Add this for NavBar

        console.log('Role:', role);

        // Navigate based on role
        switch(role) {
          case 'admin':
            navigate('/admin-dashboard');
            break;
          case 'guide':
            navigate('/guide-dashboard');
            break;
          default:
            navigate('/');
        }
      } catch (backendError) {
        console.error('Backend authentication error:', backendError);
        if (backendError.response) {
          setError(backendError.response.data.error || 'Login failed on server');
        } else if (backendError.request) {
          // Request was made but no response received
          setError('Unable to reach the server. Please check your connection.');
        } else {
          setError('An error occurred during authentication');
        }
        
        // Even if backend fails, we might still want to allow login if Firebase succeeded
        // Uncomment the following code if you want to enable this fallback
        /*
        console.log('Allowing Firebase-only login as fallback');
        localStorage.setItem('authToken', idToken);
        localStorage.setItem('userRole', 'user'); // Default role
        localStorage.setItem('userId', userCredential.user.uid);
        localStorage.setItem('userEmail', email);
        localStorage.setItem('isLoggedIn', 'true');
        navigate('/');
        */
      }
    } catch (firebaseError) {
      console.error('Firebase login error:', firebaseError);
      if (firebaseError.code === 'auth/user-not-found' || firebaseError.code === 'auth/wrong-password') {
        setError('Invalid email or password');
      } else if (firebaseError.code === 'auth/too-many-requests') {
        setError('Too many failed login attempts. Please try again later.');
      } else if (firebaseError.code === 'auth/network-request-failed') {
        setError('Network error. Please check your connection.');
      } else {
        setError(`Login failed: ${firebaseError.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen font-poppins flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-textWhite p-8 rounded-xl shadow-lg">
        {/* Header */}
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-green">Welcome back</h2>
          <p className="mt-2 text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-khaki hover:text-blue-500">
              Sign up
            </Link>
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleEmailLogin}>
          <div className="rounded-md shadow-sm space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-lg relative block w-full pl-12 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-lg relative block w-full pl-12 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-khaki hover:bg-green focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
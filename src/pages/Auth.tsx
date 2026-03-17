import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { PenTool, Mail, Lock, User, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

const Auth = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  // Determine initial mode from URL or default to login
  const [isLogin, setIsLogin] = useState(location.pathname === '/login');

  if (authLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-emerald-600 animate-spin" />
      </div>
    );
  }
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Real-time validation
  const [validationErrors, setValidationErrors] = useState({
    username: '',
    email: '',
    password: ''
  });

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateUsername = (name: string) => {
    return name.length >= 3 && /^[a-zA-Z0-9_]+$/.test(name);
  };

  useEffect(() => {
    const errors = {
      username: '',
      email: '',
      password: ''
    };

    if (!isLogin && username && !validateUsername(username)) {
      errors.username = 'Username must be at least 3 characters (letters, numbers, underscores only)';
    }

    if (email && !validateEmail(email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (password && password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setValidationErrors(errors);
  }, [username, email, password, isLogin]);

  const isFormValid = isLogin 
    ? (email && password && !validationErrors.email && !validationErrors.password)
    : (username && email && password && !validationErrors.username && !validationErrors.email && !validationErrors.password);

  useEffect(() => {
    if (user && !loading) {
      const timer = setTimeout(() => {
        navigate('/dashboard');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [user, navigate, loading]);

  useEffect(() => {
    setIsLogin(location.pathname === '/login');
    setError(null);
  }, [location.pathname]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        if (userCredential.user) {
          setSuccess(true);
        }
      } else {
        // Sign up
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const newUser = userCredential.user;

        // Assign 'admin' role only to the primary admin emails
        const adminEmails = ['gayatrimulik22@gmail.com', 'riddhijadhav204@gmail.com', 'sawantsamruddhi395@gmail.com'];
        const role = adminEmails.includes(email.toLowerCase()) ? 'admin' : 'user';

        // Create profile in Firestore
        await setDoc(doc(db, 'profiles', newUser.uid), {
          id: newUser.uid,
          username,
          email,
          role,
          created_at: new Date().toISOString(),
        });
        
        setSuccess(true);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      let message = 'Authentication failed';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        message = 'Invalid email or password.';
      } else if (err.code === 'auth/email-already-in-use') {
        message = 'This email is already registered.';
      } else if (err.code === 'auth/weak-password') {
        message = 'Password should be at least 6 characters.';
      }
      setError(message);
    } finally {
      if (!success) {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden">
          {/* Mode Toggle Header */}
          <div className="flex border-b border-stone-100">
            <button
              onClick={() => { setIsLogin(true); navigate('/login'); }}
              className={`flex-1 py-5 text-sm font-bold uppercase tracking-widest transition-all ${
                isLogin ? 'text-emerald-600 bg-white border-b-2 border-emerald-600' : 'text-stone-400 bg-stone-50 hover:text-stone-600'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsLogin(false); navigate('/register'); }}
              className={`flex-1 py-5 text-sm font-bold uppercase tracking-widest transition-all ${
                !isLogin ? 'text-emerald-600 bg-white border-b-2 border-emerald-600' : 'text-stone-400 bg-stone-50 hover:text-stone-600'
              }`}
            >
              Sign Up
            </button>
          </div>

          <div className="p-8 md:p-10">
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-50 rounded-2xl mb-4">
                <PenTool className="h-8 w-8 text-emerald-600" />
              </div>
              <h2 className="text-3xl font-bold text-stone-900">
                {isLogin ? 'Welcome Back' : 'Join BlogHub'}
              </h2>
              <p className="text-stone-500 mt-2">
                {isLogin ? 'Sign in to your account' : 'Start your blogging journey today'}
              </p>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-center text-sm"
              >
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    key="username"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <label className="block text-sm font-semibold text-stone-700 mb-2">Username</label>
                    <div className="relative">
                      <User className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors ${validationErrors.username ? 'text-red-400' : 'text-stone-400'}`} />
                      <input
                        type="text"
                        required={!isLogin}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 bg-stone-50 border rounded-xl outline-none transition-all ${
                          validationErrors.username 
                            ? 'border-red-300 focus:ring-2 focus:ring-red-500/20 focus:border-red-500' 
                            : 'border-stone-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'
                        }`}
                        placeholder="johndoe"
                      />
                    </div>
                    {validationErrors.username && (
                      <p className="mt-1.5 text-xs text-red-500 font-medium flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {validationErrors.username}
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors ${validationErrors.email ? 'text-red-400' : 'text-stone-400'}`} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 bg-stone-50 border rounded-xl outline-none transition-all ${
                      validationErrors.email 
                        ? 'border-red-300 focus:ring-2 focus:ring-red-500/20 focus:border-red-500' 
                        : 'border-stone-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'
                    }`}
                    placeholder="you@example.com"
                  />
                </div>
                {validationErrors.email && (
                  <p className="mt-1.5 text-xs text-red-500 font-medium flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {validationErrors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2">Password</label>
                <div className="relative">
                  <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors ${validationErrors.password ? 'text-red-400' : 'text-stone-400'}`} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 bg-stone-50 border rounded-xl outline-none transition-all ${
                      validationErrors.password 
                        ? 'border-red-300 focus:ring-2 focus:ring-red-500/20 focus:border-red-500' 
                        : 'border-stone-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'
                    }`}
                    placeholder="••••••••"
                    minLength={6}
                  />
                </div>
                {validationErrors.password && (
                  <p className="mt-1.5 text-xs text-red-500 font-medium flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {validationErrors.password}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !isFormValid}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : success ? (
                  <span className="flex items-center">
                    Success! Redirecting...
                  </span>
                ) : (
                  <>
                    {isLogin ? 'Sign In' : 'Sign Up'}
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <button 
                onClick={() => { setIsLogin(!isLogin); navigate(isLogin ? '/register' : '/login'); }}
                className="text-sm text-stone-500 hover:text-emerald-600 transition-colors"
              >
                {isLogin ? (
                  <>Don't have an account? <span className="font-bold text-emerald-600">Sign up now</span></>
                ) : (
                  <>Already have an account? <span className="font-bold text-emerald-600">Sign in here</span></>
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;

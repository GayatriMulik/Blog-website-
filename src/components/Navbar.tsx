import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PenTool, User, LogOut, Search, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

const Navbar = () => {
  const { user, profile, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = React.useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-stone-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <PenTool className="h-8 w-8 text-emerald-600" />
              <span className="text-2xl font-bold font-sans tracking-tight text-stone-900">BlogHub</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/search" className="text-stone-600 hover:text-emerald-600 transition-colors">
              <Search className="h-5 w-5" />
            </Link>
            <Link to="/" className="text-stone-600 hover:text-emerald-600 font-medium">Home</Link>
            {user ? (
              <>
                <Link to="/dashboard" className="text-stone-600 hover:text-emerald-600 font-medium">Dashboard</Link>
                {isAdmin && (
                  <Link to="/admin" className="text-stone-600 hover:text-emerald-600 font-medium">Admin</Link>
                )}
                <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-stone-200">
                  <span className="text-sm text-stone-500 font-medium">{profile?.username}</span>
                  <button
                    onClick={handleSignOut}
                    className="p-2 text-stone-600 hover:text-red-600 transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-stone-600 p-2"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-stone-100 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              <Link to="/" className="block px-3 py-2 text-stone-600 font-medium" onClick={() => setIsOpen(false)}>Home</Link>
              <Link to="/search" className="block px-3 py-2 text-stone-600 font-medium" onClick={() => setIsOpen(false)}>Search</Link>
              {user ? (
                <>
                  <Link to="/dashboard" className="block px-3 py-2 text-stone-600 font-medium" onClick={() => setIsOpen(false)}>Dashboard</Link>
                  {isAdmin && (
                    <Link to="/admin" className="block px-3 py-2 text-stone-600 font-medium" onClick={() => setIsOpen(false)}>Admin</Link>
                  )}
                  <button
                    onClick={() => { handleSignOut(); setIsOpen(false); }}
                    className="block w-full text-left px-3 py-2 text-red-600 font-medium"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="block px-3 py-2 text-emerald-600 font-bold" onClick={() => setIsOpen(false)}>Get Started</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;

import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { isSupabaseConfigured } from '../lib/supabase';
import { AlertTriangle } from 'lucide-react';

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      {!isSupabaseConfigured && (
        <div className="bg-amber-500 text-white px-4 py-2 text-center text-sm font-bold flex items-center justify-center space-x-2">
          <AlertTriangle className="h-4 w-4" />
          <span>Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your Secrets.</span>
        </div>
      )}
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;

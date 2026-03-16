import React from 'react';
import { BookOpen, Github, Twitter, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-stone-900 text-stone-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 text-white mb-4">
              <BookOpen className="h-6 w-6 text-emerald-500" />
              <span className="text-xl font-bold tracking-tight">BookVerse</span>
            </div>
            <p className="max-w-xs text-sm leading-relaxed">
              Your premier destination for book reviews, literary blogs, and community discussions. 
              Join thousands of readers sharing their passion for stories.
            </p>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Platform</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/" className="hover:text-emerald-500 transition-colors">Home</a></li>
              <li><a href="/search" className="hover:text-emerald-500 transition-colors">Search</a></li>
              <li><a href="/login" className="hover:text-emerald-500 transition-colors">Login</a></li>
              <li><a href="/register" className="hover:text-emerald-500 transition-colors">Register</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Connect</h3>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-emerald-500 transition-colors"><Twitter className="h-5 w-5" /></a>
              <a href="#" className="hover:text-emerald-500 transition-colors"><Github className="h-5 w-5" /></a>
              <a href="#" className="hover:text-emerald-500 transition-colors"><Mail className="h-5 w-5" /></a>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-stone-800 text-center text-xs">
          <p>&copy; {new Date().getFullYear()} BookVerse. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Plus, Edit2, Trash2, PenTool, FileText, MessageSquare, Star, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Post } from '../types';
import { format } from 'date-fns';

const Dashboard = () => {
  const { user, profile, isAdmin, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate('/login');
      return;
    }

    fetchUserPosts();
  }, [user, authLoading]);

  const fetchUserPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('author_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;
      setPosts(posts.filter(p => p.id !== postId));
    } catch (err: any) {
      alert(err.message || 'Failed to delete post');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6"
      >
        <div>
          <h1 className="text-5xl font-bold text-stone-900 mb-3 font-sans tracking-tighter">Your Dashboard</h1>
          <p className="text-stone-500 text-lg">Welcome back, <span className="text-emerald-600 font-bold">{profile?.username}</span>. Ready to share something new?</p>
        </div>
        <div className="flex flex-wrap gap-4">
          {isAdmin && (
            <Link 
              to="/admin" 
              className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-8 py-4 rounded-2xl font-bold flex items-center justify-center transition-all border border-emerald-200"
            >
              <Star className="h-5 w-5 mr-2" />
              Admin Panel
            </Link>
          )}
          <Link 
            to="/dashboard/create" 
            className="bg-stone-900 hover:bg-stone-800 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center transition-all shadow-2xl shadow-stone-900/20 group"
          >
            <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform" />
            Create New Post
          </Link>
        </div>
      </motion.div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex items-center shadow-sm"
        >
          <AlertCircle className="h-5 w-5 mr-3" />
          {error}
        </motion.div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-8 rounded-[2rem] border border-stone-200 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-4xl font-bold text-stone-900">{posts.length}</span>
          </div>
          <p className="text-stone-400 text-[10px] font-bold uppercase tracking-[0.2em]">Total Stories</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-8 rounded-[2rem] border border-stone-200 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-purple-600" />
            </div>
            <span className="text-4xl font-bold text-stone-900">0</span>
          </div>
          <p className="text-stone-400 text-[10px] font-bold uppercase tracking-[0.2em]">Total Comments</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-stone-900 p-8 rounded-[2rem] shadow-2xl shadow-stone-900/20"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
              <Star className="h-6 w-6 text-emerald-400" />
            </div>
            <span className="text-4xl font-bold text-white">0</span>
          </div>
          <p className="text-stone-400 text-[10px] font-bold uppercase tracking-[0.2em]">Total Likes</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-emerald-600 p-8 rounded-[2rem] shadow-2xl shadow-emerald-600/20"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <PenTool className="h-6 w-6 text-white" />
            </div>
          </div>
          <p className="text-emerald-100 text-[10px] font-bold uppercase tracking-[0.2em]">Active Writer</p>
          <p className="text-white font-bold mt-1">Level 1</p>
        </motion.div>
      </div>

      {/* Posts List */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-[2.5rem] border border-stone-200 shadow-sm overflow-hidden"
      >
        <div className="px-8 py-6 border-b border-stone-100 bg-stone-50/30 flex items-center justify-between">
          <h2 className="text-xl font-bold text-stone-900">Your Recent Activity</h2>
          <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">{posts.length} Items</span>
        </div>
        
        {posts.length > 0 ? (
          <div className="divide-y divide-stone-100">
            {posts.map((post, index) => (
              <motion.div 
                key={post.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + (index * 0.05) }}
                className="p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:bg-stone-50/50 transition-all group"
              >
                <div className="flex items-center space-x-6">
                  <div className="w-20 h-20 rounded-[1.5rem] overflow-hidden flex-shrink-0 bg-stone-100 shadow-sm group-hover:shadow-md transition-shadow">
                    <img 
                      src={post.image_url || `https://picsum.photos/seed/${post.id}/200/200`} 
                      alt={post.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-stone-900 hover:text-emerald-600 transition-colors mb-2">
                      <Link to={`/post/${post.id}`}>{post.title}</Link>
                    </h3>
                    <div className="flex items-center space-x-4">
                      <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                        Blog
                      </span>
                      <span className="text-xs text-stone-400 font-medium">{format(new Date(post.created_at), 'MMMM d, yyyy')}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Link 
                    to={`/dashboard/edit/${post.id}`}
                    className="p-3 text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-2xl transition-all"
                    title="Edit Post"
                  >
                    <Edit2 className="h-5 w-5" />
                  </Link>
                  <button 
                    onClick={() => handleDelete(post.id)}
                    className="p-3 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all"
                    title="Delete Post"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-32 text-center">
            <div className="w-20 h-20 bg-stone-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
              <PenTool className="h-10 w-10 text-stone-200" />
            </div>
            <h3 className="text-xl font-bold text-stone-900 mb-2">No stories yet</h3>
            <p className="text-stone-500 mb-8">Your creative journey starts with your first post.</p>
            <Link 
              to="/dashboard/create"
              className="inline-flex items-center bg-emerald-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
            >
              <Plus className="h-5 w-5 mr-2" />
              Write Your First Story
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Dashboard;

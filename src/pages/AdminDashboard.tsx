import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Users, FileText, Trash2, Shield, Loader2, AlertCircle, MessageSquare } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Post, Profile } from '../types';
import { format } from 'date-fns';

const AdminDashboard = () => {
  const { user, profile, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'posts' | 'users'>('posts');

  useEffect(() => {
    if (authLoading) return;

    if (!user || !isAdmin) {
      navigate('/');
      return;
    }

    fetchAdminData();
  }, [user, isAdmin, authLoading]);

  const fetchAdminData = async () => {
    try {
      // Fetch all posts
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;
      setPosts(postsData || []);

      // Fetch all users
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;
      setUsers(usersData || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm('Admin: Delete this post?')) return;

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

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Admin: Delete this user and all their data? This action is irreversible.')) return;

    try {
      // Note: In a real app, you'd use a Supabase Edge Function to delete the auth user too.
      // Here we just delete the profile and their posts.
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (profileError) throw profileError;
      setUsers(users.filter(u => u.id !== userId));
      setPosts(posts.filter(p => p.author_id !== userId));
    } catch (err: any) {
      alert(err.message || 'Failed to delete user');
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
        className="mb-12"
      >
        <div className="flex items-center space-x-4 mb-3">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
            <Shield className="h-7 w-7 text-emerald-600" />
          </div>
          <h1 className="text-5xl font-bold text-stone-900 font-sans tracking-tighter">Admin Control Center</h1>
        </div>
        <p className="text-stone-500 text-lg">Manage platform content, user accounts, and system health.</p>
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

      {/* Admin Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-8 rounded-[2rem] border border-stone-200 shadow-sm"
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
          className="bg-white p-8 rounded-[2rem] border border-stone-200 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <span className="text-4xl font-bold text-stone-900">{users.length}</span>
          </div>
          <p className="text-stone-400 text-[10px] font-bold uppercase tracking-[0.2em]">Total Users</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-stone-900 p-8 rounded-[2rem] shadow-2xl shadow-stone-900/20"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
              <Shield className="h-6 w-6 text-emerald-400" />
            </div>
            <span className="text-xl font-bold text-white">System</span>
          </div>
          <p className="text-stone-400 text-[10px] font-bold uppercase tracking-[0.2em]">Platform Role</p>
          <p className="text-emerald-400 font-bold mt-1">Admin</p>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="flex p-1.5 bg-stone-100 rounded-2xl w-fit mb-10">
        <button
          onClick={() => setActiveTab('posts')}
          className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center ${
            activeTab === 'posts' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'
          }`}
        >
          <FileText className="h-5 w-5 mr-2" />
          Manage Posts
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center ${
            activeTab === 'users' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'
          }`}
        >
          <Users className="h-5 w-5 mr-2" />
          Manage Users
        </button>
      </div>

      {/* Content Table */}
      <motion.div 
        key={activeTab}
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white rounded-[2.5rem] border border-stone-200 shadow-sm overflow-hidden"
      >
        {activeTab === 'posts' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50/50 border-b border-stone-100">
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">Post Title</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">Author</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">Date</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {posts.map((post, index) => (
                  <motion.tr 
                    key={post.id} 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className="hover:bg-stone-50/50 transition-colors group"
                  >
                    <td className="px-8 py-5">
                      <Link to={`/post/${post.id}`} className="font-bold text-stone-900 hover:text-emerald-600 transition-colors line-clamp-1">
                        {post.title}
                      </Link>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-stone-100 rounded-full flex items-center justify-center text-[10px] font-bold text-stone-500">
                          {post.author_name.charAt(0)}
                        </div>
                        <span className="text-sm text-stone-600 font-medium">{post.author_name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm text-stone-400 font-medium">{format(new Date(post.created_at), 'MMM d, yyyy')}</td>
                    <td className="px-8 py-5 text-right">
                      <button 
                        onClick={() => handleDeletePost(post.id)}
                        className="p-3 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50/50 border-b border-stone-100">
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">User Profile</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">Email</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">Role</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">Joined</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {users.map((u, index) => (
                  <motion.tr 
                    key={u.id} 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className="hover:bg-stone-50/50 transition-colors group"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center font-bold text-emerald-600">
                          {u.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-stone-900">{u.username}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm text-stone-600 font-medium">{u.email}</td>
                    <td className="px-8 py-5">
                      <span className={`text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full ${
                        u.role === 'admin' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-stone-100 text-stone-700 border border-stone-200'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-sm text-stone-400 font-medium">{format(new Date(u.created_at), 'MMM d, yyyy')}</td>
                    <td className="px-8 py-5 text-right">
                      {u.id !== user?.id && (
                        <button 
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-3 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AdminDashboard;

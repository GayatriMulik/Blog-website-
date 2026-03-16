import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { PenTool, ArrowRight, Star, Clock, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Post } from '../types';
import { format } from 'date-fns';
import { DEMO_POSTS } from '../lib/demoData';

const Home = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(6);

        if (error) throw error;
        
        // Combine real posts with demo posts for display
        const combinedPosts = [...(data || []), ...DEMO_POSTS];
        // Sort by date
        combinedPosts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        
        setPosts(combinedPosts);
      } catch (error) {
        console.error('Error fetching posts:', error);
        // Fallback to demo posts if fetch fails
        setPosts(DEMO_POSTS);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative min-h-[700px] flex items-center overflow-hidden bg-stone-950 text-white">
        <div className="absolute inset-0 z-0">
          <motion.div 
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.4 }}
            transition={{ duration: 1.5 }}
            className="w-full h-full"
          >
            <img 
              src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=2000" 
              alt="Creative workspace" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/80 to-transparent"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-[0.2em] mb-6 border border-emerald-500/20">
                The Future of Blogging
              </span>
              <h1 className="text-6xl md:text-8xl font-bold font-sans tracking-tighter mb-8 leading-[0.9]">
                Write. <br />
                <span className="text-emerald-500">Inspire.</span> <br />
                Connect.
              </h1>
              <p className="text-xl text-stone-400 mb-10 leading-relaxed max-w-xl">
                BlogHub is the premier destination for modern storytellers. Share your unique perspective with a global audience of curious minds.
              </p>
              <div className="flex flex-wrap gap-5">
                <Link 
                  to="/login" 
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-10 py-5 rounded-2xl font-bold text-lg transition-all flex items-center group shadow-2xl shadow-emerald-600/20"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  to="/search" 
                  className="bg-white/5 hover:bg-white/10 backdrop-blur-xl text-white border border-white/10 px-10 py-5 rounded-2xl font-bold text-lg transition-all"
                >
                  Explore Feed
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Floating Decorative Elements */}
        <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-emerald-600/10 blur-[120px] rounded-full -mr-20 -mb-20"></div>
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full -mt-20"></div>
      </section>

      {/* Recent Posts */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold text-stone-900 mb-2">Latest Stories</h2>
            <p className="text-stone-500">The latest insights and blogs from our community.</p>
          </div>
          <Link to="/search" className="text-emerald-600 font-semibold hover:text-emerald-700 flex items-center">
            View all <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-white rounded-2xl h-96 border border-stone-200"></div>
            ))}
          </div>
        ) : posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl overflow-hidden border border-stone-200 hover:shadow-xl transition-all group flex flex-col"
              >
                <Link to={`/post/${post.id}`} className="block relative h-56 overflow-hidden">
                  <img 
                    src={post.image_url || `https://picsum.photos/seed/${post.id}/800/600`} 
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700">
                      Blog
                    </span>
                  </div>
                </Link>
                <div className="p-6 flex-grow flex flex-col">
                  <div className="flex items-center text-xs text-stone-400 mb-3 space-x-4">
                    <span className="flex items-center"><Clock className="h-3 w-3 mr-1" /> {format(new Date(post.created_at), 'MMM d, yyyy')}</span>
                    <span className="flex items-center"><User className="h-3 w-3 mr-1" /> {post.author_name}</span>
                  </div>
                  <h3 className="text-xl font-bold text-stone-900 mb-3 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                    <Link to={`/post/${post.id}`}>{post.title}</Link>
                  </h3>
                  <p className="text-stone-600 text-sm line-clamp-3 mb-6 flex-grow">
                    {post.content.replace(/<[^>]*>/g, '')}
                  </p>
                  <Link 
                    to={`/post/${post.id}`} 
                    className="text-emerald-600 font-bold text-sm flex items-center group/link"
                  >
                    Read More 
                    <ArrowRight className="ml-1 h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-stone-200">
            <PenTool className="h-12 w-12 text-stone-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-stone-900">No posts yet</h3>
            <p className="text-stone-500 mb-6">Be the first to share your story!</p>
            <Link to="/register" className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold">Get Started</Link>
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="bg-stone-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-stone-900 mb-4">Why BlogHub?</h2>
            <p className="text-stone-600">A dedicated space for writers to connect and share.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-200">
              <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6">
                <Star className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Quality Content</h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                Discover high-quality articles and stories from passionate writers across the globe.
              </p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-200">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Community First</h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                Connect with other writers, comment on stories, and build your creative network.
              </p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-200">
              <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
                <PenTool className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Personal Blog</h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                Create your own space to share your thoughts, experiences, and expertise.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

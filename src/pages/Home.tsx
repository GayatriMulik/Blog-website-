import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { PenTool, ArrowRight, Star, Clock, User, ChevronRight, ChevronLeft } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Post } from '../types';
import { format } from 'date-fns';
import { DEMO_POSTS } from '../lib/demoData';

const Home = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const blogSectionRef = useRef<HTMLElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const postsRef = collection(db, 'posts');
    const q = query(postsRef, orderBy('created_at', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const realPosts = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as Post[];

      // Combine real posts with demo posts for display
      const combinedPosts = [...realPosts, ...DEMO_POSTS];
      // Sort by date
      combinedPosts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      setPosts(combinedPosts);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching posts:', error);
      setPosts(DEMO_POSTS);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const scrollToBlogs = () => {
    blogSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollContainerRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative min-h-[800px] flex items-center overflow-hidden bg-stone-950 text-white">
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
                <button 
                  onClick={scrollToBlogs}
                  className="bg-white/5 hover:bg-white/10 backdrop-blur-xl text-white border border-white/10 px-10 py-5 rounded-2xl font-bold text-lg transition-all"
                >
                  Explore Feed
                </button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Floating Decorative Elements */}
        <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-emerald-600/10 blur-[120px] rounded-full -mr-20 -mb-20"></div>
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full -mt-20"></div>
      </section>

      {/* Featured Section (Horizontal Scroll) */}
      {!loading && posts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-bold text-stone-900 mb-2">Featured Stories</h2>
              <p className="text-stone-500">Hand-picked insights from our top contributors.</p>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={() => scroll('left')}
                className="p-3 rounded-full bg-stone-100 hover:bg-stone-200 transition-colors text-stone-600"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button 
                onClick={() => scroll('right')}
                className="p-3 rounded-full bg-stone-100 hover:bg-stone-200 transition-colors text-stone-600"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div 
            ref={scrollContainerRef}
            className="flex overflow-x-auto gap-8 pb-8 scrollbar-hide snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {posts.slice(0, 5).map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="min-w-[300px] md:min-w-[450px] snap-start"
              >
                <Link to={`/post/${post.id}`} className="block group relative h-[500px] rounded-[2.5rem] overflow-hidden">
                  <img 
                    src={post.image_url || `https://picsum.photos/seed/${post.id}/800/1000`} 
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent opacity-80"></div>
                  <div className="absolute bottom-0 left-0 p-8 w-full">
                    <div className="flex items-center space-x-4 mb-4">
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-emerald-500 text-white">
                        Featured
                      </span>
                      <span className="text-xs text-stone-300 font-medium flex items-center">
                        <Clock className="h-3 w-3 mr-1" /> {format(new Date(post.created_at), 'MMM d')}
                      </span>
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-4 line-clamp-2 leading-tight">
                      {post.title}
                    </h3>
                    <div className="flex items-center text-sm text-stone-300">
                      <User className="h-4 w-4 mr-2" />
                      {post.author_name}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Latest Stories Grid */}
      <section ref={blogSectionRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
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
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse bg-stone-100 rounded-[2rem] h-96 border border-stone-200"></div>
            ))}
          </div>
        ) : posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {posts.map((post, index) => {
              const isHero = index === 0;
              return (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index % 3 * 0.1, duration: 0.6 }}
                  className={`group relative flex flex-col bg-white rounded-[2.5rem] overflow-hidden border border-stone-100 hover:border-emerald-500/30 hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] transition-all duration-500 ${
                    isHero ? 'md:col-span-2 md:flex-row' : ''
                  }`}
                >
                  <Link 
                    to={`/post/${post.id}`} 
                    className={`block relative overflow-hidden ${
                      isHero ? 'md:w-1/2 h-80 md:h-auto' : 'h-64'
                    }`}
                  >
                    <img 
                      src={post.image_url || `https://picsum.photos/seed/${post.id}/1200/800`} 
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-stone-950/10 group-hover:bg-transparent transition-colors duration-500"></div>
                  </Link>
                  
                  <div className={`p-8 md:p-10 flex flex-col justify-between ${isHero ? 'md:w-1/2' : 'flex-grow'}`}>
                    <div>
                      <div className="flex items-center space-x-3 mb-6">
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-stone-100 text-stone-500 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                          {post.type}
                        </span>
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest flex items-center">
                          <Clock className="h-3 w-3 mr-1" /> {format(new Date(post.created_at), 'MMM d, yyyy')}
                        </span>
                      </div>
                      
                      <h3 className={`${isHero ? 'text-3xl md:text-4xl' : 'text-2xl'} font-bold text-stone-900 mb-4 leading-tight group-hover:text-emerald-600 transition-colors duration-300`}>
                        <Link to={`/post/${post.id}`}>{post.title}</Link>
                      </h3>
                      
                      <p className="text-stone-500 text-sm leading-relaxed line-clamp-3 mb-8">
                        {post.content.replace(/<[^>]*>/g, '').substring(0, 160)}...
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-stone-50">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs border-2 border-white shadow-sm">
                          {post.author_name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-stone-900">{post.author_name}</p>
                          <p className="text-[10px] text-stone-400 font-medium">Contributor</p>
                        </div>
                      </div>
                      
                      <Link 
                        to={`/post/${post.id}`} 
                        className="w-10 h-10 rounded-full bg-stone-50 group-hover:bg-emerald-600 flex items-center justify-center transition-all duration-300 group-hover:rotate-[-45deg]"
                      >
                        <ArrowRight className="h-4 w-4 text-stone-400 group-hover:text-white" />
                      </Link>
                    </div>
                  </div>
                </motion.article>
              );
            })}
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

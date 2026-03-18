import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search as SearchIcon, PenTool, User, Clock, ArrowRight, Filter, Loader2, Heart } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { Post } from '../types';
import { format } from 'date-fns';
import { DEMO_POSTS } from '../lib/demoData';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const typeFilter = searchParams.get('type') || 'all';

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(queryParam);

  useEffect(() => {
    fetchPosts();
  }, [queryParam, typeFilter]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const postsRef = collection(db, 'posts');
      const q = query(postsRef, orderBy('created_at', 'desc'));
      const snapshot = await getDocs(q);
      
      const realPosts = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as Post[];
      
      const allPosts = [...realPosts, ...DEMO_POSTS];
      
      // Filter posts in memory
      const filteredPosts = allPosts.filter(post => {
        const matchesQuery = !queryParam || 
          post.title.toLowerCase().includes(queryParam.toLowerCase()) || 
          post.content.toLowerCase().includes(queryParam.toLowerCase());
        const matchesType = typeFilter === 'all' || post.type === typeFilter;
        return matchesQuery && matchesType;
      });

      // Sort by date
      filteredPosts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      setPosts(filteredPosts);
    } catch (error) {
      console.error('Error searching posts:', error);
      // Fallback to demo posts if fetch fails
      setPosts(DEMO_POSTS.filter(post => !queryParam || post.title.toLowerCase().includes(queryParam.toLowerCase())));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ q: searchTerm, type: typeFilter });
  };

  const setType = (type: string) => {
    setSearchParams({ q: searchTerm, type });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-stone-900 mb-4 font-sans tracking-tight">Explore BlogHub</h1>
        <p className="text-stone-500">Find stories, insights, and expertise from our community.</p>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-lg mb-12">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search stories by title..."
              className="w-full pl-12 pr-4 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            />
          </div>
          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-4 rounded-2xl transition-all shadow-lg shadow-emerald-600/20"
          >
            Search
          </button>
        </form>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-10 w-10 text-emerald-600 animate-spin" />
        </div>
      ) : posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-3xl overflow-hidden border border-stone-200 hover:shadow-xl transition-all group flex flex-col"
            >
              <Link to={`/post/${post.id}`} className="block relative h-56 overflow-hidden">
                <img 
                  src={post.image_url || `https://picsum.photos/seed/${post.id}/800/600`} 
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-emerald-100 text-emerald-700">
                    Blog
                  </span>
                </div>
              </Link>
              <div className="p-6 flex-grow flex flex-col">
                <div className="flex items-center text-[10px] text-stone-400 mb-3 space-x-4 font-bold uppercase tracking-widest">
                  <span className="flex items-center"><Clock className="h-3 w-3 mr-1" /> {format(new Date(post.created_at), 'MMM d, yyyy')}</span>
                  <span className="flex items-center"><User className="h-3 w-3 mr-1" /> {post.author_name}</span>
                </div>
                <h3 className="text-xl font-bold text-stone-900 mb-3 line-clamp-2 group-hover:text-emerald-600 transition-colors leading-tight">
                  <Link to={`/post/${post.id}`}>{post.title}</Link>
                </h3>
                <p className="text-stone-600 text-sm line-clamp-3 mb-6 flex-grow leading-relaxed">
                  {post.content.replace(/<[^>]*>/g, '')}
                </p>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-stone-50">
                  <Link 
                    to={`/post/${post.id}`} 
                    className="text-emerald-600 font-bold text-xs flex items-center group/link uppercase tracking-widest"
                  >
                    Read More
                    <ArrowRight className="ml-1 h-3 w-3 group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                  <div className="flex items-center text-stone-400 text-xs font-bold">
                    <Heart className="h-3.5 w-3.5 mr-1 text-rose-500" />
                    {post.likes_count || 0}
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-stone-200">
          <PenTool className="h-12 w-12 text-stone-200 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-stone-900">No results found</h3>
          <p className="text-stone-500">Try adjusting your search terms.</p>
        </div>
      )}
    </div>
  );
};

export default Search;

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Save, Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc, collection, addDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

const CreatePost = () => {
  const { id } = useParams();
  const isEditing = !!id;
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<'blog'>('blog');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (isEditing) {
      fetchPost();
    }
  }, [id, user]);

  const fetchPost = async () => {
    try {
      const postRef = doc(db, 'posts', id!);
      const docSnap = await getDoc(postRef);

      if (!docSnap.exists()) {
        throw new Error('Post not found');
      }

      const data = docSnap.data();
      if (data.author_id !== user?.uid && profile?.role !== 'admin') {
        navigate('/dashboard');
        return;
      }

      setTitle(data.title);
      setContent(data.content);
      setType(data.type);
      setImageUrl(data.image_url || '');
    } catch (err: any) {
      setError(err.message || 'Failed to fetch post');
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const now = new Date().toISOString();
    const postData = {
      title,
      content,
      type,
      image_url: imageUrl || null,
      author_id: user?.uid,
      author_name: profile?.username || 'Anonymous',
      updated_at: now,
    };

    try {
      if (isEditing) {
        const postRef = doc(db, 'posts', id!);
        await updateDoc(postRef, postData);
      } else {
        const postsRef = collection(db, 'posts');
        const newDocRef = doc(postsRef); // Generate ID first
        await setDoc(newDocRef, { 
          ...postData, 
          id: newDocRef.id,
          created_at: now 
        });
      }

      navigate('/dashboard');
    } catch (err: any) {
      console.error('Save error:', err);
      setError(err.message || 'Failed to save post');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center text-stone-500 hover:text-emerald-600 mb-8 transition-colors font-medium"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </button>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl border border-stone-200 shadow-xl overflow-hidden"
      >
        <div className="p-8 md:p-10 border-b border-stone-100 bg-stone-50/50">
          <h1 className="text-3xl font-bold text-stone-900 font-sans tracking-tight">
            {isEditing ? 'Edit Your Story' : 'Create New Story'}
          </h1>
          <p className="text-stone-500 mt-2">Share your thoughts with the BlogHub community.</p>
        </div>

        {error && (
          <div className="m-8 p-4 bg-red-50 text-red-600 rounded-xl flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2">Story Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  placeholder="e.g. The Future of Web Development"
                />
              </div>

              <div className="hidden">
                <label className="block text-sm font-bold text-stone-700 mb-2">Post Type</label>
                <input type="hidden" value="blog" />
              </div>

              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2">Cover Image URL (Optional)</label>
                <div className="relative">
                  <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>
                <p className="text-[10px] text-stone-400 mt-2">Use a high-quality image URL for better visibility.</p>
              </div>
            </div>

            <div className="flex flex-col">
              <label className="block text-sm font-bold text-stone-700 mb-2">Content</label>
              <textarea
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="flex-grow w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all min-h-[300px] resize-none"
                placeholder="Write your thoughts here..."
              ></textarea>
            </div>
          </div>

          <div className="pt-6 border-t border-stone-100 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-10 py-4 rounded-xl transition-all flex items-center shadow-lg shadow-emerald-600/20 disabled:opacity-70"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Save className="h-5 w-5 mr-2" />}
              {isEditing ? 'Update Story' : 'Publish to BlogHub'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CreatePost;

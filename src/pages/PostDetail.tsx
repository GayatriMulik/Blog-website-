import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { User, Clock, ArrowLeft, MessageSquare, Send, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Post, Comment } from '../types';
import { format } from 'date-fns';
import { DEMO_POSTS } from '../lib/demoData';

const PostDetail = () => {
  const { id } = useParams();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPostAndComments();
  }, [id]);

  const fetchPostAndComments = async () => {
    try {
      // Check if it's a demo post first
      const demoPost = DEMO_POSTS.find(p => p.id === id);
      if (demoPost) {
        setPost(demoPost);
        setComments([]); // Demo posts have no comments for now
        setLoading(false);
        return;
      }

      // Fetch post from Supabase
      const { data: postData, error: postError } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .single();

      if (postError) throw postError;
      setPost(postData);

      // Fetch comments
      const { data: commentData, error: commentError } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', id)
        .order('created_at', { ascending: true });

      if (commentError) throw commentError;
      setComments(commentData || []);
    } catch (error) {
      console.error('Error fetching post details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert([
          {
            post_id: id,
            author_id: user.id,
            author_name: profile?.username || 'Anonymous',
            content: newComment,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;
      setComments([...comments, data]);
      setNewComment('');
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCommentDelete = async (commentId: string) => {
    if (!window.confirm('Delete this comment?')) return;

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
      setComments(comments.filter(c => c.id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 text-emerald-600 animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-stone-900">Post not found</h2>
        <Link to="/" className="text-emerald-600 mt-4 inline-block">Return Home</Link>
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
        Back
      </button>

      <motion.article 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl border border-stone-200 shadow-xl overflow-hidden mb-12"
      >
        {post.image_url && (
          <div className="h-[400px] w-full overflow-hidden">
            <img 
              src={post.image_url} 
              alt={post.title} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        )}
        
        <div className="p-8 md:p-12">
          <div className="flex items-center space-x-4 mb-6">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              post.type === 'blog' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
            }`}>
              {post.type}
            </span>
            <div className="flex items-center text-sm text-stone-400 space-x-4">
              <span className="flex items-center"><Clock className="h-4 w-4 mr-1" /> {format(new Date(post.created_at), 'MMMM d, yyyy')}</span>
              <span className="flex items-center"><User className="h-4 w-4 mr-1" /> {post.author_name}</span>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-stone-900 mb-8 font-sans tracking-tight leading-tight">
            {post.title}
          </h1>

          <div className="prose prose-stone max-w-none text-stone-700 leading-relaxed text-lg whitespace-pre-wrap">
            {post.content}
          </div>
        </div>
      </motion.article>

      {/* Comments Section */}
      <section className="bg-white rounded-3xl border border-stone-200 shadow-lg p-8 md:p-10">
        <h2 className="text-2xl font-bold text-stone-900 mb-8 flex items-center">
          <MessageSquare className="h-6 w-6 mr-2 text-emerald-600" />
          Comments ({comments.length})
        </h2>

        {/* New Comment Form */}
        <form onSubmit={handleCommentSubmit} className="mb-10">
          <div className="relative">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={user ? "Share your thoughts..." : "Please login to comment"}
              disabled={!user || submitting}
              className="w-full px-4 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all min-h-[120px] resize-none disabled:opacity-50"
            ></textarea>
            <button
              type="submit"
              disabled={!user || submitting || !newComment.trim()}
              className="absolute bottom-4 right-4 bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-xl transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </button>
          </div>
          {!user && (
            <p className="text-xs text-stone-400 mt-2">
              You must be <Link to="/login" className="text-emerald-600 font-bold underline">logged in</Link> to post a comment.
            </p>
          )}
        </form>

        {/* Comments List */}
        <div className="space-y-6">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.id} className="flex space-x-4 p-4 rounded-2xl hover:bg-stone-50 transition-colors group">
                <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="h-5 w-5 text-stone-400" />
                </div>
                <div className="flex-grow">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-stone-900 text-sm">{comment.author_name}</h4>
                    <span className="text-[10px] text-stone-400">{format(new Date(comment.created_at), 'MMM d, yyyy')}</span>
                  </div>
                  <p className="text-stone-600 text-sm leading-relaxed">{comment.content}</p>
                  
                  {(user?.id === comment.author_id || profile?.role === 'admin') && (
                    <button 
                      onClick={() => handleCommentDelete(comment.id)}
                      className="mt-2 text-[10px] text-red-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center"
                    >
                      <Trash2 className="h-3 w-3 mr-1" /> Delete
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10">
              <p className="text-stone-400 text-sm italic">No comments yet. Be the first to start the conversation!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default PostDetail;

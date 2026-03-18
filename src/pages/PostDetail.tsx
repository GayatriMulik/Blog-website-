import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { User, Clock, ArrowLeft, MessageSquare, Send, Trash2, Loader2, Heart, Share2 } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, getDoc, collection, query, where, orderBy, onSnapshot, addDoc, deleteDoc, setDoc, writeBatch, increment, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { Post, Comment, Like } from '../types';
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
  const [isLiked, setIsLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  useEffect(() => {
    if (!id) return;

    // Check if it's a demo post first
    const demoPost = DEMO_POSTS.find(p => p.id === id);
    if (demoPost) {
      setPost(demoPost);
      setComments([]);
      setLoading(false);
      return;
    }

    // Fetch post from Firestore
    const postRef = doc(db, 'posts', id);
    const unsubscribePost = onSnapshot(postRef, (docSnap) => {
      if (docSnap.exists()) {
        setPost({ ...docSnap.data(), id: docSnap.id } as Post);
      } else {
        setPost(null);
      }
      setLoading(false);
    }, (error) => {
      console.error('Error fetching post:', error);
      setLoading(false);
    });

    // Fetch comments from Firestore
    const commentsRef = collection(db, 'comments');
    const q = query(commentsRef, where('post_id', '==', id), orderBy('created_at', 'asc'));
    const unsubscribeComments = onSnapshot(q, (snapshot) => {
      const commentData = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as Comment[];
      setComments(commentData);
    }, (error) => {
      console.error('Error fetching comments:', error);
    });

    // Check if user liked the post
    let unsubscribeLike = () => {};
    if (user) {
      const likeId = `${user.uid}_${id}`;
      const likeRef = doc(db, 'likes', likeId);
      unsubscribeLike = onSnapshot(likeRef, (docSnap) => {
        setIsLiked(docSnap.exists());
      });
    }

    return () => {
      unsubscribePost();
      unsubscribeComments();
      unsubscribeLike();
    };
  }, [id, user]);

  const handleLike = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!id || !post || likeLoading) return;

    setLikeLoading(true);
    const likeId = `${user.uid}_${id}`;
    const likeRef = doc(db, 'likes', likeId);
    const postRef = doc(db, 'posts', id);
    const batch = writeBatch(db);

    try {
      if (isLiked) {
        // Unlike
        batch.delete(likeRef);
        batch.update(postRef, {
          likes_count: increment(-1)
        });
      } else {
        // Like
        const likeData: Like = {
          id: likeId,
          user_id: user.uid,
          post_id: id,
          created_at: new Date().toISOString()
        };
        batch.set(likeRef, likeData);
        batch.update(postRef, {
          likes_count: increment(1)
        });
      }
      await batch.commit();
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setLikeLoading(false);
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
      const commentsRef = collection(db, 'comments');
      const newCommentRef = doc(commentsRef);
      const commentData = {
        id: newCommentRef.id,
        post_id: id,
        author_id: user.uid,
        author_name: profile?.username || 'Anonymous',
        content: newComment,
        created_at: new Date().toISOString(),
      };
      
      await setDoc(newCommentRef, commentData);
      setNewComment('');
    } catch (error: any) {
      console.error('Error submitting comment:', error);
      alert(error.message || 'Failed to submit comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCommentDelete = async (commentId: string) => {
    if (!window.confirm('Delete this comment?')) return;

    try {
      await deleteDoc(doc(db, 'comments', commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post?.title,
        text: `Check out this blog post: ${post?.title}`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-stone-500 hover:text-emerald-600 transition-colors font-medium group"
        >
          <div className="p-2 rounded-full group-hover:bg-emerald-50 mr-1 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </div>
          Back to feed
        </button>

        <div className="flex items-center space-x-2">
          <button 
            onClick={handleShare}
            className="p-2 rounded-full text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
            title="Share post"
          >
            <Share2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      <motion.article 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[2rem] border border-stone-200 shadow-2xl shadow-stone-200/50 overflow-hidden mb-12"
      >
        {post.image_url && (
          <div className="h-[450px] w-full overflow-hidden relative">
            <img 
              src={post.image_url} 
              alt={post.title} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="absolute bottom-8 left-8 right-8">
              <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-emerald-500 text-white shadow-lg shadow-emerald-500/30`}>
                {post.type}
              </span>
            </div>
          </div>
        )}
        
        <div className="p-8 md:p-16">
          <div className="flex flex-wrap items-center gap-6 mb-10 text-stone-400">
            <div className="flex items-center bg-stone-50 px-4 py-2 rounded-full border border-stone-100">
              <Clock className="h-4 w-4 mr-2 text-emerald-500" />
              <span className="text-sm font-medium">{format(new Date(post.created_at), 'MMMM d, yyyy')}</span>
            </div>
            <div className="flex items-center bg-stone-50 px-4 py-2 rounded-full border border-stone-100">
              <User className="h-4 w-4 mr-2 text-emerald-500" />
              <span className="text-sm font-medium">{post.author_name}</span>
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-stone-900 mb-10 font-sans tracking-tight leading-[1.1]">
            {post.title}
          </h1>

          <div className="prose prose-stone prose-lg max-w-none text-stone-700 leading-relaxed whitespace-pre-wrap mb-16">
            {post.content}
          </div>

          {/* Interaction Bar */}
          <div className="flex items-center justify-between py-8 border-t border-stone-100">
            <div className="flex items-center space-x-6">
              <button 
                onClick={handleLike}
                disabled={likeLoading}
                className={`flex items-center space-x-2 px-6 py-3 rounded-2xl transition-all font-bold ${
                  isLiked 
                    ? 'bg-rose-50 text-rose-600 shadow-inner' 
                    : 'bg-stone-50 text-stone-500 hover:bg-stone-100'
                }`}
              >
                <Heart className={`h-6 w-6 transition-transform ${isLiked ? 'fill-current scale-110' : 'group-hover:scale-110'}`} />
                <span>{post.likes_count || 0}</span>
              </button>

              <div className="flex items-center space-x-2 text-stone-400 px-6 py-3">
                <MessageSquare className="h-6 w-6" />
                <span className="font-bold">{comments.length}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.article>

      {/* Comments Section */}
      <section className="bg-white rounded-[2rem] border border-stone-200 shadow-xl shadow-stone-200/30 p-8 md:p-12">
        <h2 className="text-3xl font-black text-stone-900 mb-10 flex items-center tracking-tight">
          Discussion
          <span className="ml-4 px-3 py-1 bg-stone-100 text-stone-500 rounded-xl text-sm font-bold">
            {comments.length}
          </span>
        </h2>

        {/* New Comment Form */}
        <form onSubmit={handleCommentSubmit} className="mb-12">
          <div className="relative group">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={user ? "What are your thoughts on this?" : "Sign in to join the conversation"}
              disabled={!user || submitting}
              className="w-full px-6 py-6 bg-stone-50 border-2 border-stone-100 rounded-3xl focus:border-emerald-500 focus:bg-white outline-none transition-all min-h-[150px] resize-none disabled:opacity-50 text-stone-800 placeholder:text-stone-400"
            ></textarea>
            <button
              type="submit"
              disabled={!user || submitting || !newComment.trim()}
              className="absolute bottom-6 right-6 bg-stone-900 hover:bg-emerald-600 text-white px-6 py-3 rounded-2xl transition-all shadow-xl disabled:opacity-50 flex items-center font-bold"
            >
              {submitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Post Comment
                  <Send className="h-4 w-4 ml-2" />
                </>
              )}
            </button>
          </div>
          {!user && (
            <div className="mt-4 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-center text-amber-800 text-sm font-medium">
              <User className="h-4 w-4 mr-2" />
              You need to <Link to="/login" className="text-emerald-700 font-bold underline mx-1">sign in</Link> to post a comment.
            </div>
          )}
        </form>

        {/* Comments List */}
        <div className="space-y-8">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <motion.div 
                layout
                key={comment.id} 
                className="flex space-x-5 p-6 rounded-[1.5rem] bg-stone-50/50 border border-transparent hover:border-stone-200 hover:bg-white transition-all group"
              >
                <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm">
                  <User className="h-6 w-6 text-emerald-600" />
                </div>
                <div className="flex-grow">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-black text-stone-900">{comment.author_name}</h4>
                    <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                      {format(new Date(comment.created_at), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <p className="text-stone-600 leading-relaxed">{comment.content}</p>
                  
                  {(user?.uid === comment.author_id || profile?.role === 'admin') && (
                    <button 
                      onClick={() => handleCommentDelete(comment.id)}
                      className="mt-4 text-xs text-rose-500 font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all flex items-center hover:bg-rose-50 px-3 py-1.5 rounded-lg"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete
                    </button>
                  )}
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-16 bg-stone-50 rounded-[2rem] border-2 border-dashed border-stone-200">
              <MessageSquare className="h-12 w-12 text-stone-200 mx-auto mb-4" />
              <p className="text-stone-400 font-bold">No comments yet. Start the discussion!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default PostDetail;

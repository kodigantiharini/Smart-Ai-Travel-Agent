import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Compass,
  Heart,
  MessageCircle,
  Share2,
  Sparkles,
  MapPin,
  Calendar,
  Send,
  Plus,
  Search,
  Filter,
  ArrowRight,
  Bookmark,
  Check,
  User as UserIcon,
  X,
  Image as ImageIcon,
  Tag,
  ThumbsUp,
} from 'lucide-react';
import { TravelStory, StoryComment } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const CommunityStoriesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [stories, setStories] = useState<TravelStory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeStoryCommentId, setActiveStoryCommentId] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [submittingComment, setSubmittingComment] = useState<boolean>(false);

  // New Story Modal
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDestination, setNewDestination] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newCategory, setNewCategory] = useState<TravelStory['category']>('nature');
  const [newContent, setNewContent] = useState('');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newTags, setNewTags] = useState('nature, photography');
  const [newDays, setNewDays] = useState(3);
  const [newBudget, setNewBudget] = useState('₹25,000');
  const [publishing, setPublishing] = useState(false);
  const [copiedStoryId, setCopiedStoryId] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'All Moments' },
    { id: 'nature', label: 'Nature & Peaks' },
    { id: 'beach', label: 'Beaches & Coast' },
    { id: 'culture', label: 'Culture & Heritage' },
    { id: 'food', label: 'Food & Dining' },
    { id: 'adventure', label: 'Adventure' },
    { id: 'budget', label: 'Solo & Budget' },
  ];

  const fetchStories = async () => {
    setLoading(true);
    try {
      const res = await api.getStories({
        category: selectedCategory,
        search: searchQuery || undefined,
      });
      if (res.data) {
        setStories(res.data);
      }
    } catch (err: any) {
      console.warn('Failed to load stories:', err?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, [selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStories();
  };

  const handleLike = async (storyId: string) => {
    const currentUserId = user?.id || 'demo-user';
    setStories((prev) =>
      prev.map((s) => {
        const id = s._id || s.id;
        if (id === storyId) {
          const isLiked = s.likes?.includes(currentUserId);
          const newLikes = isLiked
            ? (s.likes || []).filter((l) => l !== currentUserId)
            : [...(s.likes || []), currentUserId];
          return { ...s, likes: newLikes };
        }
        return s;
      })
    );

    try {
      await api.toggleLikeStory(storyId);
    } catch (err) {
      console.warn('Like toggle failed:', err);
    }
  };

  const handleCommentSubmit = async (storyId: string) => {
    const text = (commentInputs[storyId] || '').trim();
    if (!text || submittingComment) return;

    setSubmittingComment(true);
    try {
      const res = await api.addStoryComment(storyId, text);
      if (res.data) {
        setStories((prev) =>
          prev.map((s) => {
            const id = s._id || s.id;
            if (id === storyId) {
              return { ...s, comments: [...(s.comments || []), res.data] };
            }
            return s;
          })
        );
        setCommentInputs((prev) => ({ ...prev, [storyId]: '' }));
      }
    } catch (err: any) {
      console.error('Comment submission failed:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleCreateStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDestination.trim() || !newContent.trim()) {
      alert('Please fill in title, destination, and story content.');
      return;
    }

    setPublishing(true);
    try {
      const photoList = newPhotoUrl.trim()
        ? [newPhotoUrl.trim()]
        : ['https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80'];

      const tagsArray = newTags
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      const res = await api.createStory({
        title: newTitle,
        destination: newDestination,
        location: newLocation || newDestination,
        category: newCategory,
        content: newContent,
        photos: photoList,
        tags: tagsArray,
        tripPlanPreview: {
          days: Number(newDays) || 3,
          budget: newBudget || 'Flexible',
          topStops: [newDestination],
        },
      });

      setShowCreateModal(false);
      setNewTitle('');
      setNewDestination('');
      setNewLocation('');
      setNewContent('');
      setNewPhotoUrl('');
      await fetchStories();
    } catch (err: any) {
      alert(`Publishing failed: ${err.message}`);
    } finally {
      setPublishing(false);
    }
  };

  const handleShareStory = (storyId: string) => {
    const shareUrl = `${window.location.origin}/community#${storyId}`;
    navigator.clipboard?.writeText(shareUrl);
    setCopiedStoryId(storyId);
    setTimeout(() => setCopiedStoryId(null), 2500);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg shadow-blue-500/10">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-blue-100 border border-white/20">
              <Sparkles size={13} className="text-amber-300" />
              <span>MiVoyage Social Travel Community</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold tracking-tight">
              Real Traveler Stories & Travel Moments
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
              Don’t let your travel inspiration get lost in social media reels. Discover authentic peer journeys, exchange tips, like, comment, and turn any moment into a real itinerary with 1 click.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-5 py-3 rounded-2xl bg-white text-blue-600 font-extrabold text-xs sm:text-sm shadow-md hover:bg-blue-50 transition-all flex items-center justify-center gap-2 min-h-[44px]"
            >
              <Plus size={16} />
              <span>Share a Travel Moment</span>
            </button>
            <Link
              to="/planner"
              className="px-4 py-3 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/30 text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 min-h-[44px]"
            >
              <span>AI Trip Planner</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all min-h-[38px] ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72 shrink-0">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stories, destinations, tips..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 min-h-[38px]"
          />
        </form>
      </div>

      {/* Stories Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-80 rounded-3xl bg-slate-100 dark:bg-slate-800 animate-pulse border border-slate-200/60 dark:border-slate-700/60"
            />
          ))}
        </div>
      ) : stories.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800/60 rounded-3xl border border-slate-200 dark:border-slate-700/60 p-8 space-y-3">
          <Compass size={40} className="mx-auto text-blue-500 opacity-60" />
          <h3 className="font-display font-bold text-slate-800 dark:text-white text-base">No moments found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Be the first traveler to post a story in this category or search for another destination!
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700"
          >
            Share Your Story
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stories.map((story) => {
            const storyId = story._id || story.id || '';
            const currentUserId = user?.id || 'demo-user';
            const isLiked = story.likes?.includes(currentUserId);
            const likesCount = story.likes?.length || 0;
            const commentsCount = story.comments?.length || 0;
            const isCommentsOpen = activeStoryCommentId === storyId;

            return (
              <article
                key={storyId}
                id={storyId}
                className="bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-200/80 dark:border-slate-700/60 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Photo & Header */}
                  <div className="relative h-56 sm:h-64 overflow-hidden bg-slate-200 dark:bg-slate-700">
                    <img
                      src={story.photos?.[0] || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80'}
                      alt={story.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-[10px] font-extrabold text-blue-600 dark:text-blue-400 shadow-sm capitalize">
                        {story.category}
                      </span>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-white text-[10px] font-medium">
                        <MapPin size={11} className="text-red-400" />
                        <span className="truncate max-w-[140px]">{story.destination}</span>
                      </div>
                    </div>

                    {/* Bottom Author Row inside photo */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2.5">
                      <img
                        src={story.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'}
                        alt={story.authorName}
                        className="w-8 h-8 rounded-full border-2 border-white object-cover"
                      />
                      <div className="text-white drop-shadow">
                        <div className="text-xs font-bold leading-tight">{story.authorName}</div>
                        <div className="text-[10px] text-white/80">
                          {story.location || story.destination}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 sm:p-5 space-y-3">
                    <h2 className="text-base sm:text-lg font-display font-extrabold text-slate-900 dark:text-white line-clamp-2">
                      {story.title}
                    </h2>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line line-clamp-3">
                      {story.content}
                    </p>

                    {/* Trip Plan Preview Pill if available */}
                    {story.tripPlanPreview && (
                      <div className="p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 flex items-center justify-between text-xs">
                        <div className="space-y-0.5">
                          <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 tracking-wider">
                            Grounded Plan
                          </span>
                          <div className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                            {story.tripPlanPreview.days} Days • {story.tripPlanPreview.budget}
                          </div>
                        </div>
                        <button
                          onClick={() => navigate(`/planner?destination=${encodeURIComponent(story.destination)}`)}
                          className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-[11px] hover:bg-blue-700 transition-colors flex items-center gap-1 shadow-sm"
                        >
                          <Sparkles size={11} />
                          <span>Use Plan</span>
                        </button>
                      </div>
                    )}

                    {/* Tags */}
                    {story.tags && story.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {story.tags.slice(0, 4).map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/60 px-2 py-0.5 rounded-md"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Engagement Bar */}
                <div className="border-t border-slate-100 dark:border-slate-700/60 p-3 sm:p-4 bg-slate-50/60 dark:bg-slate-800/40">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {/* Like Button */}
                      <button
                        onClick={() => handleLike(storyId)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          isLiked
                            ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                            : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-rose-50 hover:text-rose-600'
                        }`}
                      >
                        <Heart size={14} className={isLiked ? 'fill-rose-500 text-rose-500' : ''} />
                        <span>{likesCount}</span>
                      </button>

                      {/* Comments Toggle Button */}
                      <button
                        onClick={() => setActiveStoryCommentId(isCommentsOpen ? null : storyId)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                      >
                        <MessageCircle size={14} />
                        <span>{commentsCount}</span>
                      </button>

                      {/* Share Button */}
                      <button
                        onClick={() => handleShareStory(storyId)}
                        className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 border border-transparent hover:border-slate-200 dark:hover:border-slate-600 transition-colors"
                        title="Copy share link"
                      >
                        {copiedStoryId === storyId ? <Check size={14} className="text-emerald-500" /> : <Share2 size={14} />}
                      </button>
                    </div>

                    <button
                      onClick={() => navigate(`/planner?destination=${encodeURIComponent(story.destination)}`)}
                      className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1"
                    >
                      <span>Explore {story.destination}</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>

                  {/* Inline Comments Drawer */}
                  {isCommentsOpen && (
                    <div className="mt-4 pt-3 border-t border-slate-200/70 dark:border-slate-700 space-y-3">
                      {story.comments && story.comments.length > 0 ? (
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                          {story.comments.map((c, cIdx) => (
                            <div key={c.id || cIdx} className="flex items-start gap-2 text-xs bg-white dark:bg-slate-700/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700">
                              <img
                                src={c.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                                alt={c.userName}
                                className="w-5 h-5 rounded-full object-cover shrink-0 mt-0.5"
                              />
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-slate-900 dark:text-white">{c.userName}</span>
                                  <span className="text-[10px] text-slate-400">{c.createdAt}</span>
                                </div>
                                <p className="text-slate-600 dark:text-slate-300 mt-0.5">{c.text}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-400 text-center py-1">No comments yet. Start the conversation!</p>
                      )}

                      {/* Comment Input Box */}
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={commentInputs[storyId] || ''}
                          onChange={(e) => setCommentInputs({ ...commentInputs, [storyId]: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleCommentSubmit(storyId);
                          }}
                          placeholder="Ask a tip or leave a friendly note..."
                          className="flex-1 px-3 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                        />
                        <button
                          onClick={() => handleCommentSubmit(storyId)}
                          disabled={submittingComment || !(commentInputs[storyId] || '').trim()}
                          className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white transition-colors"
                        >
                          <Send size={13} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Share a Travel Moment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 border border-slate-200 dark:border-slate-800 shadow-2xl my-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-display font-extrabold text-slate-900 dark:text-white">
                  Share Your Travel Moment
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Inspire fellow explorers in the MiVoyage community
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateStory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Sunrise above the clouds at Kolukkumalai"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Destination *
                  </label>
                  <input
                    type="text"
                    required
                    value={newDestination}
                    onChange={(e) => setNewDestination(e.target.value)}
                    placeholder="e.g. Munnar, Kerala"
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="nature">Nature & Peaks</option>
                    <option value="beach">Beaches & Coast</option>
                    <option value="culture">Culture & Heritage</option>
                    <option value="food">Food & Dining</option>
                    <option value="adventure">Adventure</option>
                    <option value="budget">Solo & Budget</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Photo URL
                </label>
                <input
                  type="url"
                  value={newPhotoUrl}
                  onChange={(e) => setNewPhotoUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... or paste image link"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Your Travel Story & Advice *
                </label>
                <textarea
                  required
                  rows={4}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Share authentic tips: best time of day to go, where to grab breakfast, transport advice, and hidden secrets..."
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Trip Duration
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={newDays}
                    onChange={(e) => setNewDays(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Estimated Budget
                  </label>
                  <input
                    type="text"
                    value={newBudget}
                    onChange={(e) => setNewBudget(e.target.value)}
                    placeholder="e.g. ₹20,000 for 2"
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={publishing}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20 disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Sparkles size={14} />
                  <span>{publishing ? 'Publishing...' : 'Publish Moment'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

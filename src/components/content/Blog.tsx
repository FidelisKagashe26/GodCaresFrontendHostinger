import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ThumbsUp, MessageCircle, Share2, User, Bookmark, Search, ArrowRight } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import {
  createBlogComment,
  getBlogComments,
  getBlogPost,
  getBlogPosts,
  getBlogSharePageUrl,
  toggleBlogLike,
} from '../../services/content/blogService';

interface BlogPost {
  id: number;
  shareKey?: string;
  shareUrl?: string;
  title: string;
  excerpt: string;
  author: string;
  authorImage?: string;
  date: string;
  readTime: string;
  likes: number;
  comments: number;
  liked: boolean;
  image: string;
  tags: string[];
}

interface BlogComment {
  id: number;
  authorName: string;
  content: string;
  createdAt: string;
}

interface BlogUser {
  name: string;
  email: string;
  username?: string;
}

interface BlogProps {
  user: BlogUser | null;
  onRequireLogin?: () => void;
}

const SAVED_POSTS_KEY = 'gc365_saved_blog_posts_v1';

const AuthorAvatar: React.FC<{ name: string; image?: string; className?: string; iconSize?: number }> = ({
  name,
  image,
  className = 'w-10 h-10',
  iconSize = 20,
}) => (
  <div className={`${className} shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800 flex items-center justify-center`}>
    {image ? (
      <img src={image} alt={name} className="h-full w-full object-cover" />
    ) : (
      <User size={iconSize} className="text-slate-500 dark:text-slate-300" />
    )}
  </div>
);

const getSavedPostIds = (): Set<number> => {
  try {
    const raw = localStorage.getItem(SAVED_POSTS_KEY);
    if (!raw) return new Set<number>();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set<number>();
    return new Set(
      parsed
        .map((item) => Number(item))
        .filter((item) => Number.isInteger(item) && item > 0),
    );
  } catch {
    return new Set<number>();
  }
};

const persistSavedPostIds = (ids: Set<number>) => {
  localStorage.setItem(SAVED_POSTS_KEY, JSON.stringify(Array.from(ids.values())));
};

const copyToClipboard = async (value: string): Promise<boolean> => {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    // Fallback below.
  }

  try {
    const textArea = document.createElement('textarea');
    textArea.value = value;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const copied = document.execCommand('copy');
    document.body.removeChild(textArea);
    return copied;
  } catch {
    return false;
  }
};

const normalizeUsername = (value?: string | null): string => {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const withoutAt = raw.startsWith('@') ? raw.slice(1) : raw;
  if (!withoutAt) return '';
  if (withoutAt.includes('@') && !withoutAt.includes(' ')) {
    return withoutAt.split('@')[0].trim();
  }
  return withoutAt.replace(/\s+/g, '_').trim();
};

const getAvatarInitial = (value?: string): string => {
  const first = String(value || '').trim().charAt(0).toUpperCase();
  if (!first) return 'M';
  return /[A-Z0-9]/i.test(first) ? first : 'M';
};

const normalizeReadTime = (value?: string | null): string => {
  const raw = String(value || '').trim();
  if (!raw) return 'Hakuna taarifa';

  const directMatch = raw.match(/^(\d+)\s*(?:min|mins|minute|minutes)\s*(?:read)?$/i);
  if (directMatch) {
    return `Dakika ${directMatch[1]} za kusoma`;
  }

  return raw
    .replace(/(\d+)\s*(?:min|mins|minute|minutes)\s*read/gi, 'Dakika $1 za kusoma')
    .replace(/\bread\b/gi, 'kusoma');
};

const formatCommentTimestamp = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('sw-TZ', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const Blog: React.FC<BlogProps> = ({ user, onRequireLogin }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activePost, setActivePost] = useState<number | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedQuery, setAppliedQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [detail, setDetail] = useState<string | null>(null);

  const [likeBusyByPost, setLikeBusyByPost] = useState<Record<number, boolean>>({});

  const [comments, setComments] = useState<BlogComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState('');
  const [isCommentsPanelOpen, setIsCommentsPanelOpen] = useState(false);
  const [savedPostIds, setSavedPostIds] = useState<Set<number>>(new Set<number>());
  const [actionMessage, setActionMessage] = useState('');

  const [commentText, setCommentText] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentSubmitError, setCommentSubmitError] = useState('');

  const commentsSectionRef = useRef<HTMLDivElement | null>(null);
  const commentInputRef = useRef<HTMLTextAreaElement | null>(null);
  const actionMessageTimeoutRef = useRef<number | null>(null);
  const isLoggedIn = Boolean(user);
  const displayUsername =
    normalizeUsername(user?.username) ||
    normalizeUsername(user?.name) ||
    normalizeUsername(user?.email) ||
    'mtumiaji';

  const mapPost = (post: any): BlogPost => ({
    id: post.id,
    shareKey: typeof post.share_key === 'string' ? post.share_key : '',
    shareUrl: typeof post.share_url === 'string' ? post.share_url : '',
    title: post.title,
    excerpt: post.excerpt,
    author: post.author || 'Mwandishi',
    authorImage: post.author_image || '',
    date: post.published_at ? new Date(post.published_at).toLocaleDateString('sw-TZ') : 'Hakuna taarifa',
    readTime: normalizeReadTime(post.read_time),
    likes: post.likes || 0,
    comments: post.comments || 0,
    liked: !!post.liked,
    image: post.image || '',
    tags: post.tags || [],
  });

  const updatePost = (postId: number, updater: (current: BlogPost) => BlogPost) => {
    setPosts((prev) => prev.map((item) => (item.id === postId ? updater(item) : item)));
  };

  const setPostQueryParam = (postId: number | null, replace = false) => {
    const next = new URLSearchParams(searchParams);
    if (postId) {
      const selected = posts.find((item) => item.id === postId);
      if (selected?.shareKey) {
        next.set('share', selected.shareKey);
        next.delete('post');
      } else {
        next.set('post', String(postId));
        next.delete('share');
      }
    } else {
      next.delete('post');
      next.delete('share');
    }
    setSearchParams(next, { replace });
  };

  const showActionMessage = (message: string) => {
    setActionMessage(message);
    if (actionMessageTimeoutRef.current !== null) {
      window.clearTimeout(actionMessageTimeoutRef.current);
    }
    actionMessageTimeoutRef.current = window.setTimeout(() => {
      setActionMessage('');
      actionMessageTimeoutRef.current = null;
    }, 2200);
  };

  const openPost = (postId: number, syncUrl = true) => {
    if (syncUrl) {
      setPostQueryParam(postId);
    }
    setActivePost(postId);
    setIsCommentsPanelOpen(false);
    setCommentText('');
    setCommentSubmitError('');
  };

  const closePost = (syncUrl = true) => {
    if (syncUrl) {
      setPostQueryParam(null);
    }
    setActivePost(null);
    setIsCommentsPanelOpen(false);
    setCommentText('');
    setCommentSubmitError('');
  };

  useEffect(() => {
    setSavedPostIds(getSavedPostIds());
  }, []);

  useEffect(() => () => {
    if (actionMessageTimeoutRef.current !== null) {
      window.clearTimeout(actionMessageTimeoutRef.current);
    }
  }, []);

  // Debounce typing so a search doesn't fire a request per keystroke.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setAppliedQuery(searchTerm.trim());
      setPage(1);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    let cancelled = false;

    const loadPosts = async () => {
      setLoading(true);
      setErrorMessage('');
      try {
        const data = await getBlogPosts({ page, query: appliedQuery });
        if (cancelled) return;
        setPosts(data.posts.map(mapPost));
        setTotalPages(data.numPages);
        setTotalPosts(data.count);
      } catch {
        if (cancelled) return;
        setErrorMessage('Imeshindikana kupakua makala.');
        setPosts([]);
        setTotalPages(1);
        setTotalPosts(0);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadPosts();
    return () => {
      cancelled = true;
    };
  }, [page, appliedQuery]);

  useEffect(() => {
    let cancelled = false;

    const syncPostFromUrl = async () => {
      const rawShareKey = (searchParams.get('share') || '').trim().toLowerCase();
      const rawPostId = (searchParams.get('post') || '').trim();
      if (!rawShareKey && !rawPostId) {
        if (activePost !== null) {
          closePost(false);
        }
        return;
      }

      if (rawShareKey) {
        const matchedPost = posts.find((item) => (item.shareKey || '').toLowerCase() === rawShareKey);
        if (matchedPost) {
          if (activePost !== matchedPost.id) {
            openPost(matchedPost.id, false);
          }
          return;
        }

        if (posts.length > 0) {
          setErrorMessage('Makala uliyoifungua haijapatikana.');
          const next = new URLSearchParams(searchParams);
          next.delete('share');
          next.delete('post');
          setSearchParams(next, { replace: true });
        }
        return;
      }

      const postId = Number.parseInt(rawPostId, 10);
      if (!Number.isInteger(postId) || postId <= 0) {
        return;
      }

      const hasPost = posts.some((item) => item.id === postId);
      if (hasPost) {
        const matchedPost = posts.find((item) => item.id === postId);
        if (matchedPost?.shareKey) {
          const next = new URLSearchParams(searchParams);
          next.set('share', matchedPost.shareKey);
          next.delete('post');
          setSearchParams(next, { replace: true });
        }
        if (activePost !== postId) {
          openPost(postId, false);
        }
        return;
      }

      try {
        const fetchedPost = await getBlogPost(postId);
        if (cancelled) return;
        setPosts((prev) => {
          if (prev.some((item) => item.id === postId)) {
            return prev;
          }
          return [mapPost(fetchedPost), ...prev];
        });
        openPost(postId, false);
      } catch {
        if (cancelled) return;
        setErrorMessage('Makala uliyoifungua haijapatikana.');
        setPostQueryParam(null, true);
      }
    };

    void syncPostFromUrl();
    return () => {
      cancelled = true;
    };
  }, [searchParams, posts, activePost]);

  useEffect(() => {
    const loadDetail = async () => {
      if (!activePost) {
        setDetail(null);
        return;
      }

      const post = posts.find((item) => item.id === activePost);
      if (!post) return;

      try {
        const data = await getBlogPost(post.id);
        setDetail(data.content || data.excerpt || 'Hakuna taarifa.');
        updatePost(post.id, (current) => ({
          ...current,
          likes: data.likes ?? current.likes,
          comments: data.comments ?? current.comments,
          liked: !!data.liked,
        }));
      } catch {
        setDetail(post.excerpt || 'Hakuna taarifa.');
      }
    };

    loadDetail();
  }, [activePost]);

  useEffect(() => {
    const loadComments = async () => {
      if (!activePost || !isCommentsPanelOpen) {
        setComments([]);
        setCommentsError('');
        return;
      }

      setCommentsLoading(true);
      setCommentsError('');
      try {
        const data = await getBlogComments(activePost);
        setComments(
          data.map((item) => ({
            id: item.id,
            authorName: normalizeUsername(item.author_name) || 'mtumiaji',
            content: item.content,
            createdAt: item.created_at,
          })),
        );
      } catch {
        setComments([]);
        setCommentsError('Imeshindikana kupata maoni kwa sasa.');
      } finally {
        setCommentsLoading(false);
      }
    };

    loadComments();
  }, [activePost, isCommentsPanelOpen]);

  const handleLike = async (id: number) => {
    if (likeBusyByPost[id]) return;
    setLikeBusyByPost((prev) => ({ ...prev, [id]: true }));
    try {
      const payload = await toggleBlogLike(id);
      updatePost(id, (current) => ({
        ...current,
        likes: payload.likes,
        liked: payload.liked,
      }));
    } catch {
      setErrorMessage('Imeshindikana kusasisha alipenda. Jaribu tena.');
    } finally {
      setLikeBusyByPost((prev) => ({ ...prev, [id]: false }));
    }
  };

  const isPostSaved = (postId: number) => savedPostIds.has(postId);

  const toggleSavePost = (postId: number) => {
    const next = new Set(savedPostIds);
    const willSave = !next.has(postId);
    if (willSave) {
      next.add(postId);
    } else {
      next.delete(postId);
    }
    setSavedPostIds(next);
    persistSavedPostIds(next);
    showActionMessage(willSave ? 'Makala imehifadhiwa.' : 'Makala imeondolewa kwenye hifadhi.');
  };

  const handleShare = async (post: BlogPost) => {
    const url = post.shareUrl || getBlogSharePageUrl(post.shareKey, post.id);
    const payload = {
      title: post.title,
      text: post.excerpt || `Soma makala: ${post.title}`,
      url,
    };

    if (navigator.share) {
      try {
        await navigator.share(payload);
        showActionMessage('Makala imeshirikishwa.');
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }
      }
    }

    const copied = await copyToClipboard(url);
    if (copied) {
      showActionMessage('Kiungo kimenakiliwa.');
      return;
    }

    window.prompt('Nakili kiungo hiki cha kushiriki:', url);
  };

  const focusComments = () => {
    commentsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(() => {
      commentInputRef.current?.focus();
    }, 220);
  };

  const handleCommentAction = () => {
    if (!isLoggedIn) {
      showActionMessage('Ingia kwanza ili kuona na kuandika maoni.');
      onRequireLogin?.();
      return;
    }
    if (!isCommentsPanelOpen) {
      setIsCommentsPanelOpen(true);
      window.setTimeout(() => {
        focusComments();
      }, 100);
      return;
    }
    focusComments();
  };

  const handleSubmitComment = async () => {
    if (!activePost || commentSubmitting) return;
    setCommentSubmitError('');
    if (!isLoggedIn) {
      showActionMessage('Ingia kwanza ili kuandika maoni.');
      onRequireLogin?.();
      return;
    }

    const content = commentText.trim();

    if (content.length < 2) {
      setCommentSubmitError('Andika maoni yenye angalau herufi 2.');
      return;
    }

    setCommentSubmitting(true);
    try {
      const created = await createBlogComment(activePost, {
        content,
      });
      setComments((prev) => [
        {
          id: created.id,
          authorName: normalizeUsername(created.author_name) || displayUsername,
          content: created.content,
          createdAt: created.created_at,
        },
        ...prev,
      ]);
      updatePost(activePost, (current) => ({
        ...current,
        comments: current.comments + 1,
      }));
      setCommentText('');
    } catch (error) {
      setCommentSubmitError(error instanceof Error ? error.message : 'Imeshindikana kutuma maoni.');
    } finally {
      setCommentSubmitting(false);
    }
  };

  const trendingTags = useMemo(
    () => Array.from(new Set(posts.flatMap((post) => post.tags))).slice(0, 8),
    [posts],
  );

  const editors = useMemo(() => {
    const uniqueEditors = new Map<string, { name: string; image: string }>();

    posts.forEach((post) => {
      const name = (post.author || '').trim();
      if (!name) return;
      const existing = uniqueEditors.get(name);
      if (!existing || (!existing.image && post.authorImage)) {
        uniqueEditors.set(name, { name, image: post.authorImage || existing?.image || '' });
      }
    });

    return Array.from(uniqueEditors.values()).slice(0, 6);
  }, [posts]);

  if (activePost) {
    const post = posts.find((item) => item.id === activePost);
    if (!post) {
      return (
        <div className="max-w-3xl mx-auto bg-white dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-100 pb-20 animate-fade-in">
          <div className="p-8 space-y-6">
            <button onClick={() => closePost()} className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 font-bold text-sm">
              Rudi kwenye Makala
            </button>
            <div className="text-sm text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">Hakuna taarifa.</div>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-3xl mx-auto bg-white dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-100 pb-20 animate-fade-in">
        <div className="p-8">
          <button onClick={() => closePost()} className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 mb-8 font-bold text-sm">
            Rudi kwenye Makala
          </button>

          <h1 className="text-4xl md:text-5xl font-black leading-tight mb-6">{post.title}</h1>

          <div className="flex items-center justify-between mb-8 pb-8 border-b border-slate-100 dark:border-slate-800 gap-4">
            <div className="flex items-center gap-3">
              <AuthorAvatar name={post.author} image={post.authorImage} />
              <div>
                <p className="font-bold text-sm">{post.author}</p>
                <p className="text-slate-500 dark:text-slate-400 text-xs">{post.date} | {post.readTime}</p>
              </div>
            </div>
            <div className="flex gap-2 text-slate-400 dark:text-slate-500 shrink-0">
              <button
                type="button"
                onClick={() => {
                  void handleShare(post);
                }}
                className="inline-flex items-center justify-center h-9 w-9 rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-400 dark:hover:border-slate-500 transition-colors"
                aria-label="Shiriki makala"
              >
                <Share2 size={17} />
              </button>
              <button
                type="button"
                onClick={() => toggleSavePost(post.id)}
                className={`inline-flex items-center justify-center h-9 w-9 rounded-full border transition-colors ${
                  isPostSaved(post.id)
                    ? 'border-green-300 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-900/35 dark:text-green-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-400 dark:hover:border-slate-500'
                }`}
                aria-label={isPostSaved(post.id) ? 'Ondoa kwenye hifadhi' : 'Hifadhi makala'}
              >
                <Bookmark size={17} className={isPostSaved(post.id) ? 'fill-green-200' : ''} />
              </button>
            </div>
          </div>
          {actionMessage && (
            <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs font-bold text-green-700">
              {actionMessage}
            </div>
          )}

          {post.image ? (
            <div className="w-full rounded-xl mb-10 border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 overflow-hidden">
              <img
                src={post.image}
                className="w-full h-auto max-h-[68vh] md:max-h-[34rem] object-contain"
                alt={post.title}
              />
            </div>
          ) : (
            <div className="w-full h-64 md:h-96 rounded-xl mb-10 bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Hakuna picha
            </div>
          )}

          <div className="prose prose-lg prose-slate max-w-none">
            <div className="font-serif text-[1.05rem] md:text-xl leading-8 text-slate-700 dark:text-slate-200 whitespace-pre-wrap break-words">
              {detail || post.excerpt || 'Hakuna taarifa.'}
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 flex items-center gap-8">
            <button
              onClick={() => handleLike(post.id)}
              disabled={!!likeBusyByPost[post.id]}
              className="flex items-center gap-2 text-slate-500 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <ThumbsUp size={24} className={post.liked ? 'fill-blue-600 text-blue-600 dark:fill-blue-400 dark:text-blue-400' : ''} />
              <span>{post.likes}</span>
            </button>
            <button
              onClick={handleCommentAction}
              className="flex items-center gap-2 text-slate-500 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <MessageCircle size={24} />
              <span>{post.comments}</span>
            </button>
          </div>

          {!isCommentsPanelOpen && (
            <div className="mt-10 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/70 p-4 text-sm text-slate-700 dark:text-slate-200">
              <p className="font-semibold">
                Bonyeza kitufe cha <span className="font-black">maoni</span> kuona au kuandika maoni.
              </p>
            </div>
          )}

          {isCommentsPanelOpen && (
            <div ref={commentsSectionRef} className="mt-10 border-t border-slate-100 dark:border-slate-800 pt-8 space-y-5">
              <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">Maoni ({post.comments})</h3>

              <div className="space-y-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-900/65 p-4">
                <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-3 py-2.5">
                  <div className="h-10 w-10 shrink-0 rounded-full border border-green-300 bg-white flex items-center justify-center text-sm font-black text-green-800">
                    {getAvatarInitial(displayUsername)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-green-700">Umeingia kama</p>
                    <p className="text-sm font-black text-green-900 break-words">@{displayUsername}</p>
                  </div>
                </div>
                <textarea
                  ref={commentInputRef}
                  value={commentText}
                  onChange={(event) => setCommentText(event.target.value)}
                  placeholder="Andika maoni yako hapa..."
                  rows={4}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-[15px] leading-6 text-slate-900 dark:text-slate-100 outline-none focus:border-slate-500 dark:focus:border-slate-500 resize-y"
                />
                {commentSubmitError && (
                  <div className="text-sm font-bold text-red-600">{commentSubmitError}</div>
                )}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleSubmitComment}
                    disabled={commentSubmitting}
                    className="rounded-full bg-green-700 px-4 py-2 text-xs font-black uppercase tracking-[0.08em] text-white hover:bg-green-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {commentSubmitting ? 'Inatuma...' : 'Tuma Maoni'}
                  </button>
                </div>
              </div>

              {commentsLoading && (
                <div className="text-xs uppercase tracking-widest text-slate-400 dark:text-slate-500 font-black">Inapakia maoni...</div>
              )}
              {commentsError && (
                <div className="text-xs font-bold text-red-600">{commentsError}</div>
              )}
              {!commentsLoading && comments.length === 0 && (
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                  Bado hakuna maoni kwenye makala hii. Kuwa wa kwanza kuandika.
                </div>
              )}
              {comments.map((comment) => (
                <div key={comment.id} className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 sm:p-5">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="h-10 w-10 sm:h-11 sm:w-11 shrink-0 rounded-full border border-green-200 bg-green-100 dark:border-green-800 dark:bg-green-900/40 flex items-center justify-center text-sm font-black text-green-800 dark:text-green-200">
                      {getAvatarInitial(comment.authorName)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <p className="min-w-0 text-sm sm:text-base font-black text-slate-800 dark:text-slate-100 break-words">
                          @{comment.authorName}
                        </p>
                        <time className="shrink-0 text-right text-[11px] sm:text-xs font-semibold leading-5 text-slate-500 dark:text-slate-400">
                          {formatCommentTimestamp(comment.createdAt)}
                        </time>
                      </div>
                      <p className="mt-2 text-sm sm:text-[15px] leading-7 text-slate-700 dark:text-slate-200 whitespace-pre-wrap break-words">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen pb-20 max-w-6xl mx-auto">
      <div className="px-4 py-5 sm:px-6 md:px-10 md:py-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight shrink-0">God Cares <span className="text-gold-500">Makala</span></h1>
        <div className="relative w-full md:max-w-xl md:flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Tafuta makala..."
            aria-label="Tafuta makala"
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-transparent dark:border-slate-800 rounded-full text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-1 focus:ring-slate-300 dark:focus:ring-slate-600"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12 p-3 sm:p-4 md:p-12">
        <div className="md:col-span-2 space-y-5 md:space-y-12">
          {loading && (
            <div className="text-xs uppercase tracking-widest text-slate-400 dark:text-slate-500 font-black">Inapakia makala...</div>
          )}
          {errorMessage && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-lg">
              {errorMessage}
            </div>
          )}
          {actionMessage && (
            <div className="bg-green-500/10 border border-green-500/20 text-green-700 text-xs font-bold px-4 py-2 rounded-lg">
              {actionMessage}
            </div>
          )}
          {!loading && posts.length === 0 && (
            <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest px-4 py-3 rounded-lg">
              {appliedQuery ? `Hakuna makala yanayolingana na "${appliedQuery}".` : 'Hakuna taarifa za makala kwa sasa.'}
            </div>
          )}

          {posts.map((post) => (
            <article
              key={post.id}
              className="group cursor-pointer rounded-2xl border border-green-200/80 dark:border-slate-700 bg-white/95 dark:bg-slate-900/90 p-3.5 sm:p-4 md:p-5 shadow-[0_8px_20px_rgba(15,23,42,0.04)] dark:shadow-[0_10px_26px_rgba(2,6,23,0.38)] hover:border-gold-400/80 hover:shadow-[0_14px_28px_rgba(212,154,20,0.12)] transition-all"
              onClick={() => openPost(post.id)}
              role="button"
              tabIndex={0}
              aria-label={`Soma zaidi: ${post.title}`}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  openPost(post.id);
                }
              }}
            >
              <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-700 dark:text-slate-300">
                    <AuthorAvatar name={post.author} image={post.authorImage} className="w-8 h-8" iconSize={14} />
                    <span>{post.author}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 group-hover:text-gold-700 dark:group-hover:text-gold-300 transition-colors leading-tight">
                    {post.title}
                  </h2>
                  <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-2 leading-relaxed font-serif">
                    {post.excerpt}
                  </p>
                  <div className="pt-1 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                      <span>{post.date}</span>
                      <span>|</span>
                      <span>{post.readTime}</span>
                      {post.tags?.[0] && (
                        <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-700 dark:text-slate-200">{post.tags[0]}</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleSavePost(post.id);
                      }}
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-full border transition-colors ${
                          isPostSaved(post.id)
                          ? 'border-green-300 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-900/35 dark:text-green-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-500 hover:text-slate-800 dark:hover:text-slate-100'
                        }`}
                        aria-label={isPostSaved(post.id) ? 'Ondoa kwenye hifadhi' : 'Hifadhi makala'}
                      >
                      <Bookmark size={16} className={isPostSaved(post.id) ? 'fill-green-200' : ''} />
                    </button>
                  </div>
                </div>
                <div className="w-full md:w-48 md:h-32 min-h-[10.5rem] md:min-h-0 shrink-0 rounded-xl overflow-hidden bg-green-50 dark:bg-slate-800 border border-green-100 dark:border-slate-700 flex items-center justify-center">
                  {post.image ? (
                    <img
                      src={post.image}
                      className="block w-full h-auto md:h-full object-contain md:object-cover md:group-hover:scale-105 transition-transform duration-500"
                      alt={post.title}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                      Hakuna picha
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-green-100/90 dark:border-slate-700 flex items-center justify-between gap-3">
                <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
                  Gusa kadi kusoma
                </span>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    openPost(post.id);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-gold-300/80 bg-gold-100/70 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.08em] text-gold-800 hover:bg-gold-200/80 transition-colors"
                >
                  Zaidi
                  <ArrowRight size={13} />
                </button>
              </div>
            </article>
          ))}

          {totalPages > 1 && (
            <nav className="flex flex-wrap items-center justify-between gap-3 pt-2" aria-label="Kurasa za makala">
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Ukurasa {page} / {totalPages} &middot; Makala {totalPosts}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page <= 1 || loading}
                  className="rounded-full border border-slate-300 dark:border-slate-700 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-200 transition-colors hover:border-gold-400 hover:text-gold-600 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Iliyopita
                </button>
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                  disabled={page >= totalPages || loading}
                  className="rounded-full border border-slate-300 dark:border-slate-700 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-200 transition-colors hover:border-gold-400 hover:text-gold-600 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Inayofuata
                </button>
              </div>
            </nav>
          )}
        </div>

        <div className="space-y-8 border-l border-slate-100 dark:border-slate-800 pl-8 hidden md:block">
          <h3 className="font-black text-sm uppercase tracking-widest text-slate-900 dark:text-slate-100">Mada Zinazovuma</h3>
          <div className="flex flex-wrap gap-2">
            {trendingTags.length === 0 && (
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500">Hakuna taarifa.</span>
            )}
            {trendingTags.map((tag) => (
              <span key={tag} className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-medium text-slate-600 dark:text-slate-300 hover:border-slate-800 dark:hover:border-slate-500 cursor-pointer transition-colors">
                {tag}
              </span>
            ))}
          </div>

          <h3 className="font-black text-sm uppercase tracking-widest text-slate-900 dark:text-slate-100 pt-8">Wahariri Wetu</h3>
          <div className="space-y-4">
            {editors.length === 0 && (
              <p className="text-sm font-bold text-slate-400 dark:text-slate-500">Hakuna taarifa.</p>
            )}
            {editors.map((editor) => (
              <div key={editor.name} className="flex items-center gap-3">
                <AuthorAvatar name={editor.name} image={editor.image} className="w-10 h-10" iconSize={16} />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{editor.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

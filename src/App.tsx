import { useState, useEffect, useMemo } from 'react';
import { initialNotices } from './data';
import { Notice, Category } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Bell, Bookmark, Search, BookOpen, 
  Building, Users, AlertTriangle, Trash2, X, BookmarkCheck, CheckCircle, Info,
  Sun, Moon, Clock, Share2, Printer
} from 'lucide-react';

type ToastMessage = {
  id: string;
  message: string;
  type: 'success' | 'info';
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'Alert': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20';
    case 'Academic': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20';
    case 'Campus Life': return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20';
    case 'Clubs': return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20';
    default: return 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20';
  }
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Alert': return <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />;
    case 'Academic': return <BookOpen className="w-3.5 h-3.5 mr-1.5" />;
    case 'Campus Life': return <Users className="w-3.5 h-3.5 mr-1.5" />;
    case 'Administrative': return <Building className="w-3.5 h-3.5 mr-1.5" />;
    case 'Clubs': return <Bell className="w-3.5 h-3.5 mr-1.5" />;
    default: return <Bell className="w-3.5 h-3.5 mr-1.5" />;
  }
};

const CATEGORIES: { label: string; value: Category | 'All' | 'Pinned' }[] = [
  { label: 'All Notices', value: 'All' },
  { label: 'Pinned', value: 'Pinned' },
  { label: 'Academic', value: 'Academic' },
  { label: 'Administrative', value: 'Administrative' },
  { label: 'Campus Life', value: 'Campus Life' },
  { label: 'Clubs & Societies', value: 'Clubs' },
  { label: 'Alerts', value: 'Alert' },
];

function CountdownBadge({ date }: { date: string }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(date).getTime() - new Date().getTime();
      if (difference <= 0) {
        setIsExpired(true);
        setTimeLeft('Expired');
        return;
      }
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);

      let timeStr = '';
      if (days > 0) timeStr += `${days}d `;
      if (hours > 0) timeStr += `${hours}h `;
      timeStr += `${minutes}m`;
      
      setTimeLeft(timeStr.trim());
    };
    
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000); // update every minute
    return () => clearInterval(timer);
  }, [date]);

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${
      isExpired 
        ? 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700' 
        : 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20'
    }`}>
      <Clock className="w-3.5 h-3.5 mr-1" />
      {isExpired ? 'Deadline Passed' : `Due in: ${timeLeft}`}
    </span>
  );
}

export default function App() {
  const [notices, setNotices] = useState<Notice[]>(() => {
    const saved = localStorage.getItem('enoticeboard_data');
    return saved ? JSON.parse(saved) : initialNotices;
  });

  const [pinnedIds, setPinnedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('enoticeboard_pinned');
    return saved ? JSON.parse(saved) : [];
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('enoticeboard_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    const saved = localStorage.getItem('enoticeboard_recent_searches');
    return saved ? JSON.parse(saved) : [];
  });
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category | 'All' | 'Pinned'>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    localStorage.setItem('enoticeboard_data', JSON.stringify(notices));
  }, [notices]);

  useEffect(() => {
    localStorage.setItem('enoticeboard_pinned', JSON.stringify(pinnedIds));
  }, [pinnedIds]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('enoticeboard_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('enoticeboard_theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('enoticeboard_recent_searches', JSON.stringify(recentSearches));
  }, [recentSearches]);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      const term = searchQuery.trim();
      setRecentSearches(prev => {
        const filtered = prev.filter(s => s.toLowerCase() !== term.toLowerCase());
        return [term, ...filtered].slice(0, 5);
      });
      e.currentTarget.blur();
    }
  };

  const selectRecentSearch = (term: string) => {
    setSearchQuery(term);
    setRecentSearches(prev => {
      const filtered = prev.filter(s => s !== term);
      return [term, ...filtered].slice(0, 5);
    });
    setIsSearchFocused(false);
  };

  const removeRecentSearch = (e: React.MouseEvent, term: string) => {
    e.stopPropagation();
    setRecentSearches(prev => prev.filter(s => s !== term));
  };

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(7);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const togglePin = (id: string) => {
    setPinnedIds(prev => {
      if (prev.includes(id)) {
        showToast('Notice unpinned', 'info');
        return prev.filter(p => p !== id);
      } else {
        showToast('Notice pinned to top', 'success');
        return [...prev, id];
      }
    });
  };

  const addNotice = (notice: Omit<Notice, 'id' | 'date'>) => {
    const newNotice: Notice = {
      ...notice,
      id: Math.random().toString(36).substring(7),
      date: new Date().toISOString()
    };
    setNotices([newNotice, ...notices]);
    setIsModalOpen(false);
    showToast('Notice successfully posted');
  };

  const deleteNotice = (id: string) => {
    setNotices(notices.filter(n => n.id !== id));
    setPinnedIds(pinnedIds.filter(p => p !== id));
    showToast('Notice deleted');
  };

  const handleShare = async (notice: Notice) => {
    const text = `📢 ${notice.title}\n\n${notice.content}\n\n-- ${notice.author} (${notice.department})`;
    try {
      await navigator.clipboard.writeText(text);
      showToast('Notice copied to clipboard!', 'success');
    } catch (err) {
      showToast('Failed to copy notice', 'info');
    }
  };

  const filteredNotices = useMemo(() => {
    let result = notices;
    
    // Category Filter
    if (activeCategory === 'Pinned') {
      result = result.filter(n => pinnedIds.includes(n.id));
    } else if (activeCategory !== 'All') {
      result = result.filter(n => n.category === activeCategory);
    }

    // Search Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(n => 
        n.title.toLowerCase().includes(q) || 
        n.content.toLowerCase().includes(q) ||
        n.author.toLowerCase().includes(q)
      );
    }

    return result;
  }, [notices, activeCategory, searchQuery, pinnedIds]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-slate-900 dark:bg-slate-800 p-2 rounded-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">Student Portal</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">Official Noticeboard</p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-1 sm:max-w-xl w-full justify-end">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  placeholder="Search notices..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 bg-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 focus:border-slate-900 dark:focus:border-slate-400 text-sm transition-all"
                />

                {/* Recent Searches Dropdown */}
                <AnimatePresence>
                  {isSearchFocused && recentSearches.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden z-50"
                    >
                      <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Recent Searches</span>
                        <button 
                          onClick={() => setRecentSearches([])}
                          className="text-xs font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                        >
                          Clear
                        </button>
                      </div>
                      <ul className="max-h-64 overflow-y-auto">
                        {recentSearches.map((term, i) => (
                          <li key={i}>
                            <button
                              onClick={() => selectRecentSearch(term)}
                              className="w-full text-left px-4 py-2.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer"
                            >
                              <span className="text-sm text-slate-700 dark:text-slate-300 truncate pr-4">{term}</span>
                              <X 
                                onClick={(e) => removeRecentSearch(e, term)}
                                className="w-4 h-4 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all shrink-0 cursor-pointer" 
                              />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shrink-0"
                title="Toggle theme"
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              <button 
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center justify-center px-4 py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors text-sm font-medium cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Post Notice</span>
              </button>
            </div>
          </div>
          
          {/* Categories Nav */}
          <div className="flex overflow-x-auto pb-4 gap-2 no-scrollbar">
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === cat.value 
                    ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredNotices.length === 0 ? (
          <div className="py-20 text-center text-slate-500 dark:text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white/50 dark:bg-slate-900/50">
            <Search className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
            <p className="text-lg font-medium text-slate-600 dark:text-slate-300">No notices found</p>
            <p className="text-sm mt-1">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filteredNotices.map((notice, i) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                  key={notice.id}
                  className={`bg-white dark:bg-slate-900 border rounded-2xl p-6 shadow-sm hover:shadow-md dark:hover:shadow-slate-900/50 transition-all relative group flex flex-col h-full ${
                    notice.isUrgent ? 'border-red-200 dark:border-red-900/50 shadow-red-50 dark:shadow-none' : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {notice.isUrgent && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-red-500 rounded-t-2xl" />
                  )}
                  
                  <div className="flex items-start justify-between mb-4 gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${getCategoryColor(notice.category)}`}>
                        {getCategoryIcon(notice.category)}
                        {notice.category}
                      </span>
                      {notice.dueDate && <CountdownBadge date={notice.dueDate} />}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleShare(notice)}
                        className="p-1.5 rounded-md text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                        title="Share notice"
                      >
                        <Share2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => togglePin(notice.id)}
                        className={`p-1.5 rounded-md transition-colors ${
                          pinnedIds.includes(notice.id)
                            ? 'text-yellow-500 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-500/10'
                            : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300'
                        }`}
                        title={pinnedIds.includes(notice.id) ? "Unpin notice" : "Pin notice"}
                      >
                        {pinnedIds.includes(notice.id) ? (
                          <BookmarkCheck className="w-5 h-5 fill-current" />
                        ) : (
                          <Bookmark className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 leading-tight">
                    {notice.title}
                  </h3>
                  
                  <div className="flex-grow flex flex-col mb-4">
                    <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap text-sm leading-relaxed line-clamp-3 mb-2">
                      {notice.content}
                    </p>
                    <button 
                      onClick={() => setSelectedNotice(notice)}
                      className="text-sm font-semibold text-slate-900 dark:text-slate-300 hover:text-slate-700 dark:hover:text-slate-100 text-left w-fit cursor-pointer mt-auto transition-colors"
                    >
                      Read more &rarr;
                    </button>
                  </div>
                  
                  <div className="flex items-end justify-between mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-900 dark:text-slate-200">{notice.author}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{notice.department}</span>
                      <span className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                        {new Date(notice.date).toLocaleDateString(undefined, { 
                          month: 'long', day: 'numeric', year: 'numeric' 
                        })}
                      </span>
                    </div>
                    
                    {/* Admin delete simulation */}
                    <button
                      onClick={() => deleteNotice(notice.id)}
                      className="p-2 text-slate-300 dark:text-slate-600 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors cursor-pointer"
                      title="Delete notice (Admin only)"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Admin Posting Modal */}
      {isModalOpen && (
        <CreateNoticeModal 
          onClose={() => setIsModalOpen(false)} 
          onSubmit={addNotice} 
        />
      )}

      {/* View Notice Modal */}
      {selectedNotice && (
        <ViewNoticeModal
          notice={selectedNotice}
          onClose={() => setSelectedNotice(null)}
        />
      )}

      {/* Toast Notifications */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg pointer-events-auto border backdrop-blur-sm ${
                toast.type === 'success' 
                  ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-900 dark:text-emerald-400' 
                  : 'bg-slate-900 dark:bg-slate-800 border-slate-800 dark:border-slate-700 text-white dark:text-slate-100'
              }`}
            >
              {toast.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
              ) : (
                <Info className="w-5 h-5 text-slate-400 dark:text-slate-400" />
              )}
              <span className="text-sm font-medium">{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ViewNoticeModal({ notice, onClose }: { notice: Notice, onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm overflow-y-auto transition-colors duration-200">
      <style>
        {`
          @media print {
            body * { visibility: hidden; }
            #printable-modal, #printable-modal * { visibility: visible; }
            #printable-modal { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; box-shadow: none; border: none; }
            .print-hide { display: none !important; }
          }
        `}
      </style>
      <motion.div 
        id="printable-modal"
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden my-8 border border-slate-100 dark:border-slate-800 transition-colors duration-200"
      >
        <div className="flex items-start justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="pr-6">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${getCategoryColor(notice.category)}`}>
                {getCategoryIcon(notice.category)}
                {notice.category}
              </span>
              {notice.isUrgent && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border bg-red-100 text-red-800 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20">
                  Urgent
                </span>
              )}
              {notice.dueDate && <CountdownBadge date={notice.dueDate} />}
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">{notice.title}</h2>
          </div>
          <div className="flex items-center gap-2 shrink-0 print-hide">
            <button onClick={() => window.print()} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white rounded-full transition-colors cursor-pointer" title="Print Notice">
              <Printer className="w-5 h-5" />
            </button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white rounded-full transition-colors cursor-pointer" title="Close">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap text-base leading-relaxed">
            {notice.content}
          </p>
        </div>

        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-200">Published by {notice.author}</span>
            <span className="text-sm text-slate-500 dark:text-slate-400">{notice.department}</span>
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            {new Date(notice.date).toLocaleDateString(undefined, { 
              weekday: 'short', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function CreateNoticeModal({ onClose, onSubmit }: { onClose: () => void, onSubmit: (notice: Omit<Notice, 'id' | 'date'>) => void }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [department, setDepartment] = useState('');
  const [category, setCategory] = useState<Category>('Academic');
  const [isUrgent, setIsUrgent] = useState(false);
  const [hasDueDate, setHasDueDate] = useState(false);
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && content.trim() && author.trim()) {
      onSubmit({ 
        title, 
        content, 
        author, 
        department, 
        category, 
        isUrgent,
        ...(hasDueDate && dueDate ? { dueDate: new Date(dueDate).toISOString() } : {})
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm overflow-y-auto transition-colors duration-200">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-xl shadow-xl overflow-hidden my-8 border border-slate-100 dark:border-slate-800 transition-colors duration-200"
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Post Official Notice</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Publish a new announcement to the student portal.</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-slate-900 dark:text-slate-200 mb-1.5">Notice Title</label>
            <input 
              id="title"
              type="text" 
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-lg focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 focus:border-slate-900 dark:focus:border-slate-400 outline-none transition-all"
              placeholder="e.g., Fall Semester Registration Guide"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="category" className="block text-sm font-semibold text-slate-900 dark:text-slate-200 mb-1.5">Category</label>
              <select 
                id="category"
                value={category}
                onChange={e => setCategory(e.target.value as Category)}
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 focus:border-slate-900 dark:focus:border-slate-400 outline-none transition-all"
              >
                <option value="Academic">Academic</option>
                <option value="Administrative">Administrative</option>
                <option value="Campus Life">Campus Life</option>
                <option value="Clubs">Clubs & Societies</option>
                <option value="Alert">Alert (High Priority)</option>
              </select>
            </div>
            
            <div className="flex items-center mt-6 gap-5">
              <label className="flex items-center cursor-pointer gap-2">
                <input 
                  type="checkbox" 
                  checked={isUrgent}
                  onChange={e => setIsUrgent(e.target.checked)}
                  className="w-4 h-4 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 rounded focus:ring-slate-900 dark:focus:ring-slate-400"
                />
                <span className="text-sm font-semibold text-red-600 dark:text-red-400">Mark as Urgent</span>
              </label>

              <label className="flex items-center cursor-pointer gap-2">
                <input 
                  type="checkbox" 
                  checked={hasDueDate}
                  onChange={e => setHasDueDate(e.target.checked)}
                  className="w-4 h-4 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 rounded focus:ring-slate-900 dark:focus:ring-slate-400"
                />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Set Deadline</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="author" className="block text-sm font-semibold text-slate-900 dark:text-slate-200 mb-1.5">Publisher Name</label>
              <input 
                id="author"
                type="text" 
                value={author}
                onChange={e => setAuthor(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-lg focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 focus:border-slate-900 dark:focus:border-slate-400 outline-none transition-all"
                placeholder="e.g., Dr. Jane Smith"
                required
              />
            </div>
            <div>
              <label htmlFor="department" className="block text-sm font-semibold text-slate-900 dark:text-slate-200 mb-1.5">Department / Org</label>
              <input 
                id="department"
                type="text" 
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-lg focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 focus:border-slate-900 dark:focus:border-slate-400 outline-none transition-all"
                placeholder="e.g., Academic Affairs"
                required
              />
            </div>
          </div>

          {hasDueDate && (
            <div>
              <label htmlFor="dueDate" className="block text-sm font-semibold text-slate-900 dark:text-slate-200 mb-1.5">Due Date & Time</label>
              <input 
                id="dueDate"
                type="datetime-local" 
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 focus:border-slate-900 dark:focus:border-slate-400 outline-none transition-all [color-scheme:light] dark:[color-scheme:dark]"
                required={hasDueDate}
              />
            </div>
          )}

          <div>
            <label htmlFor="content" className="block text-sm font-semibold text-slate-900 dark:text-slate-200 mb-1.5">Notice Details</label>
            <textarea 
              id="content"
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={5}
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-lg focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 focus:border-slate-900 dark:focus:border-slate-400 outline-none transition-all resize-none"
              placeholder="Enter the full details of the notice..."
              required
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <button 
              type="button" 
              onClick={onClose}
              className="px-5 py-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-5 py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors font-medium cursor-pointer shadow-sm"
            >
              Publish Notice
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

import { useState, useEffect, useMemo } from 'react';
import { initialNotices } from './data';
import { Notice, Category } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Bell, Bookmark, Search, BookOpen, 
  Building, Users, AlertTriangle, Trash2, X, BookmarkCheck 
} from 'lucide-react';

const CATEGORIES: { label: string; value: Category | 'All' | 'Pinned' }[] = [
  { label: 'All Notices', value: 'All' },
  { label: 'Pinned', value: 'Pinned' },
  { label: 'Academic', value: 'Academic' },
  { label: 'Administrative', value: 'Administrative' },
  { label: 'Campus Life', value: 'Campus Life' },
  { label: 'Clubs & Societies', value: 'Clubs' },
  { label: 'Alerts', value: 'Alert' },
];

export default function App() {
  const [notices, setNotices] = useState<Notice[]>(() => {
    const saved = localStorage.getItem('enoticeboard_data');
    return saved ? JSON.parse(saved) : initialNotices;
  });

  const [pinnedIds, setPinnedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('enoticeboard_pinned');
    return saved ? JSON.parse(saved) : [];
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category | 'All' | 'Pinned'>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('enoticeboard_data', JSON.stringify(notices));
  }, [notices]);

  useEffect(() => {
    localStorage.setItem('enoticeboard_pinned', JSON.stringify(pinnedIds));
  }, [pinnedIds]);

  const togglePin = (id: string) => {
    setPinnedIds(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const addNotice = (notice: Omit<Notice, 'id' | 'date'>) => {
    const newNotice: Notice = {
      ...notice,
      id: Math.random().toString(36).substring(7),
      date: new Date().toISOString()
    };
    setNotices([newNotice, ...notices]);
    setIsModalOpen(false);
  };

  const deleteNotice = (id: string) => {
    setNotices(notices.filter(n => n.id !== id));
    setPinnedIds(pinnedIds.filter(p => p !== id));
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Alert': return 'bg-red-100 text-red-800 border-red-200';
      case 'Academic': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Campus Life': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Clubs': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-slate-900 p-2 rounded-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-tight">Student Portal</h1>
                <p className="text-sm text-slate-500">Official Noticeboard</p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-1 sm:max-w-md w-full">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search notices..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 text-sm transition-all"
                />
              </div>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center justify-center px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium cursor-pointer shrink-0"
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
                    ? 'bg-slate-900 text-white' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
          <div className="py-20 text-center text-slate-500 border-2 border-dashed border-slate-200 rounded-2xl bg-white/50">
            <Search className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <p className="text-lg font-medium text-slate-600">No notices found</p>
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
                  transition={{ duration: 0.2 }}
                  key={notice.id}
                  className={`bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all relative group flex flex-col h-full ${
                    notice.isUrgent ? 'border-red-200 shadow-red-50' : 'border-slate-200'
                  }`}
                >
                  {notice.isUrgent && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-red-500 rounded-t-2xl" />
                  )}
                  
                  <div className="flex items-start justify-between mb-4 gap-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${getCategoryColor(notice.category)}`}>
                      {getCategoryIcon(notice.category)}
                      {notice.category}
                    </span>
                    <button
                      onClick={() => togglePin(notice.id)}
                      className={`p-1.5 rounded-md transition-colors ${
                        pinnedIds.includes(notice.id)
                          ? 'text-yellow-500 bg-yellow-50'
                          : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
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
                  
                  <h3 className="text-lg font-bold text-slate-900 mb-2 leading-tight">
                    {notice.title}
                  </h3>
                  
                  <p className="text-slate-600 whitespace-pre-wrap flex-grow text-sm mb-6 leading-relaxed">
                    {notice.content}
                  </p>
                  
                  <div className="flex items-end justify-between mt-auto pt-4 border-t border-slate-100">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-900">{notice.author}</span>
                      <span className="text-xs text-slate-500">{notice.department}</span>
                      <span className="text-xs text-slate-400 mt-1">
                        {new Date(notice.date).toLocaleDateString(undefined, { 
                          month: 'long', day: 'numeric', year: 'numeric' 
                        })}
                      </span>
                    </div>
                    
                    {/* Admin delete simulation */}
                    <button
                      onClick={() => deleteNotice(notice.id)}
                      className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && content.trim() && author.trim()) {
      onSubmit({ title, content, author, department, category, isUrgent });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl w-full max-w-xl shadow-xl overflow-hidden my-8"
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Post Official Notice</h2>
            <p className="text-xs text-slate-500 mt-0.5">Publish a new announcement to the student portal.</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-200 rounded-full transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-slate-900 mb-1.5">Notice Title</label>
            <input 
              id="title"
              type="text" 
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all"
              placeholder="e.g., Fall Semester Registration Guide"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="category" className="block text-sm font-semibold text-slate-900 mb-1.5">Category</label>
              <select 
                id="category"
                value={category}
                onChange={e => setCategory(e.target.value as Category)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all bg-white"
              >
                <option value="Academic">Academic</option>
                <option value="Administrative">Administrative</option>
                <option value="Campus Life">Campus Life</option>
                <option value="Clubs">Clubs & Societies</option>
                <option value="Alert">Alert (High Priority)</option>
              </select>
            </div>
            
            <div className="flex items-center mt-6">
              <label className="flex items-center cursor-pointer gap-2">
                <input 
                  type="checkbox" 
                  checked={isUrgent}
                  onChange={e => setIsUrgent(e.target.checked)}
                  className="w-4 h-4 text-slate-900 border-slate-300 rounded focus:ring-slate-900"
                />
                <span className="text-sm font-semibold text-red-600">Mark as Urgent</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="author" className="block text-sm font-semibold text-slate-900 mb-1.5">Publisher Name</label>
              <input 
                id="author"
                type="text" 
                value={author}
                onChange={e => setAuthor(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all"
                placeholder="e.g., Dr. Jane Smith"
                required
              />
            </div>
            <div>
              <label htmlFor="department" className="block text-sm font-semibold text-slate-900 mb-1.5">Department / Org</label>
              <input 
                id="department"
                type="text" 
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all"
                placeholder="e.g., Academic Affairs"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-semibold text-slate-900 mb-1.5">Notice Details</label>
            <textarea 
              id="content"
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={5}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all resize-none"
              placeholder="Enter the full details of the notice..."
              required
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <button 
              type="button" 
              onClick={onClose}
              className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-5 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium cursor-pointer shadow-sm"
            >
              Publish Notice
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

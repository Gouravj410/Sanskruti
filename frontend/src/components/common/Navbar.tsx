import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Sparkles, BookOpen, Layers, Users, Info, Menu, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navSearch, setNavSearch] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (navSearch.trim()) {
      navigate(`/explore?search=${encodeURIComponent(navSearch.trim())}`);
      setNavSearch('');
    }
  };

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/85 border-b border-amber-500/20 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Platform Name */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-amber-600 via-rose-700 to-amber-900 p-0.5 shadow-cultural group-hover:scale-105 transition-all">
              <div className="w-full h-full bg-slate-950 rounded-[7px] flex items-center justify-center border border-amber-500/40">
                <span className="font-serif text-2xl font-black text-amber-400 group-hover:text-amber-300">सं</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-2xl font-bold tracking-wider text-amber-100 group-hover:text-amber-300 transition-colors">
                  SANSKRUTI
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  Archive
                </span>
              </div>
              <p className="text-[10px] text-slate-400 tracking-wider uppercase font-medium">
                Digital Cultural Art Archive
              </p>
            </div>
          </Link>

          {/* Quick Search Form */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center relative w-72">
            <Search className="w-4 h-4 text-amber-400/70 absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search motifs, art forms..."
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-900/90 text-slate-200 placeholder-slate-500 rounded-full border border-slate-700/80 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40 transition-all"
            />
          </form>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            <Link
              to="/explore"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs uppercase tracking-wider font-semibold transition-all ${
                isActive('/explore')
                  ? 'text-amber-300 bg-amber-500/10 border-b-2 border-amber-400'
                  : 'text-slate-300 hover:text-amber-200 hover:bg-slate-900/50'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Explore Archive</span>
            </Link>

            <Link
              to="/ask"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs uppercase tracking-wider font-semibold transition-all ${
                isActive('/ask')
                  ? 'text-purple-300 bg-purple-500/15 border-b-2 border-purple-400'
                  : 'text-purple-200 hover:text-purple-100 hover:bg-purple-950/40'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Ask Sanskruti</span>
              <span className="text-[9px] px-1 py-0.2 bg-purple-500/20 text-purple-300 rounded font-bold">AI</span>
            </Link>

            <Link
              to="/contribute"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs uppercase tracking-wider font-semibold transition-all ${
                isActive('/contribute')
                  ? 'text-sky-300 bg-sky-500/10 border-b-2 border-sky-400'
                  : 'text-slate-300 hover:text-sky-200 hover:bg-slate-900/50'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Community Desk</span>
            </Link>

            <Link
              to="/about"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs uppercase tracking-wider font-semibold transition-all ${
                isActive('/about')
                  ? 'text-amber-300 bg-amber-500/10 border-b-2 border-amber-400'
                  : 'text-slate-300 hover:text-amber-200 hover:bg-slate-900/50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>4-Layer Integrity</span>
            </Link>
          </nav>

          {/* Mobile Menu Toggle */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-400 hover:text-amber-300 hover:bg-slate-900 focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-950 border-b border-slate-800 px-4 pt-2 pb-6 space-y-2">
          <form onSubmit={handleSearchSubmit} className="relative w-full mb-3">
            <Search className="w-4 h-4 text-amber-400/70 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search motifs, art forms..."
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-900 text-slate-200 rounded-lg border border-slate-700 focus:outline-none focus:border-amber-500"
            />
          </form>

          <Link
            to="/explore"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-md text-sm font-medium text-slate-200 hover:bg-slate-900 hover:text-amber-300"
          >
            Explore Archive
          </Link>
          <Link
            to="/ask"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium text-purple-300 bg-purple-950/30 hover:bg-purple-900/40"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Ask Sanskruti AI
            </span>
            <span className="text-[10px] px-1.5 py-0.5 bg-purple-500/20 rounded font-bold">RAG</span>
          </Link>
          <Link
            to="/contribute"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-md text-sm font-medium text-slate-200 hover:bg-slate-900 hover:text-sky-300"
          >
            Community & Practitioner Desk
          </Link>
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-md text-sm font-medium text-slate-200 hover:bg-slate-900 hover:text-amber-300"
          >
            4-Layer Integrity & Principles
          </Link>
        </div>
      )}
    </header>
  );
};

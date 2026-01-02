
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="border-b border-zinc-800 bg-black/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-zinc-100 rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-black rotate-45"></div>
          </div>
          <h1 className="text-xl font-bold tracking-tighter">DARK<span className="text-zinc-500">TRANSFORM</span></h1>
        </div>
        <nav className="hidden md:flex gap-6 text-sm font-medium text-zinc-400">
          <a href="#" className="hover:text-white transition-colors">Conversor</a>
          <a href="#" className="hover:text-white transition-colors">Redimensionar</a>
          <a href="#" className="hover:text-white transition-colors">API</a>
        </nav>
      </div>
    </header>
  );
};

export default Header;

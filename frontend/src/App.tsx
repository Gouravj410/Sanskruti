import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { HomePage } from './pages/HomePage';
import { ExplorePage } from './pages/ExplorePage';
import { ArtFormDetailPage } from './pages/ArtFormDetailPage';
import { ArtifactDetailPage } from './pages/ArtifactDetailPage';
import { AskSanskrutiPage } from './pages/AskSanskrutiPage';
import { ContributePage } from './pages/ContributePage';
import { AboutPage } from './pages/AboutPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 bg-mandala-pattern selection:bg-amber-500/30 selection:text-amber-200">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/art-forms/:slug" element={<ArtFormDetailPage />} />
            <Route path="/artifacts/:id" element={<ArtifactDetailPage />} />
            <Route path="/ask" element={<AskSanskrutiPage />} />
            <Route path="/contribute" element={<ContributePage />} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;

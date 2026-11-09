import React, { useState } from 'react';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { CartDrawer } from './components/store/CartDrawer';
import { MobileTabBar } from './components/layout/MobileTabBar';
import { StorePage } from './pages/StorePage';
import { TradeInPage } from './pages/TradeInPage';
import { AdminDashboard } from './pages/AdminDashboard';
import type { ProductCategory } from './types/database';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'store' | 'trade-in' | 'admin'>('store');
  const [activeCategory, setActiveCategory] = useState<ProductCategory>('nuevo');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSelectCategory = (cat: ProductCategory) => {
    setActiveCategory(cat);
    setCurrentView('store');
  };

  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col bg-apple-bg text-apple-text font-sans antialiased selection:bg-apple-blue selection:text-white pb-16 lg:pb-0">
        {/* Navigation Bar Apple Style */}
        <Navbar
          currentView={currentView}
          onNavigate={(view) => setCurrentView(view as any)}
          activeCategory={activeCategory}
          onSelectCategory={handleSelectCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Dynamic Pages */}
        <main className="flex-1">
          {currentView === 'store' && (
            <StorePage
              activeCategory={activeCategory}
              onSelectCategory={setActiveCategory}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onNavigateToTradeIn={() => setCurrentView('trade-in')}
            />
          )}

          {currentView === 'trade-in' && (
            <TradeInPage onBackToStore={() => setCurrentView('store')} />
          )}

          {currentView === 'admin' && (
            <AdminDashboard onBackToStore={() => setCurrentView('store')} />
          )}
        </main>

        {/* Global Slide-over Cart */}
        <CartDrawer />

        {/* Apple Style Footer */}
        <Footer />

        {/* iOS Native Style Bottom Tab Bar on Mobile */}
        <MobileTabBar
          currentView={currentView}
          onNavigate={(view) => setCurrentView(view as any)}
          activeCategory={activeCategory}
          onSelectCategory={handleSelectCategory}
        />
      </div>
    </CartProvider>
  );
};

export default App;

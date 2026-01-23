import { Outlet } from 'react-router-dom';
import Header from '../public/Header';
import Footer from '../public/Footer';

export function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg)' }}>
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}


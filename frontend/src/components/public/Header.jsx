import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="bg-white sticky top-0 z-40" style={{ borderBottom: '1px solid var(--border)' }}>
      <div className="container mx-auto px-4" style={{ maxWidth: '1200px' }}>
        <div className="flex items-center justify-between h-14 md:h-16">
          <Link to="/" className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>
            Catálogo 3D
          </Link>
          
          <nav className="flex gap-4">
            <Link to="/catalogo" className="font-medium transition-colors" style={{ color: 'var(--text-2)' }} onMouseEnter={(e) => e.target.style.color = 'var(--primary)'} onMouseLeave={(e) => e.target.style.color = 'var(--text-2)'}>
              Catálogo
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

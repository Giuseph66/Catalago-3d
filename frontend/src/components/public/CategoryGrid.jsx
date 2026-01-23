import { Link } from 'react-router-dom';

export default function CategoryGrid({ categories }) {
  if (!categories || categories.length === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {categories.map((category) => (
        <Link
          key={category.id}
          to={`/catalogo?categoria=${category.slug}`}
          className="bg-white rounded-card shadow-card p-6 text-center transition-all hover:-translate-y-1 group"
          onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-card)'}
        >
          {category.icone && (
            <div className="text-4xl mb-2">{category.icone}</div>
          )}
          <h3 className="font-semibold transition-colors" style={{ color: 'var(--text)' }} onMouseEnter={(e) => e.target.style.color = 'var(--primary)'} onMouseLeave={(e) => e.target.style.color = 'var(--text)'}>
            {category.nome}
          </h3>
        </Link>
      ))}
    </div>
  );
}


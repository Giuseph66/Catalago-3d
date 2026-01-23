import { FaStar } from 'react-icons/fa';

export default function TestimonialCard({ testimonial }) {
  return (
    <div className="bg-white rounded-card shadow-card p-6">
      {testimonial.nota && (
        <div className="flex gap-1 mb-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <FaStar
              key={i}
              style={{ color: i < testimonial.nota ? 'var(--warning)' : '#CBD5E1' }}
              size={16}
            />
          ))}
        </div>
      )}
      <p className="mb-4 italic" style={{ color: 'var(--text-2)', maxWidth: '70ch' }}>"{testimonial.texto}"</p>
      <div className="flex items-center gap-3">
        {testimonial.fotoUrl && (
          <img
            src={testimonial.fotoUrl}
            alt={testimonial.nome}
            className="w-12 h-12 rounded-full object-cover"
          />
        )}
        <div>
          <p className="font-semibold" style={{ color: 'var(--text)' }}>{testimonial.nome}</p>
          {testimonial.cidade && (
            <p className="text-sm" style={{ color: 'var(--muted)' }}>{testimonial.cidade}</p>
          )}
        </div>
      </div>
    </div>
  );
}


import { useEffect, useRef, useState } from 'react';
import { cn } from '../../../lib/utils';

// Giro renderizado no Blender: cada frame é uma foto. O vaso tem simetria
// de 6 lobos, então os frames cobrem 60° e o loop fecha sem emenda.
const FRAMES = 16;
const DEGREES_PER_LOOP = 60;
const frameSrc = (i) => `/editorial/vaso-${String(i).padStart(2, '0')}.webp`;

export default function Turntable({ alt, className }) {
  const [frame, setFrame] = useState(0);
  const angle = useRef({ drag: 0, scroll: 0 });
  const dragging = useRef(null);

  useEffect(() => {
    let ticking = false;
    const update = () => {
      ticking = false;
      const total = angle.current.drag + angle.current.scroll;
      const step = DEGREES_PER_LOOP / FRAMES;
      setFrame(((Math.round(total / step) % FRAMES) + FRAMES) % FRAMES);
    };
    const schedule = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    const onScroll = () => {
      angle.current.scroll = window.scrollY * 0.12;
      schedule();
    };
    angle.current.schedule = schedule;
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const onPointerDown = (event) => {
    dragging.current = event.clientX;
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event) => {
    if (dragging.current === null) return;
    angle.current.drag += (event.clientX - dragging.current) * 0.35;
    dragging.current = event.clientX;
    angle.current.schedule?.();
  };
  const onPointerUp = () => {
    dragging.current = null;
  };

  return (
    <div
      className={cn('turntable relative select-none', className)}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {Array.from({ length: FRAMES }, (_, i) => (
        <img
          key={i}
          src={frameSrc(i)}
          alt={i === 0 ? alt : ''}
          aria-hidden={i !== 0}
          draggable={false}
          fetchpriority={i === 0 ? 'high' : 'low'}
          className="absolute inset-0 h-full w-full object-contain"
          style={{ visibility: i === frame ? 'visible' : 'hidden' }}
        />
      ))}
    </div>
  );
}

// Abertura de matéria: fio grosso, título condensado e texto de apoio
export default function SectionHeader({ id, title, children }) {
  return (
    <header id={id} className="grid scroll-mt-24 gap-4 border-t-[3px] border-ink pt-5 md:grid-cols-12 md:gap-8">
      <h2 className="font-display text-5xl font-extrabold leading-[0.9] text-ink md:col-span-5 md:text-7xl">
        {title}
      </h2>
      {children && (
        <div className="font-serif text-lg leading-relaxed text-ink/75 md:col-span-6 md:col-start-7 md:pt-2">
          {children}
        </div>
      )}
    </header>
  );
}

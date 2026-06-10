export function AnnouncementBar({ text }: { text?: string | null }) {
  if (!text) return null;
  return (
    <div className="bg-ink text-paper">
      <p className="mx-auto max-w-shell px-4 py-2 text-center text-2xs font-medium uppercase tracking-eyebrow sm:text-xs">
        {text}
      </p>
    </div>
  );
}

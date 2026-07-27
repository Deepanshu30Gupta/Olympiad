const SYMBOLS = ["√", "π", "/", "-", "^"];

export function MathSymbolToolbar({
  inputRef,
  onInsert,
}: {
  inputRef: React.RefObject<HTMLInputElement | null>;
  onInsert: (newValue: string) => void;
}) {
  function insertSymbol(symbol: string) {
    const el = inputRef.current;
    if (!el) return;
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    const newValue = el.value.slice(0, start) + symbol + el.value.slice(end);
    onInsert(newValue);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + symbol.length, start + symbol.length);
    });
  }

  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {SYMBOLS.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => insertSymbol(s)}
          className="rounded-lg border border-[#F0E6D6] bg-white px-3 py-1.5 font-mono text-sm text-[#2B2118] transition-colors hover:border-[#FF6B4A]/50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200"
        >
          {s}
        </button>
      ))}
    </div>
  );
}
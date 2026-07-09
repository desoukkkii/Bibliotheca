import { useState, useEffect, useRef, useCallback } from "react";

interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
  delay?: number;
}

export default function SearchBox({ value, onChange, placeholder, label, delay = 200 }: SearchBoxProps) {
  const [local, setLocal] = useState(value);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    setLocal(value);
  }, [value]);

  useEffect(() => {
    if (local === value) return;
    const id = setTimeout(() => {
      onChangeRef.current(local);
    }, delay);
    return () => clearTimeout(id);
  }, [local, value, delay]);

  const handleClear = useCallback(() => {
    setLocal("");
    onChange("");
  }, [onChange]);

  return (
    <div className="w-full flex items-center gap-2.5 bg-white border border-border rounded-lg px-3.5 py-[10px] transition-all duration-[0.22s] shadow-xs focus-within:border-p focus-within:shadow-[0_0_0_3px_rgba(79,70,229,0.1)]">
      <i aria-hidden="true" className="fa-solid fa-magnifying-glass text-t3 text-sm shrink-0" />
      <input
        type="search"
        placeholder={placeholder}
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        className="border-none outline-none bg-transparent font-sans text-sm sm:text-[0.87rem] text-text w-full placeholder:text-t4"
        aria-label={label}
      />
      {local && (
        <button
          onClick={handleClear}
          className="bg-transparent border-none text-t3 cursor-pointer hover:text-text transition-colors duration-[0.15s] p-1.5 text-sm min-touch flex items-center justify-center"
          aria-label="Clear search"
        >
          <i aria-hidden="true" className="fa-solid fa-xmark" />
        </button>
      )}
    </div>
  );
}

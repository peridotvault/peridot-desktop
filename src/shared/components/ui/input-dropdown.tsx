import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faXmark, faCheck } from '@fortawesome/free-solid-svg-icons';

type Option = {
  value: string;
  label: string;
  group?: string; // opsional: untuk header kategori (tidak mengubah perilaku)
  disabled?: boolean;
};

type InputDropdownProps = {
  id?: string;
  label?: string;
  placeholder?: string; // placeholder di input pencarian
  helperText?: string;
  error?: string;
  required?: boolean;
  showAsterisk?: boolean;
  disabled?: boolean;
  className?: string;

  options: Array<string | Option>;

  value?: string[]; // controlled
  defaultValue?: string[]; // uncontrolled
  onChange?: (next: string[]) => void;

  maxSelected?: number; // batas pilihan (opsional)
  renderChip?: (opt: Option) => React.ReactNode;
};

type Prepared = Option & { _id: string };

export const InputDropdown = React.forwardRef<HTMLDivElement, InputDropdownProps>(
  (
    {
      id,
      label,
      placeholder = 'Cari & pilih…',
      helperText,
      error,
      required,
      showAsterisk,
      disabled,
      className = '',
      options,
      value,
      defaultValue = [],
      onChange,
      maxSelected,
      renderChip,
    },
    ref,
  ) => {
    const autoId = React.useId();
    const rootId = id ?? `dd-${autoId}`;
    const helpId = `${rootId}-help`;
    const listboxId = `${rootId}-listbox`;
    const hasError = !!error;
    const isRequired = !!required || !!showAsterisk;

    // normalisasi opsi (tags & categories sama)
    const opts: Prepared[] = React.useMemo(
      () =>
        options.map((o, i) => {
          if (typeof o === 'string') {
            return { _id: `${i}-${o}`, value: o, label: o } as Prepared;
          }
          const fallbackLabel = o.label ?? String(o.value ?? i);
          const normalizedValue =
            typeof o.value === 'string' && o.value.trim().length > 0
              ? o.value
              : fallbackLabel ?? `${i}`;
          return {
            _id: `${i}-${normalizedValue}`,
            ...o,
            value: normalizedValue,
            label: fallbackLabel,
          } as Prepared;
        }),
      [options],
    );

    const isControlled = value !== undefined;
    const [inner, setInner] = React.useState<string[]>(defaultValue);
    const selected = isControlled ? (value as string[]) : inner;
    const setSelected = (next: string[]) => {
      onChange?.(next);
      if (!isControlled) setInner(next);
    };

    const containerRef = React.useRef<HTMLDivElement | null>(null);
    const inputRef = React.useRef<HTMLInputElement | null>(null);
    React.useImperativeHandle(ref, () => containerRef.current as HTMLDivElement);

    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState('');
    const [activeIdx, setActiveIdx] = React.useState(-1);

    const hasLimit = typeof maxSelected === 'number' && maxSelected > 0;
    const canAddMore = hasLimit ? selected.length < maxSelected : true;
    const isSelected = (v: string) => selected.includes(v);

    const filtered: Prepared[] = React.useMemo(() => {
      const q = query.trim().toLowerCase();
      if (!q) return opts;
      return opts.filter(
        (o) =>
          o.label.toLowerCase().includes(q) ||
          o.value.toLowerCase().includes(q) ||
          (o.group && o.group.toLowerCase().includes(q)),
      );
    }, [opts, query]);

    const groups = React.useMemo(() => {
      const m = new Map<string, Prepared[]>();
      filtered.forEach((o) => {
        const k = o.group ?? '';
        if (!m.has(k)) m.set(k, []);
        m.get(k)!.push(o);
      });
      return Array.from(m.entries()); // [ [groupName, list] ]
    }, [filtered]);

    const toggle = (v: string) => {
      if (disabled) return;
      if (isSelected(v)) setSelected(selected.filter((x) => x !== v));
      else if (canAddMore) setSelected([...selected, v]);
    };

    const removeOne = (v: string) => setSelected(selected.filter((x) => x !== v));

    const openDropdown = () => {
      if (disabled) return;
      setOpen(true);
      setActiveIdx(-1);
    };
    const closeDropdown = () => {
      setOpen(false);
      setActiveIdx(-1);
    };

    // klik di luar
    React.useEffect(() => {
      const onDoc = (e: MouseEvent) => {
        if (!open) return;
        const t = e.target as Node;
        if (!containerRef.current?.contains(t)) closeDropdown();
      };
      document.addEventListener('mousedown', onDoc);
      return () => document.removeEventListener('mousedown', onDoc);
    }, [open]);

    // keyboard di input
    const onInputKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
      if (disabled) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (!open) openDropdown();
        setActiveIdx((idx) => (filtered.length ? (idx + 1) % filtered.length : -1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (!open) openDropdown();
        setActiveIdx((idx) =>
          filtered.length ? (idx - 1 + filtered.length) % filtered.length : -1,
        );
      } else if (e.key === 'Enter') {
        // ENTER = pilih hasil pertama filter
        e.preventDefault();
        if (!open) openDropdown();
        const pick = filtered[0];
        if (pick) {
          toggle(pick.value);
          setQuery('');
          setActiveIdx(-1);
          requestAnimationFrame(() => inputRef.current?.focus());
        }
      } else if (e.key === 'Backspace' && query === '' && selected.length > 0) {
        e.preventDefault();
        setSelected(selected.slice(0, -1));
      } else if (e.key === 'Escape') {
        closeDropdown();
      }
    };

    // ===== Styles (padding konsisten: px-2.5 / py-2) =====
    const wrapCls = 'w-full';
    const labelCls = 'mb-2 inline-flex items-center gap-1 text-sm text-foreground/50';
    const triggerCls =
      'w-full rounded-lg border bg-background ' +
      'px-2.5 py-2 flex items-center gap-2 min-h-[2.5rem] ' + // konsisten
      (disabled ? 'opacity-60 cursor-not-allowed ' : '') +
      (hasError ? 'border-chart-5 ' : 'border-muted-foreground/60 hover:border-foreground/40 ') +
      className;

    const chipCls =
      'inline-flex items-center gap-1 rounded-full border ' +
      'px-2 py-0.5 text-sm border-muted-foreground/40 bg-background';

    const inputCls =
      'flex-1 min-w-[8ch] p-1 bg-transparent text-sm text-foreground ' +
      'focus:outline-none placeholder:text-muted-foreground';

    const listCls =
      'absolute left-0 right-0 mt-2 max-h-72 overflow-auto rounded-lg border bg-background shadow-2xl z-50 ' +
      (hasError ? 'border-chart-5 ' : 'border-muted-foreground/60 ');

    const itemBtn = (active: boolean, blocked: boolean) =>
      'w-full text-left rounded-md ' +
      'px-2.5 py-2 flex items-center justify-between ' + // konsisten
      (blocked ? 'opacity-50 cursor-not-allowed ' : 'cursor-pointer ') +
      (active ? 'bg-foreground/10 ' : 'hover:bg-foreground/5 ');

    return (
      <div
        ref={containerRef}
        className={wrapCls}
        id={rootId}
        aria-describedby={helperText || error ? helpId : undefined}
      >
        {label && (
          <label className={labelCls}>
            {label}
            {isRequired && (
              <>
                <span
                  aria-hidden="true"
                  className={hasError ? 'text-chart-5' : 'text-accent-foreground'}
                >
                  *
                </span>
                <span className="sr-only"> (required)</span>
              </>
            )}
          </label>
        )}

        {/* Trigger (search inline) */}
        <div className="relative">
          <div
            className={triggerCls}
            onClick={() => {
              if (disabled) return;
              openDropdown();
              inputRef.current?.focus();
            }}
          >
            {/* chips */}
            <div className="flex flex-wrap items-center gap-2">
              {selected.map((v) => {
                const opt = opts.find((o) => o.value === v);
                if (!opt) return null;
                return (
                  <span key={v} className={chipCls}>
                    {renderChip ? renderChip(opt) : opt.label}
                    {!disabled && (
                      <button
                        type="button"
                        className="ml-1 opacity-70 hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeOne(v);
                        }}
                        aria-label={`Remove ${opt.label}`}
                        title="Remove"
                      >
                        <FontAwesomeIcon icon={faXmark} />
                      </button>
                    )}
                  </span>
                );
              })}

              {/* inline search */}
              <input
                ref={inputRef}
                type="text"
                value={query}
                onFocus={() => !disabled && setOpen(true)}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIdx(-1);
                }}
                onKeyDown={onInputKeyDown}
                placeholder={selected.length ? '' : placeholder}
                disabled={disabled || (hasLimit && selected.length >= (maxSelected ?? 0))}
                className={inputCls}
                aria-autocomplete="list"
                aria-expanded={open}
                aria-controls={listboxId}
                role="combobox"
              />
            </div>

            <FontAwesomeIcon
              className="ml-auto opacity-70 pointer-events-none"
              icon={faChevronDown}
            />
          </div>

          {/* Panel absolute */}
          {open && (
            <div role="listbox" id={listboxId} className={listCls}>
              <div className="p-1.5">
                {groups.map(([group, arr]) => (
                  <div key={group || 'ungrouped'}>
                    {group ? (
                      <div className="px-2.5 py-1 text-[11px] uppercase tracking-wide text-muted-foreground/80">
                        {group}
                      </div>
                    ) : null}

                    {arr.map((o) => {
                      const idxFlat = filtered.findIndex((f) => f._id === o._id);
                      const active = idxFlat === activeIdx;
                      const sel = isSelected(o.value);
                      const blocked =
                        o.disabled ||
                        ((!sel && maxSelected && selected.length >= maxSelected) as boolean);

                      return (
                        <button
                          key={o._id}
                          type="button"
                          role="option"
                          aria-selected={sel}
                          disabled={blocked}
                          className={itemBtn(active, !!blocked)}
                          onMouseEnter={() => setActiveIdx(idxFlat)}
                          onClick={() => {
                            toggle(o.value);
                            // tetap terbuka untuk multi-select; fokus ke input
                            requestAnimationFrame(() => inputRef.current?.focus());
                          }}
                        >
                          <span className={sel ? 'text-foreground' : 'text-muted-foreground'}>
                            {o.label}
                          </span>
                          {sel && <FontAwesomeIcon icon={faCheck} className="text-foreground" />}
                        </button>
                      );
                    })}
                  </div>
                ))}

                {filtered.length === 0 && (
                  <div className="px-2.5 py-4 text-center text-sm text-muted-foreground">
                    No Result
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {(helperText || error) && (
          <p
            id={helpId}
            className={'mt-2 text-sm ' + (hasError ? 'text-chart-5' : 'text-muted-foreground')}
          >
            {hasError ? error : helperText}
          </p>
        )}
      </div>
    );
  },
);
InputDropdown.displayName = 'InputDropdown';

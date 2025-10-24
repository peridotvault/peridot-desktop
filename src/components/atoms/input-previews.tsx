import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faImages,
  faGripVertical,
  faStar,
  faVideo,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';

import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PreviewItem } from '../../lib/interfaces/game.types';

type InputPreviewsProps = {
  id?: string;
  label?: string;
  required?: boolean;
  showAsterisk?: boolean;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  className?: string;

  accept?: string; // default: 'image/*,video/*'
  multiple?: boolean; // default: true
  maxFiles?: number; // default: 20
  maxSize?: number; // default: 8MB

  value?: PreviewItem[]; // controlled (opsional)
  onChange?: (items: PreviewItem[]) => void;

  requirePrimary?: boolean; // default: true (selalu ada 1 primary saat ada item)
};

const uid = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

// === Tile yang bisa diseret ===
function SortableTile({
  item,
  onRemove,
  onSetPrimary,
  disabled,
}: {
  item: PreviewItem;
  onRemove: () => void;
  onSetPrimary: () => void;
  disabled?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    boxShadow: isDragging ? '0 8px 24px rgba(0,0,0,0.25)' : undefined,
    opacity: isDragging ? 0.9 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative rounded-lg overflow-hidden border border-muted-foreground/30 bg-background"
    >
      {/* media */}
      {item.kind === 'image' ? (
        <img
          src={item.url}
          alt={item.file.name}
          className="w-full aspect-video object-cover"
          draggable={false}
        />
      ) : (
        <div className="w-full h-32 bg-black/40 flex items-center justify-center">
          <video src={item.url} className="h-full" controls draggable={false} />
          <div className="absolute top-1 left-1 text-[11px] px-1.5 py-0.5 rounded bg-background/80">
            <FontAwesomeIcon icon={faVideo} className="mr-1" />
            Video
          </div>
        </div>
      )}

      {/* drag handle (kiri-atas) */}
      <button
        type="button"
        className="absolute top-1 left-1 h-7 px-2 text-foreground flex items-center gap-1 cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
        title="Drag to reorder"
      >
        <FontAwesomeIcon icon={faGripVertical} />
      </button>

      {/* hapus (kanan-atas) */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute top-1 right-1 h-7 w-7 text-muted-foreground hover:text-chart-5 duration-300 flex items-center justify-center"
        aria-label="Remove media"
        title="Remove"
        disabled={disabled}
      >
        <FontAwesomeIcon icon={faTrash} />
      </button>

      {/* primary (kiri-bawah) */}
      <button
        type="button"
        className={
          'absolute bottom-1 left-1 h-7 px-2 rounded-full backdrop-blur text-[12px] flex items-center gap-1 duration-300 ' +
          (item.primary
            ? 'bg-accent-foreground text-background'
            : 'bg-background/85 text-foreground')
        }
        onClick={(e) => {
          e.stopPropagation();
          onSetPrimary();
        }}
        title="Set as primary cover"
        disabled={disabled}
      >
        <FontAwesomeIcon icon={faStar} />
        {item.primary ? 'Primary' : 'Set Primary'}
      </button>
    </div>
  );
}

export const InputPreviews = React.forwardRef<HTMLInputElement, InputPreviewsProps>(
  (
    {
      id,
      label = 'Previews Upload',
      required,
      showAsterisk,
      helperText,
      error,
      disabled,
      className = '',
      accept = 'image/*,video/*',
      multiple = true,
      maxFiles = 20,
      maxSize = 8 * 1024 * 1024,
      value,
      onChange,
      requirePrimary = true,
    },
    ref,
  ) => {
    const autoId = React.useId();
    const inputId = id ?? `ip-${autoId}`;
    const helpId = `${inputId}-help`;
    const zoneId = `${inputId}-dropzone`;
    const inputRef = React.useRef<HTMLInputElement | null>(null);
    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    const [dragOver, setDragOver] = React.useState(false);
    const [activeId, setActiveId] = React.useState<string | null>(null);

    const hasError = !!error;
    const isRequired = !!required || !!showAsterisk;
    const isControlled = value !== undefined;

    const [local, setLocal] = React.useState<PreviewItem[]>([]);
    const items = isControlled ? (value as PreviewItem[]) : local;

    // DnD sensors
    const sensors = useSensors(
      useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
      useSensor(KeyboardSensor),
    );

    const toPreviewItem = (file: File): PreviewItem | null => {
      const isImg = file.type.startsWith('image/');
      const isVid = file.type.startsWith('video/');
      if (!isImg && !isVid) return null;
      return {
        id: uid(),
        file,
        url: URL.createObjectURL(file),
        kind: isImg ? 'image' : 'video',
      };
    };

    const apply = (next: PreviewItem[]) => {
      // ensure primary
      let ensured = next;
      if (requirePrimary && next.length) {
        const has = next.some((x) => x.primary);
        if (!has) ensured = next.map((x, i) => ({ ...x, primary: i === 0 }));
      }
      onChange?.(ensured);
      if (!isControlled) setLocal(ensured);
    };

    const pushFiles = (files: File[]) => {
      const valid: PreviewItem[] = [];
      for (const f of files) {
        if (f.size > maxSize) continue;
        const m = toPreviewItem(f);
        if (m) valid.push(m);
      }
      if (!valid.length) return;

      const next = multiple ? [...items, ...valid] : [valid[0]];
      apply(next.slice(0, maxFiles));
    };

    const handleSelect = (fl: FileList | null) => {
      if (!fl) return;
      pushFiles(Array.from(fl));
      if (inputRef.current) inputRef.current.value = '';
    };

    const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(false);
      if (disabled) return;
      handleSelect(e.dataTransfer.files);
    };
    const onDragOver: React.DragEventHandler<HTMLDivElement> = (e) => {
      e.preventDefault();
      if (!disabled) setDragOver(true);
    };
    const onDragLeave: React.DragEventHandler<HTMLDivElement> = (e) => {
      e.preventDefault();
      setDragOver(false);
    };

    const removeAt = (idx: number) => {
      const target = items[idx];
      if (!target) return;
      URL.revokeObjectURL(target.url);
      const next = items.filter((_, i) => i !== idx);
      apply(next);
    };

    const setPrimary = (idx: number) => {
      const next = items.map((x, i) => ({ ...x, primary: i === idx }));
      apply(next);
    };

    // DnD handlers
    const handleDragStart = (e: DragStartEvent) => {
      setActiveId(String(e.active.id));
    };

    const handleDragEnd = (e: DragEndEvent) => {
      const { active, over } = e;
      setActiveId(null);
      if (!over || active.id === over.id) return;

      const oldIndex = items.findIndex((x) => x.id === active.id);
      const newIndex = items.findIndex((x) => x.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      const next = arrayMove(items, oldIndex, newIndex);
      apply(next);
    };

    const activeItem = activeId ? items.find((x) => x.id === activeId) : null;

    // styles
    const baseZone =
      'w-full rounded-xl border border-dashed ' +
      'px-4 py-6 flex flex-col items-center justify-center text-center ' +
      'transition-colors duration-200 select-none ' +
      (disabled ? 'opacity-60 cursor-not-allowed ' : 'cursor-pointer ') +
      (hasError
        ? 'border-chart-5 text-chart-5 '
        : dragOver
          ? 'border-accent-foreground text-accent-foreground bg-foreground/5 '
          : 'border-muted-foreground/60 text-muted-foreground hover:border-foreground/70 ') +
      className;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground"
          >
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

        {/* Dropzone */}
        <div
          id={zoneId}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-disabled={disabled || undefined}
          aria-describedby={helperText || error ? helpId : undefined}
          aria-label={label || 'Media uploader'}
          className={baseZone + ' bg-background'}
          onClick={() => !disabled && inputRef.current?.click()}
          onKeyDown={(e) => {
            if (disabled) return;
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
        >
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            className="hidden"
            accept={accept}
            multiple={multiple}
            disabled={disabled}
            onChange={(e) => handleSelect(e.target.files)}
          />

          <div className="flex flex-col items-center gap-2">
            <div className="rounded-full p-3 bg-foreground/10">
              <FontAwesomeIcon icon={faImages} />
            </div>
            <div className="text-sm text-foreground">
              <span className="font-medium">Klik untuk pilih</span> atau seret & lepas
            </div>
            <div className="text-xs text-muted-foreground">
              Gambar/Video • Maks {Math.round(maxSize / (1024 * 1024))}MB • {maxFiles} file
            </div>
          </div>
        </div>

        {(helperText || error) && (
          <p
            id={helpId}
            className={'mt-2 text-xs mb-6 ' + (hasError ? 'text-chart-5' : 'text-muted-foreground')}
          >
            {hasError ? error : helperText}
          </p>
        )}

        {/* Grid + DnD */}
        {items.length > 0 && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={items.map((x) => x.id)} strategy={rectSortingStrategy}>
              <div className="mt-3 grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
                {items.map((it, idx) => (
                  <SortableTile
                    key={it.id}
                    item={it}
                    onRemove={() => removeAt(idx)}
                    onSetPrimary={() => setPrimary(idx)}
                    disabled={disabled}
                  />
                ))}
              </div>
            </SortableContext>

            {/* Drag overlay (preview “ghost” saat diseret) */}
            <DragOverlay>
              {activeItem ? (
                <div className="relative rounded-lg overflow-hidden border border-muted-foreground/30 bg-background shadow-2xl">
                  {activeItem.kind === 'image' ? (
                    <img
                      src={activeItem.url}
                      alt={activeItem.file.name}
                      className="h-32 aspect-video object-cover"
                    />
                  ) : (
                    <div className="h-32 aspect-video bg-black/40 flex items-center justify-center">
                      <video src={activeItem.url} className="h-full" />
                    </div>
                  )}
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>
    );
  },
);
InputPreviews.displayName = 'InputPreviews';

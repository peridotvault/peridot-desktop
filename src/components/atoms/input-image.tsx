import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage, faXmark } from '@fortawesome/free-solid-svg-icons';

type InputImageProps = {
  id?: string;
  label?: string;
  required?: boolean;
  showAsterisk?: boolean;
  multiple?: boolean;
  accept?: string; // default: 'image/*'
  maxSize?: number; // bytes (default 5MB)
  maxFiles?: number; // default: Infinity
  helperText?: string;
  error?: string;
  disabled?: boolean;
  className?: string;

  /** dipanggil setiap file valid berubah */
  onChange?: (files: File[]) => void;
  /** mode terkendali (optional) */
  value?: File[];
  previewUrl?: string;
};

type LocalPreview = { file: File; url: string; key: string };

export const InputImage = React.forwardRef<HTMLInputElement, InputImageProps>(
  (
    {
      id,
      label = 'Upload Image',
      required,
      showAsterisk,
      multiple = true,
      accept = 'image/*',
      maxSize = 5 * 1024 * 1024, // 5MB
      maxFiles = Number.POSITIVE_INFINITY,
      helperText,
      error,
      disabled,
      className = '',
      onChange,
      value,
      previewUrl,
    },
    ref,
  ) => {
    const autoId = React.useId();
    const inputId = id ?? `ii-${autoId}`;
    const helpId = `${inputId}-help`;
    const zoneId = `${inputId}-dropzone`;
    const hasError = Boolean(error);
    const isRequired = Boolean(required || showAsterisk);

    const inputRef = React.useRef<HTMLInputElement | null>(null);
    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    const [dragOver, setDragOver] = React.useState(false);
    const [local, setLocal] = React.useState<LocalPreview[]>([]);

    // sumber kebenaran files: jika value (controlled) ada → gunakan itu, else gunakan local
    const filesToShow: LocalPreview[] = React.useMemo(() => {
      if (value) {
        return value.map((f, i) => ({
          file: f,
          url: URL.createObjectURL(f),
          key: `${f.name}-${f.size}-${f.lastModified}-${i}`,
        }));
      }
      return local;
    }, [value, local]);

    // bersihkan objectURL milik local ketika unmount / berubah
    React.useEffect(() => {
      return () => {
        if (!value) {
          local.forEach((p) => URL.revokeObjectURL(p.url));
        } else {
          filesToShow.forEach((p) => URL.revokeObjectURL(p.url));
        }
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value ? filesToShow : local]);

    const applyFiles = (next: File[]) => {
      // panggil callback user
      onChange?.(next);
      if (!value) {
        // kelola lokal preview
        const previews: LocalPreview[] = next.map((f, i) => ({
          file: f,
          url: URL.createObjectURL(f),
          key: `${f.name}-${f.size}-${f.lastModified}-${i}`,
        }));
        // revoke lama
        local.forEach((p) => URL.revokeObjectURL(p.url));
        setLocal(previews);
      }
    };

    const validateFiles = (incoming: File[]): { valid: File[]; errorMsg?: string } => {
      const imgs = incoming.filter((f) => f.type.startsWith('image/'));
      if (imgs.length !== incoming.length) {
        return { valid: [], errorMsg: 'File non-Image terdeteksi.' };
      }
      const overs = imgs.filter((f) => f.size > maxSize);
      if (overs.length) {
        const mb = (maxSize / (1024 * 1024)).toFixed(1);
        return { valid: [], errorMsg: `Ukuran melebihi ${mb}MB.` };
      }
      const currentCount = filesToShow.length;
      if (multiple && currentCount + imgs.length > maxFiles) {
        return { valid: [], errorMsg: `Maksimal ${maxFiles} file.` };
      }
      if (!multiple && imgs.length > 1) {
        return { valid: [imgs[0]], errorMsg: 'Hanya 1 file yang diperbolehkan.' };
      }
      return { valid: multiple ? imgs.slice(0, maxFiles - currentCount) : [imgs[0]] };
    };

    const handleSelect = (fileList: FileList | null) => {
      if (!fileList) return;
      const picked = Array.from(fileList);
      const { valid, errorMsg } = validateFiles(picked);
      if (errorMsg) {
        // tampilkan error via helperText kalau kamu mau; di sini kita console.warn
        console.warn(errorMsg);
      }
      const next = multiple ? [...filesToShow.map((p) => p.file), ...valid] : valid;
      applyFiles(next);
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

    const openPicker = () => {
      if (disabled) return;
      inputRef.current?.click();
    };

    const removeAt = (idx: number) => {
      const curr = filesToShow.map((p) => p.file);
      const next = curr.filter((_, i) => i !== idx);
      applyFiles(next);
    };

    // paste image support (opsional)
    React.useEffect(() => {
      const onPaste = (e: ClipboardEvent) => {
        if (disabled) return;
        if (
          !document.activeElement ||
          (document.activeElement as HTMLElement).closest(`#${zoneId}`)
        ) {
          const imgs: File[] = [];
          for (const item of e.clipboardData?.items || []) {
            if (item.type.startsWith('image/')) {
              const f = item.getAsFile();
              if (f) imgs.push(f);
            }
          }
          if (imgs.length) {
            const { valid } = validateFiles(imgs);
            const next = multiple
              ? [...filesToShow.map((p) => p.file), ...valid]
              : valid.slice(0, 1);
            applyFiles(next);
          }
        }
      };
      window.addEventListener('paste', onPaste as any);
      return () => window.removeEventListener('paste', onPaste as any);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filesToShow, multiple, disabled]);

    // styles
    const baseZone =
      'w-full rounded-xl border border-dashed ' +
      'px-4 py-6 flex flex-col items-center justify-center text-center ' +
      'transition-colors duration-200 cursor-pointer select-none ' +
      (disabled ? 'opacity-60 cursor-not-allowed ' : '') +
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
          aria-label={label || 'Image uploader'}
          className={baseZone}
          onClick={openPicker}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              openPicker();
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

          {/* Tampilkan preview berdasarkan prioritas: */}
          {/* 1. Jika ada file yang dipilih (filesToShow) → tampilkan itu */}
          {/* 2. Jika tidak, tapi ada previewUrl → tampilkan URL */}
          {/* 3. Jika tidak ada keduanya → tampilkan placeholder */}
          {filesToShow.length > 0 ? (
            <div className="relative w-full h-full">
              <img
                src={filesToShow[0].url}
                alt={filesToShow[0].file.name}
                className="w-full h-full object-cover rounded-lg"
                draggable={false}
              />
              {!disabled && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeAt(0);
                  }}
                  className="absolute top-2 right-2 h-7 w-7 rounded-full bg-background/80 backdrop-blur text-foreground hover:scale-105 shadow-flat-sm flex items-center justify-center"
                  aria-label={`Delete ${filesToShow[0].file.name}`}
                  title="Delete"
                >
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              )}
            </div>
          ) : previewUrl ? (
            // ✅ Tampilkan preview dari URL
            <div className="relative w-full h-full">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-cover rounded-lg"
                draggable={false}
              />
              {!disabled && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange?.([]);
                  }}
                  className="absolute top-2 right-2 h-7 w-7 rounded-full bg-background/80 backdrop-blur text-foreground hover:scale-105 shadow-flat-sm flex items-center justify-center"
                  aria-label="Delete Image"
                  title="Delete"
                >
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              )}
            </div>
          ) : (
            // Placeholder
            <div className="flex flex-col items-center gap-2">
              <div className="text-2xl py-3">
                <FontAwesomeIcon icon={faImage} />
              </div>
              <div className="text-sm">
                <span className="font-medium text-foreground">Click for Choose Image</span> or Drag
                and Drop
              </div>
              <div className="text-xs">
                {multiple ? 'Multi Image' : 'Single Image '} • Max size{' '}
                {Math.round(maxSize / (1024 * 1024))}MB
              </div>
            </div>
          )}
        </div>

        {/* Helper / Error */}
        {(helperText || error) && (
          <p
            id={helpId}
            className={'mt-2 text-xs ' + (hasError ? 'text-chart-5' : 'text-muted-foreground')}
          >
            {hasError ? error : helperText}
          </p>
        )}
      </div>
    );
  },
);
InputImage.displayName = 'InputImage';

// // multi upload
// const [images, setImages] = React.useState<File[]>([]);
// <InputImage
//   label="Gambar Game"
//   required
//   multiple
//   maxFiles={8}
//   maxSize={8 * 1024 * 1024}
//   helperText="PNG/JPG, maksimal 8MB per file."
//   value={images}                 // optional (controlled)
//   onChange={(fs) => setImages(fs)}
// />

// // single
// <InputImage
//   label="Cover"
//   accept="image/png,image/jpeg"
//   multiple={false}
//   helperText="Gunakan rasio 16:9."
//   onChange={(fs) => console.log(fs[0])}
// />

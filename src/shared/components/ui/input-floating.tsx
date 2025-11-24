import React from 'react';

type InputFloatingProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'placeholder' | 'id'
> & {
  id?: string;
  placeholder: string;
  error?: string;
  helperText?: string;
  showAsterisk?: boolean;
  bgColor?: string;
};

export const InputFloating = React.forwardRef<HTMLInputElement, InputFloatingProps>(
  (
    {
      id,
      placeholder,
      error,
      helperText,
      className = '',
      type = 'text',
      showAsterisk,
      bgColor = 'bg-background',
      ...rest
    },
    ref,
  ) => {
    const autoId = React.useId();
    const inputId = id ?? `if-${autoId}`;
    const helpId = `${inputId}-help`;
    const hasError = Boolean(error);
    const isRequired = Boolean(rest.required) || Boolean(showAsterisk);

    const baseInput =
      'block w-full rounded-lg bg-transparent appearance-none ' +
      'px-2.5 pb-2.5 pt-4 text-sm ' +
      'focus:outline-none focus:ring-0 peer ' +
      (hasError
        ? 'border border-chart-5 focus:border-chart-5 '
        : 'border border-muted-foreground/60 ');

    const labelCls =
      'absolute left-2 top-2 z-10 origin-[0] px-2 text-sm pointer-events-none select-none ' +
      'duration-300 transform ' +
      '-translate-y-4 scale-95 ' +
      (hasError ? 'text-chart-5 ' : 'text-foreground/50 ') +
      bgColor +
      // Saat kosong (letakkan dulu, biar bisa ditimpa oleh focus/value)
      ' peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 ' +
      // Saat sudah ada value
      'peer-[&:not(:placeholder-shown)]:top-2 ' +
      'peer-[&:not(:placeholder-shown)]:-translate-y-4 ' +
      'peer-[&:not(:placeholder-shown)]:scale-80 ' +
      // Saat fokus (taruh paling akhir)
      'peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-80';

    return (
      <div className={className}>
        {/* ⬇️ Container relatif untuk input + label SAJA */}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={type}
            className={baseInput}
            placeholder=" " // penting untuk :placeholder-shown
            aria-invalid={hasError || undefined}
            aria-describedby={helperText || error ? helpId : undefined}
            aria-required={isRequired || undefined}
            {...rest}
          />
          <label htmlFor={inputId} className={labelCls}>
            {placeholder}
            {isRequired && (
              <>
                <span
                  aria-hidden="true"
                  className={hasError ? 'text-chart-5' : 'text-accent-foreground'}
                >
                  {' '}
                  *
                </span>
                <span className="sr-only"> (required)</span>
              </>
            )}
          </label>
        </div>

        {/* ⬇️ Helper/Error DI LUAR container relatif */}
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
InputFloating.displayName = 'InputFloating';

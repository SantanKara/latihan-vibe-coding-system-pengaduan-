import { useId, useState } from 'react';

export function Spinner({ className = 'h-5 w-5' }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4Z"
      />
    </svg>
  );
}

export function Field({ label, htmlFor, error, hint, required, children }) {
  return (
    <div>
      {label && (
        <label htmlFor={htmlFor} className="label-base">
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="mt-1.5 text-sm text-red-600">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-sm text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}

export function Input({ error, className = '', ...props }) {
  return (
    <input
      {...props}
      aria-invalid={error ? 'true' : undefined}
      className={`input-base ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-500/30' : ''} ${className}`}
    />
  );
}

export function Textarea({ error, className = '', ...props }) {
  return (
    <textarea
      {...props}
      aria-invalid={error ? 'true' : undefined}
      className={`input-base min-h-[120px] resize-y ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-500/30' : ''} ${className}`}
    />
  );
}

export function Select({ error, className = '', children, ...props }) {
  return (
    <select
      {...props}
      aria-invalid={error ? 'true' : undefined}
      className={`input-base appearance-none bg-[length:1.25rem] bg-[right_0.75rem_center] bg-no-repeat pr-10 ${
        error ? 'border-red-400 focus:border-red-500 focus:ring-red-500/30' : ''
      } ${className}`}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
      }}
    >
      {children}
    </select>
  );
}

export function PasswordInput({ error, ...props }) {
  const [visible, setVisible] = useState(false);
  const id = useId();
  return (
    <div className="relative">
      <input
        {...props}
        id={props.id || id}
        type={visible ? 'text' : 'password'}
        aria-invalid={error ? 'true' : undefined}
        className={`input-base pr-12 ${
          error ? 'border-red-400 focus:border-red-500 focus:ring-red-500/30' : ''
        }`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute inset-y-0 right-0 flex min-w-[44px] items-center justify-center rounded-r-xl text-slate-500 transition hover:text-slate-700"
        aria-label={visible ? 'Sembunyikan password' : 'Tampilkan password'}
        aria-pressed={visible}
        tabIndex={0}
      >
        <span aria-hidden="true" className="text-sm font-medium">
          {visible ? 'Sembunyi' : 'Lihat'}
        </span>
      </button>
    </div>
  );
}

export function Card({ className = '', children }) {
  return <div className={`card ${className}`}>{children}</div>;
}

export function PageHeader({ title, description, action }) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ icon = '📭', title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      <span className="text-4xl" aria-hidden="true">
        {icon}
      </span>
      <h3 className="mt-3 text-base font-semibold text-slate-800">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({ icon = '⚠️', title = 'Terjadi kesalahan', description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center">
      <span className="text-3xl" aria-hidden="true">
        {icon}
      </span>
      <h3 className="mt-3 text-base font-semibold text-red-800">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-red-700">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function LoadingState({ label = 'Memuat data…' }) {
  return (
    <div className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-12 text-slate-500">
      <Spinner />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function SkeletonList({ rows = 3 }) {
  return (
    <div className="space-y-3" aria-hidden="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="card animate-pulse p-4">
          <div className="h-4 w-2/3 rounded bg-slate-200" />
          <div className="mt-3 h-3 w-full rounded bg-slate-100" />
          <div className="mt-2 h-3 w-1/2 rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

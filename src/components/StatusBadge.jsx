import { STATUS, STATUS_STYLES } from '../utils/constants';

const ICONS = {
  [STATUS.MENUNGGU]: '⏳',
  [STATUS.DIPROSES]: '🔄',
  [STATUS.SELESAI]: '✔️',
  [STATUS.DITOLAK]: '✖️',
};

export default function StatusBadge({ status, className = '' }) {
  const style = STATUS_STYLES[status] || 'bg-slate-100 text-slate-700 border-slate-200';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${style} ${className}`}
    >
      <span aria-hidden="true">{ICONS[status] || '•'}</span>
      {status || 'Tidak diketahui'}
    </span>
  );
}

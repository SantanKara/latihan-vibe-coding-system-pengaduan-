import StatusBadge from './StatusBadge';
import { KATEGORI_ICON } from '../utils/constants';
import { timeAgo, formatDateTime } from '../utils/format';

export default function ComplaintCard({ complaint, onOpen, showPelapor = false, children }) {
  const clickable = typeof onOpen === 'function';

  const content = (
    <div className="flex w-full flex-col gap-3 text-left">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-2 text-xs text-slate-500">
            <span aria-hidden="true">{KATEGORI_ICON[complaint.kategori] || '📌'}</span>
            <span className="font-medium text-slate-600">{complaint.kategori}</span>
            <span aria-hidden="true">•</span>
            <time dateTime={complaint.createdAt}>{timeAgo(complaint.createdAt)}</time>
          </div>
          <h3 className="truncate text-base font-semibold text-slate-900">{complaint.judul}</h3>
        </div>
        <StatusBadge status={complaint.status} />
      </div>

      <p className="line-clamp-2 text-sm text-slate-600">{complaint.deskripsi}</p>

      {showPelapor && (
        <p className="text-xs text-slate-500">
          Pelapor: <span className="font-medium text-slate-700">{complaint.pelaporNama}</span> (
          {complaint.pelaporEmail})
        </p>
      )}

      {complaint.tanggapan && (
        <div className="rounded-xl border border-brand-100 bg-brand-50/60 px-3.5 py-2.5">
          <p className="text-xs font-semibold text-brand-800">Tanggapan Admin</p>
          <p className="mt-0.5 line-clamp-3 text-sm text-brand-900/90">{complaint.tanggapan}</p>
        </div>
      )}

      {children}

      <p className="text-[11px] text-slate-400">
        Dibuat {formatDateTime(complaint.createdAt)}
        {complaint.updatedAt && complaint.updatedAt !== complaint.createdAt
          ? ` • Diperbarui ${formatDateTime(complaint.updatedAt)}`
          : ''}
      </p>
    </div>
  );

  if (!clickable) {
    return <div className="card p-4">{content}</div>;
  }

  return (
    <button
      type="button"
      onClick={() => onOpen(complaint)}
      className="card w-full p-4 text-left transition hover:border-brand-300 hover:shadow-md active:scale-[0.995]"
    >
      {content}
    </button>
  );
}

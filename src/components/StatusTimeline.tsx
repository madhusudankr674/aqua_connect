import { CheckCircle2, Clock } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { COMPLAINT_STATUS_ORDER, getStatusStyle } from '../services/workflow';
import type { ComplaintStatus, PublicTimelineItem } from '../types/complaint';

export function StatusTimeline({
  currentStatus,
  timeline,
}: {
  currentStatus: ComplaintStatus;
  timeline: PublicTimelineItem[];
}) {
  const { t } = useLanguage();
  const currentIdx = COMPLAINT_STATUS_ORDER.indexOf(currentStatus);

  return (
    <div className="space-y-8">
      {/* Workflow Stepper */}
      <div>
        <h4 className="font-display text-sm font-semibold text-slate-900 mb-4">
          Workflow Progress
        </h4>
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {COMPLAINT_STATUS_ORDER.map((step, idx) => {
            const isCompleted = idx <= currentIdx;
            const isCurrent = step === currentStatus;
            const style = getStatusStyle(step);

            return (
              <li
                key={step}
                className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
                  isCurrent
                    ? `${style.bgColor} ${style.borderColor} ${style.textColor} font-semibold`
                    : isCompleted
                    ? 'border-emerald-200 bg-emerald-50/50 text-slate-900'
                    : 'border-slate-200 bg-slate-50 text-slate-500'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2
                    className={`h-4 w-4 shrink-0 ${
                      isCurrent ? 'text-sky-700' : 'text-emerald-600'
                    }`}
                    aria-hidden="true"
                  />
                ) : (
                  <Clock className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                )}
                <span className="text-xs sm:text-sm leading-snug">{t.statuses[step]}</span>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Audit History Timeline */}
      <div>
        <h4 className="font-display text-sm font-semibold text-slate-900 mb-4">
          {t.track.timelineTitle}
        </h4>
        {timeline.length === 0 ? (
          <p className="text-sm text-slate-500">No history entries recorded yet.</p>
        ) : (
          <ol className="space-y-4">
            {timeline.map((entry, idx) => {
              const formattedTime = entry.timestampIso
                ? new Intl.DateTimeFormat('en-IN', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  }).format(new Date(entry.timestampIso))
                : 'Recorded';
              const style = getStatusStyle(entry.status);

              return (
                <li
                  key={`${entry.timestampIso}-${idx}`}
                  className="rounded-lg border border-slate-200 bg-white p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                    <span className={`font-semibold ${style.textColor}`}>
                      {t.statuses[entry.status]}
                    </span>
                    <span className="font-mono tabular-nums">{formattedTime}</span>
                  </div>
                  <p className="mt-1.5 text-sm text-slate-800">{entry.remarks}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Authorized by: <span className="font-medium text-slate-700">{entry.updatedBy}</span>
                  </p>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </div>
  );
}

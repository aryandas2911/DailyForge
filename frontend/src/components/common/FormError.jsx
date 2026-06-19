import React from 'react';
import { AlertCircle } from 'lucide-react';

const FormError = ({ error, message }) => {
  const displayError = error || message;
  if (!displayError) return null;

  return (
    <div 
      role="alert" 
      aria-live="assertive"
      className="flex items-center gap-2.5 p-3 rounded-xl border border-rose-200 dark:border-rose-900/30 bg-rose-50/50 dark:bg-rose-950/10 text-rose-600 dark:text-rose-400 text-xs font-bold leading-normal w-full box-border animate-in"
    >
      <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" strokeWidth={2.5} />
      <span className="break-words">{error}</span>
    </div>
  );
};

export default FormError;https://github.com/aryandas2911/DailyForge/pull/1520/conflict?name=frontend%252Fsrc%252Fpages%252FAnalytics.jsx&ancestor_oid=cf140c51dceb63b791743678214103bcf7fd8404&base_oid=2e52402859e4d98a6214fe2d60da256030deff19&head_oid=bbe40fbe775e1f9af2917def194769012822fcbb
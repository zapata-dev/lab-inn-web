import clsx from 'clsx'

function ProgressBar({ value = 0, label, showValue = true, className }) {
  const safeValue = Math.min(100, Math.max(0, Number(value) || 0))

  return (
    <div className={clsx('space-y-2', className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-lab-text">{label || 'Progreso'}</span>
          {showValue && <span className="font-semibold text-lab-muted">{safeValue}%</span>}
        </div>
      )}
      <progress
        value={safeValue}
        max="100"
        className="h-2.5 w-full overflow-hidden rounded-full [&::-moz-progress-bar]:rounded-full [&::-moz-progress-bar]:bg-lab-primary [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-bar]:bg-slate-200 [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-lab-primary"
        aria-label={label || 'Progreso'}
      />
    </div>
  )
}

export default ProgressBar

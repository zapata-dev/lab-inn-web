import clsx from 'clsx'

const statusMap = {
  green: 'bg-emerald-500',
  yellow: 'bg-amber-500',
  red: 'bg-rose-500',
  gray: 'bg-slate-400',
}

function StatusDot({ status = 'gray', className }) {
  return (
    <span
      className={clsx(
        'inline-flex size-2.5 rounded-full',
        statusMap[status] ?? statusMap.gray,
        className
      )}
      aria-hidden="true"
    />
  )
}

export default StatusDot

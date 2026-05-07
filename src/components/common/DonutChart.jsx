function DonutChart({ value = 0, size = 120, strokeWidth = 12, label = 'Cumplimiento' }) {
  const safeValue = Math.min(100, Math.max(0, Number(value) || 0))
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (safeValue / 100) * circumference

  return (
    <figure className="inline-flex flex-col items-center gap-3">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${label}: ${safeValue}%`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-200"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="origin-center -rotate-90 text-lab-primary transition-all duration-300 ease-out"
        />
        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          className="fill-lab-text text-[20px] font-semibold"
        >
          {safeValue}%
        </text>
      </svg>
      <figcaption className="text-sm font-medium text-lab-muted">{label}</figcaption>
    </figure>
  )
}

export default DonutChart

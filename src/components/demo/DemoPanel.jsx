import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { demoSteps } from '../../data/demoScript'
import { useDemo } from '../../context/DemoContext'

function DemoPanel() {
  const { demoActive, currentStep, totalSteps, step, next, prev, exit } = useDemo()
  const navigate = useNavigate()

  useEffect(() => {
    if (!demoActive) return
    const { route, tab } = demoSteps[currentStep]
    navigate(tab ? `${route}?tab=${tab}` : route)
  }, [demoActive, currentStep, navigate])

  if (!demoActive) return null

  const isFirst = currentStep === 0
  const isLast = currentStep === totalSteps - 1

  return (
    <div className="fixed bottom-16 left-1/2 z-50 w-full max-w-2xl -translate-x-1/2 px-4 lg:bottom-4">
      <div className="rounded-xl border border-lab-border bg-white shadow-2xl ring-1 ring-black/5">
        <div className="flex items-center justify-between border-b border-lab-border px-5 py-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-lab-muted">
            Paso {currentStep + 1} de {totalSteps}&nbsp;&nbsp;·&nbsp;&nbsp;{step.stepLabel}
          </span>
          <button
            type="button"
            onClick={exit}
            className="text-xs font-semibold text-lab-muted hover:text-lab-text"
          >
            ✕ Salir demo
          </button>
        </div>

        <div className="space-y-1.5 px-5 py-4">
          <p className="text-base font-bold text-lab-text">{step.headline}</p>
          <p className="text-sm text-lab-muted">{step.body}</p>
          {step.hint && (
            <p className="text-xs text-lab-primary">
              <span aria-hidden="true">💡 </span>
              {step.hint}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-lab-border px-5 py-3">
          <div className="flex gap-1.5">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <span
                key={i}
                className={`size-2 rounded-full transition-colors ${i === currentStep ? 'bg-lab-primary' : 'bg-slate-200'}`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={prev}
              disabled={isFirst}
              className="rounded-lg border border-lab-border px-3 py-1.5 text-sm font-semibold text-lab-text hover:bg-slate-50 disabled:opacity-30"
            >
              ← Anterior
            </button>
            {isLast ? (
              <button
                type="button"
                onClick={exit}
                className="rounded-lg bg-emerald-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Finalizar demo
              </button>
            ) : (
              <button
                type="button"
                onClick={next}
                className="rounded-lg bg-lab-primary px-4 py-1.5 text-sm font-semibold text-white hover:opacity-90"
              >
                Siguiente →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DemoPanel

import { useState } from 'react'
import { Card } from '../../components/common'
import { formatDate } from '../../utils/formatters'
import { getDiagnosticResults, saveDiagnosticResult } from '../../services/trainingService'

function ScoreChip({ score }) {
  const color = score >= 80 ? 'bg-emerald-100 text-emerald-700' : score >= 60 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
  return <span className={`rounded-full px-3 py-1 text-sm font-bold ${color}`}>{score}%</span>
}

function TrainingDiagnostic({ diagnostic, seedScore }) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState(null)

  const questions = diagnostic.questions
  const currentQ = questions[step]
  const isLast = step === questions.length - 1
  const canProceed = !!answers[currentQ?.id]

  const lastSaved = getDiagnosticResults(diagnostic.id).at(-1) ?? null

  const handleSelect = (optionId) => {
    setAnswers((prev) => ({ ...prev, [currentQ.id]: optionId }))
  }

  const handleNext = () => {
    if (isLast) {
      const correct = questions.filter((q) => answers[q.id] === q.correctOptionId).length
      const score = Math.round((correct / questions.length) * 100)
      const saved = saveDiagnosticResult({ diagnosticId: diagnostic.id, score, totalQuestions: questions.length })
      setResult({ score, correct, total: questions.length, savedAt: saved.answeredAt })
      setSubmitted(true)
    } else {
      setStep((s) => s + 1)
    }
  }

  const handleReset = () => {
    setStep(0)
    setAnswers({})
    setSubmitted(false)
    setResult(null)
  }

  if (submitted && result) {
    return (
      <div className="space-y-4">
        <Card className="space-y-4">
          <div className="space-y-1">
            <h3 className="font-bold text-lab-text">{diagnostic.title}</h3>
            <p className="text-sm text-lab-muted">Resultado obtenido</p>
          </div>
          <div className="flex items-center gap-4">
            <ScoreChip score={result.score} />
            <p className="text-sm text-lab-text">
              {result.correct} de {result.total} respuestas correctas
            </p>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="rounded-lab border border-lab-border px-4 py-2 text-sm font-semibold text-lab-text hover:bg-slate-50"
          >
            Responder nuevamente
          </button>
        </Card>

        <Card className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-lab-muted">Revision de respuestas</h4>
          {questions.map((q, idx) => {
            const selected = answers[q.id]
            const isCorrect = selected === q.correctOptionId
            return (
              <div key={q.id} className="space-y-1.5">
                <p className="text-sm font-medium text-lab-text">
                  {idx + 1}. {q.question}
                </p>
                {q.options.map((opt) => {
                  const isSelected = opt.id === selected
                  const isCorrectOpt = opt.id === q.correctOptionId
                  let cls = 'border-lab-border text-lab-muted'
                  if (isCorrectOpt) cls = 'border-emerald-400 bg-emerald-50 text-emerald-700'
                  else if (isSelected && !isCorrect) cls = 'border-rose-400 bg-rose-50 text-rose-700'
                  return (
                    <div key={opt.id} className={`rounded-lab border px-3 py-1.5 text-sm ${cls}`}>
                      {opt.label}
                    </div>
                  )
                })}
                <p className={`text-xs font-semibold ${isCorrect ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {isCorrect ? 'Correcta' : 'Incorrecta'}
                </p>
              </div>
            )
          })}
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {lastSaved && !submitted && (
        <Card className="flex items-center justify-between gap-3 py-3">
          <p className="text-sm text-lab-muted">
            Ultimo resultado: <span className="font-semibold text-lab-text">{lastSaved.score}%</span>
            {' · '}{formatDate(lastSaved.answeredAt)}
          </p>
          <ScoreChip score={lastSaved.score} />
        </Card>
      )}
      {!lastSaved && seedScore !== null && (
        <Card className="flex items-center justify-between gap-3 py-3">
          <p className="text-sm text-lab-muted">Puntuacion de referencia</p>
          <ScoreChip score={seedScore} />
        </Card>
      )}

      <Card className="space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lab-text">{diagnostic.title}</h3>
          <span className="text-xs text-lab-muted">Pregunta {step + 1} de {questions.length}</span>
        </div>

        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-1.5 rounded-full bg-lab-primary transition-all duration-300"
            style={{ width: `${((step + 1) / questions.length) * 100}%` }}
          />
        </div>

        <div className="space-y-3">
          <p className="font-medium text-lab-text">{currentQ.question}</p>
          <div className="space-y-2">
            {currentQ.options.map((opt) => {
              const selected = answers[currentQ.id] === opt.id
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelect(opt.id)}
                  className={`w-full rounded-lab border px-4 py-2.5 text-left text-sm transition ${
                    selected
                      ? 'border-lab-primary bg-lab-primary/5 font-semibold text-lab-primary'
                      : 'border-lab-border text-lab-text hover:bg-slate-50'
                  }`}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleNext}
            disabled={!canProceed}
            className="rounded-lab bg-lab-primary px-5 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-40"
          >
            {isLast ? 'Ver resultado' : 'Siguiente'}
          </button>
        </div>
      </Card>
    </div>
  )
}

export default TrainingDiagnostic

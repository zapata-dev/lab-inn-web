import { createContext, useCallback, useContext, useState } from 'react'
import { demoSteps } from '../data/demoScript'

const DemoContext = createContext(null)

export function DemoProvider({ children }) {
  const [demoActive, setDemoActive] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  const start = useCallback(() => {
    setCurrentStep(0)
    setDemoActive(true)
  }, [])

  const next = useCallback(() => {
    setCurrentStep((s) => Math.min(s + 1, demoSteps.length - 1))
  }, [])

  const prev = useCallback(() => {
    setCurrentStep((s) => Math.max(s - 1, 0))
  }, [])

  const exit = useCallback(() => {
    setDemoActive(false)
  }, [])

  return (
    <DemoContext.Provider
      value={{
        demoActive,
        currentStep,
        totalSteps: demoSteps.length,
        step: demoSteps[currentStep],
        start,
        next,
        prev,
        exit,
      }}
    >
      {children}
    </DemoContext.Provider>
  )
}

export function useDemo() {
  const ctx = useContext(DemoContext)
  if (!ctx) throw new Error('useDemo must be used within DemoProvider')
  return ctx
}

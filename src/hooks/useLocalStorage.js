import { useEffect, useState } from 'react'
import { getFromStorage, removeFromStorage, setToStorage } from '../services/storage'

function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => getFromStorage(key, initialValue))

  useEffect(() => {
    if (value === null || value === undefined) {
      removeFromStorage(key)
      return
    }

    setToStorage(key, value)
  }, [key, value])

  const updateValue = (nextValue) => {
    setValue((previousValue) =>
      typeof nextValue === 'function' ? nextValue(previousValue) : nextValue
    )
  }

  return [value, updateValue]
}

export default useLocalStorage

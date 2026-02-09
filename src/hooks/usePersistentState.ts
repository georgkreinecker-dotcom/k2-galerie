import { useEffect, useState } from 'react'

const isBrowser = typeof window !== 'undefined'

export function usePersistentBoolean(key: string, defaultValue = false) {
  const [value, setValue] = useState<boolean>(() => {
    if (!isBrowser) return defaultValue
    return localStorage.getItem(key) === '1'
  })

  useEffect(() => {
    if (isBrowser) {
      localStorage.setItem(key, value ? '1' : '0')
    }
  }, [key, value])

  return [value, setValue] as const
}

export function usePersistentString(key: string, defaultValue = '') {
  const [value, setValue] = useState<string>(() => {
    if (!isBrowser) return defaultValue
    return localStorage.getItem(key) ?? defaultValue
  })

  useEffect(() => {
    if (isBrowser) {
      localStorage.setItem(key, value)
    }
  }, [key, value])

  return [value, setValue] as const
}

const STORAGE_KEY = 'k2-openai-usage'

export type Usage = { promptTokens: number; completionTokens: number }

function load(): Usage {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const o = JSON.parse(raw) as Usage
      return { promptTokens: o.promptTokens || 0, completionTokens: o.completionTokens || 0 }
    }
  } catch (_) {}
  return { promptTokens: 0, completionTokens: 0 }
}

function save(u: Usage) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(u))
}

export function addUsage(promptTokens: number, completionTokens: number) {
  const u = load()
  u.promptTokens += promptTokens
  u.completionTokens += completionTokens
  save(u)
}

export function getUsage(): Usage {
  return load()
}

export function resetUsage() {
  save({ promptTokens: 0, completionTokens: 0 })
}

// gpt-4o-mini (approx. Okt 2024): $0.15/1M input, $0.60/1M output
export function estimateCostUsd(u: Usage): number {
  return (u.promptTokens / 1e6) * 0.15 + (u.completionTokens / 1e6) * 0.6
}

import { useEffect, useState, type ReactNode } from 'react'
import { renderGeorgsNotizMarkdown } from '../../utils/georgsNotizMarkdownView'

/**
 * Eine Schrift des Projekts, gelesen aus der Notiz-Quelle.
 * Hellles Blatt auf der Ausstellung, damit der Text lesbar bleibt.
 */
export function HundredGenerationSchrift({ path, id }: { path: string; id: string }) {
  const [text, setText] = useState('')
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    setFailed(false)
    setText('')
    fetch(path)
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error('missing'))))
      .then((body) => {
        if (!cancelled) setText(body)
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })
    return () => {
      cancelled = true
    }
  }, [path])

  let body: ReactNode
  if (failed) {
    body = <p>Die Schrift lässt sich gerade nicht öffnen.</p>
  } else if (!text) {
    body = <p>Wird gelesen …</p>
  } else {
    body = renderGeorgsNotizMarkdown(text)
  }

  return (
    <article id={id} className="hg-schrift">
      {body}
    </article>
  )
}

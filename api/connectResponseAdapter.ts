import type { ServerResponse } from 'http'

/**
 * Vercel Serverless: res.status().json() / .end()
 * Vite-Dev (Connect): nur Node http.ServerResponse – dort fehlt das.
 */
export function wrapResForVercelStyleApi(res: ServerResponse) {
  return {
    setHeader(name: string, value: string) {
      if (!res.writableEnded) res.setHeader(name, value)
    },
    status(code: number) {
      return {
        json(body: unknown) {
          if (res.writableEnded) return
          const payload = JSON.stringify(body)
          res.statusCode = code
          res.setHeader('Content-Type', 'application/json')
          res.end(payload)
        },
        end(chunk?: string) {
          if (res.writableEnded) return
          res.statusCode = code
          res.end(chunk)
        },
      }
    },
  }
}

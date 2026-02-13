declare module 'png-dpi-reader-writer' {
  export function writePngDpi(arrayBuffer: ArrayBuffer, dpi?: number): Uint8Array
  export function parsePngFormat(arrayBuffer: ArrayBuffer): { width: number; height: number; dpi: number }
}

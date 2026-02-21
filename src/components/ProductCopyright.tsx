import { PRODUCT_COPYRIGHT } from '../config/tenantConfig'

/** Copyright-Zeile – (G. Kreinecker) kleiner dargestellt. */
export default function ProductCopyright() {
  const parts = PRODUCT_COPYRIGHT.split('(G. Kreinecker)')
  return (
    <>
      {parts[0]}
      <span style={{ fontSize: '0.65em', opacity: 0.6 }}>(G. Kreinecker)</span>
      {parts[1] ?? ''}
    </>
  )
}

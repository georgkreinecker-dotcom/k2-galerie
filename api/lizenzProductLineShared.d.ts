export type LizenzProductLineJs = 'k2_galerie' | 'k2_familie'

export function productLineFromLicenceType(
  licenceType: string | null | undefined,
): LizenzProductLineJs

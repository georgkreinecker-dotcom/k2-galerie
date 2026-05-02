/**
 * Drucker-Einstellungen pro Mandant (Admin → Einstellungen → Drucker).
 * Eine Quelle für ScreenshotExportAdmin, Shop (Bon-Hinweise) und Print-Server-Client.
 */
import type { TenantId } from '../config/tenantConfig'

/**
 * Beispiel aus Epson-Netzwerk-Status-Bon (K2 vor Ort).
 * Nur per Button in Admin → Drucker eintragbar – keine automatische Überschreibung von gespeicherten Werten.
 * Bei DHCP kann sich die Drucker-IP ändern; ggf. neuen Bon drucken oder feste IP im Router/WebConfig.
 */
export const K2_EPSON_STATUS_BON_EXAMPLE_IP = '192.168.0.83'

export type PrinterSettings = {
  ipAddress: string
  printerModel: string
  printerType: 'etikettendrucker' | 'standarddrucker'
  labelSize: string
  /** IPP-Pfad für One-Click → Etikettendrucker (Brother: meist ipp/print) */
  ippPath: string
  /** K2: separater Kassendrucker (Epson TM) – Bon im Shop per Systemdialog */
  kassaIpAddress: string
  kassaIppPath: string
  printServerUrl: string
  openEtikettAfterSave: boolean
  openEtikettInNewTab: boolean
}

export function printerStorageKey(
  tenantId: TenantId,
  key:
    | 'ip'
    | 'type'
    | 'labelSize'
    | 'printServerUrl'
    | 'openEtikettAfterSave'
    | 'openEtikettInNewTab'
    | 'ippPath'
    | 'kassaIp'
    | 'kassaIppPath'
): string {
  const suffix =
    key === 'ip'
      ? 'printer-ip'
      : key === 'type'
        ? 'printer-type'
        : key === 'labelSize'
          ? 'label-size'
          : key === 'printServerUrl'
            ? 'print-server-url'
            : key === 'openEtikettAfterSave'
              ? 'open-etikett-after-save'
              : key === 'openEtikettInNewTab'
                ? 'open-etikett-in-new-tab'
                : key === 'ippPath'
                  ? 'ipp-path'
                  : key === 'kassaIp'
                    ? 'kassa-printer-ip'
                    : 'kassa-ipp-path'
  return `k2-${suffix}-${tenantId}`
}

export function defaultPrinterSettings(): PrinterSettings {
  return {
    ipAddress: '192.168.1.102',
    printerModel: 'K2: Etikett Brother · Kasse Epson TM',
    printerType: 'etikettendrucker',
    labelSize: '29x60',
    ippPath: 'ipp/print',
    kassaIpAddress: '',
    kassaIppPath: 'EPSON_IPP_Printer',
    printServerUrl:
      typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'http://localhost:3847'
        : 'http://192.168.1.1:3847',
    openEtikettAfterSave: false,
    openEtikettInNewTab: false
  }
}

export function loadPrinterSettingsForTenant(tenantId: TenantId): PrinterSettings {
  try {
    const def = defaultPrinterSettings()
    if (tenantId === 'k2') {
      const newIpKey = printerStorageKey('k2', 'ip')
      if (!localStorage.getItem(newIpKey)) {
        const oldIp = localStorage.getItem('k2-printer-ip')
        if (oldIp) localStorage.setItem(newIpKey, oldIp)
      }
      if (!localStorage.getItem(printerStorageKey('k2', 'type'))) {
        const oldType = localStorage.getItem('k2-printer-type')
        if (oldType) localStorage.setItem(printerStorageKey('k2', 'type'), oldType)
      }
      if (!localStorage.getItem(printerStorageKey('k2', 'labelSize'))) {
        const oldLabel = localStorage.getItem('k2-label-size')
        if (oldLabel) localStorage.setItem(printerStorageKey('k2', 'labelSize'), oldLabel)
      }
      if (!localStorage.getItem(printerStorageKey('k2', 'printServerUrl'))) {
        const oldUrl = localStorage.getItem('k2-print-server-url')
        if (oldUrl) localStorage.setItem(printerStorageKey('k2', 'printServerUrl'), oldUrl)
      }
    }
    const ip = localStorage.getItem(printerStorageKey(tenantId, 'ip'))
    const type = localStorage.getItem(printerStorageKey(tenantId, 'type'))
    const labelSize = localStorage.getItem(printerStorageKey(tenantId, 'labelSize'))
    const ippPathStored = localStorage.getItem(printerStorageKey(tenantId, 'ippPath'))
    const printServerUrl = localStorage.getItem(printerStorageKey(tenantId, 'printServerUrl'))
    const openEtikettRaw = localStorage.getItem(printerStorageKey(tenantId, 'openEtikettAfterSave'))
    const openEtikettAfterSave = openEtikettRaw === '1' || openEtikettRaw === 'true'
    const inNewTabRaw = localStorage.getItem(printerStorageKey(tenantId, 'openEtikettInNewTab'))
    const openEtikettInNewTab = inNewTabRaw == null ? def.openEtikettInNewTab : inNewTabRaw === '1' || inNewTabRaw === 'true'
    const kassaIp = localStorage.getItem(printerStorageKey(tenantId, 'kassaIp'))
    const kassaIpp = localStorage.getItem(printerStorageKey(tenantId, 'kassaIppPath'))
    return {
      ipAddress: ip || def.ipAddress,
      printerModel: def.printerModel,
      printerType: (type || def.printerType) as 'etikettendrucker' | 'standarddrucker',
      labelSize: labelSize || def.labelSize,
      ippPath: ippPathStored || def.ippPath,
      kassaIpAddress: kassaIp ?? def.kassaIpAddress,
      kassaIppPath: kassaIpp || def.kassaIppPath,
      printServerUrl: printServerUrl || def.printServerUrl,
      openEtikettAfterSave: openEtikettRaw != null ? openEtikettAfterSave : def.openEtikettAfterSave,
      openEtikettInNewTab
    }
  } catch {
    return defaultPrinterSettings()
  }
}

export function savePrinterSetting(
  tenantId: TenantId,
  key:
    | 'ip'
    | 'type'
    | 'labelSize'
    | 'printServerUrl'
    | 'openEtikettAfterSave'
    | 'openEtikettInNewTab'
    | 'ippPath'
    | 'kassaIp'
    | 'kassaIppPath',
  value: string
): void {
  try {
    localStorage.setItem(printerStorageKey(tenantId, key), value)
  } catch {
    /* ignore */
  }
}

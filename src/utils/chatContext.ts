/**
 * Kontext-Loader für Chat-Dialog
 * Lädt alle wichtigen Informationen für hochwertige Kommunikation
 */

export interface ChatContext {
  user: {
    name: string
    preferredName: string
    background: {
      profession: string
      technicalKnowledge: {
        softwareDevelopment: string
        programming: string
        dependency: string
      }
      language: {
        german: string
        english: string
      }
    }
    partner: {
      name: string
      role: string
    }
  }
  project: {
    name: string
    type: string
    description: string
    techStack: string[]
  }
  communication: {
    language: string
    style: {
      tone: string
      length: string
      structure: string
      visual: string
      enthusiasm: string
      practical: string
    }
    preferences: {
      terminalInstructions: string
      noMarketingTerms: boolean
      useTerm: string
      simpleLanguage: boolean
    }
  }
  projectStatus: {
    currentPhase: string
    mainIssues: string[]
    solutions: Record<string, string>
  }
  teamValues?: string[]
  workPatterns?: string[]
}

let cachedContext: ChatContext | null = null

export async function loadChatContext(): Promise<ChatContext | null> {
  if (cachedContext) return cachedContext

  try {
    // Versuche verschiedene Pfade
    const paths = [
      '/backup/k2-ai-memory-backup.json',
      '/k2-ai-memory-backup.json',
      'backup/k2-ai-memory-backup.json'
    ]
    
    let data = null
    for (const path of paths) {
      try {
        const response = await fetch(path)
        if (response.ok) {
          data = await response.json()
          break
        }
      } catch (e) {
        // Weiter zum nächsten Pfad
      }
    }
    
    if (!data) return null
    
    cachedContext = {
      user: data.user,
      project: data.project,
      communication: data.communication,
      projectStatus: data.projectStatus,
      teamValues: data.teamValues,
      workPatterns: data.workPatterns
    }
    return cachedContext
  } catch (error) {
    console.warn('Kontext konnte nicht geladen werden:', error)
    return null
  }
}

export function buildSystemPrompt(context: ChatContext | null): string {
  const basePrompt = `Du bist der KI-Assistent für die K2 Galerie. Du arbeitest als Teil des K2Teams mit Georg Kreinecker zusammen.

## WICHTIGE REGELN:

### Kommunikations-Stil:
- Antworte IMMER auf Deutsch
- KURZE Antworten: Keine langen Textwände
- STRUKTURIERT: Nutze Überschriften, Listen, Code-Blöcke
- VISUAL: Nutze Emojis zur Strukturierung (🔧 🎯 ✅ 📸 🔥 💚 etc.)
- DIREKT: Komm schnell zum Punkt
- ENTHUSIASTISCH: Zeige Begeisterung für Erfolge
- PRAKTISCH: Gib konkrete Schritt-für-Schritt Anleitungen

### Persönliche Informationen - GEORG:
- Name: Georg Kreinecker - IMMER "Georg" ansprechen (nicht formell)
- Partnerin: Martina (gemeinsame Galerie)
- Geboren: 1959
- Hintergrund: Schlosser → Meister → Unternehmer (Maschinenbau) → Consulting/Trading → Immobilien
- Technische Kenntnisse: KEINE Softwareentwickler-Kenntnisse - 100% auf Hilfe angewiesen
- Englisch: Gut für Konversation, NICHT für Fachwissen/Programmierung
- Kommunikation: IMMER einfach erklären, keine Fachbegriffe ohne Erklärung, Schritt-für-Schritt

### Projekt-Kontext:
- Projekt: K2 Galerie Multi-Tenant SaaS
- Tech-Stack: React + TypeScript + Tailwind + Vite + Supabase
- Alles auf Deutsch, professionell, seriös
- KEINE aggressiven Marketing-Begriffe
- "Empfehlungs-Programm" statt "Affiliate"

### Terminal-Befehle:
- IMMER explizit sagen: "Im Terminal am Mac" oder "In Cursor Terminal"
- NIEMALS einfach "Terminal" sagen ohne zu spezifizieren
- Mac Terminal = separates Terminal-Fenster außerhalb von Cursor
- Cursor Terminal = integriertes Terminal in Cursor IDE
- Bei Unsicherheit: Immer Mac Terminal bevorzugen (stabiler)

### Code-Qualität:
- IMMER ZUERST LESEN: Komplette Funktion/Datei lesen bevor Änderungen gemacht werden
- STRUKTUR VERSTEHEN: Verstehe den Code-Flow bevor du änderst
- FEHLER VERMEIDEN: Ein Fehler = viele unnötige API-Calls für Fixes
- EINMAL RICHTIG: Lieber einmal gründlich lesen als mehrmals falsch ändern`

  if (!context) {
    return basePrompt + '\n\nBei Bildern beschreibe, was du siehst.'
  }

  const contextDetails = `
### Aktueller Projekt-Status:
- Phase: ${context.projectStatus.currentPhase}
- Hauptprobleme: ${context.projectStatus.mainIssues.join(', ')}
- Lösungen: ${Object.entries(context.projectStatus.solutions).map(([k, v]) => `${k}: ${v}`).join(', ')}

### Projekt-Details:
- Name: ${context.project.name}
- Typ: ${context.project.type}
- Beschreibung: ${context.project.description}
- Tech-Stack: ${context.project.techStack.join(', ')}

### Team-Werte:
${context.teamValues ? context.teamValues.map(v => `- ${v}`).join('\n') : '- Nicht definiert'}

### Arbeits-Muster:
${context.workPatterns ? context.workPatterns.map(p => `- ${p}`).join('\n') : '- Nicht definiert'}
`

  return basePrompt + contextDetails + '\n\nBei Bildern beschreibe, was du siehst.'
}

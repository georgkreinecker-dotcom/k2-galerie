/**
 * Einmalige Korrektur: gallery-data.json hatte fälschlich MUSTER-Vitas (Lena/Paul).
 * Setzt martina.vita / georg.vita auf denselben Inhalt wie K2_DEFAULT_VITA_* in tenantConfig.ts.
 * Quelle: docs/VITA-MARTINA-K2-ENTWURF-2026-03.md, docs/VITA-GEORG-K2-ENTWURF-2026-03.md
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const file = path.join(root, 'public/gallery-data.json')

const K2_DEFAULT_VITA_MARTINA = `Mein Werdegang: Arbeitslehrerin, Mutter, Assistentin der Geschäftsführung, Bewegungstrainerin.

Das Experimentieren mit verschiedenen Farben, Textilien und Techniken fasziniert mich schon mein Leben lang. Die kreative Fähigkeit, meine persönlichen Erfahrungen in kleinen und großen Kunstwerken zu verarbeiten, wurde mir wahrscheinlich schon von meinen Eltern in die Wiege gelegt – beide liebten ihr Handwerk sehr.

Durch meine gute Freundin und Künstlerin Len van Hagendoorn wurde ich ermutigt, tiefer in die Welt der künstlerischen Ausdrucksmöglichkeiten einzutauchen, dabei meine Ängste zu überwinden und so zu meiner Leidenschaft, dem Malen, zu finden.

Mit meiner Ausstellung „Mutprobe“ im Frühjahr 2025 trat ich erstmals allein in die Öffentlichkeit und präsentierte Werke aus allen meinen Schaffensperioden.

Besuchte Kurse und Stationen

1997 – Kurs, Volkshochschule
1998–2000 – Kurse bei Len van Hagendoorn
2002 – Malworkshop Aboriginal Art mit Ausstellung
2003 – Malreise in die Toskana
2004–2006 – Zeichenkurse im Bildungshaus Puchberg (Mag. Martin Staufer: Akt/Portrait; Mag. Harald Birklhuber: Perspektive)
Es folgten weitere Kurse bei Christine Kastner in Krems (PanArt).
2018 – Beitritt zur Aktzeichengruppe Karl Breuer und zu einer Künstlergruppe
Seit 2020 – jährliche Teilnahme an Sommerakademien (unter anderem in Eferding)
2023 – Gemeinschaftsausstellung der Aktgruppe in der Konditorei Vogl und in der „Kleinen Kellergalerie“
2025 – Gastausstellung bei der Künstlergilde Eferding`

const K2_DEFAULT_VITA_GEORG = `Schlosserhandwerk und Unternehmertum prägen meinen Berufsweg; im Ruhestand widme ich mich kgm solution und dem gemeinsamen Projekt K2 Galerie mit der digitalen Plattform.

Beruf und Unternehmertum

1983 – Schlossermeisterprüfung.
1985 – Gründung Kreinecker Georg Maschinenbau (KGM); Start in die Selbstständigkeit.
Es folgten die kgm consulting & trading GmbH und die kgm Immobilien GmbH.
Seit 2020 – kgm solution im Ruhestand; Schwerpunkt K2 Galerie und digitale Plattform.

Kunst und Keramik

2009 – Einstieg über Stein und Bildhauerei.
Es folgten eine Phase mit Bronze; Keramik wurde der bleibende Schwerpunkt.
2016–2018 – Praxiskurse bei Georg Niemann, bei Sabine Classen (ceramic4you, sabineclassen.de) und im Keramikzentrum Grenzhausen (Keramik-Kombinat).

Heute lese ich viel und experimentiere am Ton – das gehört für mich zum Handwerk dazu.`

const raw = fs.readFileSync(file, 'utf8')
const data = JSON.parse(raw)
if (!data.martina) data.martina = {}
if (!data.georg) data.georg = {}
data.martina.vita = K2_DEFAULT_VITA_MARTINA
data.georg.vita = K2_DEFAULT_VITA_GEORG
fs.writeFileSync(file, JSON.stringify(data), 'utf8')
console.log('OK: martina.vita + georg.vita in gallery-data.json auf K2-Entwürfe gesetzt.')

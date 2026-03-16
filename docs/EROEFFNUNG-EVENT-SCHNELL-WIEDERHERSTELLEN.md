# Eröffnungsevent 24.–26.04. schnell wiederherstellen

**So geht’s:** Einmal im **Admin (K2)** sein, dann das Skript im Browser ausführen – das Event wird angelegt, danach Seite neu laden.

---

## Schritte

1. **App im Browser öffnen** (z. B. http://localhost:5177 oder k2-galerie.vercel.app).
2. **In den Admin gehen** – K2-Galerie (nicht ök2, nicht VK2).
3. **Zum Tab „Eventplanung“ / „Öffentlichkeitsarbeit & Eventplanung“** wechseln (Marketing-Bereich).
4. **Entwicklertools öffnen:** **Cmd + Option + I** (Mac) oder **F12** (Windows) → Reiter **„Konsole“** (Console).
5. **Dieses Skript komplett kopieren**, in die Konsole einfügen und **Enter** drücken:

```javascript
(function() {
  var key = 'k2-events';
  var raw = localStorage.getItem(key);
  var events = (raw && raw.trim() ? JSON.parse(raw) : []) || [];
  if (!Array.isArray(events)) events = [];

  var hatEröffnung = events.some(function(e) {
    return e && (e.date === '2026-04-24' || (e.title && e.title.indexOf('Eröffnung') !== -1));
  });
  if (hatEröffnung) {
    console.log('✅ Eröffnungsevent ist bereits vorhanden.');
    return;
  }

  var galerie = null;
  try {
    var g = localStorage.getItem('k2-stammdaten-galerie');
    if (g && g.trim()) galerie = JSON.parse(g);
  } catch (e) {}
  var location = '';
  if (galerie && galerie.address) {
    location = [galerie.address, galerie.city, galerie.country].filter(Boolean).join(', ');
  }

  var newEvent = {
    id: 'event-' + Date.now(),
    title: 'Eröffnung der K2 Galerie',
    type: 'galerieeröffnung',
    date: '2026-04-24',
    endDate: '2026-04-26',
    startTime: '',
    endTime: '',
    dailyTimes: {},
    description: '',
    location: location,
    documents: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  events.push(newEvent);
  events.sort(function(a, b) { return new Date(a.date).getTime() - new Date(b.date).getTime(); });
  localStorage.setItem(key, JSON.stringify(events));
  console.log('✅ Eröffnungsevent 24.–26. April wieder angelegt! Bitte Seite neu laden (F5 oder Cmd+R).');
})();
```

6. **Seite neu laden** (F5 oder Cmd+R). Unter **Eventplanung** solltest du das Event **„Eröffnung der K2 Galerie“** (24.04.–26.04.2026) sehen. Dokumente (Flyer, Presse, Einladung) danach unter **Öffentlichkeitsarbeit** bei diesem Event hinzufügen.

---

*Falls der Button „🎉 Eröffnung 24.–26. April wiederherstellen“ im Admin sichtbar ist, kannst du stattdessen einfach darauf klicken – gleiche Wirkung.*

# Kontingent

Cannabis-Tracker als Web-App fürs iPhone. Alle Daten bleiben lokal auf dem Gerät (localStorage), nichts verlässt das iPhone.

- **Heute:** Tagesbudget bis zu einem Zieldatum, Konsum erfassen (Menge, Sorte, Konsumform), Bestand-Warnung,
  Zähler für konsumfreie Tage mit Rekord, Etappen und optionalem Pausenziel
- **Bestand:** Sorten mit THC/CBD, Preis und Bewertung (1–5 Sterne), Gesamtwert, „reicht bis“ nach deinem Tempo
- **Statistik:** Ø Tagesbedarf in Gramm und Euro, letzte 7 Tage, Muster (Tageszeit, Wochentag), Monatskalender mit Vormonatsvergleich, Verlauf
- **Einstellungen:** Konsumformen und Funktionen (Zähler, Kosten, Bewertung) ein-/ausschalten, Menge pro Konsumform, Pausentage,
  Reduktionsplan, PIN-Sperre mit Face ID / Touch ID, Backup mit Erinnerung
- Einträge und Sorten antippen zum Bearbeiten (auch das Datum eines Eintrags); Erfassen und Löschen lassen sich 5 Sekunden lang rückgängig machen
- Optimiert für alle aktuellen iPhones (SE bis Pro Max), Querformat und iPad; Tippflächen nach Apple-Richtlinie (44 pt)
- Funktioniert offline (Service Worker)

## Aufs iPhone

1. GitHub Pages aktivieren: Settings → Pages → Branch wählen, Ordner `/ (root)`.
   (Bei privatem Repo braucht Pages GitHub Pro; alternativ Repo öffentlich machen, es enthält keine persönlichen Daten.)
2. Die Pages-URL in Safari öffnen → Teilen → „Zum Home-Bildschirm“.
3. Ab dann startet die App vom Home-Bildschirm im Vollbild, auch ohne Internet.

Updates erscheinen beim zweiten Start nach dem Hochladen (erst laden, dann anzeigen).

## Etikett scannen

Bestand → „Sorte hinzufügen“ → ins Etikett-Feld tippen → „Text scannen“ → Kamera aufs Etikett.
Name, THC %, CBD % und Gramm werden automatisch übernommen (iOS Live Text, offline).

## Test

`node test.js`

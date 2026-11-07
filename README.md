# Kontingent

Cannabis-Tracker als Web-App fürs iPhone. Alle Daten bleiben lokal auf dem Gerät (localStorage), nichts verlässt das iPhone.

- **Heute:** Tagesbudget bis zu einem Zieldatum, Konsum erfassen (Menge, Sorte, Konsumform)
- **Bestand:** Sorten mit THC/CBD und Preis, Gesamtwert, „reicht bis“ nach deinem Tempo
- **Statistik:** Ø Tagesbedarf in Gramm und Euro, letzte 7 Tage, Monatskalender mit Vormonatsvergleich, Verlauf
- **Einstellungen:** Pausentage, PIN-Sperre, Backup
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

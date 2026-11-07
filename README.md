# Kontingent

Cannabis-Tracker als Web-App fürs iPhone: Bestand verwalten, Konsum erfassen, Tagesbudget bis zu einem Zieldatum.
Alle Daten bleiben lokal auf dem Gerät (localStorage), nichts verlässt das iPhone.

## Aufs iPhone

1. GitHub Pages aktivieren: Settings → Pages → Branch `main`, Ordner `/ (root)`.
   (Bei privatem Repo braucht Pages GitHub Pro; alternativ Repo öffentlich machen, es enthält keine persönlichen Daten.)
2. Die Pages-URL in Safari öffnen → Teilen → „Zum Home-Bildschirm“.
3. Ab dann startet die App vom Home-Bildschirm im Vollbild ohne Safari-Leiste.

## Etikett scannen

„Sorte hinzufügen“ → ins Etikett-Feld tippen → „Text scannen“ → Kamera aufs Etikett.
Name, THC %, CBD % und Gramm werden automatisch übernommen (iOS Live Text, offline).

## Test

`node test.js`

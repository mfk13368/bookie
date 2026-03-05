# Deployment Guide für Bibliothekar

Es gibt verschiedene Möglichkeiten, die App online zu bringen. Hier sind die gängigsten Methoden:

## 1. Hosting auf Vercel (Empfohlen für Web)

Dies ist der einfachste Weg, die App weltweit über eine URL erreichbar zu machen.

### Schritt 1: GitHub
Lade den Code in ein eigenes GitHub-Repository hoch.

### Schritt 2: Vercel verbinden
1. Gehe auf [vercel.com](https://vercel.com) und erstelle ein Konto.
2. Klicke auf **"Add New"** -> **"Project"**.
3. Importiere dein GitHub-Repository.

### Schritt 3: Datenbank (Wichtig!)
Vercel unterstützt kein dauerhaftes Speichern von lokalen Dateien (SQLite). Du hast zwei Möglichkeiten:

**A) PostgreSQL (Supabase/Neon):**
1. Erstelle eine kostenlose Datenbank bei [Supabase](https://supabase.com) oder [Neon](https://neon.tech).
2. Kopiere die Verbindungs-URL.
3. Füge in den Vercel-Projekteinstellungen unter "Environment Variables" die Variable `DATABASE_URL` mit deiner URL ein.
4. Ändere in `prisma/schema.prisma` den Provider von `sqlite` auf `postgresql`.

**B) Turso (SQLite in der Cloud):**
1. Erstelle eine Datenbank bei [Turso](https://turso.tech).
2. Nutze den `@libsql/client` wie im Code vorbereitet.

---

## 2. Self-Hosting mit Docker (Lokal oder auf eigenem Server)

Ideal für einen Raspberry Pi oder einen eigenen Server.

### Schritt 1: Docker installieren
Stelle sicher, dass Docker und Docker Compose auf deinem System installiert sind.

### Schritt 2: Starten
Führe im Projektverzeichnis aus:
```bash
docker-compose up -d --build
```

Die App ist dann unter `http://deine-ip:3000` erreichbar. Deine Daten werden sicher im Ordner `prisma/data` auf deinem Rechner gespeichert.

---

## 3. Deployment auf einem Server (ohne Docker)

1. Kopiere den Code auf den Server.
2. Installiere die Abhängigkeiten: `npm install`.
3. Erstelle einen Production-Build: `npm run build`.
4. Starte die App mit einem Process Manager wie **PM2**:
   ```bash
   pm2 start npm --name "bibliothekar" -- start
   ```

---

## Wichtige Hinweise
- **HTTPS:** Für den Kamerazugriff (ISBN-Scanner) auf dem Handy ist im Browser zwingend eine sichere Verbindung (**HTTPS**) erforderlich.
- **Backups:** Wenn du SQLite nutzt, sichere regelmäßig die Datei `prisma/dev.db`.

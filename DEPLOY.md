# Vercel Deployment

This is a Vite React app.

## Local
```bash
npm install
npm run dev
```

## GitHub
```bash
git init
git add .
git commit -m "Spotify clone player page and related songs"
git branch -M main
git remote add origin YOUR_REPOSITORY_URL
git push -u origin main
```

## Vercel
1. Import the GitHub repository in Vercel.
2. Framework Preset: Vite
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Deploy.

Songs are stored in `public/music/`, so Vite serves them at `/music/<filename>.mp3`.

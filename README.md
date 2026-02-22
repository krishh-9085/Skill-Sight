# SkillSight Resume Analyzer

Cloud-based resume analyzer built with React Router, Supabase Storage/DB, and Ollama model inference (local or cloud).

## Setup

1. Install dependencies

```bash
npm install
```

2. Create `.env` from `.env.example` and fill values.

3. In Supabase Dashboard:
   - Go to **Authentication > Providers > Email** and enable email/password auth.
   - (Optional) Disable email confirmation in **Authentication > Settings** for easier local testing.

4. In Supabase SQL Editor, open `docs/supabase.sql`, copy all contents, paste into the editor, and click **Run**.

5. Start dev server

```bash
npm run dev
```

## Required Environment Variables

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SUPABASE_STORAGE_BUCKET` (default: `resumes`)
- `SUPABASE_SERVICE_ROLE_KEY` (server-only)
- `OLLAMA_API_KEY` (optional for local, required for Ollama Cloud)
- `OLLAMA_BASE_URL` (optional, default `http://127.0.0.1:11434`)
- `OLLAMA_MODEL` (optional, default `qwen2.5:7b-instruct`)
- `OLLAMA_THINK_LEVEL` (optional, default `false`; for GPT-OSS prefer `low`)
- `OLLAMA_TIMEOUT_MS` (optional, default `60000`)
- `OLLAMA_NUM_PREDICT` (optional, default `900`)
- `OLLAMA_NUM_CTX` (optional, default `3072`)
- `OLLAMA_MAX_RESUME_CHARS` (optional, default `4500`)
- `OLLAMA_MAX_RESUME_PAGES` (optional, default `1`)

## Notes

- Uploads are stored in Supabase Storage.
- Resume metadata + feedback are stored in `public.resumes` and scoped by `user_id`.
- Storage object paths are user-scoped and must follow: `<auth.uid()>/<random>/<filename>`.
- AI analysis runs in `app/routes/api.analyze.ts` on the server and calls your configured Ollama endpoint.

## Vercel + Ollama Cloud

In Vercel, set these server environment variables:

- `OLLAMA_BASE_URL=https://ollama.com/api`
- `OLLAMA_API_KEY=<your_ollama_cloud_api_key>`
- `OLLAMA_MODEL=<a model available in your Ollama Cloud account>`
- `OLLAMA_THINK_LEVEL=low` (recommended for GPT-OSS models)

The API route accepts both `http://127.0.0.1:11434` (local) and `https://ollama.com/api` (cloud).

### Recommended settings for `gpt-oss:120b-cloud`

- `OLLAMA_MODEL=gpt-oss:120b-cloud`
- `OLLAMA_THINK_LEVEL=low`
- `OLLAMA_TIMEOUT_MS=120000`
- `OLLAMA_NUM_PREDICT=1400`
- `OLLAMA_NUM_CTX=8192`

## Ollama Setup (Free Local AI)

1. Install Ollama: https://ollama.com/download
2. Pull a model:

```bash
ollama pull qwen2.5:7b-instruct
```

3. Start Ollama server (if not already running):

```bash
ollama serve
```

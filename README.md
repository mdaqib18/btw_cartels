# Codebase Black Box

A flight recorder for AI-assisted development. It treats **Entire Checkpoints** as the source of current development context, **Entire Graph** as structural evidence, and Databricks as durable memory, retrieval, and reasoning.

## Run

```bash
npm install
copy .env.example .env.local
npm run dev
```

Without credentials, the dashboard remains usable but explicitly reports unavailable integrations. Import actual checkpoint JSON through `POST /api/checkpoints/import`, or configure the Entire CLI and use `POST /api/checkpoints/refresh`.

## Verify

```bash
npm test
npm run build
```

See [BUILDATHON.md](./BUILDATHON.md) for architecture, setup, and the curveball demo.

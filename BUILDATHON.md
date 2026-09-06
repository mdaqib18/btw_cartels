# Codebase Black Box

**Summary:** a developer flight recorder that turns verified Entire context, graph evidence, and Databricks memory into safe next actions.

## Problem and user

AI-assisted teams lose intent between sessions. A developer or fresh coding agent needs trustworthy answers about what changed, why, what remains, and what a change affects.

## Selected Entire track: Checkpoints + Graph

Entire is essential: Checkpoints supply the primary development record and Graph supplies the code-relationship evidence. Removing either disables context review or structural impact analysis; the UI does not substitute fabricated records.

## Architecture

`Entire Checkpoint -> parser -> Delta development_events -> AI Search -> Foundation Model -> dashboard`

`Entire Graph -> normalized relationship evidence -> impact/risk recommendation -> dashboard`

`src/lib/entire` invokes the configured CLI and normalizes incomplete fields to `null`. `src/lib/entire-graph` invokes graph search/relationship commands. `src/lib/databricks` sends Delta SQL, Vector Search and serving-endpoint requests only when all required configuration exists.

## Checkpoint workflow

Create an Entire checkpoint after a coherent implementation step, refresh/import it, and the app writes normalized evidence to `codebase_black_box.development_events`. Review Intent and Resume Work use that evidence; no evidence produces an explicit insufficiency state.

## Graph findings

Analyze a changed file or symbol. Related files, callers and test hints are presented as raw normalized Entire Graph evidence underneath every recommendation.

## Databricks data usage

Delta stores checkpoint fields and graph impact. AI Search retrieves prior decisions by semantic query. The Foundation Model receives labelled checkpoint, historical, graph and test evidence and must return a typed recommendation; its output is labelled inference.

## Curveball response

At 11:45 preserve a checkpoint. At 12:00 choose **Resume Work** in a new agent session: it builds a copyable prompt from the latest checkpoint plus impact evidence. Implement the smallest safe response, run tests, create a new Entire checkpoint, refresh it, and compare the timeline/coverage.

## Checkpoint links

Add actual checkpoint URLs/IDs here during the demo: `TODO: cp-stable`, `TODO: cp-curveball`.

## Setup

Install dependencies, copy `.env.example` to `.env.local`, install/sign in to Entire CLI, then set Databricks Free Edition host, token, SQL warehouse, Vector Search endpoint, model serving endpoint, and project ID. Keep `.env.local` uncommitted.

## Commands

`npm run dev` · `npm test` · `npm run build`

## Limitations and next steps

Entire CLI JSON command shapes vary; configure `ENTIRE_CLI_PATH` and adjust the adapter command if your version differs. The MVP has no authentication or background sync. Next: webhook checkpoint ingestion, durable local cache, project selection, and visual dependency paths.

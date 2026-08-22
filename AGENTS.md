# Agent Entry

This repository maintains a reusable collaboration kit. Optimize for portability, clarity,
and fail-closed validation.

## Boundaries

- Modify only this repository unless the task explicitly authorizes another project.
- Keep templates independent of Cindy, specific employers, private endpoints, machine paths,
  frameworks, languages, and vendors.
- Treat templates/manifest.json as the source of truth for copyable files, destinations,
  required status, and documented placeholders.

## Required Checks

Before commit, run:

    npm run validate

Also run the generator once against a temporary directory when changing its behavior:

    node scripts/use-template.mjs "$TMPDIR/agent-collab-kit-smoke" --set PROJECT_NAME=Smoke

Remove the temporary directory after the smoke test.

## Editing Rules

- Update README, CHANGELOG, manifest, validation, and tests together when the contract
  changes.
- Use semantic placeholders rather than embedding example company names.
- Keep scripts dependency-free so public repositories can adopt the kit without install risk.
- Do not weaken overwrite protection, path containment, or manifest validation.

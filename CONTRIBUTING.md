# Contributing

## Workflow

1. Open or find an issue before adding a material change.
2. Create a short-lived branch from main.
3. Keep one pull request focused on one change.
4. Run npm run validate before committing.
5. Review the full diff and describe verification in the PR.
6. Use a Signed-off-by trailer for each commit.

## Template Rules

- Keep templates product-neutral and free of private paths, commands, credentials, and team
  names.
- Update manifest.json whenever a template is added, renamed, removed, or made optional.
- Prefer explicit placeholders over hidden assumptions.
- Prefer deterministic validation over prose-only requirements.
- Do not turn every recommendation into a blocking gate; route rules by risk.

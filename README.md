# Agent Collaboration Kit

A copy-ready starter kit for teams that use coding agents alongside human contributors.
It packages the collaboration model used by modern product repositories: shared agent
entry points, risk-based rule routing, branch and PR evidence standards, layered review,
UI and copy constraints, and automation gates.

## What Is Included

| Path | Purpose |
| --- | --- |
| templates/AGENT_ENTRY.template.md | Shared entry for humans and coding agents. |
| templates/WORKFLOW.template.md | Branch, commit, verification, PR, and escalation rules. |
| templates/PR_TEMPLATE.md | Pull-request evidence template. |
| templates/REVIEW_GUIDE.template.md | P0/P1/P2 review standard and AI-review boundary. |
| templates/UI_UX_RULES.template.md | Optional interface, interaction, motion, and copy rules. |
| templates/SETUP_CHECKLIST.md | One-time adoption checklist. |
| templates/manifest.json | Machine-readable sources, destinations, and placeholders. |
| profiles/cindy/ | Cindy-derived engineering and design rules, copied from a pinned public commit. |

The templates are intentionally product-neutral. They do not assume a language, framework,
CI vendor, hosting platform, or team size.

The Cindy profile is kept separate from the templates. It includes the actual
engineering and design documents from Cindy, while leaving product rules,
feature plans, and one-off QA artifacts out of the reusable package. See
profiles/cindy/README.md for the source commit, license, and boundary.

## Quick Start

From this repository:

    npm run validate

Generate the kit into a new or existing repository:

    node scripts/use-template.mjs /path/to/target-repo \
      --set "PROJECT_NAME=My Project" \
      --set DEFAULT_BRANCH=main \
      --set CHANGE_BRANCH_PREFIX=tasks/ \
      --set RELATED_TEST_GATE=npm test \
      --set TYPECHECK_GATE=npm run typecheck \
      --set FORMAT_GATE=npm run format:check \
      --set SIGNOFF_MECHANISM="DCO Signed-off-by"

Add more --set arguments as your project requires. The generator refuses to overwrite an
existing destination unless you pass --force. After generation, search the copied files for
remaining placeholder names and finish the routing table with real paths.

Skip optional UI rules when the destination has no interface:

    node scripts/use-template.mjs /path/to/target-repo --no-ui

## Validation

Run local checks:

    npm run validate

CI validates the generic manifest and the Cindy profile manifest, verifies every required
source exists, rejects unsafe target paths, confirms placeholders are documented and
discoverable, and checks that templates stay product-neutral.

## License

MIT. See LICENSE.

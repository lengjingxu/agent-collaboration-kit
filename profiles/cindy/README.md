# Cindy Rules Profile

This directory is a copy-ready profile built from the public Cindy client
repository. It contains the parts of Cindy's collaboration system that can be
reused across agent-assisted software projects.

## Source

- Repository: https://github.com/makecindy/cindy
- Branch: main
- Source commit: 50a6e913b43c5d86b5f0d2ee1c2da06f27238a57
- Source license: Apache-2.0

## Included

- AGENTS.md: the shared human and agent entry point.
- REVIEW.md: automated review boundaries and severity mapping.
- .github/PULL_REQUEST_TEMPLATE.md: scope, verification, risk, and rollback evidence.
- docs/dev-rules/: engineering, security, storage, architecture, workflow, and
  platform rules.
- docs/design-rules/: the complete design system, token, interaction, copy,
  governance, visual reference, gamepad authoring, and controller artwork set.
- DCO and CONTRIBUTING.md: contribution and attribution guidance required by the
  copied entry point.

## Deliberately excluded

- docs/product-rules/: product behavior, naming, regional editions, and feature
  decisions.
- Feature requirements, implementation plans, bridge designs, and runtime
  integration plans under docs/.
- docs/design-previews/: one-off QA demos, screenshots, and bug reproductions.
- Generated legal notices, SBOM files, and third-party dependency inventories.

## Use

1. Use the files in templates/ for a project-neutral starting point.
2. Copy this profile when the target project wants the fuller Cindy-derived
   engineering and design rule set.
3. Keep the target project's product rules in its own docs/product-rules/
   directory.
4. Replace Cindy paths, package names, commands, and platform assumptions with
   facts from the target repository before making the copied files authoritative.

The profile is a source snapshot, while templates/ remains the maintained
project-neutral package. The manifest records the exact source and inclusion
boundary.

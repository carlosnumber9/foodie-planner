# Git workflow

Use only the local Git CLI for ordinary commit and push requests. Read status and the intended diff first; preserve unrelated changes and stage only the requested scope. Never commit credentials or machine-specific state.

Repository commit subjects use `type: English description`, for example `feat: add local recipe catalog` or `docs: document catalog ownership`. Common types are `feat`, `fix`, `docs`, `test`, `refactor`, and `chore`. An explicit user convention overrides this default.

Before committing, run checks appropriate to the changed behavior as described in the [quality strategy](architecture/quality-strategy.md), and inspect `git diff --check`. Report meaningful failures honestly; do not silently skip required checks.

Content acceptance authorizes catalog edits and validation, not commit, push, or publication. Commit authorization does not imply push. A commit-and-push request does not authorize creating or modifying a pull request. Do not use `gh`, `github:yeet`, a GitHub plugin, connector, or app unless the user explicitly requests a GitHub or pull request workflow. Publication requires a publication request or an explicitly authorized push to a branch already connected to deployment.

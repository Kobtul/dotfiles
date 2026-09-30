---
name: handoff
description: Save a concise continuation note when the user asks for a handoff or wants to reset context and resume work in a fresh session.
---

Write a note that lets a fresh agent continue the task. Use the user's chosen path, otherwise update the task's existing handoff or create HANDOFF.md in the workspace. Preserve unrelated notes. Tailor it to the next session's focus when given.

Capture only what matters for continuing:

- Goal, scope, and definition of done.
- Decisions and reasons, separating fixed requirements from preferences and open assumptions.
- Current branch, relevant changed files, completed work, and verification actually performed.
- Unresolved questions, blockers, useful failed attempts, and the next concrete action.

Reference existing specs, issues, commits, and files instead of duplicating them. Omit secrets and the conversation transcript. Remove superseded information; do not turn tentative plans into obligations.

End with a short prompt for the next agent to read the note, check it against the current repo, and continue. Return the note's path and that prompt to the user.

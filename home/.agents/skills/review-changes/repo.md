# Target: one Git repo

Reviews the current branch of one repo and its uncommitted files. It needs only
Git, so it works in any repo.

## Collect

- **Repo:** the working directory, or the repo that the engineer names.
- **Base:** `git merge-base HEAD origin/<default branch>`. Run
  `git fetch origin <default branch>` first; it changes only the
  remote-tracking ref. Without a remote, ask the engineer for the base.
- **Changes:** `git log --oneline <base>..HEAD`, `git diff <base>...HEAD`, and
  `git status --short`. Review the uncommitted files too, and say which
  findings are about them.
- **Task:** the work item or issue that the branch or the commits name.
  Without one, ask the engineer for the goal in one sentence.
- **Description:** the commit messages.
- **Scratch folder:** `~/scratch/review-<repo>/`.

## Checks

Run the repo's lint, type check, and unit tests, as its `AGENTS.md` or
`README.md` describes. Record each command and its result.

## Runs

Probes and agent or API runs use detached worktrees in the scratch folder, as
step 5 of `SKILL.md` describes. When the repo cannot run without other
services, list the runs under "Claims that need a run".

## Report

Show the result to the engineer and write it to
`~/scratch/review-<repo>/review.md`. Leave out "Replies to open threads". Do
not change code: the engineer decides what to fix.

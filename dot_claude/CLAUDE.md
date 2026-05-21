# Shortcuts

- `.`: continue: resuming after a process interuption, continue on with the task
- `r`: refactor:
  1. identify accidental complexity, present actionable items to user
  2. act on items, also perform general code quality sweep: inline variables and functions, condense, make concise, remove comments except important caveats
- `q`: question: user wants to know something, answer their question, do not start editing, only suggest
- `d`: deploy: (re)build and (re)start local server, according to project specifics
- `t`: test: perform manual and automatic tests in parallel
    - `tm`: test manually: use REPL, CLI, agent-browser, or other available means to verify added functionality
    - `ta`: test automatically: ensure new code is covered, then run tests, prefer E2E over mocks and "thing-is-thing" unit tests
- `pls`: grep for comments containing `pls`, act on the instructions there, remove the comments

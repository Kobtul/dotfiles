# Review checklist

The best code is the code that is never written. This review asks first
whether the code is necessary, and only then how good it is. A comment that
asks for more code needs the same reason as code: a realistic trigger, a
second real caller, or a value that differs between environments.

If `team.md` exists next to this file, it adds the team's facts to the same
levels. The linters and type checkers of the repo already report what they
catch, so do not report it again. Read the folders that they exclude with the
same rules.

The checks are in four levels. Go through them in order. A finding on a
higher level can make the lower levels unnecessary for that code.

Report a finding only with a realistic trigger: an input or a scenario that the
users of this service produce. Skip findings that need several unlikely
conditions at the same time. Security and data loss are the exception, because
an attacker makes the unlikely conditions on purpose.

# Level 1: Necessity

- The problem exists on the base. The code path that the bug evidence names
  (a tool, a sub-agent, a version) still exists and works in the same way.
  Reproduce the failure on the base first. If it does not reproduce, that is
  the main finding: report it and hold all other findings.
- A difference between the bug report and the current code is a finding. Do
  not explain it away.
- The change is the smallest one that fixes the observed failure. Compare its
  size with the sketch from step 2 of `SKILL.md`. A large change for a small
  failure needs a reason.
- Compare a proactive pre-check with the reactive fix: no pre-check, catch the
  error, and return a recovery message to the LLM. State the trade-off (less
  code against a later failure). A pre-computation needs a reason.
- An existing helper, library, callback, plugin, or platform feature covers the
  case. Then the new code goes away.
- Each change in the diff traces back to the task. Unrelated changes go into a
  separate change. Code that must not go into the release goes away, for
  example debug code or a feature that the task does not enable.
- Code, settings, and tests that the change makes unnecessary are deleted in
  the same change.
- The task proposes fix directions. Name the ones that the change does not
  take, and ask why.
- A change that addresses several problems classifies each one as a fix or an
  optimization, with separate evidence. An optimization gives the measured
  gain.
- A bug fix has a regression test that fails on the base and passes on the
  head.

# Level 2: Behaviour

- Each claim about behaviour has runs on the base and on the head, with the
  same inputs. A claim without runs is labelled `code reading`.
- The inputs include the common case (small, ordinary data), not only the edge
  cases that the change targets.
- The model does what the prompt asks. A prompt rule or a tool path that the
  model ignores is a finding, and the code built around that path may be
  unnecessary. Record which tools the model calls, and how many agent round
  trips the common case takes.
- Numbers in the description of the change are claims. Check the setup behind
  them.
- LLM behaviour has three or more runs.
- A change in the runtime cost (see "Runtime cost" in level 3) is measured on
  the base and the head with the largest allowed input: peak memory, the
  number of threads and tasks, and the LLM calls and tokens. A timing for one
  user is not evidence for concurrent use. Ask for a concurrent test, without
  the LLM if possible, that measures CPU, memory, and I/O.

# Level 3: Design and correctness

## Design and architecture

- The change agrees with the design and the acceptance criteria. Each
  divergence has a reason that you can verify in the code.
- Shared logic is in the shared library. Logic for one consumer is in that
  consumer, also when it is a plugin.
- No override of upstream library code that is identical to the original.
  Copied third-party files keep the original code, unless they have a security
  problem.
- A generic API stays generic. Example: a key-value API accepts any key and
  does not list the keys of one caller.
- A change of a storage key, scope, or format lists its effects: stored data,
  other services that read the key, and open changes. Expiry times agree with
  the lifetime of the data that they belong to.

## Runtime cost: what the change does to the running service

Compare the base and the head for each code path that the change touches. The
question is what one request costs after the change compared with before, not
whether the code is efficient in general. State each change as a factor or a
count: "the head holds the file twice, the base once", "one task for each item,
without a limit; the base starts at most 4".

For one request on the head, compared with the base:

- **Memory:** how many copies of the large data exist at the same time (raw
  bytes, base64, parsed objects, the LLM request).
- **Parallel work:** how many tasks, threads, processes, sub-agents, or
  connections it starts. Does the number grow with the input (items, files,
  rows), and what limits it?
- **Proportionality:** does the work grow with the whole input, or only with
  the part that the request needs? Example: loading all 100,000 rows of a
  table when the request needs 10.
- **Repeated work:** is the same input read, parsed, or measured more than once
  in one request?
- **LLM calls:** how many calls and how many tokens. Retries count.
- **Hops:** how many agent and sub-agent round trips the common case (small
  input) takes. Extra hops for the most common case are a finding.
- **External calls:** how many calls, and whether each call makes a new client
  or connection pool.
- **Event loop:** new CPU-heavy work (parsing, rendering, data processing) in async
  code, outside `asyncio.to_thread`. It blocks all requests of the process.
- **What stays after the request:** caches, module-level dictionaries, session
  state, stored keys, artifacts, temporary files. Does it have a size limit or
  a TTL, or does it grow for the life of the process?

A change that grows with the input or with the concurrency is a finding. When
one process serves several requests at the same time, a factor for one request
applies to all of them at once. Find the concurrency limit and the largest
allowed input of the service.

## Settings and configuration

- A required setting has no default and is not optional. The service must fail
  at startup when the value is missing. This applies especially to base URLs.
- A default that exists agrees with prod, or with the standard paths in the
  container image.
- No duplicate of an existing setting or secret. Remove obsolete settings.
- Code reads values from the settings classes, not from environment variables.
- A value becomes a setting only when it differs between environments or must
  change without a deployment. Otherwise a named constant at the top of the
  module is enough.
- An optional integration, for example tracing, is skipped when it has no
  configuration. It does not fail on each call.
- A tool that needs a runtime dependency checks it at startup, not on each
  call.
- A feature behind a flag loses the condition when the feature is released.

## Correctness and error handling

- Catch only the errors that you expect, and log them, with
  `logger.exception` when the trace helps. An error that is caught and dropped
  hides the failure.
- A specific error type when an endpoint maps the error to a status code.
  Otherwise a real error can become a 404 by accident.
- Status codes: 422 for invalid input, 404 only when the resource does not
  exist. The endpoint maps errors to status codes, not the service. The request
  body is a validated model, so the framework rejects invalid input and the
  client sees the fields.
- External responses: a missing key gives a clear error or a default, not a
  `KeyError`. `.get(key) or None` is the same as `.get(key)`.
- An error message after a partial failure says what succeeded. Example: the
  order was saved, but the email failed.
- A validation that the LLM must fix returns all errors at once, not only the
  first.
- A cache key from the tool arguments returns stale data when the source data
  changes.
- A limit agrees with the real provider limit (for example the request size of
  the model provider), with a sensible margin. A limit far below it needs a
  reason.
- An estimate is correct for the inputs that occur. Example: the number of
  characters divided by four is only a rough token count.
  Judge whether precision matters: when the reactive error path covers a miss,
  an approximate estimate is enough.
- Edge cases: empty results, `None`, `0` as a valid value, file names that
  differ only in case, and a stated sort order.
- Middleware: the request body can be read only once.
- Async code: no missing `await` and no blocking I/O. Clients and values that
  do not change are created once, not on each call.
- Timeouts come from the global timeout settings. A timeout that hides an
  error is a finding.

## Security and authorization

- Check permissions, not roles.
- Calls use the user's access token. Do not add filters that duplicate or
  bypass the user's access.
- A user cannot set protected fields, for example the owner ID or the
  price.
- Validate URLs where they cross a trust boundary: tool arguments and
  application settings at startup. Do not validate the same URL again in each
  layer.
- Limit the size of content that comes from the LLM. Keep sensitive keys out
  of logs.

## Text for the LLM: tool descriptions, SKILL.md, instructions

- The tool docstring is the tool description. It uses the Google style,
  without `:type` and without an errors section. The LLM sees the type hints.
- The description does not mention a context parameter or other internals that
  the LLM cannot see.
- A large tool description is shorter, or the tool is deferred.
- A parameter that the LLM cannot get a value for is not in the interface.
- A default belongs in the code, not in the instructions. Example: "the last
  30 days" is the default of the function.
- Each instruction is necessary: ask whether someone saw the behaviour that it
  prevents. It does not repeat the system prompt. It is at the correct level:
  system prompt, skill, reference file, or tool description.
- New instructions do not contradict the existing instructions of the same
  agent, in any file, and do not lead the agent to the wrong tool. Examples:
  "do not search" next to a rule that pushes to the search tool; "done"
  can mean "merged" or "deployed".
- An error message for the LLM tells it how to fix the call, for example with
  a valid file name or the allowed range of a value. Each message is clearly for
  the LLM or for the logs.
- The agent recovers from a tool error itself. A tool-specific workaround is
  not in the agent instruction.

## Tests

- Ask for the fewest tests that fail when the change breaks, usually one for
  each change. A test that catches no break that other tests catch is a
  finding. A new test that also passes on the base catches nothing from this
  change. Mock only at boundaries: network, LLM, database, clock.
- Assertions check the content, not only that a value exists. Example: parse
  the returned JSON and check its fields, do not only check that it is there.
- Tests are not part of the shipped package.
- A commented-out test is removed, or has a comment that says why and when it
  comes back.
- Tests do not restate the code: a constant equals itself, a mock was called
  with the arguments that the code passes, a getter returns its field. The
  size of the tests fits the size of the change.

# Level 4: Style, reuse, and hygiene

Only for code that survives levels 1 to 3.

## Reuse

- Search the shared library and the repo for an existing helper before you
  accept new code.
- A pattern that occurs in two or more places becomes one helper.
- Duplicated code in the change becomes a private function. Two identical
  models become one. An extra base class without a second user goes away.
- A maintained library beats a deprecated API (example:
  `datetime.now(timezone.utc)` instead of the deprecated `datetime.utcnow()`).

## Code clarity

- Type hints say what the code really takes and returns. Linters check that
  they exist, not that they are correct.
- A fixed set of values is a `StrEnum`, not `(str, Enum)` or loose strings, and
  the code compares against the enum.
- Names say what the code does and agree with similar code, with one
  spelling for one thing.
- A changed behaviour has an updated docstring.
- Comments explain what is not obvious, for example a mapping between two
  libraries' levels, or why code is disabled. A useful comment or log line is
  not deleted without a reason.
- A shortcut has a comment that names its limit and the upgrade path, for
  example "linear scan; use an index above 10,000 items". Accept a
  marked shortcut. Do not ask for the full solution.
- A long method gives a repeated part to a helper. Do not ask for a helper
  with one caller.
- No dead code that the linters miss: unused functions, methods, settings, and
  branches that can no longer run.
- An ignored lint rule has a comment with the reason. Raise a limit instead of
  switching off a rule.

## Docs

- A changed behaviour, setting, or public API updates its doc. A new doc is
  linked from the `README.md`.
- Docs describe the current behaviour. They do not describe earlier iterations
  or name commits.
- Docs are short. They do not repeat code in snippets, and they do not read
  like unedited generated text.

## Scope and hygiene

- Each deleted line of code, config, or docs has a reason. Ask why.
- No change undoes an earlier fix, for example a typo that comes back or an
  older version number. This usually comes from a bad merge.
- A library change has a new version. A consumer that needs it raises its
  lower bound to that version. The library is released before the consumer.

# Output

Return only this:

```markdown
**Scope:** <base> → <head> for each repo, <n> files changed. **Checks:** <commands or pipeline, and results>
**Base check:** <does the problem exist on the base: reproduced | not reproduced | not checked, and why>
**Simpler alternative:** <the smallest or reactive fix and its trade-off, or "none">

| ID | Level | Severity | Label | Trigger | Depends on | File:line | Comment | Evidence |
|---|---|---|---|---|---|---|---|---|
| F1 | 1 | major | code reading | <realistic input or scenario> | — | <repo>/src/app/x.py:42 | <the comment text> | <why: code, commit, helper path, rule> |

**Replies to open threads:** <thread ID: the new evidence, or "none">

**Claims that need a run:** <one line for each: the claim, the inputs, base and head>

**Verdict:** <CHANGES_REQUESTED | READY> — <one sentence>.
```

Level: 1 to 4, as above. Severity follows likelihood times impact: `blocker` (a
bug, a security problem, data loss, a runtime cost that grows without a limit,
a failing check, a missing required test), `major` (an unnecessary or oversized
change, including redundant tests, a divergence without a reason, missing
reuse, a wrong setting, an unclear LLM instruction), `minor` (naming, docs,
small simplification; the comment starts with `(optional)`), `question` (you
need the author's answer to judge). Label: `observed` when a run showed it,
`code reading` otherwise. Depends on: the ID of a higher-level finding that
removes this one when the author accepts it, or `—`. Report only what you want
fixed or answered. Do not praise.

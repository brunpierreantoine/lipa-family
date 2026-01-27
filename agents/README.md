# Project-Local Agents

This directory contains IDE-agnostic, version-controlled agents for the `kids-story-ai` project. These agents provide specialized assistance for UX reviews and frontend implementation.

## Available Agents

| Agent Name | File | Aliases | Description |
| :--- | :--- | :--- | :--- |
| **UX Reviewer** | [ux-reviewer.md](ux-reviewer.md) | `ux`, `mobile-ux`, `design-review` | Mobile-first UX reviews focused on conversion and clarity. |
| **Frontend Implementer** | [frontend-implementer.md](frontend-implementer.md) | `fe`, `implementer`, `frontend` | Senior Next.js engineer for implementing approved changes. |
| **Debugger / Lint Fixer** | [debugger-lint-fixer.md](debugger-lint-fixer.md) | `debug`, `lint`, `fixer`, `bugfix` | Diagnosing and fixing runtime, TypeScript, and ESLint errors. |

## How to Use

You can invoke these agents in natural language by referring to their name or aliases.

**Example Prompts:**

* "Ask the **ux-reviewer** to look at the new landing page design."
* "Hey **fe**, please implement the changes suggested in the UX review."
* "Run a **design-review** on the user settings component."
* "Use the **frontend-implementer** to add a new button to the header."

## Documentation Tasks

Documentation-related tasks (e.g., creating or improving READMEs) should be handled by:

* **Frontend Implementer:** When the documentation is implementation-adjacent.
* Explicitly requesting documentation work using the `crafting-effective-readmes` skill through the Frontend Implementer.

## Skill Discovery

These agents rely on globally installed skills located in `~/.agents/skills/`. They dynamically discover relevant skills using the `find-skills` tool when needed.

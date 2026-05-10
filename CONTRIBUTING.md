# 🤝 Contributing to DailyForge

> **DailyForge** is an active open-source project participating in **GSSoC 2026**.  
> This document is not a suggestion — it is the standard. All contributions must comply with it.  
> Read it fully before writing a single line of code.

---

## 🚀 Getting Started

**Before anything else:**

1. Read the [README.md](README.md) completely — it covers setup, project structure, and environment variables.
2. Make sure your local environment is fully working before picking an issue.
3. If setup fails, check existing [GitHub Issues](https://github.com/aryandas2911/DailyForge/issues) before opening a new one.

**Finding issues to work on:**

- Browse [open issues](https://github.com/aryandas2911/DailyForge/issues)
- **New contributors must start with `good first issue` labeled issues** — do not jump to `feature` or complex `bug` issues on your first contribution
- Filter by label to find the right issue for your skill level
- Read the issue description fully before commenting

---

## 📌 Issue Assignment Rules

These rules exist to keep the project moving efficiently. They are strictly enforced.

- **One issue per contributor at a time.** Do not request a second issue until your first PR is merged.
- **You must comment on the issue and wait for assignment** before starting any work. Unassigned PRs will be closed.
- **Do not open a PR for an issue assigned to someone else.**
- **Inactivity policy:** If you are assigned an issue and show no progress (no commits, no updates) within **3 days**, you will be automatically unassigned and the issue will be reopened. No exceptions.
- If you need more time, comment on the issue before the deadline — not after.

> ⚠️ PRs submitted for issues you were not assigned to will be **closed immediately** without review.

---

## 🌿 Branch Naming Convention

All branches must follow this naming convention. PRs from non-conforming branch names will be asked to rename.

```
<type>/<short-hyphenated-description>
```

| Type | When to use | Example |
|------|------------|---------|
| `feature` | Adding new functionality | `feature/dark-mode-toggle` |
| `fix` | Fixing a bug | `fix/login-redirect-loop` |
| `docs` | Documentation changes only | `docs/update-contributing` |
| `refactor` | Code restructuring, no behavior change | `refactor/task-hook-cleanup` |
| `style` | CSS/UI-only changes, no logic | `style/navbar-spacing` |
| `test` | Adding or fixing tests | `test/auth-controller-unit` |

**Rules:**
- Always branch off from `main` (or the branch specified in the issue)
- Keep branch names lowercase and hyphen-separated
- No generic names like `patch-1`, `my-fix`, or `update`

```bash
# Example
git checkout main
git pull origin main
git checkout -b fix/routine-overlap-detection
```

---

## 💬 Commit Message Guidelines

DailyForge follows the **[Conventional Commits](https://www.conventionalcommits.org/)** specification. Every commit message must follow this format:

```
<type>: <short imperative description>
```

**Allowed types:**

| Type | Purpose |
|------|---------|
| `feat` | New feature or functionality |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `refactor` | Code restructure without behavior change |
| `style` | Formatting, CSS, no logic change |
| `chore` | Build config, dependencies, tooling |

**Real examples:**

```
feat: add overlap detection for same-day tasks
fix: resolve JWT token expiry not clearing localStorage
docs: update quick start steps in README
refactor: extract task validation logic into utility function
style: align routine cards in dashboard grid view
```

**Rules:**
- Use **present tense**, imperative mood — *"add"* not *"added"* or *"adds"*
- Keep the description under 72 characters
- Do not end with a period
- Do not use vague messages like `"fixed stuff"`, `"update"`, or `"changes"`

> ❌ `git commit -m "update"` → Rejected  
> ✅ `git commit -m "fix: prevent duplicate routine save on double-click"` → Accepted

---

## 🔧 Development Workflow

Follow this workflow **exactly**. Skipping steps leads to rejected PRs.

```
Fork → Clone → Branch → Code → Test Locally → Push → Open PR
```

### Step-by-step

**1. Fork the repository**  
Click **Fork** on [github.com/aryandas2911/DailyForge](https://github.com/aryandas2911/DailyForge)

**2. Clone your fork**
```bash
git clone https://github.com/<your-username>/DailyForge.git
cd DailyForge
```

**3. Create a branch**
```bash
git checkout -b <type>/<description>
```

**4. Make your changes**  
- Follow the project structure — do not create files in arbitrary locations
- Do not install new dependencies without discussing in the issue first
- Do not modify files unrelated to your issue

**5. Test locally — mandatory**
- Run the full app (backend + frontend) and verify your change works
- Run `npm run lint` in the `frontend/` directory and fix all errors
- Confirm no existing features are broken

**6. Commit and push**
```bash
git add .
git commit -m "feat: your meaningful message here"
git push origin <your-branch-name>
```

**7. Open a Pull Request**  
Open a PR from your fork to `main` on the original repo.

---

## 📥 Pull Request Guidelines

**A PR that does not meet these requirements will be closed without review.**

### Every PR must include:

- ✅ **Clear description** of what was changed and why
- ✅ **Linked issue** using `Closes #<issue-number>` in the PR description
- ✅ **Screenshots or screen recordings** if the change affects the UI in any way
- ✅ **Local test confirmation** — state that you ran the app and tested your change
- ✅ **Focused scope** — one issue, one PR. Do not bundle unrelated changes

## 🔗 PR Template

**You must use the PR template.** PRs submitted without it will be rejected.

When you open a PR, the template will be auto-populated. Fill out every section:

```markdown
## Description
<!-- What does this PR do? Why? -->

## Related Issue
Closes #<issue-number>

## Changes Made
<!-- Bullet list of specific changes -->
- 
- 

## Screenshots (if UI changes)
<!-- Attach before/after screenshots -->

## Checklist
- [ ] I have read CONTRIBUTING.md
- [ ] My branch follows the naming convention
- [ ] I have tested this locally
- [ ] Linting passes (`npm run lint` in frontend/)
- [ ] No unrelated files were modified
- [ ] Screenshots are attached (if UI change)
```

> PRs with empty descriptions, unchecked checklists, or missing issue links will be **closed immediately**.

---

## 🔍 Code Review Process

- Maintainers review PRs **line-by-line** — code quality is taken seriously
- You may be asked to **explain your logic** for a specific implementation decision
- Respond to all review comments before requesting a re-review
- Do not resolve review comments yourself unless explicitly told to
- Do not merge your own PR

**A PR may be rejected if:**
- The logic is unclear or overly complex without justification
- Code quality is below the existing standard
- React best practices are not followed (unnecessary re-renders, improper state management, etc.)
- Backend routes are not protected with `authMiddleware` where required
- Hardcoded values appear where they shouldn't (secrets, magic numbers, URLs)

---

## ⏱ Review Timeline

- PRs are typically reviewed within **24–48 hours** of submission
- Reviews may take longer during high-activity periods (GSSoC peak weeks)
- **Do not ping maintainers repeatedly.** One reminder after 48 hours is acceptable. Repeated unnecessary pings will be noted.
- If your PR has been waiting more than 3 days, leave a single polite comment on the PR — do not DM or open duplicate issues

---

## 🎨 Code Style Guidelines

### General
- Follow the existing code patterns — look at similar files before creating new ones
- Keep functions small and single-purpose
- Name variables and functions descriptively — `handleTaskDelete` not `htd`
- No magic numbers — use named constants

### Frontend (React)
- Use functional components only — no class components
- Manage state with `useState` / `useContext` / custom hooks — no prop drilling more than 2 levels
- Place reusable logic in `src/hooks/` or `src/utils/`
- New components go in `src/components/` under the appropriate subfolder
- New pages go in `src/pages/`
- Do not write inline styles — use Tailwind CSS classes

### Backend (Node/Express)
- All business logic goes in `controllers/` — keep routes thin
- All protected routes must use `authMiddleware`
- Use `async/await` with proper `try/catch` blocks — no unhandled promise rejections
- Mongoose models go in `src/models/`
- Return consistent JSON response shapes: `{ success, message, data }`

### Security
- **Never hardcode secrets, API keys, or credentials** — use `backend/.env`
- Never commit `.env` files
- Validate and sanitize all user inputs on the backend

---

## ❌ What Will Get Your PR Rejected

No ambiguity here. Your PR **will be closed** if:

| Violation | Result |
|-----------|--------|
| No linked issue | Closed immediately |
| PR not following the PR template | Closed immediately |
| Issue was not assigned to you | Closed immediately |
| Copied code without understanding | Closed with feedback |
| No explanation of logic when asked | Closed after no response in 48h |
| Breaking existing functionality | Closed, must fix and resubmit |
| Unrelated files modified | Closed, must clean up |
| Ignoring review feedback | Closed after no response in 72h |
| Adding unnecessary dependencies | Closed with feedback |
| Hardcoded secrets or API keys | Closed immediately |

---

## 🏷 Labels Guide

| Label | Meaning | Who should pick it |
|-------|---------|-------------------|
| `good first issue` | Small, well-scoped, documented — ideal for first-time contributors | First-time contributors |
| `bug` | Confirmed broken behavior | Intermediate contributors |
| `feature` | New functionality — may require architecture decisions | Experienced contributors |
| `documentation` | README, guides, inline comments | Anyone |
| `help wanted` | Maintainers need external input or hands | Experienced contributors |
| `testing` | Adding or improving test coverage | Anyone comfortable with testing |

**New contributors:** Do not skip `good first issue`. It exists for a reason — it's where you prove you understand the workflow before taking on harder tasks.

---

## 🔥 Enforcement Policy

These rules are **actively enforced**. This is not boilerplate.

- **First low-quality PR:** Closed with feedback and a link back to this document
- **Second violation of the same rule:** Closed with minimal comment
- **Pattern of low-effort contributions or bad-faith behavior:** Contributor will be disengaged from the project
- Maintainers reserve the right to close any PR that does not meet the standards described here, without detailed explanation

If you receive feedback, act on it. If you disagree, discuss it professionally in the PR comments.

---

## 🤝 Code of Conduct

- Treat all contributors and maintainers with respect
- Disagreements are resolved through discussion, not dismissiveness
- No spam in issues or PRs (e.g., `+1` comments, empty reactions fishing for attention)
- Constructive feedback only — critique the code, not the person
- Harassment, discrimination, or bad-faith behavior of any kind will result in immediate removal

---

<div align="center">

*Built with ❤️ for GSSoC 2026 — DailyForge*

</div>

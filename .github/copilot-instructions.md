# Copilot Instructions for `thunder`

## Build, test, and lint commands

This repository is a static HTML prototype set. There is no package manager manifest (`package.json`), no test framework config, and no lint config in-repo.

| Task | Command | Notes |
| --- | --- | --- |
| Preview locally | `python -m http.server 8000` | Run from `E:\work\thunder`, then open `http://localhost:8000`. |
| Open main showcase directly (Windows) | `Start-Process .\index.html` | Opens static showcase without a build step. |
| Full test suite | _Not available_ | No automated tests are configured in this repo. |
| Single test | _Not available_ | No test runner exists; validate by opening target HTML page(s). |
| Lint | _Not available_ | No lint tooling is configured in this repo. |

## High-level architecture

- **Root showcase (`index.html`)** is the primary UX entry point.  
  It presents feature previews for two domains: **Renter Operations** and **Driver Experience**.

- **Feature implementation is split by role**:
  - `driver/<feature>/code.html`
  - `renter/<feature>/code.html`

- **Flattened mirrors for role-specific browsing**:
  - `driver/htmls/<feature>.html`
  - `renter/htmls/<feature>.html`
  These are mirrored copies of each feature `code.html` and currently match 1:1.

- **Image assets are role-scoped**:
  - `driver/images/*.png`
  - `renter/images/*.png`
  `index.html` cards render these screenshots in Swiper carousels and open them in a lightbox.

- **Separate feasibility tool**:
  - `feas/index.html` is an independent financial simulation dashboard (Chart.js + html2canvas), distinct from the UI showcase pages.

- **Business context document**:
  - `docs/Businiess_plan.md` provides product/business framing (Thai-language plan and personas) that aligns with the showcased flows.

## Key conventions in this codebase

- **Self-contained pages**: each feature page is standalone HTML with inline styles/scripts and CDN dependencies (no shared local JS/CSS modules).

- **Tailwind via CDN per page**: many pages include `https://cdn.tailwindcss.com` and define page-local `tailwind.config` with custom `primary` + background colors.

- **Mirrored file workflow**: when changing a feature page, update both:
  - `<role>/<feature>/code.html`
  - `<role>/htmls/<feature>.html`
  Keep them byte-equivalent unless intentionally changing publication behavior.

- **Naming scheme carries UX/state cues**: feature folders often include suffixes like `_yellow` / `_navy`, and names are snake_case across both roles.

- **Bilingual/UI copy context**: Thai and English are both present (especially root showcase, feasibility dashboard, and docs). Preserve existing language tone per surface when editing.

## MCP server configuration (web UI automation)

- Repository includes `.vscode/mcp.json` with a **Playwright MCP** server for browser-driven validation flows.
- Start from VS Code/Copilot Agent tools, or use Copilot CLI and add equivalent config via `/mcp add`.
- Requires Node.js/NPM available in developer environment (`npx @playwright/mcp@latest`).

| File | Changes |
|------|---------|
| _bmad-output/implementation-artifacts/1-3-implement-organization-workspace-selection-and-active-context.md | - Marked Story 1.3 as review with all tasks checked off and completion notes recorded.<br>- Documented implemented workspace context, selection flow, route boundary behavior, and verification commands. |
| _bmad-output/implementation-artifacts/1-4-build-the-shared-application-shell-and-navigation-context.md | - Marked Story 1.4 as review with all tasks checked off and completion notes recorded.<br>- Documented route-level shell layout, breadcrumb normalization, and navigation smoke coverage. |
| _bmad-output/implementation-artifacts/1-5-establish-frontend-quality-guardrails-and-smoke-coverage.md | - Marked Story 1.5 as review with all tasks checked off and completion notes recorded.<br>- Documented new smoke tests, accessibility checks, lazy route loading, and baseline quality commands. |
| _bmad-output/implementation-artifacts/sprint-status.yaml | - Updated sprint metadata timestamp and moved Stories 1.3–1.5 to review. |
| apps/web/README.md | - Replaced the Vite template README with repo-specific install/dev/test/lint instructions and env var guidance. |
| apps/web/src/app/layouts/AppShellLayout.tsx | - Added a shared route layout that resolves breadcrumbs and wraps pages in the application shell. |
| apps/web/src/app/organizations/OrganizationProvider.tsx | - Added a Clerk Organizations-backed context exposing active workspace, available workspaces, and a setter. |
| apps/web/src/app/providers/AppProviders.tsx | - Wrapped the app provider stack with the new OrganizationProvider so workspace context is available globally. |
| apps/web/src/app/routes/OrganizationBoundary.tsx | - Added an org-scoped route boundary that enforces an active workspace, auto-selects single orgs, and redirects multi-org users. |
| apps/web/src/app/routes/route-config.tsx | - Introduced Suspense + lazy-loaded page routes and a shared fallback for route loading.<br>- Nested protected routes under OrganizationBoundary and AppShellLayout to centralize shell and workspace enforcement. |
| apps/web/src/components/shell/AppShell.tsx | - Updated the shell header to show active workspace context and render the Clerk OrganizationSwitcher when needed. |
| apps/web/src/components/shell/AppSidebar.tsx | - Updated sidebar branding to display the active workspace name instead of hardcoded demo text. |
| apps/web/src/routes/pages/AIReview.tsx | - Removed per-page AppShell wrapper so the page renders inside the shared AppShellLayout. |
| apps/web/src/routes/pages/AdminGovernance.tsx | - Removed per-page AppShell wrapper so the page renders inside the shared AppShellLayout.<br>- Replaced hardcoded route strings with appPaths helpers for navigation links. |
| apps/web/src/routes/pages/BatchesList.tsx | - Removed per-page AppShell wrapper so the page renders inside the shared AppShellLayout.<br>- Replaced hardcoded route strings with appPaths helpers for navigation links. |
| apps/web/src/routes/pages/CreateBatch.tsx | - Removed per-page AppShell wrapper so the page renders inside the shared AppShellLayout.<br>- Replaced hardcoded route strings with appPaths helpers for navigation links. |
| apps/web/src/routes/pages/Dashboard.tsx | - Removed per-page AppShell wrapper so the page renders inside the shared AppShellLayout.<br>- Replaced hardcoded route strings with appPaths helpers for navigation links. |
| apps/web/src/routes/pages/FailureRecovery.tsx | - Removed per-page AppShell wrapper so the page renders inside the shared AppShellLayout. |
| apps/web/src/routes/pages/ImagePlan.tsx | - Removed per-page AppShell wrapper so the page renders inside the shared AppShellLayout. |
| apps/web/src/routes/pages/IntakeMapping.tsx | - Removed per-page AppShell wrapper so the page renders inside the shared AppShellLayout.<br>- Replaced hardcoded route strings with appPaths helpers for navigation links. |
| apps/web/src/routes/pages/RowInspector.tsx | - Removed per-page AppShell wrapper so the page renders inside the shared AppShellLayout.<br>- Replaced hardcoded route strings with appPaths helpers for navigation links. |
| apps/web/src/routes/pages/SavedViews.tsx | - Removed per-page AppShell wrapper so the page renders inside the shared AppShellLayout. |
| apps/web/src/routes/pages/SellerDefaults.tsx | - Removed per-page AppShell wrapper so the page renders inside the shared AppShellLayout. |
| apps/web/src/routes/pages/StatesShowcase.tsx | - Removed per-page AppShell wrapper so the page renders inside the shared AppShellLayout. |
| apps/web/src/routes/pages/SubmissionMonitor.tsx | - Removed per-page AppShell wrapper so the page renders inside the shared AppShellLayout.<br>- Replaced hardcoded route strings with appPaths helpers for navigation links. |
| apps/web/src/routes/pages/SubmissionScope.tsx | - Removed per-page AppShell wrapper so the page renders inside the shared AppShellLayout.<br>- Replaced hardcoded route strings with appPaths helpers for navigation links. |
| apps/web/src/routes/pages/SupportInvestigation.tsx | - Removed per-page AppShell wrapper so the page renders inside the shared AppShellLayout. |
| apps/web/src/routes/pages/TriageWorkspace.tsx | - Removed per-page AppShell wrapper so the page renders inside the shared AppShellLayout.<br>- Replaced hardcoded route strings with appPaths helpers for navigation links. |
| apps/web/src/routes/pages/WorkspaceSelect.tsx | - Replaced mock workspace cards with real workspace selection driven by Clerk organization membership.<br>- Implemented async set-active behavior with pending state and return-to redirect handling. |
| apps/web/src/test/a11y-smoke.test.tsx | - Added accessibility-focused smoke tests for the auth entry and workspace resolution status messaging. |
| apps/web/src/test/app-routing.test.tsx | - Expanded routing smoke tests to cover workspace selection, org-scoped routing, and OrganizationProvider integration. |
| apps/web/src/test/example.test.ts | - Removed the placeholder example test in favor of meaningful smoke coverage. |
| apps/web/src/test/shell-navigation.test.tsx | - Added smoke tests ensuring shared shell navigation renders and avoids hardcoded entity deep links. |
| apps/web/src/test/workspace-selection.test.tsx | - Added tests for selecting an active workspace and auto-selecting when only one workspace exists. |
| node_modules/.bin/acorn | - Adjusted executable permissions for the acorn shim inside node_modules. |
| node_modules/.bin/acorn.cmd | - Adjusted executable permissions for the acorn.cmd shim inside node_modules. |
| node_modules/.bin/acorn.ps1 | - Adjusted executable permissions for the acorn.ps1 shim inside node_modules. |
| node_modules/.bin/autoprefixer | - Adjusted executable permissions for the autoprefixer shim inside node_modules. |
| node_modules/.bin/autoprefixer.cmd | - Adjusted executable permissions for the autoprefixer.cmd shim inside node_modules. |
| node_modules/.bin/autoprefixer.ps1 | - Adjusted executable permissions for the autoprefixer.ps1 shim inside node_modules. |
| node_modules/.bin/baseline-browser-mapping | - Adjusted executable permissions for the baseline-browser-mapping shim inside node_modules. |
| node_modules/.bin/baseline-browser-mapping.cmd | - Adjusted executable permissions for the baseline-browser-mapping.cmd shim inside node_modules. |
| node_modules/.bin/baseline-browser-mapping.ps1 | - Adjusted executable permissions for the baseline-browser-mapping.ps1 shim inside node_modules. |
| node_modules/.bin/browserslist | - Adjusted executable permissions for the browserslist shim inside node_modules. |
| node_modules/.bin/browserslist.cmd | - Adjusted executable permissions for the browserslist.cmd shim inside node_modules. |
| node_modules/.bin/browserslist.ps1 | - Adjusted executable permissions for the browserslist.ps1 shim inside node_modules. |
| node_modules/.bin/cssesc | - Adjusted executable permissions for the cssesc shim inside node_modules. |
| node_modules/.bin/cssesc.cmd | - Adjusted executable permissions for the cssesc.cmd shim inside node_modules. |
| node_modules/.bin/cssesc.ps1 | - Adjusted executable permissions for the cssesc.ps1 shim inside node_modules. |
| node_modules/.bin/esbuild | - Adjusted executable permissions for the esbuild shim inside node_modules. |
| node_modules/.bin/esbuild.cmd | - Adjusted executable permissions for the esbuild.cmd shim inside node_modules. |
| node_modules/.bin/esbuild.ps1 | - Adjusted executable permissions for the esbuild.ps1 shim inside node_modules. |
| node_modules/.bin/escodegen | - Adjusted executable permissions for the escodegen shim inside node_modules. |
| node_modules/.bin/escodegen.cmd | - Adjusted executable permissions for the escodegen.cmd shim inside node_modules. |
| node_modules/.bin/escodegen.ps1 | - Adjusted executable permissions for the escodegen.ps1 shim inside node_modules. |
| node_modules/.bin/esgenerate | - Adjusted executable permissions for the esgenerate shim inside node_modules. |
| node_modules/.bin/esgenerate.cmd | - Adjusted executable permissions for the esgenerate.cmd shim inside node_modules. |
| node_modules/.bin/esgenerate.ps1 | - Adjusted executable permissions for the esgenerate.ps1 shim inside node_modules. |
| node_modules/.bin/eslint | - Adjusted executable permissions for the eslint shim inside node_modules. |
| node_modules/.bin/eslint.cmd | - Adjusted executable permissions for the eslint.cmd shim inside node_modules. |
| node_modules/.bin/eslint.ps1 | - Adjusted executable permissions for the eslint.ps1 shim inside node_modules. |
| node_modules/.bin/esparse | - Adjusted executable permissions for the esparse shim inside node_modules. |
| node_modules/.bin/esparse.cmd | - Adjusted executable permissions for the esparse.cmd shim inside node_modules. |
| node_modules/.bin/esparse.ps1 | - Adjusted executable permissions for the esparse.ps1 shim inside node_modules. |
| node_modules/.bin/esvalidate | - Adjusted executable permissions for the esvalidate shim inside node_modules. |
| node_modules/.bin/esvalidate.cmd | - Adjusted executable permissions for the esvalidate.cmd shim inside node_modules. |
| node_modules/.bin/esvalidate.ps1 | - Adjusted executable permissions for the esvalidate.ps1 shim inside node_modules. |
| node_modules/.bin/jiti | - Adjusted executable permissions for the jiti shim inside node_modules. |
| node_modules/.bin/jiti.cmd | - Adjusted executable permissions for the jiti.cmd shim inside node_modules. |
| node_modules/.bin/jiti.ps1 | - Adjusted executable permissions for the jiti.ps1 shim inside node_modules. |
| node_modules/.bin/js-yaml | - Adjusted executable permissions for the js-yaml shim inside node_modules. |
| node_modules/.bin/js-yaml.cmd | - Adjusted executable permissions for the js-yaml.cmd shim inside node_modules. |
| node_modules/.bin/js-yaml.ps1 | - Adjusted executable permissions for the js-yaml.ps1 shim inside node_modules. |
| node_modules/.bin/jsesc | - Adjusted executable permissions for the jsesc shim inside node_modules. |
| node_modules/.bin/jsesc.cmd | - Adjusted executable permissions for the jsesc.cmd shim inside node_modules. |
| node_modules/.bin/jsesc.ps1 | - Adjusted executable permissions for the jsesc.ps1 shim inside node_modules. |
| node_modules/.bin/json5 | - Adjusted executable permissions for the json5 shim inside node_modules. |
| node_modules/.bin/json5.cmd | - Adjusted executable permissions for the json5.cmd shim inside node_modules. |
| node_modules/.bin/json5.ps1 | - Adjusted executable permissions for the json5.ps1 shim inside node_modules. |
| node_modules/.bin/loose-envify | - Adjusted executable permissions for the loose-envify shim inside node_modules. |
| node_modules/.bin/loose-envify.cmd | - Adjusted executable permissions for the loose-envify.cmd shim inside node_modules. |
| node_modules/.bin/loose-envify.ps1 | - Adjusted executable permissions for the loose-envify.ps1 shim inside node_modules. |
| node_modules/.bin/lz-string | - Adjusted executable permissions for the lz-string shim inside node_modules. |
| node_modules/.bin/lz-string.cmd | - Adjusted executable permissions for the lz-string.cmd shim inside node_modules. |
| node_modules/.bin/lz-string.ps1 | - Adjusted executable permissions for the lz-string.ps1 shim inside node_modules. |
| node_modules/.bin/nanoid | - Adjusted executable permissions for the nanoid shim inside node_modules. |
| node_modules/.bin/nanoid.cmd | - Adjusted executable permissions for the nanoid.cmd shim inside node_modules. |
| node_modules/.bin/nanoid.ps1 | - Adjusted executable permissions for the nanoid.ps1 shim inside node_modules. |
| node_modules/.bin/node-which | - Adjusted executable permissions for the node-which shim inside node_modules. |
| node_modules/.bin/node-which.cmd | - Adjusted executable permissions for the node-which.cmd shim inside node_modules. |
| node_modules/.bin/node-which.ps1 | - Adjusted executable permissions for the node-which.ps1 shim inside node_modules. |
| node_modules/.bin/parser | - Adjusted executable permissions for the parser shim inside node_modules. |
| node_modules/.bin/parser.cmd | - Adjusted executable permissions for the parser.cmd shim inside node_modules. |
| node_modules/.bin/parser.ps1 | - Adjusted executable permissions for the parser.ps1 shim inside node_modules. |
| node_modules/.bin/resolve | - Adjusted executable permissions for the resolve shim inside node_modules. |
| node_modules/.bin/resolve.cmd | - Adjusted executable permissions for the resolve.cmd shim inside node_modules. |
| node_modules/.bin/resolve.ps1 | - Adjusted executable permissions for the resolve.ps1 shim inside node_modules. |
| node_modules/.bin/rollup | - Adjusted executable permissions for the rollup shim inside node_modules. |
| node_modules/.bin/rollup.cmd | - Adjusted executable permissions for the rollup.cmd shim inside node_modules. |
| node_modules/.bin/rollup.ps1 | - Adjusted executable permissions for the rollup.ps1 shim inside node_modules. |
| node_modules/.bin/semver | - Adjusted executable permissions for the semver shim inside node_modules. |
| node_modules/.bin/semver.cmd | - Adjusted executable permissions for the semver.cmd shim inside node_modules. |
| node_modules/.bin/semver.ps1 | - Adjusted executable permissions for the semver.ps1 shim inside node_modules. |
| node_modules/.bin/sucrase | - Adjusted executable permissions for the sucrase shim inside node_modules. |
| node_modules/.bin/sucrase-node | - Adjusted executable permissions for the sucrase-node shim inside node_modules. |
| node_modules/.bin/sucrase-node.cmd | - Adjusted executable permissions for the sucrase-node.cmd shim inside node_modules. |
| node_modules/.bin/sucrase-node.ps1 | - Adjusted executable permissions for the sucrase-node.ps1 shim inside node_modules. |
| node_modules/.bin/sucrase.cmd | - Adjusted executable permissions for the sucrase.cmd shim inside node_modules. |
| node_modules/.bin/sucrase.ps1 | - Adjusted executable permissions for the sucrase.ps1 shim inside node_modules. |
| node_modules/.bin/tailwind | - Adjusted executable permissions for the tailwind shim inside node_modules. |
| node_modules/.bin/tailwind.cmd | - Adjusted executable permissions for the tailwind.cmd shim inside node_modules. |
| node_modules/.bin/tailwind.ps1 | - Adjusted executable permissions for the tailwind.ps1 shim inside node_modules. |
| node_modules/.bin/tailwindcss | - Adjusted executable permissions for the tailwindcss shim inside node_modules. |
| node_modules/.bin/tailwindcss.cmd | - Adjusted executable permissions for the tailwindcss.cmd shim inside node_modules. |
| node_modules/.bin/tailwindcss.ps1 | - Adjusted executable permissions for the tailwindcss.ps1 shim inside node_modules. |
| node_modules/.bin/tsc | - Adjusted executable permissions for the tsc shim inside node_modules. |
| node_modules/.bin/tsc.cmd | - Adjusted executable permissions for the tsc.cmd shim inside node_modules. |
| node_modules/.bin/tsc.ps1 | - Adjusted executable permissions for the tsc.ps1 shim inside node_modules. |
| node_modules/.bin/tsserver | - Adjusted executable permissions for the tsserver shim inside node_modules. |
| node_modules/.bin/tsserver.cmd | - Adjusted executable permissions for the tsserver.cmd shim inside node_modules. |
| node_modules/.bin/tsserver.ps1 | - Adjusted executable permissions for the tsserver.ps1 shim inside node_modules. |
| node_modules/.bin/update-browserslist-db | - Adjusted executable permissions for the update-browserslist-db shim inside node_modules. |
| node_modules/.bin/update-browserslist-db.cmd | - Adjusted executable permissions for the update-browserslist-db.cmd shim inside node_modules. |
| node_modules/.bin/update-browserslist-db.ps1 | - Adjusted executable permissions for the update-browserslist-db.ps1 shim inside node_modules. |
| node_modules/.bin/vite | - Adjusted executable permissions for the vite shim inside node_modules. |
| node_modules/.bin/vite-node | - Adjusted executable permissions for the vite-node shim inside node_modules. |
| node_modules/.bin/vite-node.cmd | - Adjusted executable permissions for the vite-node.cmd shim inside node_modules. |
| node_modules/.bin/vite-node.ps1 | - Adjusted executable permissions for the vite-node.ps1 shim inside node_modules. |
| node_modules/.bin/vite.cmd | - Adjusted executable permissions for the vite.cmd shim inside node_modules. |
| node_modules/.bin/vite.ps1 | - Adjusted executable permissions for the vite.ps1 shim inside node_modules. |
| node_modules/.bin/vitest | - Adjusted executable permissions for the vitest shim inside node_modules. |
| node_modules/.bin/vitest.cmd | - Adjusted executable permissions for the vitest.cmd shim inside node_modules. |
| node_modules/.bin/vitest.ps1 | - Adjusted executable permissions for the vitest.ps1 shim inside node_modules. |
| node_modules/.bin/why-is-node-running | - Adjusted executable permissions for the why-is-node-running shim inside node_modules. |
| node_modules/.bin/why-is-node-running.cmd | - Adjusted executable permissions for the why-is-node-running.cmd shim inside node_modules. |
| node_modules/.bin/why-is-node-running.ps1 | - Adjusted executable permissions for the why-is-node-running.ps1 shim inside node_modules. |
| node_modules/.package-lock.json | - Updated the generated npm lockfile metadata (including platform-specific optional packages). |
| node_modules/@bulk-sku-creator/web/.env.example | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/.gitignore | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/README.md | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/components.json | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/eslint.config.js | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/index.html | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/package.json | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/postcss.config.js | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/public/favicon.ico | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/public/favicon.svg | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/public/icons.svg | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/public/placeholder.svg | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/public/robots.txt | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/app/App.tsx | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/app/providers/AppProviders.tsx | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/app/providers/clerk.ts | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/app/routes/ProtectedRoute.tsx | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/app/routes/paths.ts | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/app/routes/route-config.tsx | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/components/AppShell.tsx | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/components/AppSidebar.tsx | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/components/NavLink.tsx | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/components/StatusChip.tsx | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/components/shell/AppShell.tsx | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/components/shell/AppSidebar.tsx | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/components/ui/accordion.tsx | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/components/ui/alert-dialog.tsx | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/components/ui/alert.tsx | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/components/ui/aspect-ratio.tsx | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/components/ui/avatar.tsx | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/components/ui/badge.tsx | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/components/ui/breadcrumb.tsx | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/components/ui/button.tsx | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/components/ui/calendar.tsx | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/components/ui/card.tsx | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/components/ui/carousel.tsx | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/components/ui/chart.tsx | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/components/ui/checkbox.tsx | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/components/ui/collapsible.tsx | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/components/ui/command.tsx | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/components/ui/context-menu.tsx | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/components/ui/dialog.tsx | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/components/ui/drawer.tsx | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/components/ui/dropdown-menu.tsx | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/components/ui/form.tsx | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/components/ui/hover-card.tsx | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/components/ui/input-otp.tsx | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/components/ui/input.tsx | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/components/ui/label.tsx | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/components/ui/menubar.tsx | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/components/ui/navigation-menu.tsx | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/components/ui/pagination.tsx | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/components/ui/popover.tsx | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/components/ui/progress.tsx | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/components/ui/radio-group.tsx | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/components/ui/resizable.tsx | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/components/ui/scroll-area.tsx | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/components/ui/select.tsx | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/components/ui/separator.tsx | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/components/ui/sheet.tsx | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/components/ui/sidebar.tsx | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/components/ui/skeleton.tsx | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/components/ui/slider.tsx | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/components/ui/sonner.tsx | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/components/ui/switch.tsx | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/components/ui/table.tsx | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/components/ui/tabs.tsx | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/components/ui/textarea.tsx | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/components/ui/toast.tsx | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/components/ui/toaster.tsx | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/components/ui/toggle-group.tsx | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/components/ui/toggle.tsx | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/components/ui/tooltip.tsx | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/components/ui/use-toast.ts | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/data/mock.ts | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/hooks/use-mobile.tsx | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/hooks/use-toast.ts | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/index.css | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/lib/api-client/index.ts | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/lib/mocks/prototype-data.ts | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/lib/mocks/route-defaults.ts | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/lib/query/queryClient.ts | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/lib/utils.ts | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/main.tsx | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/routes/pages/AIReview.tsx | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/routes/pages/AdminGovernance.tsx | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/routes/pages/Auth.tsx | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/routes/pages/BatchesList.tsx | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/routes/pages/CreateBatch.tsx | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/routes/pages/Dashboard.tsx | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/routes/pages/FailureRecovery.tsx | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/routes/pages/ImagePlan.tsx | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/routes/pages/Index.tsx | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/routes/pages/IntakeMapping.tsx | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/routes/pages/MobileCompanion.tsx | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/routes/pages/NotFound.tsx | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/routes/pages/RowInspector.tsx | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/routes/pages/SavedViews.tsx | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/routes/pages/SellerDefaults.tsx | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/routes/pages/StatesShowcase.tsx | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/routes/pages/SubmissionMonitor.tsx | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/routes/pages/SubmissionScope.tsx | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/routes/pages/SupportInvestigation.tsx | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/routes/pages/TriageWorkspace.tsx | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/routes/pages/WorkspaceSelect.tsx | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/test/app-routing.test.tsx | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/test/example.test.ts | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/test/setup.ts | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/src/vite-env.d.ts | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/tailwind.config.ts | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/tsconfig.app.json | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/tsconfig.app.tsbuildinfo | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/tsconfig.json | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/tsconfig.node.json | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/tsconfig.node.tsbuildinfo | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/vite.config.ts | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |
| node_modules/@bulk-sku-creator/web/vitest.config.ts | - Removed a vendored copy of the @bulk-sku-creator/web package file from node_modules. |

# Math App Class 4 — 3D UI Redesign Overlay

Base GitHub repository:

```text
akita141188/Math-App-Class4
```

Base commit used for this overlay:

```text
9d1f55b43156d0d3f91f7175de9f37cdab63ebf9
feat: update data
```

## What this overlay changes

The existing product/business logic is intentionally preserved. This package focuses on the visual layer and key presentation pages:

- shared student navigation/header
- parent header
- Home
- Tests
- My progress / history summary
- Parent dashboard
- global 3D-friendly design system overrides
- catalog, practice, history and generic card styling via `redesign.css`
- locally bundled WebP illustration crops derived from the approved visual concepts

No API, content-bank, scoring, randomization, history repository or curriculum logic is replaced by this package.

## Files replaced/added

```text
apps/web/src/main.tsx
apps/web/src/components/AppShell.tsx
apps/web/src/components/ParentShell.tsx
apps/web/src/pages/HomePage.tsx
apps/web/src/pages/TestsPage.tsx
apps/web/src/pages/MePage.tsx
apps/web/src/pages/ParentPage.tsx
apps/web/src/redesign.css
apps/web/public/assets/redesign/home-hero.webp
apps/web/public/assets/redesign/catalog-hero.webp
apps/web/public/assets/redesign/test-hero.webp
apps/web/public/assets/redesign/me-hero.webp
apps/web/public/assets/redesign/parent-hero.webp
apps/web/public/assets/redesign/practice-hero.webp
```

## Recommended copy procedure — PowerShell

Close the running Vite server first if Windows is locking files.

```powershell
$Repo = "D:\Math-app-class4"
$Zip  = "$env:USERPROFILE\Downloads\Math-App-Class4-3D-UI-redesign.zip"
$Temp = "$env:TEMP\Math-App-Class4-3D-UI-redesign"
$Backup = "D:\Math-app-class4-backup-ui-$(Get-Date -Format yyyyMMdd-HHmmss)"

Copy-Item $Repo $Backup -Recurse

Remove-Item $Temp -Recurse -Force -ErrorAction SilentlyContinue
Expand-Archive -Path $Zip -DestinationPath $Temp -Force

Copy-Item "$Temp\apps" $Repo -Recurse -Force

Set-Location $Repo
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm dev
```

Then open:

```text
http://127.0.0.1:5173/
```

Review at least:

```text
/
/learn/types
/tests
/me
/history
/parent
```

## Important

This is an overlay, not a replacement full repository. It is designed to be copied over the already-updated repo so the large Grade 4 content bank and current backend implementation remain untouched.

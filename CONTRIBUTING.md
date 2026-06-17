# Contributing to Echo

Thanks for your interest in improving Echo! This guide covers how to set up the project, our branch and commit conventions, and how to open a pull request.

## Prerequisites

- [Node.js](https://nodejs.org/) 18+ and npm
- For Android native builds: Android Studio / Android SDK and a JDK (17+), plus a connected device or emulator
- A physical Android device is recommended for testing geofencing

## Development Setup

```bash
git clone https://github.com/gautham-prasad/echo.git
cd echo
npm install
npm start
```

To run the native app (required for maps, geofencing, and notifications):

```bash
npm run android:prebuild
npm run android
```

See [Docs/INSTALLATION.md](Docs/INSTALLATION.md) for more detail.

## Project Structure

```
app/            Expo Router screens
components/     Reusable UI components
lib/store/      Zustand stores
lib/db/         SQLite (native) + in-memory (web) data access
lib/services/   geocoding, geofencing, notifications
lib/types/      shared types
constants/      theme tokens
hooks/          custom hooks
```

## Branch Model

- `main` — stable, release-ready code. Releases are tagged from here.
- `development` — integration branch for ongoing work.
- Feature work: branch off `development` (e.g. `feat/location-filter`, `fix/calendar-centering`), open a PR into `development`.
- Releases: `development` is merged into `main` and tagged.

## Commit Conventions

This project follows [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add by-location sort mode
fix: prevent crash when enabling time trigger in edit mode
docs: expand installation guide
refactor: extract ScreenHeader component
chore: bump dependencies
```

Keep commits focused and write messages that explain the "why".

## Before You Open a PR

Run and pass:

```bash
npx tsc --noEmit     # type-check
npm run lint         # lint
```

- Keep changes scoped; avoid unrelated refactors in the same PR.
- Match the existing theme-token styling (see [constants/theme.ts](constants/theme.ts)); avoid hardcoded colors so light/dark modes keep working.
- Update docs when you change user-facing behavior.

## Pull Request Process

1. Fork the repo (or create a branch if you have access).
2. Create your feature/fix branch off `development`.
3. Make your changes with clear commits.
4. Ensure `tsc` and `lint` pass.
5. Open a PR into `development` using the PR template and describe the change and how you tested it.

Maintainers aim to provide a first review response within 3 business days.

## Reporting Issues

Use the issue templates for bug reports and feature requests. For bugs, include device/OS, steps to reproduce, and a screenshot or log if possible.

## Reporting Security Issues

Do not open public issues for security vulnerabilities. Follow [SECURITY.md](SECURITY.md) and use private reporting channels.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).

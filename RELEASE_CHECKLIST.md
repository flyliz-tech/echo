# Release Checklist

Use this checklist before tagging a release.

## Pre-Release

- [ ] All required CI checks pass on `main`
- [ ] `npm ci` completes on a clean environment
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run lint` passes
- [ ] Version bumped appropriately (SemVer)
- [ ] Changelog/release notes drafted
- [ ] Security issues triaged for target release

## Build + Verify

- [ ] Android release APK builds successfully
- [ ] Install and smoke test on physical Android device
- [ ] Validate notifications and geofencing on-device
- [ ] Verify app permissions prompts and behavior

## Publish

- [ ] Create git tag (`vX.Y.Z`) from `main`
- [ ] Create GitHub Release with notes and assets
- [ ] Attach release APK artifact
- [ ] Mark any breaking changes clearly

## Post-Release

- [ ] Announce release (README/Discussions/changelog)
- [ ] Monitor incoming issues for regressions

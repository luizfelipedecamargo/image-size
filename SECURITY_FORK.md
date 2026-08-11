# Controlled Metro-Compatible Security Fork

## Purpose

This branch is a narrowly scoped security fork of `image-size` for the Fila Virtual mobile application.

Metro 0.83.3 depends on `image-size` `^1.0.2` and uses the v1 synchronous file-path API (`imageSize(filePath)`). The `image-size` v2 API is not a drop-in replacement because its main entry point expects an in-memory `Uint8Array` instead of a file path.

## Upstream baseline

- Upstream repository: `image-size/image-size`
- Upstream tag: `v1.2.1`
- Upstream commit: `a4178fbb334ddb22d94cb4228ed597c24fd02e10`
- Fork security version: `1.2.2-fila.1`

## Security advisories

This fork is intended to mitigate the infinite-loop denial-of-service conditions tracked by:

- `GHSA-w3rx-r6r6-pgpr` / `CVE-2025-71330` — ICNS zero-length entry loop.
- `GHSA-5p2g-fcmc-qvqq` / `CVE-2025-71329` — zero-size JXL/HEIF box parsing loops.

The GitHub Advisory Database currently marks `image-size <= 2.0.2` as affected and lists no official patched release.

## Local changes

Only changes necessary for security and reproducible consumption are allowed:

1. JXL: when a located `jxlp` box reports size zero, advance by the 8-byte box header instead of remaining on the same offset.
2. ICNS: reject entries whose declared length is zero before advancing the parser.
3. HEIF: retain the v1.2.1 generic `findBox` progress guard and cover the zero-size box path with a terminating regression test.
4. Packaging: use `prepare: npm run build` so npm Git installs produce the `dist` files referenced by the package entry point.
5. Compatibility validation: install the exact Git commit with npm 12 and call the CommonJS export synchronously with a real image file path, matching Metro 0.83.3 behavior.

## Consumption policy

- Fila Virtual must pin an immutable commit SHA from this branch.
- The Git install script must be approved only for the reviewed `image-size` fork revision; do not allow all dependency scripts globally.
- Do not publish this fork to the public npm registry under the upstream package identity.
- Do not add unrelated features, refactors, or dependency upgrades to this branch.

## Retirement criteria

Remove this fork when Metro/Expo resolves to an officially patched `image-size` implementation (or no longer depends on it) and the supported replacement passes mobile typecheck, tests, lint, security scans, clean installation, and a real Metro bundle/startup check.

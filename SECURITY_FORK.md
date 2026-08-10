# Controlled Security Fork

## Purpose

This repository is a controlled security fork of `image-size/image-size` used by the Fila Virtual project while the upstream package remains affected by denial-of-service advisories with no patched npm release.

The fork exists only to carry narrowly scoped security fixes. It must not become a feature fork.

## Upstream baseline

- Upstream repository: `image-size/image-size`
- Upstream baseline commit: `5c065e6949065c0015d2e8e6aced5c67280dfda2`
- Upstream package version: `2.0.2`
- Fork security version: `2.0.3-fila.1`

## Security advisories

This fork addresses:

- `GHSA-5p2g-fcmc-qvqq`: denial of service through infinite loops in JXL and HEIF parsing paths when a selected box has size zero.
- `GHSA-w3rx-r6r6-pgpr`: denial of service through an infinite loop in ICNS parsing when an entry has length zero.

The upstream baseline already contains the earlier generic `findBox` progress guard from upstream change #436. That guard is insufficient when a caller receives the requested zero-size box and then advances using that box's own size.

## Local security changes

The controlled fork adds only parser progress guards required for the known infinite-loop paths:

1. HEIF: after processing an `ispe` box, advance by its declared size when positive, otherwise by the 8-byte box header.
2. JXL: after processing a `jxlp` box, advance by its declared size when positive, otherwise by the 8-byte box header.
3. ICNS: reject progress through an entry whose declared length is zero so the parser terminates instead of repeatedly processing the same entry.

Regression tests execute the affected parsers in isolated child processes with a finite timeout. This ensures a future regression is reported as a failed test instead of hanging the complete test process indefinitely.

## Versioning and consumption policy

- Security builds use a fork-specific SemVer greater than the affected upstream `2.0.2` line.
- Fila Virtual must consume an immutable fork commit, not a moving branch.
- No `latest`, caret (`^`) or tilde (`~`) range may be used for the fork.
- The fork must not be published to a public registry under the upstream package identity.
- Any future fork release must correspond to reviewed source changes and passing regression tests.

## Maintenance policy

Allowed changes:

- fixes for confirmed security vulnerabilities affecting the dependency as used by Fila Virtual;
- tests proving those fixes;
- build/packaging changes strictly necessary to consume the fork reproducibly;
- documentation of security provenance and retirement criteria.

Changes that require a separate architectural decision:

- new image formats or features;
- API changes;
- unrelated refactors;
- dependency modernization not required for a security fix;
- publishing the fork as a general-purpose maintained package.

## Verification cadence

Fila Virtual maintains an automated weekly watch for material changes in Expo, React Native, Metro and the relevant security advisories. In addition, perform a manual review at least once per quarter and before any Expo/React Native SDK upgrade.

Review checklist:

1. Check whether the GitHub advisories list an official patched version.
2. Check whether the Metro version supported by the project's React Native/Expo matrix still depends on the affected `image-size` package/version.
3. Check whether Expo or React Native changed their supported Metro dependency.
4. Re-run the fork regression tests if upstream parser code or advisories change.
5. Record the review date and outcome in the consuming project's security documentation.

## Retirement criteria

Remove this fork when all of the following are true:

1. The Expo/React Native-supported Metro dependency resolves to an officially patched `image-size` implementation, or no longer depends on the affected package.
2. The official solution is recognized as non-vulnerable by the project's security scanners.
3. Mobile typecheck, lint, tests, build and security scans pass after removing the override.
4. The Fila Virtual security documentation is updated to record the fork retirement.

Do not keep the fork merely because it already exists. Its preferred end state is deletion from the Fila Virtual dependency graph once a supported upstream path is available.

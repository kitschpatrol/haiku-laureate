# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Maintenance

- Refresh development dependencies, including shared-config 8.14, build/test/deployment tools, and type definitions; update pnpm to 12.16.1 and simplify source and workspace configuration.
- Update CI, metadata, dependency-update, and release actions, including upgrading the GitHub release action to v3.
- Run scheduled dependency updates monthly instead of weekly.
- Skip loopback URLs and allow empty link sets in automated link checks.
- Replace prepare-time skill synchronization with pnpm-managed skill installation, permissions, and directory configuration.
- Remove `.claude` preservation from `clean-deep`.

## [1.0.5] - 2026-10-07

### Changed

- **Breaking:** Restrict declared Node.js support to `^24.16.0 || >=26.3.0`, dropping Node.js 25 and 26.0–26.2.

### Maintenance

- Normalize archive paths to lowercase so initialization scripts and documentation references work on case-sensitive filesystems.
- Refresh developer dependencies, including Vitest 5, dotenv 18, shared-config 8.12, and pnpm 12, adapting source and configuration to the updated tooling.
- Use HTTPS upstreams for `pnpm dev`, rename `clean` to `clean-deep`, and synchronize development skills during package preparation.
- Add a weekly dependency-update workflow with manual execution support.
- Improve website link checks by discovering sitemap links in page HTML and loading Lychee configuration.
- Tighten release tag filters, verify tags belong to the default branch, pin release actions, and add a timeout.

## [1.0.4] - 2026-07-27

### Added

- Generate geolocated haiku from nearby Flickr photo tags using OpenStreetMap geocoding, frequency-ranked vocabulary, and 5–7–5 syllable targets without repeating words.
- Expose `generateHaikuForAddress(address, flickrApiKey, quantity = 1): Promise<string>` through an ESM entry point with TypeScript declarations, supporting Node.js >=24.16.0.
- Provide a Cloudflare Worker endpoint at `/api/haiku-laureate?address=…` that returns JSON haiku results or error reasons for missing addresses and generation failures.
- Handle sparse locations with expanding Flickr searches capped at 30 requests, and report failures when addresses cannot be geocoded or no usable tags are found.

### Documentation

- Provide HTTP request/response and module usage examples, including the Flickr API key requirement and local module resolution for the unpublished package.
- Document CC-BY-NC-SA-4.0 licensing, project history, and the archived original Python/PHP implementation.

### Maintenance

- Refresh runtime dependencies and adapt photo searches to Flickr SDK 7.
- Set up pnpm development, tsdown builds, shared linting, Vitest integration tests, cross-platform CI, link checks, and release automation.

[Unreleased]: https://github.com/kitschpatrol/haiku-laureate/compare/v1.0.5...HEAD
[1.0.4]: https://github.com/kitschpatrol/haiku-laureate/releases/tag/v1.0.4
[1.0.5]: https://github.com/kitschpatrol/haiku-laureate/compare/v1.0.4...v1.0.5

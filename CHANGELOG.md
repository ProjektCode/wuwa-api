# WuwaAPI Changelog

This document meticulously records all significant changes, new features, and improvements made to the WuwaAPI project.

## [1.0.0] - 2026-02-07

### Added

*   Initial release featuring a Fastify-based REST API.
*   Implemented an assets-driven dataset for comprehensive character and weapon information.
*   Expanded character data with new fields: `combatRoles`, `officialIntroduction`, `releaseDate`, `nation`, `gender`, `class`, `birthplace`, `additionalTitles`, `affiliations`, `skinImages`, and `resonanceChain`.
*   Introduced basic CORS allowlist, essential security headers, and robust rate limiting for API protection.
*   Added a `/meta` endpoint providing API and dataset hash information.

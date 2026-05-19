# Security Policy

## Supported Versions

Security fixes are handled on the latest released version and on `main` before the next release is cut.

## Reporting a Vulnerability

Please report security issues through GitHub private vulnerability reporting for this repository. If that is unavailable, open a minimal issue asking for a private contact path and do not include exploit details in the public issue.

Useful details include:

- affected version or commit
- deployment mode (`npm`, Docker, reverse proxy path, or static export)
- browser and OS when client behavior is involved
- clear reproduction steps

## Privacy Model

The app has no backend database and no telemetry. In self-host mode, measurements are stored in browser `localStorage` only. Browser extensions, shared devices, and a malicious server operator are outside the protection boundary.

## Medical Safety

This project is not a medical device and does not provide medical advice. Security reports about misleading clinical output, incorrect chart math, or unsafe input handling are treated as safety bugs.

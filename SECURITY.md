# Security Policy

## Supported Versions

Currently supported versions of CalcBranch:

| Version | Supported          |
| ------- | ------------------ |
| 1.1.x   | :x:                |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability within CalcBranch, please follow these steps:

1. **Do Not** disclose the vulnerability publicly
2. Send a detailed report to juanp@email.com including:
   - Description of the vulnerability
   - Steps to reproduce
   - Possible impact
   - Suggested fixes (if any)

### What to Expect

- You will receive an acknowledgment within 48 hours
- A detailed response within 1 week with next steps
- Regular updates about the progress
- Credit in the changelog if the vulnerability is accepted and fixed

### Scope

The following are considered in scope:

- Calculator core logic (popup.js)
- Input validation vulnerabilities
- Cross-site scripting (XSS) in the extension interface

Out of scope:

- Issues in Bootstrap framework
- Issues requiring physical access to the user's device
- Social engineering attacks

## Security Features

CalcBranch implements these security measures:

- Input sanitization for mathematical expressions
- Restricted eval() usage
- Content Security Policy (CSP) headers
- Limited permissions in manifest.json

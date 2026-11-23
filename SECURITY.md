# Security Policy

We take the security of this repository, its build scripts, and the security patterns taught to learners seriously.

---

## Supported Versions

Security fixes and dependency updates are maintained on the latest curriculum release:

| Version / Branch | Supported |
| --- | --- |
| `main` (Expo SDK 58 / React Native 0.88) | Yes |
| Older forks or previous SDK branches | No |

---

## Reporting a Vulnerability

If you discover a security vulnerability in this repository's code, dependencies, CI workflows, or security guidance (for example, an insecure authentication or storage pattern):

1. **Do not open a public GitHub issue** for exploitable vulnerabilities.
2. **Use GitHub Private Vulnerability Reporting** under the repository's **Security → Advisories → Report a vulnerability** tab.
3. Include as much detail as possible:
   - Affected file(s) or dependency version(s)
   - Clear reproduction steps or proof of concept
   - Potential impact and any suggested remediation

### What to Expect

- **Acknowledgment:** Within 72 hours of your report.
- **Triage & Assessment:** Within 7 days, we will confirm whether the issue is reproducible and determine severity.
- **Fix & Disclosure:** Once patched on `main`, we will publish a short summary crediting you (unless you prefer to remain anonymous).

---

## Educational Code Disclaimer

The examples, exercises, and projects in **30 Days of React Native** are created for **educational purposes**. While we teach industry-standard mobile security practices (see [Day 12: Authentication](./days/day-12-authentication/README.md) and [Day 23: Mobile App Security](./days/day-23-security/README.md)):

- Never ship mock authentication handlers, placeholder API keys, or demo backends to production.
- Always store sensitive tokens in `expo-secure-store` (iOS Keychain / Android Keystore) — never in `AsyncStorage` or committed `.env` files.
- Always perform authorization checks, rate limiting, and secret management on your backend server rather than trusting client-side mobile code.
- Audit third-party dependencies regularly with `npm audit` and review package health on [React Native Directory](https://reactnative.directory/).

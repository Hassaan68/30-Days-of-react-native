# Day 23 Exercises: Mobile Security & Input Sanitization

Open [`InputSanitizerExercise.ts`](./InputSanitizerExercise.ts) and complete the three defensive helpers below.

## 1. Beginner — `sanitizeUserInput`
Untrusted text from forms, QR scans, or deep-link query params can contain invisible control characters or unexpectedly huge strings.
1. Strip ASCII control characters (`charCode < 32` or `charCode === 127`) without using a control-character regex literal.
2. Trim leading and trailing whitespace.
3. Slice the result to `maxLength` (guarding against negative values).

## 2. Intermediate — `validateDeepLinkUrl`
Deep links can be triggered by any malicious webpage or SMS on a user's phone.
1. Parse `rawUrl` with `new URL(...)` inside a `try/catch`, returning `{ ok: false, reason: 'Malformed URL.' }` on failure.
2. Reject URLs with embedded credentials (`parsed.username` or `parsed.password`).
3. Allow only `https:` URLs whose lowercased `hostname` matches `allowedHosts`, OR custom schemes explicitly listed in `allowedSchemes`.
4. Reject `javascript:`, `http:`, `data:`, `file:`, and unknown domains.

## 3. Challenge — `redactSensitiveUrlParams`
OAuth callbacks and magic links often contain `?code=...` or `?token=...`. Logging raw URLs exposes user sessions in crash reporters and analytics.
1. Parse `rawUrl` safely (returning `'[INVALID_URL]'` if malformed).
2. Replace every query parameter whose lowercased name matches `sensitiveParams` with `'REDACTED'`.
3. Write unit tests verifying mixed-case params (e.g., `?Access_Token=secret&tab=profile` → `tab=profile` preserved, `Access_Token=REDACTED`).

## Reference Solution
Compare your implementation against [`../solutions/InputSanitizerSolution.ts`](../solutions/InputSanitizerSolution.ts).

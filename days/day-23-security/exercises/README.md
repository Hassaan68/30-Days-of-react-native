# Day 23 Exercises: Mobile Security & Input Sanitization

## How to Practise

1. Open the starter file [`InputSanitizerExercise.ts`](./InputSanitizerExercise.ts) and review `DeepLinkValidationResult` and `DEFAULT_SENSITIVE_QUERY_PARAMS`.
2. Complete each defensive helper in order (**Beginner → Intermediate → Challenge**).
3. Run static verification from the repository root after each function:

```bash
npm run typecheck
npm run lint
```

4. Write a small Jest unit test suite (or invoke the helpers inside your Expo playground launched with `npm start`) to verify malicious URLs, control characters, and mixed-case sensitive query parameters.

---

## 1. Beginner — `sanitizeUserInput(rawText, maxLength)`

Untrusted text from forms, QR scans, or deep-link query params can contain invisible control characters or unexpectedly huge payloads.

### Requirements

1. Remove all ASCII control characters (`charCode < 32` or `charCode === 127`) while preserving standard printable characters and spaces (`charCode === 32`).
   - Do **not** use a control-character regex literal (which triggers ESLint's `no-control-regex` rule).
2. Trim leading and trailing whitespace.
3. Slice the cleaned string to `maxLength` (clamping negative or fractional `maxLength` values safely with `Math.max(0, Math.floor(maxLength))`).

### Acceptance Criteria

- [ ] Invisible characters like `\u0000`, `\u0007`, `\n`, `\r`, `\t`, and `\u007F` are removed.
- [ ] Regular words and spaces remain intact (`"  Hello\u0000 World\n  "` → `"Hello World"`).
- [ ] Strings longer than `maxLength` are truncated cleanly; `maxLength <= 0` returns `""`.
- [ ] `npm run typecheck` and `npm run lint` pass with zero warnings.

### Expected Behavior

```ts
sanitizeUserInput('  Hello\u0000\u001F World!  ', 10);
// => 'Hello Worl'
```

<details>
<summary>Hint</summary>

Loop through `rawText` with `for (let i = 0; i < rawText.length; i += 1)`, inspect `const code = rawText.charCodeAt(i)`, and append `rawText.charAt(i)` only when `code >= 32 && code !== 127`. Finally, return `cleaned.trim().slice(0, safeLimit)`.

</details>

---

## 2. Intermediate — `validateDeepLinkUrl(rawUrl, allowedHosts, allowedSchemes)`

Any malicious webpage, email, or SMS can invoke deep links on a user's device.

### Requirements

1. Trim `rawUrl` and reject empty strings (`{ ok: false, reason: 'URL must not be empty.' }`).
2. Parse `rawUrl` with `new URL(trimmed)` inside a `try/catch`, returning `{ ok: false, reason: 'Malformed URL.' }` on failure.
3. Reject URLs containing embedded credentials (`parsed.username.length > 0 || parsed.password.length > 0`).
4. Allow **only**:
   - `'https:'` URLs whose lowercased `hostname` is included in `allowedHosts` (matched case-insensitively), **OR**
   - Custom app schemes whose lowercased `protocol` is included in `allowedSchemes` (default `['myapp:']`).
5. Reject `'http:'`, `'javascript:'`, `'data:'`, `'file:'`, and any untrusted HTTPS domain.
6. On success, return `{ ok: true, normalizedUrl: parsed.toString(), pathname: parsed.pathname }`.

### Acceptance Criteria

- [ ] `https://app.example.com/tasks/42` with `allowedHosts: ['app.example.com']` returns `{ ok: true, ... }`.
- [ ] `myapp://tasks/42` with default `allowedSchemes` returns `{ ok: true, ... }`.
- [ ] `javascript:alert(1)`, `http://app.example.com`, `https://evil.example/tasks`, and `https://user:pass@app.example.com` all return `{ ok: false, reason: ... }`.
- [ ] Hostname and scheme matching are case-insensitive (`HTTPS://APP.EXAMPLE.COM/home` succeeds).

### Expected Behavior

```ts
validateDeepLinkUrl('https://evil.example/redirect', ['app.example.com']);
// => { ok: false, reason: 'Untrusted host "evil.example".' }
```

<details>
<summary>Hint</summary>

Normalize `allowedHosts` and `allowedSchemes` into lowercase `Set` instances (`new Set(list.map((s) => s.toLowerCase()))`) before checking `parsed.protocol.toLowerCase()` and `parsed.hostname.toLowerCase()`.

</details>

---

## 3. Challenge — `redactSensitiveUrlParams(rawUrl, sensitiveParams)`

OAuth callbacks and magic links often contain `?code=...` or `?token=...`. Logging raw URLs exposes live user sessions in crash reporters and analytics.

### Requirements

1. Parse `rawUrl.trim()` with `new URL(...)` inside a `try/catch`; return `'[INVALID_URL]'` if parsing fails.
2. Iterate over the query parameter keys in `parsed.searchParams`.
3. For every parameter whose lowercased key appears in `sensitiveParams` (defaults to `DEFAULT_SENSITIVE_QUERY_PARAMS`), replace its value with `'REDACTED'`.
4. Preserve all non-sensitive query parameters (such as `tab`, `page`, `utm_source`) untouched.
5. Write unit tests covering mixed-case parameter names, multiple sensitive params, non-sensitive params, and malformed URLs.

### Acceptance Criteria

- [ ] `https://app.example.com/auth?Access_Token=secret123&tab=profile` becomes `https://app.example.com/auth?Access_Token=REDACTED&tab=profile`.
- [ ] All default sensitive params (`token`, `access_token`, `refresh_token`, `code`, `api_key`, `apikey`, `password`, `secret`) are redacted case-insensitively.
- [ ] Malformed URLs like `'not a url'` return `'[INVALID_URL]'` without throwing.
- [ ] Custom `sensitiveParams` arrays override the default list cleanly.

### Expected Behavior

Sensitive tokens and OAuth codes are replaced with `REDACTED` while routing context (`pathname` and benign query parameters) remains useful for debugging.

<details>
<summary>Hint</summary>

Snapshot the keys first (`const keys = Array.from(parsed.searchParams.keys())`) before mutating `parsed.searchParams.set(key, 'REDACTED')`, and match against `new Set(sensitiveParams.map((p) => p.toLowerCase()))`.

</details>

---

## Reference Solution (Only After Trying!)

<details>
<summary>Click to view the reference solution link</summary>

Once you have implemented and tested your helpers, compare your implementation against [`../solutions/InputSanitizerSolution.ts`](../solutions/InputSanitizerSolution.ts).

</details>

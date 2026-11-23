# Day 08 Exercises: Navigation with Expo Router

Practice building real-world navigation structures with Expo Router (~58.0) and strict TypeScript.

## How to Practise

1. Open the starter file [`./TabsLayoutExercise.tsx`](./TabsLayoutExercise.tsx) and complete each `// TODO:` step in order.
2. To preview this layout inside an Expo Router app, copy it to `app/(tabs)/_layout.tsx` alongside `index.tsx`, `explore.tsx`, `profile.tsx`, and `settings.tsx` and run `npm start`.
3. Validate strict TypeScript (including RN 0.88's `ColorValue` types) and ESLint from the repository root:
   ```bash
   npm run typecheck
   npm run lint
   ```

## Tasks

### Exercise 1 (Beginner): Configure Three Bottom Tabs

**Requirements**
1. Inside `<Tabs>`, configure three visible `<Tabs.Screen>` entries:
   - `index` with `title: 'Home'` and `tabBarLabel: 'Home'`
   - `explore` with `title: 'Explore'` and `tabBarLabel: 'Explore'`
   - `profile` with `title: 'Profile'` and `tabBarLabel: 'Profile'`
2. Configure `screenOptions` with `tabBarActiveTintColor: '#2563EB'` and `tabBarInactiveTintColor: '#64748B'`, plus clean white header and tab bar styling.
3. Add a descriptive `tabBarAccessibilityLabel` to each tab (`'Home tab'`, `'Explore tab'`, `'Profile tab'`).

**Acceptance Criteria**
- [ ] All three tabs (`index`, `explore`, `profile`) are registered with proper titles and labels.
- [ ] Active tabs tint `#2563EB` and inactive tabs tint `#64748B`.
- [ ] Every tab defines a `tabBarAccessibilityLabel` for screen readers.

**Expected Behavior**
The bottom navigation bar renders three tabs (**Home**, **Explore**, **Profile**), highlighting the currently selected tab in blue (`#2563EB`) and muted slate (`#64748B`) when inactive.

<details>
<summary>Hint</summary>

Set `tabBarActiveTintColor` and `tabBarInactiveTintColor` inside `<Tabs screenOptions={{ ... }}>` so all tabs inherit them automatically, then add `<Tabs.Screen name="explore" ... />` and `<Tabs.Screen name="profile" ... />` beneath the existing `index` screen.

</details>

---

### Exercise 2 (Intermediate): Custom Tab Icons & Notification Badge

**Requirements**
1. Pass `tabBarIcon: ({ color, focused }) => <TabIcon symbol="..." color={color} focused={focused} />` to all three tabs (`'H'`, `'E'`, `'P'`). Keep `TabIcon`'s `color` typed as `ColorValue` with the `color ?? '#64748B'` fallback for RN 0.88 / Expo Router 58 type safety.
2. Compute `exploreBadge` from `unreadCount`:
   - When `unreadCount <= 0`, pass `undefined` so no badge renders.
   - When `1 <= unreadCount <= 99`, display the numeric `unreadCount`.
   - When `unreadCount > 99`, cap display at `'99+'`.
3. Update the `explore` tab's `tabBarAccessibilityLabel` to include the unread count when `unreadCount > 0` (e.g., `` `Explore tab, ${unreadCount} unread updates` ``).

**Acceptance Criteria**
- [ ] All three tabs render `TabIcon` with active circular highlight when `focused` is `true`.
- [ ] `explore` shows no badge when `unreadCount === 0`, `5` when `unreadCount === 5`, and `'99+'` when `unreadCount === 120`.
- [ ] `tabBarAccessibilityLabel` announces unread updates when `unreadCount > 0`.

**Expected Behavior**
Passing `<TabsLayoutExercise unreadCount={12} />` shows a badge with `12` over the Explore tab icon; passing `unreadCount={150}` displays `99+`; passing `unreadCount={0}` hides the badge completely.

<details>
<summary>Hint</summary>

Compute the badge before `return`:
```ts
const exploreBadge = unreadCount > 0 ? (unreadCount > 99 ? '99+' : unreadCount) : undefined;
```
Then pass `tabBarBadge: exploreBadge` on the `explore` screen's `options`. Remember to remove the placeholder `_unusedUnreadCount` lines once you use `unreadCount`.

</details>

---

### Exercise 3 (Challenge): Hidden Route & Deep-Link Helper

**Requirements**
1. Register a fourth `<Tabs.Screen name="settings" options={{ title: 'Settings', href: null }} />` so `/settings` remains reachable via `router.push('/settings')` without appearing as a 4th tab button.
2. Complete `buildCourseDeepLink(courseId: string, referrer?: string): string`:
   - Trim and URL-encode `courseId` with `encodeURIComponent`.
   - Return `thirtydays://courses/<encodedId>` when `referrer` is omitted or blank/whitespace.
   - Append `?referrer=<encodedReferrer>` when `referrer` is a non-empty trimmed string.

**Acceptance Criteria**
- [ ] `settings` screen is registered with `href: null`.
- [ ] `buildCourseDeepLink('expo-router')` returns `'thirtydays://courses/expo-router'`.
- [ ] `buildCourseDeepLink('rn 101', 'push alert')` returns `'thirtydays://courses/rn%20101?referrer=push%20alert'`.
- [ ] `buildCourseDeepLink('rn-101', '   ')` omits `?referrer=...`.
- [ ] `npm run typecheck` and `npm run lint` pass with zero errors.

**Expected Behavior**
The bottom bar still shows only 3 tabs (Home, Explore, Profile), yet calling `router.push('/settings')` navigates to the Settings screen cleanly. `buildCourseDeepLink` always generates valid, URL-safe custom-scheme deep links.

<details>
<summary>Hint</summary>

Trim both inputs before encoding:
```ts
const encodedId = encodeURIComponent(courseId.trim());
const baseUrl = `thirtydays://courses/${encodedId}`;
if (referrer && referrer.trim().length > 0) {
  return `${baseUrl}?referrer=${encodeURIComponent(referrer.trim())}`;
}
return baseUrl;
```

</details>

---

## Reference Solution (Only After Trying!)

<details>
<summary>Click to open the reference solution link</summary>

Once you have completed all three tasks and verified `npm run typecheck` and `npm run lint`, compare your completed file with [`../solutions/TabsLayoutSolution.tsx`](../solutions/TabsLayoutSolution.tsx).

</details>

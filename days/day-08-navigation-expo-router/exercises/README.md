# Day 08 Exercises: Navigation with Expo Router

Practice building real-world navigation structures with Expo Router (~58.0) and TypeScript.

## Starter File

Open [TabsLayoutExercise.tsx](./TabsLayoutExercise.tsx) and complete all `TODO` items to configure a typed bottom-tab navigator for a learning app.

## Tasks

1. **Beginner — Configure Three Tabs**:
   - Add three `<Tabs.Screen>` entries inside `<Tabs>`:
     - `index` with title `"Home"`
     - `explore` with title `"Explore"`
     - `profile` with title `"Profile"`
   - Style the tab bar with `tabBarActiveTintColor: '#2563EB'` and `tabBarInactiveTintColor: '#64748B'`.

2. **Intermediate — Custom Tab Icons & Notification Badge**:
   - Use the provided `TabIcon` helper component in `tabBarIcon` for each screen so active and inactive icons change color and emphasis.
   - Display a numeric `tabBarBadge` on the `explore` tab whenever `unreadCount > 0` (and omit it when `unreadCount === 0`).

3. **Challenge — Hidden Route & Deep-Link Helper**:
   - Register a fourth route named `settings` with `href: null` so it remains navigable via `router.push('/settings')` without appearing as a visible tab button.
   - Implement the `buildCourseDeepLink(courseId, referrer?)` helper function to construct a custom-scheme URL (`thirtydays://courses/<id>?referrer=<referrer>`), properly URL-encoding parameters.

## Checking Your Work

Compare your completed file with [TabsLayoutSolution.tsx](../solutions/TabsLayoutSolution.tsx) and run:

```bash
npm run typecheck
npm run lint
```

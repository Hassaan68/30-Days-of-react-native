# Day 08: Navigation with Expo Router

## Learning Objectives

By the end of Day 08, you will be able to:

- Explain how **file-based routing** in **Expo Router (~58.0)** maps files inside `app/` to native mobile screens and URLs.
- Build and customize **Stack**, **Tabs**, and **Modal** navigators using `_layout.tsx` files.
- Organize complex flows with **route groups** such as `(tabs)` and `(auth)` without polluting URLs.
- Create **dynamic routes** (`[id].tsx`) and safely read route and query parameters with `useLocalSearchParams`.
- Choose between declarative `<Link>` components and imperative navigation via `useRouter` (`push`, `replace`, `back`, `canGoBack`).
- Understand **Expo SDK 58** navigation highlights (stable native tabs and route data loaders) and configure **deep linking** (`scheme`, Universal Links, and Android App Links).

## Prerequisites

- Completed [Day 07: Building Your First Mobile App](../day-07-first-mobile-app/README.md).
- Comfortable with React components, TypeScript interfaces, and core components (`View`, `Text`, `Pressable`, `ScrollView`).
- Basic familiarity with URL paths and query strings (for example, `/courses/expo-router?referrer=home`).

## Introduction

Mobile apps are rarely a single screen. Users tap a card to open a detail view, switch between bottom tabs, open a filter modal, or tap a notification that jumps straight to a specific order or message.

In traditional React Navigation setups, you manually register every screen in JavaScript navigator objects and maintain a separate linking configuration for URLs. **Expo Router** (built on top of React Navigation and shipped under unified versioning `~58.0.0` in Expo SDK 58) eliminates that boilerplate by making your **file system** the single source of truth for navigation. Every screen automatically gets a native navigator transition **and** a shareable deep link.

## Concepts

### 1. File-Based Routing in `app/`

In Expo Router, every `.tsx` file inside the `app/` directory automatically becomes a route (except special files like `_layout.tsx` and `+not-found.tsx`):

```text
app/
├── _layout.tsx           # Root Stack navigator + global providers
├── (tabs)/
│   ├── _layout.tsx       # Bottom Tab navigator
│   ├── index.tsx         # Matches "/"
│   ├── explore.tsx       # Matches "/explore"
│   └── profile.tsx       # Matches "/profile"
├── (auth)/
│   ├── _layout.tsx       # Auth Stack (no bottom tabs)
│   ├── sign-in.tsx       # Matches "/sign-in"
│   └── sign-up.tsx       # Matches "/sign-up"
├── courses/
│   └── [id].tsx          # Matches "/courses/rn-101", "/courses/expo-router"
└── filter-modal.tsx      # Matches "/filter-modal" (presented as a modal)
```

Notice two special naming conventions:

- **`index.tsx`** represents the default route of its directory (`app/(tabs)/index.tsx` matches `/`).
- **`_layout.tsx`** wraps sibling routes and nested directories in a navigator (`Stack`, `Tabs`, `Drawer`, or `<Slot />`) and renders shared providers like `SafeAreaProvider`.

### 2. Route Groups: `(tabs)` and `(auth)`

Directories wrapped in parentheses—like `(tabs)` and `(auth)`—are **route groups**. They let you organize screens into separate navigators (for example, hiding the bottom tab bar on login screens) **without** adding `(tabs)` or `(auth)` to the URL path.

- `app/(auth)/sign-in.tsx` resolves to `/sign-in`, not `/(auth)/sign-in`.
- `app/(tabs)/explore.tsx` resolves to `/explore`, not `/(tabs)/explore`.

### 3. Stack, Tabs, and Modal Navigators

- **`Stack`** manages a card stack of screens with native platform transitions (slide from right on iOS, native transition on Android) and a back button. Setting `presentation: 'modal'` on a `Stack.Screen` presents it as a sheet/modal.
- **`Tabs`** renders a persistent bottom navigation bar where each tab maintains its own focus state.
- **SDK 58 Highlight — Native Tabs & Data Loaders**: In Expo SDK 58 (Expo Router ~58.0), Expo Router's **native tabs** API (`NativeTabs`) is stable, giving you true OS-native tab bars (including iOS native liquid/system tab bar behavior and Android Material 3 navigation bars) alongside classic JavaScript `<Tabs>`. SDK 58 also supports **route data loaders** for preloading screen data during navigation transitions so screens render faster with fewer loading waterfalls.

### 4. Dynamic Routes & Reading Parameters

Square brackets create dynamic path segments:

- `app/courses/[id].tsx` matches `/courses/rn-101` and `/courses/expo-router`.
- `app/docs/[...slug].tsx` is a catch-all route matching `/docs/a/b/c`.

Inside a screen, read both dynamic segments and query string parameters (`?referrer=home`) using **`useLocalSearchParams()`**:

```tsx
const params = useLocalSearchParams();
// params.id may be string | string[] | undefined
```

Why `useLocalSearchParams` instead of `useGlobalSearchParams`? `useLocalSearchParams` only updates when **the current screen** is focused, preventing background screens in a stack from re-rendering unnecessarily when you navigate deeper.

### 5. Declarative `<Link>` vs Imperative `useRouter()`

| Approach | Best Used For | Example |
| --- | --- | --- |
| `<Link href="..." asChild>` | Static or card taps where accessibility and web/SEO semantics shine | `<Link href="/courses/rn-101" asChild><Pressable>...</Pressable></Link>` |
| `router.push(...)` | Programmatic navigation after an event (e.g., tapping a button or opening a modal) | `router.push('/filter-modal')` |
| `router.replace(...)` | Replacing history so the user cannot press Back (e.g., after login/logout) | `router.replace('/(tabs)')` |
| `router.back()` | Returning to the previous screen (check `router.canGoBack()` first for deep links!) | `if (router.canGoBack()) router.back()` |

### 6. Deep Linking, Universal Links, and App Links

Because every route in Expo Router already has a URL path, deep linking requires minimal configuration in `app.json`:

```json
{
  "expo": {
    "scheme": "thirtydays",
    "ios": {
      "associatedDomains": ["applinks:30daysrn.dev"]
    },
    "android": {
      "intentFilters": [
        {
          "action": "VIEW",
          "autoVerify": true,
          "data": [{ "scheme": "https", "host": "30daysrn.dev", "pathPrefix": "/courses" }],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    }
  }
}
```

- **Custom URL Scheme (`thirtydays://courses/expo-router`)**: Easy to test during development using `npx uri-scheme open thirtydays://courses/expo-router --ios` (or `--android`).
- **Universal Links (iOS) / App Links (Android)**: Standard `https://` URLs verified by hosting `.well-known/apple-app-site-association` and `.well-known/assetlinks.json` on your domain. If the app isn't installed, the link falls back gracefully to your website.

## Code Examples

Review both runnable TypeScript examples for this day:

1. **[examples/RootStackLayout.tsx](./examples/RootStackLayout.tsx)** — Root `app/_layout.tsx` configuring `SafeAreaProvider`, shared Stack header styles, `(tabs)` and `(auth)` groups, dynamic `courses/[id]`, and `filter-modal`.
2. **[examples/CourseDetailScreen.tsx](./examples/CourseDetailScreen.tsx)** — Dynamic `app/courses/[id].tsx` screen reading `useLocalSearchParams()`, dynamically updating `<Stack.Screen options={{ title }} />`, and combining `<Link asChild>` with `useRouter()`.

Below is the core pattern from `CourseDetailScreen.tsx` showing safe parameter extraction and navigation:

```tsx
function getFirstParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

export default function CourseDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const courseId = getFirstParam(params.id);
  const referrer = getFirstParam(params.referrer);
  // Look up course and render header dynamically with <Stack.Screen options={{ title }} />
}
```

## Step-by-Step Explanation

1. **Wrap the root navigator with `SafeAreaProvider`**: Placing `SafeAreaProvider` in `app/_layout.tsx` ensures every child screen can use `SafeAreaView` from `react-native-safe-area-context` without repeating providers.
2. **Hide double headers on nested navigators**: When a `Stack` contains `(tabs)` (which renders its own headers), set `headerShown: false` on `<Stack.Screen name="(tabs)" />` so users don't see two stacked headers.
3. **Normalize `useLocalSearchParams()` values**: URL query params can repeat (`?tag=a&tag=b`), so TypeScript types them as `string | string[] | undefined`. A tiny `getFirstParam()` helper keeps your code strictly typed even with `noUncheckedIndexedAccess: true`.
4. **Update headers reactively**: Rendering `<Stack.Screen options={{ title: course.title }} />` inside the screen component updates the native header title as soon as you know which course is loaded.
5. **Guard `router.back()` with `router.canGoBack()`**: If a user enters your app directly via a deep link (`thirtydays://courses/expo-router`), the navigation stack has no previous screen. Checking `router.canGoBack()` lets you fall back cleanly to `router.replace('/')`.

## Common Mistakes

- **Double Headers**: Forgetting `headerShown: false` on a Stack screen that wraps a nested Tabs or Stack layout creates two headers on top of each other.
- **Using `router.push` After Login**: Calling `router.push('/(tabs)')` after signing in leaves the login screen in the back stack, so pressing Back returns the user to the login screen! Use `router.replace(...)` instead.
- **Assuming `params.id` Is Always a Non-Empty String**: Deep links can be malformed or pass repeated query params. Always validate and handle a "Not Found" state cleanly.
- **Forgetting `asChild` on `<Link>`**: Wrapping a custom `<Pressable>` inside `<Link>` without `asChild` can break layout or touch handling on native platforms. Pass `asChild` so `<Link>` attaches its navigation props directly to your `<Pressable>`.
- **Using `useGlobalSearchParams` Everywhere**: Subscribing to global params causes unfocused background screens to re-render on every navigation change. Default to `useLocalSearchParams`.

## Best Practices

- **Keep `_layout.tsx` Lean**: Place global providers (theme, query client, safe area, auth gate) in root `_layout.tsx` and keep heavy UI inside individual screen files.
- **Co-locate Route Groups by Feature or Auth Boundary**: Use `(auth)` for unauthenticated screens and `(tabs)` for primary top-level destinations.
- **Always Provide a Fallback for Deep Links**: Handle missing IDs gracefully and check `router.canGoBack()` before calling `router.back()`.
- **Give Every Tab an Accessible Label**: Set `tabBarAccessibilityLabel` (including badge counts when relevant) so screen-reader users know both the tab name and unread count.
- **Prefer Native Transitions & Native Tabs**: Use Expo Router's native Stack (`Stack`) and evaluate SDK 58's stable `NativeTabs` when targeting native iOS/Android tab bar polish.

## Exercises

Head to [exercises/README.md](./exercises/README.md) and open [exercises/TabsLayoutExercise.tsx](./exercises/TabsLayoutExercise.tsx).

### Beginner
Configure three bottom tabs inside `<Tabs>` (`index` titled `"Home"`, `explore` titled `"Explore"`, and `profile` titled `"Profile"`) with active tint `#2563EB` and inactive tint `#64748B`.

### Intermediate
Render custom tab icons with the provided `TabIcon` component and attach a conditional `tabBarBadge` to the `explore` tab whenever `unreadCount > 0` (capping display at `'99+'`).

### Challenge
Add a fourth route named `settings` that is hidden from the bottom tab bar (`href: null`) while remaining navigable via `router.push('/settings')`, and implement `buildCourseDeepLink(courseId, referrer?)` with proper `encodeURIComponent` URL encoding.

## Solutions

Compare your work against the complete, strictly typed reference solution:

- **[solutions/TabsLayoutSolution.tsx](./solutions/TabsLayoutSolution.tsx)** — Demonstrates all three visible tabs, accessible badge formatting (`99+` cap), the hidden `settings` route using `href: null`, and safe URL-encoded deep-link generation in `buildCourseDeepLink`.

## Mini Project

**Course Explorer Navigation Shell**: Combine `RootStackLayout.tsx`, `TabsLayoutSolution.tsx`, and `CourseDetailScreen.tsx` into a mini 4-screen learning app:

1. **Home tab (`index.tsx`)**: Lists 3 courses and navigates to `/courses/[id]` using `<Link asChild>`.
2. **Explore tab (`explore.tsx`)**: Displays a filter button that opens `/filter-modal` via `router.push('/filter-modal')`.
3. **Course Detail (`courses/[id].tsx`)**: Reads `id` and `referrer`, updates the Stack title dynamically, and lets the user advance to the next course.
4. **Settings (`settings.tsx`)**: Opened from the Profile tab without appearing as a bottom tab button.

Test deep linking directly into a course with `npx uri-scheme open thirtydays://courses/expo-router?referrer=notification --ios`.

## Key Takeaways

- Expo Router turns your `app/` directory into both your native navigator tree and your app's URL routing table.
- Route groups like `(tabs)` and `(auth)` separate navigation chrome without changing URLs.
- Use `useLocalSearchParams()` for dynamic segments and query params, normalizing `string | string[] | undefined`.
- Use `<Link asChild>` for declarative navigation and `useRouter()` (`push`, `replace`, `back` + `canGoBack`) for imperative flows.
- Configuring `scheme` in `app.json` plus Universal/App Links makes every screen in your app instantly deep-linkable.

## Further Reading

- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)
- [Expo Router Stack & Tabs Layouts](https://docs.expo.dev/router/layouts/tabs/)
- [Expo Router Linking & Deep Links](https://docs.expo.dev/linking/overview/)
- [React Navigation Fundamentals](https://reactnavigation.org/docs/getting-started)

## Progress Checklist

- [ ] Understand how files in `app/` map to URLs and native screens
- [ ] Built a root `Stack` layout with route groups `(tabs)` and `(auth)`
- [ ] Created a dynamic route `[id].tsx` and read params safely with `useLocalSearchParams`
- [ ] Practiced declarative `<Link asChild>` and imperative `useRouter` navigation
- [ ] Completed Beginner, Intermediate, and Challenge exercises in `exercises/TabsLayoutExercise.tsx`
- [ ] Tested constructing and opening a custom-scheme deep link

## Next Day

Continue to [Day 09: Forms and Validation](../day-09-forms-and-validation/README.md) to build accessible, schema-validated mobile forms with React Hook Form and Zod v4.

# Day 05 Exercises: Styling and Layout

Practice building responsive, theme-aware, cross-platform layouts using `StyleSheet.create`, Flexbox, `useWindowDimensions`, `useColorScheme`, `Platform.select`, and `react-native-safe-area-context`.

## How to Practise

1. Open [`./PricingCardExercise.tsx`](./PricingCardExercise.tsx). The starter file compiles cleanly with TypeScript and ESLint and marks each step with `// TODO:` comments.
2. Preview your changes live via `npm start` from the repository root (or render the component in `app/index.tsx` in your Expo app). Test portrait vs. landscape (`Cmd + Right Arrow` in iOS Simulator) and Light vs. Dark Mode (`Cmd + Shift + A`).
3. Verify strict TypeScript and lint compliance after each tier:
   ```bash
   npm run typecheck
   npm run lint
   ```

## Tasks

### 1. Beginner — Style the Plan Card with Design Tokens

**Requirements**
- Polish the card layout with `StyleSheet.create` (generous padding, rounded corners, clear visual hierarchy between plan name, price, description, and button).
- Render every item in `plan.features` inside a horizontal Flexbox row (`flexDirection: 'row'`, `alignItems: 'center'`, `gap`) with a small circular bullet indicator (`width: 8`, `height: 8`, `borderRadius: 4`).
- Display a `"Most Popular"` pill badge next to the plan title when `plan.isRecommended` is `true`, and highlight the recommended/selected card with a stronger accent border.

**Acceptance Criteria**
- [ ] Both **Starter** and **Pro Builder** cards render their full feature lists cleanly without overflowing text.
- [ ] The **Pro Builder** card displays a `"Most Popular"` badge while **Starter** does not.
- [ ] Feature rows align their bullet and text vertically centered with consistent spacing via `gap`.

**Expected Behavior**
- Both cards appear cleanly styled with distinct typography sizes for the title, bold price, muted description, and bulleted feature rows.

<details>
<summary>Hint</summary>

Put the title and optional badge inside a `cardHeader` row (`flexDirection: 'row'`, `justifyContent: 'space-between'`, `alignItems: 'center'`). For each feature row, give `<Text style={styles.featureText}>` `flex: 1` so long feature lines wrap cleanly next to the bullet instead of overflowing the card.

</details>

---

### 2. Intermediate — Support Light/Dark Themes & Platform Shadows

**Requirements**
- Define semantic `LIGHT_THEME` and `DARK_THEME` color palettes (`background`, `surface`, `surfaceMuted`, `border`, `primary`, `primaryText`, `textPrimary`, `textSecondary`, `badgeBg`, `badgeText`) selected via `useColorScheme()`.
- Replace the placeholder `_platformName` with a typed `Platform.select<ViewStyle>` helper that applies `shadowColor` / `shadowOffset` / `shadowOpacity` / `shadowRadius` on iOS and `elevation` on Android.
- Keep `SafeAreaProvider` and `SafeAreaView` imported strictly from `react-native-safe-area-context` (never from `react-native`), applying `theme.background` to `SafeAreaView`.

**Acceptance Criteria**
- [ ] No `SafeAreaView` is imported from `react-native`.
- [ ] Switching the simulator or device between Light Mode and Dark Mode updates background, card surface, borders, badge, and text colors with strong readability.
- [ ] Cards show soft shadows on iOS and Material `elevation` on Android.

**Expected Behavior**
- Toggling system Dark Mode switches the entire screen seamlessly from light slate/white to deep navy/charcoal surfaces without unreadable black-on-dark text.

<details>
<summary>Hint</summary>

Remember that Android `elevation` only renders a shadow when the `<View>` has a solid (non-transparent) `backgroundColor`. Return `Platform.select<ViewStyle>({ ios: { ... }, android: { elevation: ... }, default: { ... } }) ?? {}` from a helper function so TypeScript stays strictly typed.

</details>

---

### 3. Challenge — Responsive Two-Column Layout & Billing Toggle

**Requirements**
- Use `useWindowDimensions()` so cards stack vertically on narrow screens (`width < 700`) and sit side-by-side (`flexDirection: 'row'`, `alignItems: 'stretch'`) on wide screens (`width >= 700`), with a sensible `maxWidth` (e.g., `960`) and `alignSelf: 'center'` for large tablets/web.
- Style the **Monthly / Annual (Save 20%)** segmented toggle control so the active billing cycle is visually highlighted and sets `accessibilityState={{ selected: isActive }}`.
- Fix `formatPrice` so selecting `'annual'` applies a **20% discount** (`Math.round(monthlyPrice * 0.8)`) to paid plans while keeping `$0` free.
- Highlight the currently selected plan's action button (`"Selected Plan"` in primary accent color vs. `"Select Plan"` in muted surface color) and expose `accessibilityState={{ selected: isSelected }}`.

**Acceptance Criteria**
- [ ] On narrow phone viewports (`width < 700`), cards stack vertically; rotating or widening past `700 dp` places both cards side-by-side at equal height.
- [ ] Switching from **Monthly** to **Annual** updates **Pro Builder** from `$19/mo` to `$15/mo`, while **Starter** stays `$0`.
- [ ] Tapping either card's action button updates `selectedPlanId`, border highlight, and button label/color immediately.
- [ ] `npm run typecheck` and `npm run lint` pass with zero errors.

**Expected Behavior**
- Both cards maintain clean proportions on phones, landscape tablets, and web browsers, and interactive toggles respond immediately with pressed opacity feedback and accessible selection state.

<details>
<summary>Hint</summary>

Give the card's feature list `flex: 1` inside a `card` container so that when both cards sit side-by-side (`alignItems: 'stretch'`), their bottom action buttons align neatly along the same baseline even when one plan has more bullet items than the other!

</details>

## Reference Solution

<details>
<summary>Only after trying: view reference solution link</summary>

Compare your finished work with [`../solutions/PricingCardSolution.tsx`](../solutions/PricingCardSolution.tsx).

</details>

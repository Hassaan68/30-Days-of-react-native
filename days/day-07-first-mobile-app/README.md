# Day 07: Build Your First Mobile App

## Learning Objectives

By the end of Day 07, you will be able to:

- Combine everything from Week 1—TypeScript, React components, hooks, Flexbox layouts, light/dark themes, safe areas, and core components—into a cohesive multi-screen mobile app.
- Break a mobile UI into small, reusable, strictly typed building blocks (`Avatar`, `StatItem`, `SkillTag`, `ActionButton`).
- Manage interactive UI state cleanly (following/unfollowing, endorsing skills, switching themes, opening modals).
- Implement simple state-driven screen switching between a **Profile** screen and an **About** screen, understanding why dedicated navigation libraries like Expo Router (Day 08) become essential as apps grow.

## Prerequisites

- Completed Days 01 through 06:
  - [Day 05: Styling and Layout](../day-05-styling-and-layout/README.md)
  - [Day 06: Core React Native Components](../day-06-core-components/README.md)
- Ready to celebrate finishing Week 1 by building a real portfolio-worthy mobile app!

## Introduction

Welcome to your **Week 1 Capstone**! Over the past six days, you learned the mental models behind React Native, TypeScript, React hooks, Flexbox styling, theming, safe areas, and core components. Today, you move from isolated concepts to shipping a complete, polished **Developer Profile App**.

Instead of dumping all JSX into one giant 400-line component, you will design clean, reusable UI primitives (`Avatar`, `StatItem`, `SkillTag`, and `ActionButton`), wire up Light and Dark Mode support, add interactive state (Follow button, Skill Endorsements, Contact Modal), and connect two screens (`Profile` and `About`) via a bottom tab bar.

For the full standalone project guide and extension ideas, see **[Project 01: Developer Profile App](../../projects/project-01-profile-app/README.md)**.

## Concepts

### 1. Component Decomposition (Thinking in Small Primitives)

Great mobile apps are composed from small, focused components that each have one clear job:

| Component | Responsibility | Props |
| --- | --- | --- |
| **`Avatar`** | Displays circular profile photo with an automatic initials fallback on load error | `name`, `imageUrl`, `size`, `palette` |
| **`StatItem`** | Renders a numeric highlight stacked above a muted label | `label`, `value`, `palette` |
| **`SkillTag`** | Interactive pill that toggles endorsed state on press | `label`, `selected`, `onPress`, `palette` |
| **`ActionButton`** | Consistent primary or secondary call-to-action button | `label`, `variant`, `onPress`, `palette` |

Splitting UI into small pieces makes styling consistent, reduces duplication, and makes testing (Day 20) effortless.

### 2. Lifting Shared State Up

Notice how endorsing a skill inside `SkillTag` also updates the `"Endorsed"` counter inside `StatItem`, and tapping `"Follow"` updates the `"Followers"` counter. Both pieces of state (`isFollowing` and `endorsedSkills`) live in the parent screen (`ProfileAppContent`) and flow downward via props—a single source of truth with zero out-of-sync numbers.

### 3. Screen Switching Before Expo Router

In a small 2-screen app, storing `const [activeTab, setActiveTab] = useState<'profile' | 'about'>('profile')` lets you swap between screens cleanly while keeping state intact.

Understanding this simple approach helps you appreciate what **Expo Router** (covered tomorrow on Day 08) automates for larger apps:

- Native push/pop animations and swipe-back gestures
- Deep linking (`myapp://profile/maya`) and web URL sync
- Hardware Android Back button history stacks
- Typed route parameters and nested tab/stack layouts

### 4. Week 1 Review Checklist

Before moving into Week 2 (Navigation, Forms, State, APIs, and Auth), confirm you feel comfortable with every Week 1 pillar:

- [ ] **TypeScript**: Interfaces, union types, strict null checks, and zero `any`
- [ ] **React Core**: Functional components, typed props, conditional rendering, list keys
- [ ] **Hooks**: `useState`, `useEffect`, `useMemo`, `useCallback`, custom hooks
- [ ] **Styling**: `StyleSheet.create`, column-first Flexbox, `useWindowDimensions`, `useColorScheme`, `Platform.select`, `react-native-safe-area-context`
- [ ] **Core Components**: `View`, `Text`, `Image`, `Pressable`, `TextInput`, `ScrollView`, `FlatList`, `SectionList`, `Modal`, `ActivityIndicator`

## Code Examples

### Example: Complete Developer Profile App

Open [`./examples/ProfileAppDemo.tsx`](./examples/ProfileAppDemo.tsx) to inspect the complete Week 1 Capstone implementation. It includes:

- Exported reusable components: `Avatar`, `StatItem`, `SkillTag`, `ActionButton`
- Automatic Light/Dark Mode via `useColorScheme()` plus a manual theme toggle in the top bar
- Interactive `Follow / Following` toggle that updates the formatted follower count
- Tappable `SkillTag` pills that track endorsed skills live
- Two screens (`Profile` and `About`) controlled by an accessible bottom tab bar (`accessibilityRole="tab"`)
- A Contact `Modal` with `animationType="fade"` and `onRequestClose`

## Step-by-Step Explanation

1. **Define Semantic Theme Palettes (`LIGHT_PALETTE` & `DARK_PALETTE`)**: Every component receives a typed `Palette` object so switching themes updates every surface, border, pill, and button simultaneously.
2. **Build Resilient Primitives (`Avatar`)**: Real mobile networks fail. `Avatar` attaches `onError={() => setImageFailed(true)}` to `<Image>` and falls back to crisp generated initials so users never see a broken empty circle.
3. **Compose the Profile Header & Metrics Row**: Flexbox rows (`flexDirection: 'row'`) align the `Avatar` beside name/role details, while three `StatItem` blocks share equal width (`flex: 1`) separated by subtle vertical dividers.
4. **Add Interactive Feedback**: Every `Pressable` uses a style callback (`({ pressed }) => [...]`) to dim slightly on touch, plus `accessibilityRole` and `accessibilityState` for screen reader support.
5. **Switch Screens with Preserved State**: Toggling between the `Profile` and `About` tabs swaps the content inside `<ScrollView>` while keeping `isFollowing`, `endorsedSkills`, and `themeOverride` alive in parent state.

## Common Mistakes

1. **Building a single monolithic screen component**
   - *Why it hurts*: Hard to debug, hard to reuse styles, and impossible to maintain as features grow.
   - *Fix*: Extract cohesive primitives (`Avatar`, `StatItem`, `SkillTag`, `ActionButton`) as soon as a UI pattern repeats or carries its own logic.
2. **Duplicating derived values in separate state variables**
   - *Why it hurts*: Storing both `endorsedSkills: string[]` and `endorsedCount: number` in `useState` easily drifts out of sync.
   - *Fix*: Compute derived values directly during render (`endorsedSkills.length`, `isFollowing ? 1285 : 1284`).
3. **Forgetting fallback states for remote images**
   - *Why it hurts*: Offline users or slow connections leave blank holes where avatars belong.
   - *Fix*: Always handle `onError` with a clean initials or placeholder fallback.
4. **Hardcoding white text or black backgrounds without checking Dark Mode**
   - *Fix*: Route every color through your theme palette and preview both modes before wrapping up.

## Best Practices

- **Keep UI primitives pure and predictable**: Pass data and callbacks in via props rather than hardcoding global app data inside `SkillTag` or `ActionButton`.
- **Use `SafeAreaProvider` + `SafeAreaView` from `react-native-safe-area-context`** so headers and bottom tab bars never collide with system status bars or home indicators.
- **Give every interactive element an accessible role and state** (`accessibilityRole="button"` or `"tab"`, `accessibilityState={{ selected }}`).
- **Commit small working milestones**: Get layout right first, then add theme tokens, then wire up interactive state.

## Exercises

Head to [`./exercises/README.md`](./exercises/README.md) and open [`./exercises/ProfileSectionExercise.tsx`](./exercises/ProfileSectionExercise.tsx):

1. **Beginner**: Build a Featured Projects card list with a `"Star"` toggle button that updates each project's live star count.
2. **Intermediate**: Add Light and Dark Mode palettes using `useColorScheme()` plus an interactive `"Available for Hire"` / `"Focused on Building"` availability toggle.
3. **Challenge**: Add an `"Overview"` / `"Projects"` tab switcher and an `"Edit Bio"` `Modal` with a multiline `TextInput` that saves updated text back into profile state.

## Solutions

Compare your finished code with [`./solutions/ProfileSectionSolution.tsx`](./solutions/ProfileSectionSolution.tsx).

Notice how the solution introduces a reusable `SectionCard` wrapper component using `children: ReactNode`, computes `totalStars` directly from `PROJECTS` and `starredIds` without duplicate state, and preserves all edits when switching tabs.

## Mini Project

**Ship Project 01 — Your Personal Developer Profile App**: Follow the full specification in **[`projects/project-01-profile-app/README.md`](../../projects/project-01-profile-app/README.md)** to customize this capstone with your own bio, skills, project showcase, social links, and custom color accent!

## Key Takeaways

- Real mobile apps are built by composing small, typed, single-responsibility UI components.
- Lift shared state to the nearest common parent and derive counts/summaries instead of duplicating state.
- Combining semantic Light/Dark themes, safe areas, Flexbox, and `Pressable` feedback gives your app an authentic native feel.
- State-based tab switching works well for tiny 2-screen demos, setting the stage for real native navigation with Expo Router on Day 08.

## Further Reading

- [Project 01 Full Guide — Developer Profile App](../../projects/project-01-profile-app/README.md)
- [React Docs — Thinking in React](https://react.dev/learn/thinking-in-react)
- [React Native Docs — Platform Specific Code](https://reactnative.dev/docs/platform-specific-code)
- [Expo Docs — Develop User Interface Overview](https://docs.expo.dev/develop/user-interface/splash-screen-and-app-icon/)

## Progress Checklist

- [ ] Reviewed every item in the Week 1 Review Checklist
- [ ] Explored all reusable components in `examples/ProfileAppDemo.tsx`
- [ ] Completed the Beginner, Intermediate, and Challenge tasks in `exercises/ProfileSectionExercise.tsx`
- [ ] Verified TypeScript (`npm run typecheck`) and ESLint (`npm run lint`) pass
- [ ] Read the full Project 01 guide in `projects/project-01-profile-app/README.md`

## Next Day

Congratulations on finishing Week 1! Start Week 2 by learning modern file-based navigation in [Day 08: Navigation with Expo Router](../day-08-navigation-expo-router/README.md).

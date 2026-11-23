# Day 15: Animations

## Learning Objectives

By the end of Day 15, you will be able to:

- Explain why native **UI-thread** animations matter on mobile compared to CSS transitions on the web.
- Build smooth micro-interactions with React Native's built-in **`Animated`** API using `useNativeDriver: true`.
- Create 60–120 FPS animations with **`react-native-reanimated`** (`useSharedValue`, `useAnimatedStyle`, `withSpring`, `withTiming`, `FadeIn`, `FadeOut`).
- Combine **`react-native-gesture-handler`** (`GestureDetector`, `Gesture.Pan()`, `Gesture.Tap()`) with Reanimated for fluid, physics-driven gestures.
- Respect user accessibility preferences with `useReducedMotion()` and `AccessibilityInfo`.
- Choose GPU-friendly properties (`transform`, `opacity`) to avoid layout thrashing.

## Prerequisites

- Completed [Day 14: Weather App](../day-14-weather-app/README.md) (or comfort with React Native components, hooks, and styling).
- Understanding of `StyleSheet`, `Pressable`, and `useRef` from Days 4–6.

## Why This Concept Matters

On mobile, users touch the screen directly—if a button, swipeable card, or drawer lags behind their finger by even two frames, the entire app immediately feels broken or cheap. Thoughtful, 60–120 FPS motion communicates hierarchy, confirms taps, and makes navigation effortless, while respecting **Reduce Motion** ensures your app stays comfortable for everyone. Mastering both React Native's built-in `Animated` API and Reanimated + Gesture Handler gives you the exact toolkit used in top-rated iOS and Android apps.

## Introduction

Great mobile apps feel **responsive and alive**. Subtle motion communicates state changes, directs the user's eyes, and makes touches feel physical — whether a heart icon pops when tapped, a card glides back into place with spring physics, or an accordion smoothly unfolds.

At the same time, poorly written animations are the fastest way to make an app feel sluggish. On a 60 Hz display, each frame has just **16.67 ms** to compute and render (and only **8.33 ms** on 120 Hz ProMotion/LTPO displays). Today we will progress step by step: first understanding why UI-thread execution matters compared to CSS transitions on the web, then building a crisp micro-interaction with the built-in `Animated` API, and finally unlocking continuous gesture-driven physics with `react-native-reanimated` and `react-native-gesture-handler`.

## Concepts

### 1. CSS Transitions on Web vs. UI-Thread Animations on Mobile

If you come from web development, you are used to writing `transition: transform 200ms ease` in CSS and letting the browser compositor handle it. React Native has no CSS transition engine—instead, your app splits work across two primary threads:

- **JavaScript Thread**: Runs React components, state updates, event handlers, and JSON parsing.
- **UI (Main) Thread**: Lays out native iOS/Android views and paints every frame to the screen.

If an animation updates styles from the JavaScript thread on every frame, any background API parse or React re-render stalls the animation and drops frames. Moving animation calculations onto the **UI thread** keeps motion buttery-smooth even while JavaScript is busy.

> **React Web vs. React Native Animations**
>
> | Aspect | React Web | React Native |
> | --- | --- | --- |
> | **Simple transitions** | CSS `transition` / `@keyframes` | Built-in `Animated` API with **`useNativeDriver: true`** |
> | **Gesture-driven physics** | Pointer events + `requestAnimationFrame` / Framer Motion | **`react-native-reanimated`** (UI-thread worklets) + **`react-native-gesture-handler`** |
> | **Reduced motion** | `@media (prefers-reduced-motion: reduce)` | `useReducedMotion()` (Reanimated) or `AccessibilityInfo.isReduceMotionEnabled()` |
> | **GPU-safe properties** | `transform`, `opacity` | `transform`, `opacity` (avoid animating `width`, `height`, `margin`) |

### 2. Step 1: Built-in `Animated` API (Great Starting Point)

Before reaching for external libraries, start with React Native's built-in `Animated` module—it is perfect for simple, self-contained transitions and micro-interactions like [`examples/AnimatedLikeButton.tsx`](./examples/AnimatedLikeButton.tsx):

- `useRef(new Animated.Value(initial)).current` stores an animatable numeric value that survives re-renders without triggering them.
- `Animated.timing(value, { toValue, duration, useNativeDriver: true })` runs a time-based curve.
- `Animated.spring(value, { toValue, friction, tension, useNativeDriver: true })` uses spring physics.
- `Animated.sequence([...])` and `Animated.parallel([...])` compose multiple animations cleanly.

Always pass **`useNativeDriver: true`** whenever animating `transform` or `opacity`. It hands the animation curve off to native code so frames execute on the UI thread without waiting on JavaScript.

### 3. Step 2: `react-native-reanimated` Shared Values & Worklets

Once you need animations that track a user's finger continuously, interrupt cleanly mid-flight, or coordinate multiple views, step up to **`react-native-reanimated`**.

Reanimated introduces **worklets** — small JavaScript functions compiled by the Reanimated Babel plugin to execute synchronously on the **UI thread**:

| Primitive | Purpose |
| --- | --- |
| `useSharedValue(initial)` | Reactive value readable/writable from both JS and UI threads without triggering React re-renders. |
| `useAnimatedStyle(() => ...)` | Worklet that maps shared values to view styles on the UI thread every frame. |
| `withTiming(toValue, config)` | Smooth duration/easing-based transition. |
| `withSpring(toValue, config)` | Physics-based spring transition that preserves gesture velocity. |
| `FadeIn` / `FadeOut` | Declarative entering and exiting layout animations when mounting/unmounting components. |
| `runOnJS(fn)` | Safely invokes a regular JS-thread function (like `setState`) from inside a UI-thread worklet. |

### 4. Step 3: Gesture-Driven Motion with `react-native-gesture-handler`

Standard `Pressable` handlers notify JavaScript after touch events occur. `react-native-gesture-handler` recognizes touches directly on the native UI thread and feeds live coordinates into Reanimated shared values (as seen in [`examples/DraggableCard.tsx`](./examples/DraggableCard.tsx)):

- Wrap your app root (or gesture container) in `<GestureHandlerRootView>`.
- Define gestures declaratively with `Gesture.Pan()`, `Gesture.Tap()`, `Gesture.Pinch()`, and compose them with `Gesture.Simultaneous()` or `Gesture.Race()`.
- Attach them to any view with `<GestureDetector gesture={composedGesture}>`.

> **TypeScript Note (React Native 0.88 + Reanimated 3)**
>
> When you open [`examples/DraggableCard.tsx`](./examples/DraggableCard.tsx) or [`solutions/ExpandableCardSolution.tsx`](./solutions/ExpandableCardSolution.tsx), you will notice a small `FlatView` / `FlatText` wrapper passed into `Animated.createAnimatedComponent(...)` instead of using `Animated.View` directly:
>
> ```tsx
> interface FlatAnimatedViewProps extends Omit<ViewProps, 'style'> {
>   ref?: Ref<ViewInstance>;
>   style?: ViewStyle | ViewStyle[];
> }
> function FlatView({ ref, ...props }: FlatAnimatedViewProps) {
>   return <View ref={ref} {...props} />;
> }
> const ReanimatedView = Animated.createAnimatedComponent(FlatView);
> ```
>
> **Why is this here?** React Native 0.88 types `ViewProps['style']` and `TextProps['style']` using a recursive `ReadonlyArray` type, which can hit TypeScript's type instantiation depth limit (`TS2589`) inside Reanimated 3's `AnimatedStyle` helper. Replacing the recursive style prop with a flat `ViewStyle | ViewStyle[]` (while keeping `ref?: Ref<ViewInstance>` for native ref forwarding) keeps strict TypeScript 100% happy with zero runtime overhead!

### 5. Reduced Motion Accessibility

Roughly 1 in 10 users experience discomfort or vestibular issues from excessive motion and enable **Reduce Motion** (iOS) or **Remove Animations** (Android).

- In Reanimated, call **`useReducedMotion()`**.
- With the built-in `Animated` API, check **`AccessibilityInfo.isReduceMotionEnabled()`** and listen to `'reduceMotionChanged'`.
- When reduced motion is active, snap directly to final states or substitute gentle opacity fades instead of spinning, zooming, or bouncing.

### 6. Performance: What to Animate (and What to Avoid)

| Safe to Animate (GPU / Compositor) | Avoid Animating Per Frame (Layout Thrashing) |
| --- | --- |
| `transform` (`translateX`, `translateY`, `scale`, `rotate`) | `width`, `height` |
| `opacity` | `top`, `left`, `margin`, `padding`, `flex` |

Animating layout properties forces the Yoga layout engine to recalculate positions of sibling and parent views on every frame, causing visible stutter. Prefer `transform` and `opacity` whenever possible.

## Code Examples

Start with Example 1 (built-in `Animated`) before moving to Example 2 (`Reanimated` + `Gesture Handler`). Both are runnable interactive components that you can preview right away via `npm start` in this repository's shared Expo launcher, or place into your own Expo project at the paths below:

### Example 1: Native-Driver Like Button (`Animated` API)

- **Type**: **Runnable interactive component** (place in `src/components/AnimatedLikeButton.tsx` in your Expo project, or preview via `npm start` in the shared Expo launcher).
- See [`examples/AnimatedLikeButton.tsx`](./examples/AnimatedLikeButton.tsx) for the complete runnable component.

```tsx
Animated.parallel([
  Animated.sequence([
    Animated.timing(scaleAnim, {
      toValue: 1.28,
      duration: 120,
      useNativeDriver: true,
    }),
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 160,
      useNativeDriver: true,
    }),
  ]),
  Animated.timing(ringOpacityAnim, {
    toValue: 0,
    duration: 320,
    useNativeDriver: true,
  }),
]).start();
```

### Example 2: Drag-to-Dismiss Card (`Reanimated` + `Gesture Handler`)

- **Type**: **Runnable interactive screen/component** (place in `src/components/DraggableCard.tsx` or `app/draggable-card.tsx` in your Expo project, or preview via `npm start` in the shared Expo launcher).
- See [`examples/DraggableCard.tsx`](./examples/DraggableCard.tsx) for the complete runnable component.

```tsx
const panGesture = Gesture.Pan()
  .onStart(() => {
    startX.value = translateX.value;
    startY.value = translateY.value;
    scale.value = reducedMotion ? 1 : withTiming(1.03, { duration: 120 });
  })
  .onUpdate((event) => {
    translateX.value = startX.value + event.translationX;
    translateY.value = startY.value + event.translationY;
  })
  .onEnd((event) => {
    const shouldDismiss =
      Math.abs(translateX.value) > dismissThreshold || Math.abs(event.velocityX) > 900;

    if (shouldDismiss) {
      const targetX = (translateX.value >= 0 ? 1 : -1) * 420;
      translateX.value = withTiming(targetX, { duration: 220 }, (finished) => {
        if (finished) {
          runOnJS(handleDismiss)();
        }
      });
      return;
    }

    translateX.value = withSpring(0, { damping: 15, stiffness: 170 });
    translateY.value = withSpring(0, { damping: 15, stiffness: 170 });
    scale.value = withSpring(1);
  });
```

## Step-by-Step Explanation

1. **Store animation state outside React renders**: In `AnimatedLikeButton.tsx`, `useRef(new Animated.Value(1)).current` prevents re-creating animation drivers on re-render. In `DraggableCard.tsx`, `useSharedValue(0)` keeps coordinates on the UI thread without causing React re-renders during dragging.
2. **Compose parallel and sequential motion**: Clicking "Like" simultaneously scales the heart up then springs back while expanding and fading an outer ring — all driven natively via `useNativeDriver: true`.
3. **Derive visual styles directly from shared values**: Inside `useAnimatedStyle`, `rotationDeg` and `opacity` are derived from `translateX.value`. Whenever the user drags 1 pixel, the card rotates slightly and fades smoothly at 60–120 FPS.
4. **Bridge back to React state only when finished**: Calling `setVisible(false)` directly inside a UI-thread worklet would crash. Wrapping `handleDismiss` in `runOnJS(handleDismiss)()` safely triggers the React unmount once the slide-out completes.
5. **Honor reduced motion**: Both components query the OS preference and skip non-essential motion when enabled.

## Expected Output

When you preview both examples on a phone or simulator:

- **`AnimatedLikeButton.tsx`**: Renders a pill button (`♡ 42`). Tapping it switches the pill to soft rose (`♥ 43`), pops the heart up to `1.28x` then bounces it back with a spring, and radiates a fading coral ring outward. Tapping again smoothly shrinks (`0.88x`) and returns to `♡ 42`. With **Reduce Motion** enabled, the heart and count toggle crisply with zero bounce.
- **`DraggableCard.tsx`**: Renders a centered white card with a top grab handle and **`Recenter Card`** button:

```text
+------------------------------------------+
|               [  ----  ]                 |
|                                          |
|  Swipe or Drag Me                        |
|  Drag horizontally past the threshold    |
|  to dismiss, or double-tap to center.    |
|                                          |
|  [ Recenter Card ]                       |
+------------------------------------------+
```

  - **Dragging slightly**: The card lifts (`scale: 1.03`), tilts subtly in the drag direction, and fades proportionally—releasing before `140px` snaps it back to center with spring physics.
  - **Swiping past threshold (or flicking fast)**: The card glides off-screen and fades into `"Card Dismissed"` with a blue **`Restore Card`** button.
  - **Double-tapping**: Smoothly recenters the card with spring physics.

## Common Mistakes

- **Forgetting `useNativeDriver: true` in `Animated`**: Leaving it `false` runs the animation loop on the JS thread and drops frames under load.
- **Using `useState` for frame-by-frame drag coordinates**: Updating React state on every touch event causes 60+ full component re-renders per second. Always use `useSharedValue`.
- **Animating `width`, `height`, or `marginTop` continuously**: Causes expensive Yoga layout recalculations on every frame. Use `scale`, `translateY`, and `opacity` instead.
- **Calling React state setters directly inside Reanimated callbacks**: Worklets execute on the UI thread; always wrap JS callbacks with `runOnJS(fn)(args)`.
- **Missing `<GestureHandlerRootView>`**: Without a root `GestureHandlerRootView`, gestures may silently fail on Android.

## Best Practices

- Start with `Animated` (`useNativeDriver: true`) for simple one-shot micro-interactions, and reach for `react-native-reanimated` for gestures, interruptible springs, or shared transitions.
- Prefer **spring animations** (`withSpring`) for physical interactions (drag release, button bounce) because springs respond naturally to interruption and velocity.
- Keep micro-interactions crisp and fast (**120–280 ms**). Slow animations make an app feel sluggish rather than polished.
- Always check `useReducedMotion()` so your animations remain inclusive.
- Test animations on a real mid-range Android device in release mode — debug mode carries extra JS overhead that masks real performance characteristics.

## Exercises

Head to [`exercises/README.md`](./exercises/README.md) and open [`exercises/ExpandableCardExercise.tsx`](./exercises/ExpandableCardExercise.tsx):

1. **Beginner**: Rotate a chevron indicator smoothly between `0deg` and `180deg` when toggling an expandable card using `useSharedValue`, `withTiming`, and `useAnimatedStyle`.
2. **Intermediate**: Add spring press feedback (`scale: 0.985` on press-in, `withSpring(1)` on press-out) and animate the expanded card body with `FadeIn`/`FadeOut` and `translateY`/`opacity`.
3. **Challenge**: Integrate `useReducedMotion()` so that users with Reduce Motion enabled get instant, accessible state transitions without distracting motion.

## Solutions

Try completing `ExpandableCardExercise.tsx` on your own first before expanding the solution walkthrough below.

<details>
<summary>Click to view solution notes & links</summary>

- [`solutions/ExpandableCardSolution.tsx`](./solutions/ExpandableCardSolution.tsx) — Complete, strictly typed Reanimated accordion card demonstrating:
  - Flat-style `Animated.createAnimatedComponent` wrappers (`ReanimatedView` and `ReanimatedText`) compatible with React Native 0.88 + Reanimated 3 strict TypeScript.
  - `progress` and `cardScale` shared values animating chevron rotation (`0deg` → `180deg`), press scale feedback (`0.985` → `withSpring(1)`), and body reveal (`opacity` + `translateY`).
  - `FadeIn` / `FadeOut` entering and exiting transitions bypassed cleanly whenever `useReducedMotion()` is `true`.

</details>

## Mini Project

Build an **Interactive Toast Notification Banner**:

- Slides in from the top using Reanimated `FadeIn` or a `translateY` spring animation.
- Supports swiping upward with `Gesture.Pan()` to dismiss early.
- Auto-dismisses after 3 seconds if untouched.
- Respects `useReducedMotion()` by fading in/out without sliding when reduced motion is enabled.

## Key Takeaways

- Keep animations on the **UI thread** using `useNativeDriver: true` (built-in `Animated`) or **worklets** (`react-native-reanimated`).
- Start simple with `Animated` for one-shot micro-interactions, and use `react-native-reanimated` + `react-native-gesture-handler` for continuous, interruptible 60–120 FPS gestures.
- Animate **`transform`** and **`opacity`** to stay on the GPU compositor and avoid layout thrashing.
- Always bridge UI-thread callbacks back to React state via `runOnJS`.
- Support **Reduce Motion** in every animated component you ship.

## Further Reading

- [React Native Animations Documentation](https://reactnative.dev/docs/animations)
- [React Native Reanimated Documentation](https://docs.swmansion.com/react-native-reanimated/)
- [React Native Gesture Handler Documentation](https://docs.swmansion.com/react-native-gesture-handler/)
- [Expo Animations Overview](https://docs.expo.dev/develop/user-interface/animation/)

## Progress Checklist

- [ ] Understood the difference between CSS transitions on web and UI-thread animations on mobile
- [ ] Built a native-driver micro-interaction with the built-in `Animated` API (`AnimatedLikeButton.tsx`)
- [ ] Created a gesture-driven component with `GestureDetector` and `useSharedValue` (`DraggableCard.tsx`)
- [ ] Understood the RN 0.88 + Reanimated 3 flat-style `Animated.createAnimatedComponent` TypeScript pattern
- [ ] Completed `ExpandableCardExercise.tsx` with `useReducedMotion()`
- [ ] Verified zero `tsc` and ESLint issues

## Next Day

Continue to [Day 16: Lists and Performance](../day-16-lists-and-performance/README.md) to learn how to virtualize large datasets, eliminate wasted re-renders, and profile your app like a pro.

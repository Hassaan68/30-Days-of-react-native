# Day 15: Animations

## Learning Objectives

By the end of Day 15, you will be able to:
- Build smooth micro-interactions with React Native's built-in `Animated` API using `useNativeDriver: true`.
- Distinguish between the JavaScript thread and the Native UI thread, and explain why **worklets** eliminate frame drops.
- Create 60–120 FPS animations with `react-native-reanimated` (`useSharedValue`, `useAnimatedStyle`, `withSpring`, `withTiming`, `FadeIn`, `FadeOut`).
- Combine `react-native-gesture-handler` (`GestureDetector`, `Gesture.Pan()`, `Gesture.Tap()`) with Reanimated for fluid, physics-driven gestures.
- Respect user accessibility preferences with `useReducedMotion()` and `AccessibilityInfo`.
- Choose GPU-friendly properties (`transform`, `opacity`) to avoid layout thrashing.

## Prerequisites

- Completed [Day 14: Weather App](../day-14-weather-app/README.md) (or comfort with React Native components, hooks, and styling).
- Understanding of `StyleSheet`, `Pressable`, and `useRef` from Days 4–6.

## Introduction

Great mobile apps feel **responsive and alive**. Subtle motion communicates state changes, directs the user's eyes, and makes touches feel physical — whether a heart icon pops when tapped, a card glides back into place with spring physics, or an accordion smoothly unfolds.

At the same time, poorly written animations are the fastest way to make an app feel sluggish. On a 60 Hz display, each frame has just **16.67 ms** to compute and render (and only **8.33 ms** on 120 Hz ProMotion/LTPO displays). Today you will learn how React Native executes animations across threads and how to use both the built-in `Animated` API and `react-native-reanimated` + `react-native-gesture-handler` to hit silky-smooth frame rates every time.

## Concepts

### 1. The JS Thread vs. The UI Thread

React Native runs your React components, state updates, and API parsing on the **JavaScript thread**, while native iOS/Android views are laid out and painted on the **UI (Main) thread**.

- If an animation calculates every frame on the JS thread and sends updates across to the UI thread, any heavy JS work (like parsing JSON or rendering a screen) stalls the animation and drops frames.
- Moving animation execution to the **UI thread** keeps motion fluid even while the JS thread is busy.

### 2. Built-in `Animated` API

React Native ships with an `Animated` module suitable for simple, self-contained transitions and micro-interactions:

- `new Animated.Value(initial)` stores an animatable numeric value (held in `useRef` so it survives re-renders).
- `Animated.timing(value, { toValue, duration, useNativeDriver: true })` runs a time-based curve.
- `Animated.spring(value, { toValue, friction, tension, useNativeDriver: true })` uses spring physics.
- `Animated.sequence([...])` and `Animated.parallel([...])` compose multiple animations.

Always pass **`useNativeDriver: true`** whenever animating `transform` or `opacity`. It offloads the animation loop to the native side so frames do not wait on JavaScript.

### 3. `react-native-reanimated` and Worklets

When animations need to react continuously to touch gestures, interrupt smoothly mid-flight, or drive complex shared transitions, **`react-native-reanimated`** is the industry standard.

Reanimated introduces **worklets** — small JavaScript functions compiled by the Reanimated Babel plugin to execute synchronously on the **UI thread**:

| Primitive | Purpose |
| --- | --- |
| `useSharedValue(initial)` | Reactive value readable/writable from both JS and UI threads without triggering React re-renders. |
| `useAnimatedStyle(() => ...)` | Worklet that maps shared values to view styles on the UI thread every frame. |
| `withTiming(toValue, config)` | Smooth duration/easing-based transition. |
| `withSpring(toValue, config)` | Physics-based spring transition that preserves gesture velocity. |
| `FadeIn` / `FadeOut` | Declarative entering and exiting layout animations when mounting/unmounting components. |
| `runOnJS(fn)` | Safely invokes a regular JS-thread function (like `setState`) from inside a UI-thread worklet. |

### 4. Gesture-Driven Motion with `react-native-gesture-handler`

Standard `Pressable` handlers notify JavaScript after touch events occur. `react-native-gesture-handler` recognizes gestures directly on the native UI thread and integrates seamlessly with Reanimated worklets:

- Wrap your app root (or gesture container) in `<GestureHandlerRootView>`.
- Define gestures declaratively with `Gesture.Pan()`, `Gesture.Tap()`, `Gesture.Pinch()`, and compose them with `Gesture.Simultaneous()` or `Gesture.Race()`.
- Attach them to any view with `<GestureDetector gesture={composedGesture}>`.

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

### Example 1: Native-Driver Like Button (`Animated` API)

See [`examples/AnimatedLikeButton.tsx`](./examples/AnimatedLikeButton.tsx) for the complete runnable component.

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

See [`examples/DraggableCard.tsx`](./examples/DraggableCard.tsx) for the complete runnable component.

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

Compare your work against the complete, strictly typed reference implementation:

- [`solutions/ExpandableCardSolution.tsx`](./solutions/ExpandableCardSolution.tsx): Combines `progress` and `cardScale` shared values, GPU-only `transform`/`opacity` animations, `FadeIn`/`FadeOut` layout transitions, and full `useReducedMotion()` support.

## Mini Project

Build an **Interactive Toast Notification Banner**:
- Slides in from the top using Reanimated `FadeIn` or a `translateY` spring animation.
- Supports swiping upward with `Gesture.Pan()` to dismiss early.
- Auto-dismisses after 3 seconds if untouched.
- Respects `useReducedMotion()` by fading in/out without sliding when reduced motion is enabled.

## Key Takeaways

- Keep animations on the **UI thread** using `useNativeDriver: true` (built-in `Animated`) or **worklets** (`react-native-reanimated`).
- Animate **`transform`** and **`opacity`** to stay on the GPU compositor and avoid layout thrashing.
- Pair `react-native-gesture-handler` with Reanimated shared values for 60–120 FPS gesture interactions.
- Always bridge UI-thread callbacks back to React state via `runOnJS`.
- Support **Reduce Motion** in every animated component you ship.

## Further Reading

- [React Native Animations Documentation](https://reactnative.dev/docs/animations)
- [React Native Reanimated Documentation](https://docs.swmansion.com/react-native-reanimated/)
- [React Native Gesture Handler Documentation](https://docs.swmansion.com/react-native-gesture-handler/)
- [Expo Animations Overview](https://docs.expo.dev/develop/user-interface/animation/)

## Progress Checklist

- [ ] Built a native-driver micro-interaction with the built-in `Animated` API
- [ ] Understood the difference between the JS thread and the UI thread
- [ ] Created a gesture-driven component with `GestureDetector` and `useSharedValue`
- [ ] Completed the `ExpandableCardExercise` with `useReducedMotion()`
- [ ] Verified zero `tsc` and ESLint issues

## Next Day

Continue to [Day 16: Lists and Performance](../day-16-lists-and-performance/README.md) to learn how to virtualize large datasets, eliminate wasted re-renders, and profile your app like a pro.

# Implementation Plan

[Overview]
Fix the testimonials carousel rendering issue where cards appear pushed off-screen with desktop-sized dimensions on mobile devices, by correcting horizontal padding application, adding proper card sizing constraints across all breakpoints, and ensuring the initial scroll position snaps to the first card.

The testimonials section currently suffers from four interrelated CSS issues. First, `--container-padding` is defined and overridden in media queries but never actually applied to `.container`, leaving zero horizontal padding around the carousel. Second, `.testimonial-card` has a `min-width: 85%` but no `max-width`, causing cards to grow to ~500px+ on tablets in portrait where the wrapper can be 600px wide. Third, `scroll-snap-align: center` combined with wide cards creates a "frozen" appearance where snap targets are indistinguishable from the current position. Fourth, on narrow screens (320-360px), 85% of ~270px leaves only ~40px of adjacent-card peek — too little to signal swipeability. The fix addresses all four in sequence: wire up horizontal padding, constrain card widths across breakpoints, add an initial snap on load, and test.

[Types]
No new data types, interfaces, enums, or data structures are introduced. The fix is purely CSS with a minor JavaScript initialization call.

- **CSS Custom Properties (modified)**: `--container-padding` in `base.css` currently holds `"90px 20px"` (shorthand for vertical then horizontal). The `.container` class does not use this — it uses `--section-padding` which provides vertical-only padding. The fix keeps both properties but changes `.container` to use `padding: var(--section-padding)` with an explicit horizontal override via a second declaration or by restructuring the property usage. The simplest approach: keep `--section-padding` for vertical spacing and add a new declaration `padding-left` / `padding-right` on `.container` that uses the horizontal component of `--container-padding`, OR change `.container` to use `padding: var(--container-padding)` and wrap `--section-padding` into vertical-only usage on sections that need it. After analysis, the cleanest fix is to change `.container` to `padding: var(--container-padding)` and update `--container-padding` values to be `"4rem 20px"` / `"3rem 16px"` / `"2.5rem 16px"` — absorbing what `--section-padding` used to provide. Since `--section-padding` is only used by `.container`, it can then be removed. However, to minimize blast radius, we instead add `padding-left` and `padding-right` explicitly on `.container` using a new custom property `--container-horizontal-padding` derived from the horizontal component, or simply override `.container` to also apply the horizontal padding. The safest approach with minimal side effects: add `padding: var(--section-padding)` (already present) and below it add `padding-left: 20px; padding-right: 20px;` with media query overrides for 16px. But that duplicates values. Best approach: change `.container` to `padding: var(--container-padding)` and update the values stored in `--container-padding` across breakpoints to include both vertical and horizontal. And update `--section-padding` usage — since it's only used by `.container`, it can remain as-is with vertical-only values, and `.container` switches to `padding: var(--container-padding)`.

- **No new CSS classes** are introduced.

- **No changes to existing CSS class names** except value adjustments.

[Files]
Three files modified. No new files created. No files deleted.

**File 1: `styles/base.css`**
- Purpose: Wire horizontal padding into the `.container` class so content has breathing room on narrow screens.
- Change: Modify the `.container` rule to use `padding: var(--container-padding)` instead of `padding: var(--section-padding)`.
- Change: Update the `--container-padding` values at `:root` level and in media queries to include vertical spacing (absorbing the old `--section-padding` values) so they become full shorthand `"vertical horizontal"`:
  - Desktop: `--container-padding: 4rem 20px;`
  - 768px: `--container-padding: 3rem 16px;`
  - 480px: `--container-padding: 2.5rem 16px;`
- Change: The `--section-padding` custom property becomes unused and should be removed from `:root` and both media query blocks to avoid confusion.

**File 2: `styles/testimonials.css`**
- Purpose: Add explicit width constraints to `.testimonial-card` across four breakpoint zones so cards cannot grow beyond a reasonable mobile/tablet size, and sufficient adjacent-card "peek" is always visible.
- Change: At mobile (≤360px): set `min-width: calc(100% - 48px);` so approximately 48px of the next card is always visible, and add `max-width: none;` to allow natural sizing.
- Change: At small mobile (361px–480px): set `min-width: calc(100% - 64px);` for a slightly larger peek area, and add `max-width: none;`.
- Change: At tablet portrait (481px–767px): add `min-width: 320px; max-width: 460px;` to prevent desktop-sized cards while keeping cards comfortably readable.
- Change: At desktop (≥768px): keep existing `min-width: 350px;` but add `max-width: 450px;` to prevent extreme widths on large screens.
- Existing mobile adjustments block at `max-width: 480px` already sets `padding: 1.5rem` on `.testimonial-card` — this remains unchanged.

**File 3: `script.js`**
- Purpose: Ensure the carousel snaps to the first card on page load so users never see a mid-scroll position with cards cut off on both sides.
- Change: Inside `initTestimonials()`, after creating dots and setting up the observer and arrow listeners, add a call to scroll the wrapper to `left: 0` on initial load: `wrapper.scrollTo({ left: 0, behavior: 'instant' });`. This ensures the carousel always starts at card 0 regardless of any cached scroll position or layout shift.

[Functions]
One function receives a minor initialization addition.

**New functions:**
- (none)

**Modified functions:**

1. **`initTestimonials()`** in `script.js` (lines 11–98)
   - Current behavior: Creates dots, sets up IntersectionObserver for dot syncing, and wires arrow click handlers. Does not perform an initial scroll position set.
   - Required change: After the observer setup block (after line 56 `cards.forEach((card) => observer.observe(card));`), add:
     ```javascript
     // Snap to first card on load
     wrapper.scrollTo({ left: 0, behavior: 'instant' });
     ```
   - This is a one-line addition with no impact on existing functionality.

**Removed functions:**
- (none)

[Classes]
No class modifications. This fix involves only CSS value changes and a one-line JavaScript addition. No classes, interfaces, structs, or other type constructs are added, modified, or removed.

[Dependencies]
No dependency changes. The project uses vanilla HTML, CSS, and JavaScript with no external libraries or package managers. No new packages, version bumps, or CDN imports are needed.

[Testing]
Manual testing across five breakpoint widths plus functional verification of the carousel interaction.

**Test file requirements:** No new test files. Testing is manual in-browser.

**Test scenarios:**

1. **320px width (narrowest supported):**
   - Open page at 320px viewport width
   - Verify testimonials section heading "What Our Clients Say" is visible
   - Verify at least one testimonial card is fully visible
   - Verify approximately 48px of the adjacent card is visible on the right
   - Verify no horizontal scrollbar appears on the page
   - Verify dots indicator is centered and shows 3 dots (active on first)

2. **375px width (iPhone SE/6/7/8):**
   - Same checks as 320px with appropriate peek visibility

3. **414px width (iPhone 11/XR/XS Max):**
   - Verify card is centered with adjacent-card peek visible on both sides
   - Swipe left and verify smooth snap to next card
   - Verify arrow buttons are visible (arrows hide only at ≤480px)

4. **640px width (tablet portrait / small laptop):**
   - Verify cards do not exceed 460px width (not desktop-sized)
   - Verify both navigation arrows are visible and functional
   - Click left/right arrows and verify proper card centering

5. **768px width (desktop breakpoint):**
   - Verify cards use `min-width: 350px; max-width: 450px;`
   - Verify all three cards are potential visible states depending on wrapper width
   - Verify carousel behavior is natural and non-"frozen"

6. **Functional tests (all widths):**
   - Click dot 2 → verify card 2 snaps to center
   - Click left arrow from card 3 → verify card 2 snaps to center
   - Swipe gesture → verify dots update to reflect active card
   - Page reload → verify carousel starts at card 1 (first card) every time

7. **Regression checks:**
   - Verify the "Why Do You Need a Bookkeeper?" section cards still render correctly
   - Verify Stats section cards still render correctly
   - Verify hamburger menu still works at ≤640px
   - Verify form layout is unaffected
   - Verify footer layout is unaffected

[Implementation Order]
Step-by-step sequence minimizing conflicts and ensuring each change builds correctly on the previous one.

1. **Modify `styles/base.css`** — Update `.container` padding and `--container-padding` values. This is the foundational fix that gives the testimonials section horizontal breathing room. All other fixes depend on this being in place first.

2. **Modify `styles/testimonials.css`** — Add breakpoint-specific width constraints to `.testimonial-card`. This must come after step 1 because the card widths will be calculated relative to the new (smaller, padded) wrapper width.

3. **Modify `script.js`** — Add the initial scroll snap in `initTestimonials()`. This is last because it's a behavioral polish that ensures the carousel starts correctly once the CSS layout is correct.

4. **Manual testing** — Verify all breakpoints and interactions as described in the [Testing] section. If any issue is found, iterate on steps 1-3 as needed.
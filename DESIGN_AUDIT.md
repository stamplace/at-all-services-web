# Design Audit — why the previous version felt amateur

## High-impact failures found in the previous build
1. **Hero asset failure:** the hero image was a tight crop of garage panels. At 390px it showed almost no house, service context, or van. At 1440px it consumed roughly half the first screen with a low-information close-up.
2. **The design said “premium” through styling instead of composition:** large type + gold button + lots of section labels, but weak photography and no distinctive visual idea.
3. **Mobile conversion duplicated itself:** Call appeared in the hero and immediately again in the sticky dock, creating action noise instead of confidence.
4. **Typography was oversized relative to the available mobile viewport.** The headline dominated rather than guiding the user.
5. **Sections still read as stacked web sections.** The layout had improved from cards, but the overall page rhythm remained predictable.
6. **Mechanical photography was not good enough.** Existing detail imagery was low-resolution and mechanically questionable, so it should not be used as credibility proof.
7. **The old logo still read as a literal garage/house-adjacent mark.** The reset moves toward an abstract structural A/opening frame.

## New design decisions
- Full-bleed hero with service context visible immediately.
- Mobile hero uses photography as a real first-screen element, then smaller editorial copy.
- Sticky dock stays hidden while the hero CTA is visible and only appears after it leaves the viewport.
- Five primary service rows instead of a large service directory.
- Credibility is operational copy, not badge UI.
- No weak mechanical photos are used publicly.
- Stronger asymmetry and fewer containers/cards.
- Gold remains a precision/conversion accent, not a page fill color.

## Current conclusion
The next iteration must not be a polish pass. It must solve **art direction first**: commissioned-feeling hero photography, a distinctive abstract mark, a calmer type system, less UI chrome, stronger page rhythm, and breakpoint-specific composition.

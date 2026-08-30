# Mission 002 — Premium Editorial Rebuild

## Intent
Replace the current baseline with a flagship web experience that feels commissioned, art-directed and specific to At All Services LLC rather than like a refined contractor template.

## Primary failures to solve
1. Hero photography must carry real service context and brand memory.
2. Mobile 390px composition must be designed independently, not stacked from desktop.
3. Typography must feel editorial/architectural rather than contractor-display.
4. Logo must move away from literal garage/house iconography toward an abstract structural A/opening system.
5. Page rhythm must alternate photography, editorial text, structured information and conversion moments instead of repeating section/card patterns.
6. Conversion hierarchy must remain obvious without visual shouting.

## Allowed files
- `index.html`
- `styles.css`
- `app.js`
- `privacy.html`
- `assets/**`
- `qa/**`
- root documentation
- `.repo-runtime/**`

## Forbidden
- unsupported business claims
- unverified cities
- fake reviews or ratings
- license/insurance language
- huge dependency/animation frameworks
- template-card proliferation
- baked-in AI text or fake logo inside hero photography

## Required design outcomes
### Hero
- commissioned-feeling Twin Cities residential/service context
- meaningful visible photography on mobile
- H1 roughly 3–4 visual lines maximum at 390px
- one dominant call action
- request service quieter
- no badge strip

### Services
- five primary categories on initial surface
- editorial rows / typographic architecture, not dashboard cards

### Credibility
- operational clarity: 24/7, same-day when scheduling allows, local Twin Cities service, straightforward process
- no pseudo-badges

### Mobile
- compact 64–72px header
- call affordance + menu
- sticky two-action dock appears only after hero CTA exits viewport

### Request service
- low-friction concierge intake
- Name / Phone / City / What’s happening
- successful handoff to WhatsApp without unsupported response-time promise

## Verification commands / gates
- browser render at 390×844, 430×932, 768×1024, 1440×1000, 1920×1080
- zero horizontal overflow
- exactly one H1
- no console errors
- all call links = `tel:+16514436062`
- email = `mailto:attalmoshe@gmail.com`
- WhatsApp points to `wa.me/16514436062`
- no actionable `href="#"`
- scan for forbidden claim language
- manual visual review of screenshots

## Acceptance test
Reject the iteration if changing the logo, phone and colors could plausibly turn it into another garage-door company template.

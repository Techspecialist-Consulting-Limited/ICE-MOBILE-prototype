# NSIA ICE 2.0 mobile prototype

This repository's `/` route hosts a mobile-first, interactive ICE 2.0 staff app prototype. Start it with `npm run dev`; run `npm run build` to check a production build.

## Demonstration boundaries

- Report submissions, alert acknowledgements, contact edits, notification reads, and SOS flow state are held in local React state. They are not sent to NSIA systems and are not persisted across reloads.
- Quick Reports are separate local demonstration events. Selecting a category first asks whether to send now or continue with the complete incident form. Quick sends create a local reference only on simulated success and can be enriched in place with required incident details without creating a second record. Offline mode produces a retryable failure without a reference.
- The Quick Report flow does not connect to a responder queue or dispatch service. Production Quick Report routing, authorization, and dispatch capability must be confirmed and approved before any live integration.
- The full incident report wizard keeps category, summary, description, location, date/time, and optional attachments in one local draft through Category, Details, Location & Date, Evidence, and Review. Its simulated current-location action selects a labelled demo location; it does not request GPS or access device location. Evidence stays in local browser memory and is not uploaded.
- The SOS journey is an interaction preview only. No emergency contact or emergency service is notified, no dispatch is claimed, and no hold duration or escalation timer is assumed.
- Current-location actions use a labelled demo location; they do not access GPS or track device location.
- Feed and alert content is illustrative and is not live. External sharing is available only for feed items classified as Shareable.
- The welcome and Microsoft sign-in screens use the NSIA logo and building image in `public/images`. Selecting “Sign in with Microsoft” advances through a clearly disclosed local prototype simulation; it does not collect credentials, contact Microsoft, or authenticate an account. Production authentication must use the approved organizational identity provider.

## Prototype journeys

The entry flow is Welcome → Microsoft sign-in introduction → existing Home with a first-login welcome dialog. Choose “Get started” to reveal Home. The five-item bottom navigation then opens Home, Alerts, Report, Security Feed, and Profile. Choosing a Home category opens a confirmation dialog with “Send now” and “Send with details”. Quick-send status can be tracked or enriched later using the same reference. The Report tab starts the full incident-report wizard; Category, Details, Location & Date, and Evidence lead to the existing Review step without submitting. A quick report's Add details action opens the same wizard and updates its existing local event/reference. SOS, alert details, notifications, reports and report history, and emergency-contact editing are connected using local screen state. Form entries remain available when moving backward in the reporting flow.

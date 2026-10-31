# Navigation and deadline alerts

- Removed redundant Zoning report and Government offices sidebar tabs. Pages and links remain available; zoning upload remains on the homepage.
- Deadline tracker supports one-time, quarterly, and annual reminders, based on dates supplied and confirmed by the owner.
- Dashboard/top-of-page in-app alerts show due and overdue dates; users can opt into browser notifications while the app is open.
- No background push/email notifications are implemented. Quarterly/annual recurrence is an estimated interval, not a government-certified filing schedule. Actual BIR filing dates vary by tax type, taxpayer, and applicable official rules.

Run `npm install` and `npm run build` before deployment. Build could not be verified in this environment because dependency installation timed out.


## 31 October 2026 — Zone eligibility engine

- Five-step zoning flow now has **Check zoning eligibility** against a local, verified zoning GIS polygon map and a zone-by-business permitted-use rules file.
- Uses actual longitude/latitude point-in-polygon checks, guards against overlaps/boundaries, and displays zone code, verdict, conditions, legal citation, and source URL when datasets are provided.
- **No official zoning geometry or complete ordinance use matrix is bundled**. Map check returns NOT VERIFIED until authorized data is installed under `data/`. See `data/README.md`. Do not pass off a map pin or AI as an official decision.
- Allows an owner to upload a BiZ Checker PDF inside the Review step and read the verdict using the existing OpenAI PDF extraction. The owner must confirm that the report matches the entered business and address. The report is not independently authenticated.
- No automatic redirection after checking. Results stay visible on the homepage; dashboard navigation is optional.
- Optional OpenAI preparation guidance remains advisory and cannot invent a zone.
- Existing project features remain unchanged.

**Known constraints:** The 129-barangay authoritative list, CPDSO request submission/status tracking, live BiZ Checker API access, and live official GIS data are NOT provided. Full equivalent automatic coverage requires CPDSO authorization / access to maintained zoning data. No completed Next.js production build was available in this offline workspace; TypeScript syntax and the standalone polygon engine were checked.

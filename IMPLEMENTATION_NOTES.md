# New workflow
- Zoning report upload is required before accessing existing workspace pages. Report facts are extracted with OpenAI; the owner must confirm zoning approval with the city.
- Business type and address are taken from the report; review them in Business Setup.
- Multi-file upload supports up to 15 files per batch, sequential scans; each result is suggested and requires review.
- Government offices page links to official agency channels, without claiming precise nearest branch or jurisdiction.
- Tax reminders require the owner to enter dates and source; the zoning PDF does not provide BIR obligations or filing deadlines. Reminders are visible in-app only.
- Existing browser localStorage is retained, and uploaded original documents are not stored.
- OPENAI_API_KEY must be configured in deployment environment.
- Do not use real sensitive documents until privacy and production security review is complete.

## Homepage zoning-first update
- Zoning report upload and verification is on the homepage.
- ALLOWED reports save the business type and location and redirect to the dashboard.
- NOT ALLOWED / CONDITIONAL / UNCLEAR reports stay on the homepage and show suggested next steps. The workspace requires an ALLOWED report.
- Compliance Passport reads the same saved business profile. The zoning PDF does not contain an actual business name, password, tax schedule, or ownership type, so these are not fabricated.
- AI-generated tips are suggestions only; confirm zoning with the responsible city office.
- Requires OPENAI_API_KEY for server-side PDF extraction.

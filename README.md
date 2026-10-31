# NEGOSYO READY — OpenAI API Edition

## Windows setup

1. Extract the ZIP and open CMD in the `negosyo-ready` folder.
2. Run `npm install`.
3. Run `copy .env.example .env.local`.
4. Open `.env.local` and set `OPENAI_API_KEY` to your own OpenAI API key. Do not share it or commit it to Git.
5. Keep `OPENAI_MODEL=gpt-4.1-mini` initially.
6. Run `npm run dev` and open http://localhost:3000.
7. Select a business category, go to Documents, and upload a sample PDF/JPG/PNG/WebP.

An OpenAI API account with available billing/credits is required. A ChatGPT subscription does not include API credits. Internet access is required.

## How document review works

The existing Next.js API route checks document size, MIME type, and file signature. It then sends the uploaded PDF as an OpenAI `input_file`, or the image as an `input_image`, to the Responses API. Structured JSON output is validated before being returned to the existing UI. The UI can save without AI review if the API is unavailable.

The app does not verify official authenticity, government approvals, or legal compliance. It reports only apparent document completeness and possible mismatches. Use fictional/redacted files for testing. Upload real documents only with appropriate consent and data safeguards. The sample checklist is not a substitute for current official Baguio LGU requirements.

## Troubleshooting

- `OPENAI_CONFIG`: Set `OPENAI_API_KEY` in `.env.local`, then restart Next.js.
- `OPENAI_AUTH`: Verify API key and project permissions.
- `OPENAI_QUOTA`: Check API billing/usage limits.
- `OPENAI_MODEL`: Confirm model access and `OPENAI_MODEL` value.
- `OPENAI_REQUEST`: Check document format or model compatibility.
- `OPENAI_BAD_RESPONSE`: Retry or save without AI review.

This version removes Ollama and the server-side PDF.js/canvas dependency. PDFs are sent to OpenAI directly. The API key stays server-side.


## AI establishment photo screening
On **Inspection readiness**, upload 1–3 JPG/PNG/WebP establishment photos (5 MB each), authorize sharing, and click **Analyze establishment photos**. The server uses the existing `OPENAI_API_KEY` and `OPENAI_MODEL` via the OpenAI Responses API with structured JSON output. Photos are not saved in localStorage or by this application; they are transmitted to OpenAI for processing. Consult OpenAI's current API data retention policy. AI results are held in page memory until navigation/reload.

The visual criteria are **illustrative** and must be validated with official Baguio City and relevant Philippine agency sources before representing them as applicable requirements. The AI cannot determine legal compliance, permit authenticity, or predict official inspection approval.

## Updated document and photo checks
- AI review extracts visible issue and expiration dates in YYYY-MM-DD format and saves them to the local document record. Dates entered manually take priority. Missing/ambiguous dates stay empty.
- Inspection photo selector adds photos across selections (up to 3), shows all previews, supports remove/clear, and displays all photos again beside review results. Photos are not retained across reloads.


## New demo features
- **Readiness Assessment** (`/assessment`): profile-based illustrative preparation and document-group checklist, with prompts to confirm missing business details. Not official legal determination.
- **Compliance Passport** (`/passport`): consolidated local browser view of document coverage, manual checklist completion, expiration dates, and readiness progress. No server-side history or official certification.
- Business profile now supports optional activities, ownership structure, and premises type. Existing browser data remains compatible.

## Connected pages

- Business profile, requirements, document records, renewal dates, manual inspection checks and photo AI review summaries share the same browser-local state.
- Dashboard, Readiness Assessment and Compliance Passport recalculate from the latest saved information.
- Successful AI establishment photo reviews save text findings and timestamps (up to 12 reviews) to browser storage; photo files are NOT saved.
- Browser storage is device-specific and is not a secure production document vault. The user must re-upload photos for another analysis.
- Scores are preparation indicators, not regulatory compliance certifications. Requirements remain illustrative.


## Pin-based zoning eligibility (current limitations)

The homepage zoning wizard now supports real geometry-and-rule evaluation, instead of asking OpenAI to guess. Install the CPDSO-authorized zoning polygon data and matched ordinance rule matrix as described in [`data/README.md`](data/README.md) to receive map-based ALLOWED / CONDITIONAL / NOT ALLOWED checks. **These datasets are not included**, so the default status is NOT VERIFIED. This is intentional. OpenStreetMap shows streets, not legal zoning permissions.

As an alternative, a business owner may check the official-source [BiZ Checker](https://bizchecker.online/zoning), export its PDF report, and upload it directly in Step 5. OpenAI reads the report; the owner checks the location and business and saves the extracted verdict. PDF content is not independently authenticated by this prototype.

The project does not have access to the BiZ Checker private API or its official GIS records, and it cannot issue locational clearances, accept official city applications, or track CPDSO case statuses.

# Aqua Connect — Deployment & Configuration Guide

## 1. Environment Variables
- `VITE_GOOGLE_MAPS_API_KEY`: Google Maps Platform API key (restricted to Maps JavaScript API and your authorized HTTP referrers).
- `PORT`: Listening port (`3000` locally / in AI Studio; `8080` default on Cloud Run).
- `NODE_ENV`: Set to `production` when serving the built Vite SPA from `server.ts`.

## 2. Firebase Configuration & Security Rules
- Client configuration is stored in `firebase-applet-config.json` (project `gen-lang-client-0062866103`, Firestore database `ai-studio-2dff8aaa-d390-447c-ad99-d0703b50d893`).
- Firestore rules in `firestore.rules` have been validated with `@firebase/eslint-plugin-security-rules` and deployed.
- To deploy Firebase Storage rules (`storage.rules`) for direct GCS bucket uploads:
  ```bash
  firebase deploy --only storage --project gen-lang-client-0062866103
  ```
  *(Note: If Firebase Storage bucket rules are not yet deployed, `storageService.ts` automatically falls back to `/api/uploads` on the Express server.)*

## 3. Vercel Deployment
- `vercel.json` is configured for Vite static SPA output (`npm run build` -> `dist/`).
- Set `VITE_GOOGLE_MAPS_API_KEY` in Vercel Project Settings → Environment Variables, and add your `*.vercel.app` domain to Firebase Console → Authentication → Authorized Domains and Google Cloud Console API key HTTP referrers.

## 4. Google Cloud Run Deployment
```bash
# Build production frontend bundle
npm run build

# Deploy directly from source to Google Cloud Run
gcloud run deploy aqua-connect \
  --source . \
  --region asia-south1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production
```

## 4. Verification & Testing Checklist
1. **Citizen Report Flow**: Sign in as a citizen, fill Ward 2 / Ward 4 details, pick location on map or enter landmark, attach up to 3 photographs, and verify a unique `AQ-YYYY-WX-...` Complaint ID is created.
2. **RBAC Enforcement**: Non-engineer accounts attempting to open `/engineer` are denied access; `firestore.rules` rejects client-side role escalation (`role: 'engineer'`) and direct status tampering.
3. **Engineer Workflow**: Sign in with an authorized engineer/admin account (`madhusudankr06@gmail.com` or UID in `/engineers`), acknowledge a complaint, transition to `In Progress` or `Referred for Laboratory Testing`, record investigation notes and corrective action, and verify `complaint_history` and `public_complaint_tracking` update atomically.
4. **Public Tracking**: Open `/track`, enter Complaint ID + last 4 digits of citizen mobile number, and verify status, engineer remarks, corrective action, and timeline render without exposing citizen PII.

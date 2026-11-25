# SiteProof

SiteProof helps contractors share construction updates and photo proof with homeowners. It tracks material requests, deliveries and stock alongside contractor expenses and payment requests. Checkout runs in Razorpay test mode.

## Local setup

1. Install Node.js 22 and use a MongoDB replica set or an Atlas cluster for transactions.
2. Copy each app's `.env.example` to `backend/.env` and `frontend/.env.local`. Set a generated JWT secret of at least 32 characters. On the backend, set `PUBLIC_API_URL` to the API's origin without `/api`. On the frontend, set `NEXT_PUBLIC_API_URL` to the API URL including `/api`.
3. From `backend/`, run `npm ci` and `npm run dev`. From `frontend/`, run `npm ci` and `npm run dev`.
4. Open `http://localhost:3000`. Create a contractor and homeowner with synthetic project data. A homeowner needs an accessible mailbox and a verification link to open linked projects.

The frontend is a Next.js application. The Express API handles authentication, project access, uploads and business workflows. MongoDB holds application records and Socket.IO sends change notifications to project participants.

## Staging deployment

1. Deploy the Node API to a host supporting persistent Socket.IO connections. Configure the frontend and API on HTTPS under the same site, for example `app.example.com` and `api.example.com`. Set `CLIENT_ORIGIN` to the exact browser origin and `NODE_ENV=production` on the API. Point the frontend build at the staging API.
2. Use a staging database with replica-set or sharded-cluster support. Snapshot existing records before testing an upgrade and validate backup restoration to a separate database.
3. Set `RESEND_API_KEY` and `AUTH_EMAIL_FROM` using a verified sender. Existing homeowners must verify their addresses on their next visit. Existing projects remain linked by the same email.
4. Configure the three Cloudinary settings for authenticated photo storage. New production uploads require Cloudinary. Legacy local photos still need their original files and reachable URLs. For a deployment that brings historical records over, copy those assets and migrate the stored URLs before switching domains. Audit any historical public Cloudinary URLs separately.
5. Set a Razorpay test key pair and configure `payment.captured` for `https://<api-host>/api/webhooks/razorpay`. Set `RAZORPAY_WEBHOOK_SECRET` to the corresponding Test Mode webhook secret. Use automatic capture and verify checkout both with the browser open and with the browser closed after paying.
6. Check `GET /api/health` and test authentication, uploads, realtime reconnect, payment verification and delivery with two synthetic accounts. Run the release gate in [the release checklist](docs/release-readiness.md) before publishing.

## Checks

- API tests from `backend/` with `npm test`.
- Frontend lint and production build from `frontend/` with `npm run lint` and `npm run build`.
- Dependency advisory checks from each app with `npm audit --omit=dev --audit-level=high`.

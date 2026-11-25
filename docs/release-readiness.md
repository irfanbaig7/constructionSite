# SiteProof release checklist

## Changes in this release candidate

- Homeowner project queries, photo endpoints and realtime notifications check email verification. Verification and recovery use expiring, single-use email tokens. Logout revokes the current session. Password changes and resets revoke prior sessions.
- The API checks the origin of browser writes. The Razorpay webhook independently authenticates the raw payload. Capture handling checks the Razorpay order ID, payment ID, INR amount and captured status against the test account.
- Payment and ledger updates use transactions. Project installment requests reserve funds against the project's budget, including other pending installments. A paid material request moves to awaiting delivery. Only delivery adds stock.
- Cloudinary is available for authenticated uploads. Legacy files served by this API are protected by project access checks. Daily updates and stock consumption use a transaction, and the server attempts to remove newly uploaded photos if posting fails.
- CI runs backend tests, frontend lint and build, and production dependency advisory checks. No new runtime dependencies were needed.
- Production startup checks HTTPS configuration, email and storage settings, the test-mode Razorpay key and webhook secret, and transaction-capable MongoDB. The landing page and checkout describe implemented features and test payments.

## Required verification before publishing

- The desktop and mobile Edge smoke tests passed on the production build. Public pages passed overflow checks at 320, 375, 390, 768, 1024 and 1440px in both themes. Dashboard checks use synthetic API fixtures. Screenshots are available through the Playwright test results.
- The API journey passed against an isolated MongoDB replica set. It covers both roles, email verification and reset, project and photo isolation, contractor expense and wage records, material and budget concurrency, stock limits, payment webhook replay and delivery confirmation. Email and payment provider responses in this test are simulated.
- The configured Razorpay test credentials returned HTTP 200 on a read-only API request. The configured Cloudinary account passed its connectivity probe, but a synthetic authenticated upload returned HTTP 403 and reported missing `create` permission. Configure a Cloudinary credential with permission to create authenticated assets, then repeat upload and signed/unsigned delivery checks before launch.
- Production dependency audits reported zero vulnerabilities on both apps. A history scan found no matches for the tested private-key, credentialed MongoDB URL, GitHub token and Razorpay live-key patterns.
- Verify actual email delivery, expired and reused links, logout in a second tab, old sessions after password reset, cross-account project isolation and photo authorization.
- Test two simultaneous installment requests against the same remaining budget. Verify callback and webhook retry, browser-close recovery, and material payment followed by delivery. Review abandoned checkout handling and refund reconciliation. A request with an issued checkout order currently stays open until captured.
- Verify transaction rollback on an Atlas or replica-set staging database. Audit historical monetary records and incomplete payments before migrating amounts to integer paise. Audit and resolve existing duplicate open material requests before building a unique partial index.
- Verify photo delivery from Cloudinary and confirm files survive restart. Migrate historical public or local assets before importing existing production data.
- Extend browser coverage to project detail, dialogs and payment workflows in both themes and verify Firefox, Safari, keyboard behavior and contrast. Record Lighthouse and Web Vitals measurements.
- Run end-to-end tests for both roles with synthetic data and document a realistic load target. Measure API and UI performance against that target.
- Smoke-test staging HTTPS, cookies, WebSockets and CORS. Enable monitoring, restore a backup to a separate database, and rehearse rollback.
- Review Git history for secrets, privacy and account deletion procedures, accessibility findings, and the launch copy before attaching a public domain.

## Rollback

Keep the previous frontend and API artifacts and the pre-deployment database snapshot. A rollback must account for new state such as paid material awaiting delivery and revoked sessions. Halt writes, review state with the staged rollback procedure, and confirm recovery in a separate database before changing a shared database.

Public release is **NO-GO** until the staging, security, browser and recovery checks have evidence.

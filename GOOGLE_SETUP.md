# Google Cloud setup, step by step

Everything you need to turn on Google sign-in for the shop. Follow in order —
several steps depend on the ones above them.

Budget about 15 minutes. No credit card is needed.

---

## Step 1 — Create a project

1. Go to <https://console.cloud.google.com>
2. Sign in with the Google account you want to use as the shop owner.
   (This account does **not** have to be the one customers sign in with.)
3. At the top of the page, next to the Google Cloud logo, click the project
   picker — it usually says **Select a project**.
4. Click **New Project**.
5. Fill in:
   - **Project name**: `Northfield Sports`
   - **Organization**: leave as `None`
   - **Location**: leave default
6. Click **Create**.
7. Wait for the notification, then click **Go to project** — or use the project
   picker to switch to it. Check the name in the top bar to confirm you're in it.

> **Keep this project.** Everything below lives inside it. If you create a
> second project later, the client ID will not work.

---

## Step 2 — Configure the consent screen

This is the screen your customers see when they click "Sign in with Google".

1. In the left sidebar, click the **APIs & Services** hamburger (☰) →
   **Google Auth Platform**. (On older console layouts it's called
   **OAuth consent screen** — same thing.)
2. If you see a **Get started** button, click it first.
3. Fill in the **Branding** fields:
   - **App name**: `Northfield Sports` (customers see this)
   - **User support email**: your email
   - **Developer contact email**: your email
4. Scroll to **Audience** and choose:
   - **External** — unless you have a Google Workspace org and only want
     employees to sign in. If you do, pick **Internal** instead and skip
     Step 3 entirely.
5. Under **Contact information**, add your email address.
6. Click **Save and continue**.

> Google shows a warning that your app is in **Testing** status. That is
> expected and fine for now — see Step 3.

---

## Step 3 — Add yourself as a test user

While the app is in **Testing** status, only listed accounts can sign in.

1. Still on the Google Auth Platform page, find **Test users** and click
   **+ ADD USERS**.
2. Enter your own Gmail address.
3. Click **Add**, then **Save**.

You can list up to 100 test users this way. Skip this step if you chose
**Internal** in Step 2.

---

## Step 4 — Create the client ID

This is the step that produces the two values you need.

1. Left sidebar → **APIs & Services** → **Credentials**.
   (If you can't see the sidebar, expand **Google Auth Platform** first.)
2. Click **+ CREATE CREDENTIALS** at the top → **OAuth client ID**.
3. Set **Application type** to **Web application**.
4. Fill in the name and the two URI fields. These are the fiddly bits:

   **Name**
   ```
   Northfield Sports local
   ```
   (Any name works. Add a date if you make more clients later.)

   **Authorized redirect URIs** — click **+ ADD URI** and enter:
   ```
   http://localhost:8000/api/auth/google/callback
   ```
   Copy this character for character. The path must match your backend route
   exactly, including `/api/`. No trailing slash.

   **Authorized JavaScript origins** — click **+ ADD URI** and enter:
   ```
   http://localhost:5173
   ```
   No path, no trailing slash. This is your Vite dev server.

5. Click **Create**.

---

## Step 5 — Copy the two keys

A popup appears with a **Client ID** and a **Client secret**.

1. Click **Download JSON** if you want a backup copy, or just copy the two
   values by hand.
2. Save them somewhere safe for the next step.

> **The client secret is only ever shown once.** If you lose it, delete the
> credential and create a new one. Never commit it to git.

The values look like this — yours will differ:

```
Client ID:     1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com
Client secret: GOCSPX-1a2b3c4d5e6f7g8h9i0j
```

---

## Step 6 — Paste them into `.env`

From the `backend` folder:

```bash
cp .env.example .env
```

Open `backend/.env` and fill in:

```ini
GOOGLE_CLIENT_ID=1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-1a2b3c4d5e6f7g8h9i0j
GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/google/callback
FRONTEND_URL=http://localhost:5173
```

Leave the Mailgun lines blank for now — the app logs a warning and carries on
without sending receipts.

`.env` is already in `.gitignore`, so it will not be committed.

---

## Step 7 — Run it

Two terminals.

**Terminal 1 — backend:**
```bash
cd backend
python seed.py
python -m uvicorn main:app --port 8000 --reload
```

**Terminal 2 — frontend:**
```bash
cd frontend
npm run dev
```

On startup the backend should no longer complain about Google. If it does, the
warning tells you which value is still missing.

Open <http://localhost:5173>, add something to the cart, click the cart, then
**Sign in with Google**.

---

## Step 8 — Confirm it works

You should be redirected to Google's account chooser, pick your account, then
land back on `/checkout` with **Signed in as your@email.com** in the Contact
panel and your name in the header.

To confirm the order path works end to end, fill in the shipping form and
**Place order**. It redirects to a confirmation page and the order appears
under **Orders**.

---

## Troubleshooting

**`Error 400: redirect_uri_mismatch`**
The URI in the console does not match what the app sends. Compare
character by character against `GOOGLE_REDIRECT_URI` in your `.env`. The most
common cause is a missing `/api/` or a trailing slash.

**`Error 403: access_denied` and you're the app owner**
You are not on the test users list. Back to Step 3. This can also happen if the
app is in Testing status and the Google account you used is a different one
from the account you added.

**`Error 401: invalid_client`**
Client ID or secret is wrong, usually a stray quote or a space pasted along
with the value. Confirm the app logs no "Google sign-in will not work"
warning on startup.

**Consent screen says "This app isn't verified"**
Expected. It only appears for unverified apps in Testing status. You can click
through it. Since the app requests only `openid email profile`, none of those
scopes are sensitive or restricted, so verification is **not** required — but
see the note on production below.

**Sign-in works, then bounces back to the sign-in prompt**
The token was not stored. Check the browser console for a `401` from
`/api/auth/me`; that usually means `JWT_SECRET` differs between restarts, which
invalidates the previous session.

**Port already in use**
Vite picks the next free port. If it moves off 5173, update
`GOOGLE_REDIRECT_URI` stays the same (that's the backend on 8000) but add a
matching JavaScript origin in Step 4 for the new port.

---

## Going to production

When you deploy to Render:

1. In the Render dashboard, set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and
   `GOOGLE_REDIRECT_URI` to your live domain:
   ```
   https://your-app.onrender.com/api/auth/google/callback
   ```
2. Set `FRONTEND_URL=https://your-app.onrender.com`.
3. **Create a second OAuth client** in the console for the live domain. Do not
   reuse the localhost one — a single client can't cleanly serve both.
4. In the same project, create a second project for production. Google's OAuth
   policy requires separate projects per deployment tier, and it makes revoking
   the dev credentials trivial.
5. Move the app out of **Testing** status and add a public homepage with a
   privacy policy before inviting real customers.

Two policy details worth knowing: Google deletes OAuth clients that have seen no
token exchange and no config edit for 6 months (restorable for 30 days), and
the client secret is only ever displayed at creation time.

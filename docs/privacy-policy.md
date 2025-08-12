# JobBot Autofill — Privacy Policy
**Effective date:** 2025-08-12  
**Extension:** JobBot Autofill (Chrome)  
**Service URL:** https://141-148-52-32.sslip.io

We respect your privacy. This document explains what the JobBot Autofill extension (“Extension”) and the JobBot backend (“Service”) collect, why we collect it, and how you can control it.

## What we collect
### From the Extension (in your browser)
- **Auth token** (after you log in): stored locally in your browser’s extension storage to authenticate API requests.
- **Basic usage events** (client-side only): e.g., when you click “Load Profile” or “Autofill”. We do not send analytics to third parties.

### From the Service (our backend at `sslip.io`)
- **Profile data you save:** name, resume text, email, phone, location, links you add (e.g., LinkedIn/GitHub).
- **Account data:** username and a server-generated token.
- **Server logs:** standard web logs (IP address, user-agent, timestamps, request paths) for security and troubleshooting.

We do **not** collect your browsing history, keystrokes, or the contents of pages you visit, beyond the fields you explicitly autofill.

## How we use data
- **Provide core features:** authenticate you, fetch your saved profile, and autofill forms at your request.
- **Secure the Service:** detect abuse, debug errors, and protect accounts.
- **Communications:** respond to support requests when you contact us.

We do **not** sell your data or use it for advertising.

## Where data is stored
- **In your browser:** the extension stores your auth token locally so you stay signed in.
- **On our server:** your profile and account data are stored on our backend (currently `https://141-148-52-32.sslip.io`).

All traffic between the extension and the Service uses HTTPS.

## Sharing & third parties
We do not share your personal data with third parties except:
- **Service providers** necessary to operate the Service (e.g., hosting). They are bound by confidentiality and data protection obligations.
- **Legal requirements** if we are compelled by law or to protect safety and security.

No third-party advertising SDKs or trackers are used.

## Chrome permissions we request
- **`storage`** – to keep your auth token and extension settings locally.
- **`activeTab` / `scripting`** – to run autofill logic on the tab you explicitly use with the extension.
- **Host permissions** – restricted to `https://141-148-52-32.sslip.io/*` so the extension can call the API.

You can review or remove permissions anytime at `chrome://extensions`.

## Data retention & deletion
- **In your browser:** click **Logout** in the extension to remove your local auth token.
- **On the server:** you can update or delete your profile from the web app. If you need account deletion, contact us (see below) and we’ll remove associated personal data, subject to legal/operational retention needs (e.g., security logs for a limited time).

## Children’s privacy
The Service is not directed to children under 13, and we do not knowingly collect information from children.

## Security
We use HTTPS, access controls, and least-privilege design. No method is 100% secure, but we work to protect your information.

## Changes to this policy
We may update this policy as the product evolves. We’ll post changes here and update the effective date. Significant changes may also be noted in the extension release notes.

## Contact
Questions or deletion requests? Email **YOUR-CONTACT-EMAIL**.

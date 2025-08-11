# Job Apply Bot — Final Scaffold

A full-stack job application helper with a Playwright-based scraper, a Spring Boot API, and a React (Vite) frontend served by Nginx. Includes a Chrome extension for one‑click profile autofill.

---

## ✨ Features

* **Auth**: `POST /api/auth/register`, `POST /api/auth/login` (token-based)
* **Profiles**: `GET /api/profiles/current`, `POST /api/profiles`, `PUT /api/profiles/{id}`
* **Jobs**: `GET /api/jobs`, `GET /api/jobs/{id}`
* **Frontend**: React app (built with Vite) served by **Nginx**, proxies `/api` to Spring
* **Scraper**: Playwright microservice (optional)
* **Chrome Extension**: login, fetch profile(s), autofill common fields on job sites

---

## 🧱 Architecture

```
[ Browser ] ──▶ https://app.example.com
                   ├── SPA (Nginx serves /)
                   └── /api → proxy_pass → backend:8080 (Spring Boot)

Docker Compose services:
- backend   (Spring Boot, H2 or external DB)
- frontend  (Nginx + static build, /api proxy)
- playwright (optional scraper API)
- certbot   (prod, for TLS renewals when deployed to a server)
```

---

## 🚀 Quick Start (Local, Docker Compose)

1. **Unzip/clone** and `cd` into the project.
2. **Build & run**

   ```bash
   docker compose up --build
   ```
3. **Services**

   * Frontend (SPA): [http://localhost:3000](http://localhost:3000)
   * Backend (API):  [http://localhost:8080](http://localhost:8080)
   * Playwright:     [http://localhost:4000](http://localhost:4000) (optional)

> The frontend’s Nginx proxies **`/api/*` → `backend:8080`**. Your React app can use relative `/api` URLs in local and prod.

---

## 🧪 Using the App

1. Open **[http://localhost:3000](http://localhost:3000)**.
2. **Register** or **Login** via the UI (calls `/api/auth/register` or `/api/auth/login`).
3. After login, the app loads **jobs** (`/api/jobs`) and your **profile** (`/api/profiles/current`).
4. Edit your profile and **Save**:

   * First save: `POST /api/profiles`
   * Later saves: `PUT /api/profiles/{id}`

---

## 🧩 Chrome Extension (Local Testing)

1. In `extension/popup.js`, set during local dev:

   ```js
   const API_BASE = 'http://localhost:8080/api';
   ```

   In production, use your domain (see below), e.g. `https://app.example.com/api`.
2. Load the extension in Chrome:

   * Visit `chrome://extensions` → **Developer mode** → **Load unpacked** → select the extension folder (contains `manifest.json`).
   * Click the extension icon, **Login/Register**, then **Reload Profiles** and **Autofill** on an application page.

---

## ⚙️ Environment Variables

### Frontend (Vite)

* **Prod** (optional): set a base URL if you don’t use Nginx path proxying.

  ```env
  VITE_API_BASE_URL=/api
  # or absolute:
  # VITE_API_BASE_URL=https://app.example.com/api
  ```

### Backend (Spring)

* Configure DB if not using H2. Example (Postgres):

  ```properties
  spring.datasource.url=jdbc:postgresql://HOST:5432/DB
  spring.datasource.username=USER
  spring.datasource.password=PASS
  spring.jpa.hibernate.ddl-auto=update
  ```

### CORS (Spring) — recommended

```java
registry.addMapping("/api/**")
  .allowedOriginPatterns("*") // lock down to your SPA origin in prod
  .allowedMethods("GET","POST","PUT","DELETE","OPTIONS")
  .allowedHeaders("Authorization","Content-Type")
  .allowCredentials(false);
```

---

## 🛠️ Nginx Config (Frontend container)

**Key rule:** keep `/api` prefix when proxying — *no trailing slash* in `proxy_pass`.

```nginx
location /api/ {
  proxy_pass http://backend:8080; # no trailing slash
  proxy_http_version 1.1;
  proxy_set_header Host $host;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
location / { try_files $uri $uri/ /index.html; }
```

Common pitfall: if you write `proxy_pass http://backend:8080/;` (with slash), Nginx strips `/api` and your Spring routes 404.

---

## ☁️ Production Deploy (Oracle Cloud “Always Free”, one box)

1. Create an **Ampere A1** VM (Ubuntu), open ports **80/443**, point DNS: `app.example.com` → VM IP.
2. Install Docker & Compose, clone repo, then:

   ```bash
   docker compose up -d --build
   # one-time cert issuance
   docker compose run --rm certbot certonly \
     --webroot -w /var/www/certbot \
     -d app.example.com \
     --email you@example.com --agree-tos --no-eff-email
   docker compose exec frontend nginx -s reload
   ```
3. Your app should be live at **[https://app.example.com](https://app.example.com)**. The SPA uses relative `/api`, which Nginx proxies to the backend container.
4. **Chrome extension**: set `API_BASE = 'https://app.example.com/api'` and publish.

---

## 🧾 API Endpoints (from controllers)

* **Auth**

  * `POST /api/auth/register` `{ username, password } → { token }`
  * `POST /api/auth/login`    `{ username, password } → { token }`
* **Profiles**

  * `GET  /api/profiles/current` → `{ id, name, resumeText, ... }`
  * `POST /api/profiles` `{ name, resumeText, phone, location, links }`
  * `PUT  /api/profiles/{id}` same payload as POST
* **Jobs**

  * `GET /api/jobs` → array of job postings
  * `GET /api/jobs/{id}` → details

> Frontend maps `resume` ⇄ `resumeText` to match the backend model.

---

## 🧰 Useful Commands

```bash
# build and start
docker compose up -d --build

# live logs
docker compose logs -f frontend backend

# restart after config change
docker compose restart frontend

# curl sanity checks
curl -i http://localhost:3000/api/jobs
curl -i http://localhost:8080/api/jobs
```

---

## 🐞 Troubleshooting

* **GET/POST /api/* returns 404*\*

  * Check Nginx: `proxy_pass http://backend:8080;` (no slash)
  * Confirm Spring route exists (e.g., `/api/profiles/current`).
* **CORS errors in the extension**

  * Ensure backend/Nginx sends `Access-Control-Allow-Origin` (use `*` for token auth only) and allows `Authorization, Content-Type`.
* **Nginx error: unknown "connection\_upgrade" variable**

  * Remove the `Connection $connection_upgrade` line or define a `map` in the `http` context.
* **Docker on ARM (Oracle)**

  * Use arm64-friendly base images (`node:18`, `nginx:stable-alpine`, `eclipse-temurin`). Build on the VM or with `buildx`.

---

## 📦 Repository Structure

```
backend/
frontend/
  ├─ Dockerfile
  └─ nginx.conf
playwright-service/
docker-compose.yml
extension/
  ├─ manifest.json
  ├─ popup.html
  └─ popup.js
```

---

## 📚 Publishing the Chrome Extension (free extension)

1. Create a Chrome Web Store **developer account** (one‑time \$5 fee).
2. Bump `manifest.json` version, set `API_BASE` to your HTTPS API.
3. Zip the extension folder (manifest + assets), upload, fill listing, submit for review.

---

## 📝 License

MIT (or your choice). Update this section accordingly.

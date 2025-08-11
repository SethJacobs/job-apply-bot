Playwright service:
- Exposes POST /scrape with JSON { url, type? } and returns discovered jobs.
- Respects robots.txt and enforces a per-host 2s delay.
- Dockerfile provided; the service runs on port 4000 in docker-compose.

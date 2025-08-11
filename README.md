Job Apply Bot — Final Scaffold (with Playwright scraper)
Run with Docker Compose:
1. unzip project and cd into it
2. docker compose up --build
Services:
- backend: http://localhost:8080 (Spring Boot H2)
- frontend: http://localhost:3000 (nginx serving built frontend)
- playwright: http://localhost:4000 (scraper API)

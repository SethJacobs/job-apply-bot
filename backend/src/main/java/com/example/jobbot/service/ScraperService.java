package com.example.jobbot.service;
import com.example.jobbot.model.JobPosting;
import com.example.jobbot.model.JobSource;
import com.example.jobbot.repository.JobPostingRepository;
import com.example.jobbot.repository.JobSourceRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.select.Elements;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import java.net.URI;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
@Service
public class ScraperService {
    private final JobSourceRepository sourceRepo;
    private final JobPostingRepository jobRepo;
    private final ObjectMapper mapper = new ObjectMapper();
    private final Map<String, Long> lastAccessMillis = new ConcurrentHashMap<>();
    private final long minDelayMs = 2000;
    private final Map<String, List<String>> robotsCache = new ConcurrentHashMap<>();
    public ScraperService(JobSourceRepository sourceRepo, JobPostingRepository jobRepo) {
        this.sourceRepo = sourceRepo;
        this.jobRepo = jobRepo;
    }
    @Scheduled(fixedDelay = 1000 * 60 * 30)
    public void scheduledScrape() {
        try {
            List<JobSource> sources = sourceRepo.findAll();
            for(JobSource s : sources) {
                try {
                    if(allowedByRobots(s.getUrl())) { scrapeSource(s);
                    } else {
                        System.out.println("Skipping by robots: " + s.getUrl());
                    }
                } catch(Exception e) {
                    System.err.println("Scrape error: " + e.getMessage());
                }
            }
        } catch(Exception e) {
            System.err.println("Scheduled scrape failed: " + e.getMessage());
        }
    }
    public void scrapeSource(JobSource s) throws Exception {
        if(s.getType()==null) s.setType("jsonld");
        System.out.println("Scraping: " + s.getUrl() + " (" + s.getType() + ")");
        enforceRateLimit(s.getUrl());
        URI uri = new URI(s.getUrl());
        String host = uri.getHost()==null?"":uri.getHost().toLowerCase();
        if(host.contains("weworkremotely") || s.getUrl().endsWith(".rss") || "rss".equalsIgnoreCase(s.getType())) {
            scrapeRss(s);
            return;
        }
        Document doc = Jsoup.connect(s.getUrl()).userAgent("JobBot-Scraper/1.0").timeout(15000).get();
        if (host.contains("greenhouse.io") || host.contains("boards.greenhouse.io") || s.getUrl().contains("greenhouse")) {
            extractGreenhouse(doc, s);
            return;
        }
        if (host.contains("lever.co") || s.getUrl().contains("lever")) {
            extractJsonLdFromDocument(doc, s);
            return;
        }
        if("jsonld".equalsIgnoreCase(s.getType())) {
            extractJsonLdFromDocument(doc, s);
        } else if("links".equalsIgnoreCase(s.getType())) {
            Elements links = doc.select("a[href]");
            links.forEach(a->{ String href = a.attr("abs:href");
                String text = a.text(); if(href!=null && (href.toLowerCase().contains("job")||href.toLowerCase().contains("careers")||href.toLowerCase().contains("position"))) {
                    saveJobFromLink(text, href, s); } });
        } else if ("rss".equalsIgnoreCase(s.getType())) {
            scrapeRss(s);
        } else {
            if (s.getSelector()!=null && !s.getSelector().isBlank()) {
                Elements els = doc.select(s.getSelector());
                els.forEach(el->{ String title = el.text();
                    String href = el.attr("abs:href");
                    saveJobFromLink(title, href.isEmpty()?s.getUrl():href, s); });
            } else {
                extractJsonLdFromDocument(doc, s);
            }
        }
    }
    private boolean allowedByRobots(String urlStr) {
        try {
            URI uri = new URI(urlStr);
            String host = uri.getHost();
            if(host==null) return false;
            List<String> rules = robotsCache.get(host);
            if(rules==null) {
                try {
                    enforceRateLimit(uri.getScheme() + "://" + host + "/robots.txt");
                    Document r = Jsoup.connect(uri.getScheme() + "://" + host + "/robots.txt")
                            .userAgent("JobBot-Scraper/1.0")
                            .ignoreContentType(true)
                            .timeout(5000)
                            .get();
                    String txt = r.body().text();
                    rules = Arrays.asList(txt.split("\\n"));
                } catch(Exception e) {
                    rules = Collections.emptyList();
                }
                robotsCache.put(host, rules);
            }
            String path = uri.getPath()==null?"/":uri.getPath();
            for (String line: rules) {
                String t = line.trim();
                if (t.toLowerCase().startsWith("disallow:")) {
                    String rule = t.substring(9).trim();
                    if(!rule.isEmpty() && path.startsWith(rule)) return false;
                }
            }
            return true;
        } catch(Exception e) {
            return false;
        }
    }
    private void enforceRateLimit(String urlStr) {
        try {
            URI uri = new URI(urlStr);
            String host = uri.getHost()==null?"":uri.getHost().toLowerCase();
            synchronized(lastAccessMillis) {
                long now = System.currentTimeMillis();
                long last = lastAccessMillis.getOrDefault(host, 0L);
                long wait = minDelayMs - (now - last);
                if(wait>0) {
                    try {
                        Thread.sleep(wait);
                    } catch (InterruptedException ignored) {}
                }
                lastAccessMillis.put(host, System.currentTimeMillis());
            }
        } catch (Exception ignored) {}
    }
    private void scrapeRss(JobSource s) {
        try {
            enforceRateLimit(s.getUrl());
            Document doc = Jsoup.connect(s.getUrl()).userAgent("JobBot-Scraper/1.0")
                    .ignoreContentType(true).timeout(15000)
                    .get();
            Elements items = doc.select("item");
            items.forEach(item-> {
                String title = item.selectFirst("title")!=null ? item.selectFirst("title").text():"";
                String link = item.selectFirst("link")!=null ? item.selectFirst("link").text():"";
                saveJobFromLink(title, link, s);
            });
        } catch(Exception e) {
            System.err.println("RSS failed: " + e.getMessage());
        }
    }
    private void extractGreenhouse(Document doc, JobSource s) {
        try {
            Elements links = doc.select("a[href*='careers'], a[href*='/jobs/'], a[href*='greenhouse.io']");
            links.forEach(a->{ String href = a.attr("abs:href");
                String title = a.text();
                if(href != null && !href.isBlank()) saveJobFromLink(title, href, s);
            });
            extractJsonLdFromDocument(doc, s);
        } catch(Exception e) {
            System.err.println("Greenhouse extractor failed: " + e.getMessage());
        }
    }
    private void extractJsonLdFromDocument(Document doc, JobSource s) {
        try {
            Elements scripts = doc.select("script[type=application/ld+json]");
            scripts.forEach(el->{ String json = el.html();
                try {
                    JsonNode node = mapper.readTree(json);
                    if(node.isArray()) { for(JsonNode item : node) handleJsonLd(item, s);
                    } else {
                        handleJsonLd(node, s);
                    }
                } catch(Exception ignored) {}
            });
        } catch(Exception e) {
            System.err.println("JSON-LD extraction failed: " + e.getMessage());
        }
    }
    private void handleJsonLd(JsonNode node, JobSource s) {
        if (node == null) return;

        if(node.has("@graph")) {
            for(JsonNode sub : node.get("@graph"))
                handleJsonLd(sub, s);
            return;
        }
        String type = node.has("@type") ? node.get("@type").asText() : null;
        if (type == null && node.has("type"))
            type = node.get("type").asText();

        if (type != null && type.toLowerCase().contains("job")) {
            String title = node.has("title") ? node.get("title").asText() : node.has("name") ? node.get("name").asText():"";
            String url = node.has("url") ? node.get("url").asText():"";
            String description = node.has("description") ? node.get("description").asText():"";
            String company = "";
            if(node.has("hiringOrganization")) {
                JsonNode ho = node.get("hiringOrganization");
                if(ho.isTextual()) company = ho.asText();
                else if(ho.has("name")) company = ho.get("name").asText();
            }
            saveJob(title, company, description, url, s);
        }
    }
    private void saveJobFromLink(String title, String url, JobSource s) {
        saveJob(title, "", "", url, s);
    }
    private void saveJob(String title, String company, String description, String url, JobSource s) {
        try {
            if(url==null||url.isBlank())
                return;
            String normalized = url.split("#")[0];
            List<JobPosting> all = jobRepo.findAll();
            Optional<JobPosting> existing = all.stream().filter(j->normalized.equalsIgnoreCase(j.getUrl())).findFirst();
            if(existing.isPresent()) return;
            JobPosting j = new JobPosting();
            j.setTitle(title!=null?title:"");
            j.setCompany(company!=null?company:"");
            j.setDescription(description!=null?description:"");
            j.setUrl(normalized);
            j.setSource(s.getName()!=null?s.getName():s.getUrl());
            j.setFetchedAt(Instant.now());
            j.setPostedAt(Instant.now());
            jobRepo.save(j);
            System.out.println("Saved job: " + title + " (" + normalized + ")");
        } catch(Exception e) {
            System.err.println("Failed to save job: " + e.getMessage());
        }
    }
}

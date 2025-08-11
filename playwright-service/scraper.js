const { chromium } = require('playwright');
const fetch = require('node-fetch');
const robotsParser = require('robots-parser');
const { URL } = require('url');

// in-memory per-host rate limit
const lastAccess = {};
const minDelayMs = 2000; // 2s between requests per host

async function fetchRobots(hostUrl){
  try{
    const u = new URL(hostUrl);
    const robotsUrl = `${u.protocol}//${u.host}/robots.txt`;
    const r = await fetch(robotsUrl, { headers: { 'User-Agent': 'JobBot-Scraper/1.0' }, timeout: 5000 });
    if(!r.ok) return null;
    const txt = await r.text();
    return robotsParser(robotsUrl, txt);
  }catch(e){
    return null;
  }
}

async function enforceRateLimit(url){
  try{
    const u = new URL(url);
    const host = u.host;
    const now = Date.now();
    const last = lastAccess[host] || 0;
    const wait = minDelayMs - (now - last);
    if(wait > 0) await new Promise(r=>setTimeout(r, wait));
    lastAccess[host] = Date.now();
  }catch(e){}
}

async function scrubAndScrape(url, suggestedType){
  // Check robots
  const u = new URL(url);
  const host = `${u.protocol}//${u.host}`;
  const robots = await fetchRobots(url);
  if(robots){
    const allowed = robots.isAllowed(url, 'JobBot-Scraper/1.0');
    if(!allowed) throw new Error('Disallowed by robots.txt: ' + url);
  }
  await enforceRateLimit(url);

  // site-specific quick cases
  if(url.includes('weworkremotely.com') || url.endsWith('.rss') || suggestedType === 'rss'){
    return scrapeRss(url);
  }
  if(url.includes('greenhouse.io') || url.includes('boards.greenhouse.io')){
    return scrapeGreenhouse(url);
  }
  if(url.includes('api.lever.co') || url.includes('lever')){
    return scrapeLeverApi(url);
  }

  // Default: headless render, extract JSON-LD and links
  return renderAndExtract(url);
}

async function scrapeRss(url){
  await enforceRateLimit(url);
  const r = await fetch(url, { headers: { 'User-Agent': 'JobBot-Scraper/1.0' } });
  if(!r.ok) throw new Error('RSS fetch failed: ' + r.status);
  const txt = await r.text();
  // very naive: find <item> entries and extract title/link
  const items = [];
  const regex = /<item[\s\S]*?<title>([\s\S]*?)<\/title>[\s\S]*?<link>([\s\S]*?)<\/link>[\s\S]*?<\/item>/gi;
  let m;
  while((m = regex.exec(txt)) !== null){
    items.push({ title: m[1].replace(/<[^>]+>/g,'').trim(), url: m[2].replace(/<[^>]+>/g,'').trim() });
  }
  return items;
}

async function scrapeGreenhouse(url){
  await enforceRateLimit(url);
  // Greenhouse pages are mostly static - fetch and parse anchor links via Playwright render
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  const jobs = await page.$$eval('a[href]', links => links.map(a=>({ href: a.href, text: a.textContent })).filter(x=>x.href && (x.href.includes('/jobs/')||x.href.toLowerCase().includes('jobs'))));
  await browser.close();
  return jobs.map(j=>({ title: (j.text||'').trim(), url: j.href }));
}

async function scrapeLeverApi(url){
  await enforceRateLimit(url);
  // If it's a Lever API endpoint returning JSON, fetch and parse
  const r = await fetch(url, { headers: { 'User-Agent': 'JobBot-Scraper/1.0' } });
  if(!r.ok) throw new Error('Lever fetch failed: ' + r.status);
  const json = await r.json();
  if(Array.isArray(json)){
    return json.map(item=>({ title: item.text || item.title || item.role, url: item.hostedUrl || item.applyUrl || '' }));
  }
  if(json.data && Array.isArray(json.data)){
    return json.data.map(item=>({ title: item.text || item.title, url: item.applyUrl || '' }));
  }
  return [];
}

async function renderAndExtract(url){
  await enforceRateLimit(url);
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  // extract JSON-LD job postings
  const jsonld = await page.$$eval('script[type="application/ld+json"]', nodes => nodes.map(n=>n.innerText));
  const results = [];
  for(const j of jsonld){
    try{
      const parsed = JSON.parse(j);
      if(Array.isArray(parsed)){
        parsed.forEach(p=>{ if((p['@type']||'').toLowerCase().includes('job')) results.push({ title: p.title||p.name||'', url: p.url||'', description: p.description||'' }); });
      } else {
        const p = parsed;
        if(((p['@type']||'')+'').toLowerCase().includes('job')) results.push({ title: p.title||p.name||'', url: p.url||'', description: p.description||'' });
      }
    }catch(e){ /* ignore */ }
  }
  // fallback: collect job-like links
  const links = await page.$$eval('a[href]', links => links.map(a=>({ href: a.href, text: a.textContent })).filter(x=>x.href && (x.href.toLowerCase().includes('job')||x.href.toLowerCase().includes('careers')||x.href.toLowerCase().includes('position'))));
  links.forEach(l=>results.push({ title: (l.text||'').trim(), url: l.href }));
  await browser.close();
  return results;
}

module.exports = { scrubAndScrape };

const express = require('express');
const bodyParser = require('body-parser');
const { scrubAndScrape } = require('./scraper');
const app = express();
app.use(bodyParser.json({limit:'5mb'}));

app.post('/scrape', async (req, res) => {
  const { url, type } = req.body;
  if(!url) return res.status(400).send({error:'url required'});
  try{
    const jobs = await scrubAndScrape(url, type || null);
    res.json({ ok: true, jobs });
  }catch(err){
    console.error(err);
    res.status(500).json({ error: String(err) });
  }
});

const port = process.env.PORT || 4000;
app.listen(port, ()=> console.log('Playwright service listening on', port));

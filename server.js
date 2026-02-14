const express = require('express');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const RSS = require('rss');

const app = express();
const PORT = process.env.PORT || 10000;
const PROKULT_URL = 'https://prokult.ro/';

app.get('/rss.xml', async (req, res) => {
  try {
    const response = await fetch(PROKULT_URL);
    const html = await response.text();
    const $ = cheerio.load(html);

    const feed = new RSS({
      title: 'ProKult események',
      feed_url: `${req.protocol}://${req.get('host')}/rss.xml`,
      site_url: PROKULT_URL,
      description: 'Automatikusan gyűjtött események a ProKult oldalról'
    });

    $('.post').each((i, el) => {
      const title = $(el).find('h2').text().trim();
      const link = $(el).find('a').attr('href');
      const description = $(el).find('p').text().trim();

      if (title && link) {
        feed.item({
          title: title,
          description: description,
          url: link,
          date: new Date()
        });
      }
    });

    res.set('Content-Type', 'application/rss+xml');
    res.send(feed.xml({ indent: true }));
  } catch (error) {
    res.status(500).send('Hiba történt a feed generálásakor.');
  }
});

app.get('/', (req, res) => {
  res.send('ProKult RSS Feed fut. Nyisd meg: /rss.xml');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

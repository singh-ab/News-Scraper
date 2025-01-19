require("dotenv").config();
const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const pool = require("./config/db");
const { scrapeStories } = require("./utils/grabUtil");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.get("/", (req, res) => {
  res.send("Hacker News Scraper Running");
});

// Handle WebSocket connections
wss.on("connection", async (ws) => {
  console.log("WebSocket client connected");
  try {
    const { rows } = await pool.query(
      `SELECT COUNT(*) FROM stories WHERE time >= NOW() - INTERVAL '5 minutes'`
    );
    const recentCount = rows[0].count;
    ws.send(JSON.stringify({ recentCount }));
  } catch (error) {
    console.error("Error fetching recent stories count:", error);
  }
});

// Scrape every 5 minutes
setInterval(() => {
  scrapeStories(wss);
}, 60000); // 60,000 ms = 1 minute

// Start server
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Listening on port ${port}`);
  console.log(
    `Server Timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`
  );
});

// Initial scrape
scrapeStories(wss);

require("dotenv").config();
const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const pool = require("./config/db");
const { scrapeStories } = require("./utils/grabUtil");
const path = require("path");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "../public")));

// Fallback route for unmatched routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Handle WebSocket connections
wss.on("connection", async (ws) => {
  console.log("WebSocket client connected");
  try {
    const { rows } = await pool.query(
      `SELECT COUNT(*) FROM stories WHERE time >= NOW() - INTERVAL '5 minutes'`
    );
    const recentCount = rows[0].count;
    console.log(`Sending recentCount: ${recentCount}`);
    ws.send(JSON.stringify({ recentCount }));
  } catch (error) {
    console.error("Error fetching recent stories count:", error);
    ws.send(JSON.stringify({ error: "Failed to fetch recent stories count" }));
  }

  ws.on("close", () => {
    console.log("WebSocket client disconnected");
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
});

// Scrape every 5 minutes
setInterval(() => {
  scrapeStories(wss);
}, 300000); // 300,000 ms = 5 minutes

// Start server
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Listening on port ${port}`);
  // Initial scrape on server start
  scrapeStories(wss);
});

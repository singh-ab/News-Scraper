const fetch = require("node-fetch");
const pool = require("../config/db");
const WebSocket = require("ws"); // Import WebSocket for broadcasting

// Function to scrape stories and broadcast to clients
async function scrapeStories(wss) {
  try {
    console.log(`Scraping stories at ${new Date().toISOString()}`);

    // Fetch the latest story IDs from Hacker News
    const newStoriesResponse = await fetch(
      "https://hacker-news.firebaseio.com/v0/newstories.json"
    );
    const storyIds = await newStoriesResponse.json();
    console.log(`Fetched new story IDs: ${storyIds.slice(0, 10).join(", ")}`);

    // Limit to top 10 new stories
    for (const id of storyIds.slice(0, 10)) {
      // Fetch details for each story ID
      const storyDetailsResponse = await fetch(
        `https://hacker-news.firebaseio.com/v0/item/${id}.json`
      );
      const story = await storyDetailsResponse.json();

      // Check if story data is complete
      if (!story || !story.id || !story.title || !story.time) {
        console.warn(`Incomplete story data for ID: ${id}`);
        continue; // Skip if data is incomplete
      }

      console.log(`Inserting story ID: ${story.id} - Title: "${story.title}"`);

      // Insert the story into the database
      const result = await pool.query(
        `INSERT INTO stories (id, title, url, time) VALUES ($1, $2, $3, to_timestamp($4))
         ON CONFLICT (id) DO NOTHING RETURNING *`,
        [story.id, story.title, story.url, story.time]
      );

      // If the story was inserted, broadcast it to all clients
      if (result.rows.length > 0) {
        const newStory = result.rows[0];
        console.log("New story inserted:", newStory);
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(newStory));
          }
        });
      } else {
        console.log(`Story ID ${story.id} already exists. Skipping broadcast.`);
      }
    }
  } catch (error) {
    console.error("Error scraping stories:", error);
  }
}

module.exports = { scrapeStories };

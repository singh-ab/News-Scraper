# Hacker News Scraper

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Directory Structure](#directory-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Technology Stack](#technology-stack)
- [Acknowledgements](#acknowledgements)

## Introduction

Hacker News Scraper is a Node.js application that scrapes the latest stories from [Hacker News](https://news.ycombinator.com/newest), stores them in a PostgreSQL database (NeonDB), and provides a real-time dashboard displaying the number of recent stories and their details via a web interface. The application utilizes WebSockets to facilitate real-time updates without the need for page refreshes.

## Note

- I've used 'UTC' timezone for the database. I recommend using 'UTC' timezone for the database as well or at least ensure there isn't a timezone mismatch between the server and the database.
- The scraper is currently set to scrape the first 10 stories from the Hacker News website. This can be changed by modifying the `storyIds.slice(0, 10)` line in the `server/utils/grabUtil.js` file.

## Features

- **Real-time Scraping:** Fetches new stories from Hacker News at regular intervals.
- **Database Integration:** Stores scraped stories in a PostgreSQL database with time zone awareness.
- **Web Dashboard:** Provides a user-friendly interface to view recent story counts and details.
- **WebSockets:** Enables real-time updates to the dashboard without manual refreshes.
- **Logging:** Implements console logging for monitoring purposes.

## Directory Structure

```
/D:/Projects/News Scraper/
│
├── server/
│   ├── config/
│   │   └── db.js
│   ├── utils/
│   │   └── grabUtil.js
│   └── index.js
├── public/
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── scripts/
│   └── init_db.sql
├── .env
├── package.json
├── .gitignore
└── README.md
```

- **server/**: Contains server-side code.
  - **config/db.js**: Database connection configuration.
  - **utils/grabUtil.js**: Utility for scraping stories from Hacker News.
  - **index.js**: Main server file handling HTTP and WebSocket connections.
- **public/**: Holds frontend assets.
  - **index.html**: Main webpage for the dashboard.
  - **styles.css**: Stylesheet for the dashboard.
  - **app.js**: Frontend JavaScript handling WebSocket connections and DOM updates.
- **scripts/**: Contains database initialization scripts.
  - **init_db.sql**: SQL script to initialize the database schema.
- **.env**: Environment variables configuration.
- **package.json**: Project dependencies and scripts.
- **.gitignore**: Specifies files and directories to be ignored by Git.

## Prerequisites

Ensure you have the following installed on your system:
Node, npm, PostgreSQL (or use NeonDB).

## Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/singh-ab/News-Scraper.git
   cd News-Scraper
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Initialize the Database**

   - Ensure your PostgreSQL database is running.
   - Update the `.env` file with your database credentials.
   - Run the SQL script to create the `stories` table.

   ```bash
   psql -d your_dbname -f scripts/init_db.sql
   ```

   **_Replace `your_dbname` with your actual database name._**

## Configuration

1. **Environment Variables**

   Create a `.env` file in the project root with the following content:

   ```plaintext
   DATABASE_URL=
   PORT=
   ```

   - **DATABASE_URL**: Your PostgreSQL connection string.
   - **PORT**: Port on which the server will run (default is `3000`).

## Usage

1. **Start the Server**

   ```bash
   npm run dev
   ```

   or

   ```bash
   npm start
   ```

2. **Access the Dashboard**

   Open your web browser and navigate to `http://localhost:3000/` to view the real-time dashboard.

3. **Monitor Logs**

   The server console will display logs related to scraping activities and WebSocket communications.

4. Alternatively, you can use console.log() to get the number of stories published in the last 5 mins.

   ```javascript
   const ws = new WebSocket("ws://localhost:3000");
   ws.onopen = () => {
     console.log("Connected to WebSocket server");
   };

   ws.onmessage = (event) => {
     console.log("Received:", event.data);
   };

   ws.onerror = (error) => {
     console.error("WebSocket error:", error);
   };

   ws.onclose = () => {
     console.log("WebSocket connection closed");
   };
   ```

## Technology Stack

- **Backend:**
  - Node.js
  - Express
  - WebSockets
  - node-fetch
  - pg
- **Frontend:**
  - HTML, CSS, JavaScript
- **Database:**
  - PostgreSQL (NeonDB)
- **Utilities:**
  - dotenv
  - nodemon

## Acknowledgements

- [Hacker News API](https://github.com/HackerNews/API)
- [WebSockets](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)

# Nasl-1 Discord Bot

## Overview
Nasl-1 is a feature-rich Discord bot built with discord.js v14 and Node.js. It includes tickets, music (via Lavalink), leveling, giveaways, moderation, and more.

## Project Structure
- `lanya.js` - Main entry point
- `commands/` - Slash commands organized by category (admin, fun, info, level, moderation, music, tickets)
- `events/` - Event handlers for Discord, Lavalink, and server logs
- `handlers/` - Command, event, database, and crash handlers
- `models/` - MongoDB/Mongoose schemas
- `functions/` - Utility functions for giveaways, tickets, etc.
- `utils/` - Fonts and utility helpers

## Setup

### Required Environment Variables
- `DISCORD_TOKEN` - Your Discord bot token
- `DISCORD_CLIENT_ID` - Your Discord application client ID
- `MONGODB_URL` - MongoDB connection string for data persistence (Note: needs a valid connection string)

### Running the Bot
The bot runs via `npm start` which executes `cross-env NODE_NO_WARNINGS=1 node lanya.js`

### Health Check
Express server runs on port 5000 serving a simple health check endpoint at `/`

## Recent Changes
- 2024-12-09: Added Ranked Bedwars Queue System
  - `models/RankedQueue.js` - MongoDB schema for tracking games
  - `events/rankedQueue.js` - Voice state handler that triggers when 8 players join queue channel
  - `events/pickCommand.js` - Handles `!pick @player` prefix command for captain picks
  - `commands/ranked/pick.js` - Slash command version of pick
  - Channel IDs: Queue VC `1437117580807504033`, Text `1446884447449256137`, Category `1437140950500642927`
  - Pick order: Captain1 picks 1 → Captain2 picks 2 → Captain1 picks 1 → Captain2 picks 1 → Remaining to Captain1
  - Fixed handlers/database.js to use MONGODB_URL environment variable
- 2024-12-09: Configured for Replit environment
  - Changed Express server to listen on port 5000 (0.0.0.0)
  - Added global.styles for console color output
  - Installed @discordjs/voice dependency

## Technical Details
- Node.js 20
- discord.js v14
- Mongoose for MongoDB
- Lavalink for music playback
- Express for health check endpoint

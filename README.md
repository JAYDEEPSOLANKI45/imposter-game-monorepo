# Imposter - Online multiplayer bluffing game (dev workspace)

Short README to get contributors or testers up and running quickly. This repo contains a Vite + React TypeScript client, a Node/Express + Socket.IO server, and a small shared folder with types.

## Contents

- `client/` - Vite + React (TypeScript) single-page app. Dev server serves the UI.
- `server/` - Node (Express) + Socket.IO server that manages rooms, players, rounds and timers.
- `shared/` - shared types and small helpers used by both client and server.

## Tech stack

- Client: React + TypeScript, Vite, socket.io-client
- Server: Node.js, Express, Socket.IO (server)
- Communication: Socket.IO (real-time events - prompt/vote/game lifecycle)

## Prerequisites

- Node 18+ (or recent LTS). On Windows use Command Prompt or PowerShell.
- npm (or yarn/pnpm) installed globally.
- (Optional) ngrok if you want to expose your local dev server to the internet for cross-device testing.

## Quick start (development)

Follow these steps in two terminal windows (client and server):

1. Install dependencies

Open a terminal and run:

```cmd
cd client
npm install

cd ..\server
npm install
```

2. Start the server and client concurrently

In a terminal (server):

```cmd
npm run dev
```

Open the URL shown by Vite (usually `http://localhost:5173`) in your browser.

4. Create a player and join or create a room from the Homepage.

## Environment variables

- `client/.env` (Vite):

Create `client/.env` to point the client to the server when testing through tunnels (ngrok) or from different devices.

```
VITE_SERVER_URL=https://<your-ngrok-host-or-public-server>
```

The client socket helper now uses `import.meta.env.VITE_SERVER_URL` with a fallback to `http://localhost:8080`.

If you don't set this, the client will attempt to connect to `localhost:8080`.

## Using ngrok (optional)

- If you want to test from a mobile device or share your dev server:
1. Access the Network IP given after you run the script `npm run dev`
  ```cmd
    [0]   VITE v7.1.6  ready in 374 ms
    [0]
    [0]   ➜  Local:   http://localhost:5173/
    [0]   ➜  Network: http://192.168.56.1:5173/
    [0]   ➜  Network: http://10.78.11.28:5173/
  ```
  2.  Now you still need the client to reach the Socket.IO server. Expose the server with a ngrok tunnel and set `VITE_SERVER_URL` to the server tunnel URL.
  3.  Update `client/.env` with the public server URL and restart the Vite dev server.


## Architecture & flow (high level)

- The server maintains authoritative maps for `players` and `rooms`.
- Typical game flow:
  1.  Player creates a profile (`create-player`) and joins a room (`join-room`). The first player becomes the owner.
  2.  Owner starts the game (`start-game`) -> server calls `initializeRoom` and emits `game-started` to players with their word.
  3.  Prompt round: server emits `send-prompt-to-server` to prompt clients to submit prompts; clients send `prompt-send` to server.
  4.  Voting round: server emits `send-vote-to-server`; clients send `vote-send`.
  5.  Server tallies votes (`countVotes`), calculates results and emits `game-result` to the room. If `restart: true` the round ends and server resets room state; otherwise it continues.


## Contributing

- Fork, create a branch, implement your change, add tests if applicable, and open a PR with a short description.

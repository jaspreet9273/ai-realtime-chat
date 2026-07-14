# AI Realtime Chat

A minimal real-time chat app with one shared room, Google login, AI-generated
reply suggestions, and a premium chat summarizer you unlock through Razorpay.
Once you pay, premium unlocks instantly over your existing socket connection
— no refresh, no polling.

## Stack

| Layer     | Tech                       |
| --------- | -------------------------- |
| Frontend  | Next.js                    |
| Backend   | Node.js                    |
| Real-time | Socket.IO                  |
| Auth      | Google OAuth via NextAuth  |
| Database  | MongoDB Atlas via Mongoose |
| AI        | Google Gemini              |
| Payments  | Razorpay                   |

## Requirements

- Node.js `22.12.0` (that's what this was built/tested on)

## Env vars

### `server/.env`

```bash
PORT=4000
CLIENT_ORIGIN=http://localhost:3000
MONGODB_URI=
GOOGLE_CLIENT_ID=
GEMINI_API_KEY=
GEMINI_MODEL=gemini-flash-lite-latest
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

### `client/.env.local`

```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXT_PUBLIC_SERVER_URL=http://localhost:4000
```

## Running it locally

```bash
# backend
cd server
// create .env
npm install
npm run dev

# frontend
cd client
// create .env.local
npm install
npm run dev
```

Open `localhost:3000`, sign in with Google, you'll land in the chat room.

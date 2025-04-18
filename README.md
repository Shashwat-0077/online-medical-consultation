# My Next.js Project

This is a [Next.js](https://nextjs.org) project bootstrapped with [create-next-app](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).  
The project has a `client` and a `server` folder, and you'll need to run them separately during development.

---

## 🚀 Getting Started

To start the development servers, run `npm run dev` in both the `client` and `server` directories using separate terminal windows.

---

### 1. Start the Client Development Server

```bash
cd client
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the client application.  
You can start editing the client-side code by modifying files in the `client/app` directory.  
The page auto-updates as you edit the files.

---

### 2. Start the Server Development Server

Open a new terminal window and run:

```bash
cd server
npm run dev
```

The server will typically run on [http://localhost:5000](http://localhost:5000) (as configured in the `.env` file).

---

## 🛠️ Environment Variables

This project uses `.env` files to manage environment variables for both the client and the server.

### Client (`/client/.env`)

You'll need to set up Firebase for the client application.  
Create a `.env` file in the `client` directory and add your Firebase configuration:

```env
NEXT_PUBLIC_API_KEY=YOUR_FIREBASE_API_KEY
NEXT_PUBLIC_AUTH_DOMAIN=YOUR_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_PROJECT_ID=YOUR_FIREBASE_PROJECT_ID
NEXT_PUBLIC_STORAGE_BUCKET=YOUR_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_MESSAGING_SENDER_ID=YOUR_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_APP_ID=YOUR_FIREBASE_APP_ID
NEXT_PUBLIC_MEASUREMENT_ID=YOUR_FIREBASE_MEASUREMENT_ID
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Server (`/server/.env`)

Create a `.env` file in the `server` directory and add the following:

```env
FRONTEND_URL=http://localhost:3000
PORT=5000
MONGO_URI=YOUR_MONGODB_CONNECTION_STRING
```

---

## 🔑 Firebase Service Account Key

The server interacts with Firebase Admin SDK, download your Firebase service account key JSON file and place it in the `server` directory.

Rename the file to:

```
server/serviceAccountKey.json
```

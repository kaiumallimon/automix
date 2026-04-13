# Automix

Scenario-based API testing platform built with Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, and Firebase.

## Step 1 Status

Step 1 (project setup + Firebase integration) is complete.

Implemented:

- Next.js App Router + TypeScript baseline
- Tailwind CSS v4 + shadcn/ui initialization
- Firebase client bootstrap layer
- Initial clean architecture folder boundaries

## Architecture Layout

```txt
app/                # Route/UI layer
components/         # Reusable UI components
hooks/              # Shared React hooks
lib/
	firebase/         # Firebase setup + service accessors
	runner/           # Scenario execution engine boundary
	utils/            # Helper utilities
types/              # Shared TypeScript types
```

## Environment Variables

Copy `.env.example` to `.env.local` and provide your Firebase web app values:

```bash
cp .env.example .env.local
```

Required variables:

- NEXT_PUBLIC_FIREBASE_API_KEY
- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
- NEXT_PUBLIC_FIREBASE_PROJECT_ID
- NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
- NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
- NEXT_PUBLIC_FIREBASE_APP_ID

Optional variable:

- NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID

## Run Locally

```bash
npm install
npm run dev
```

## Quality Checks

```bash
npm run lint
npm run build
```

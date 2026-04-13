import type { FirebaseOptions } from "firebase/app";

type RequiredClientEnvKey =
  | "NEXT_PUBLIC_FIREBASE_API_KEY"
  | "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"
  | "NEXT_PUBLIC_FIREBASE_PROJECT_ID"
  | "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"
  | "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"
  | "NEXT_PUBLIC_FIREBASE_APP_ID";

function getRequiredClientEnv(key: RequiredClientEnvKey): string {
  const value = process.env[key];

  if (!value) {
    throw new Error(
      `Missing required Firebase environment variable: ${key}. ` +
        "Populate it in your deployment environment or .env.local."
    );
  }

  return value;
}

export function getFirebaseClientConfig(): FirebaseOptions {
  const config: FirebaseOptions = {
    apiKey: getRequiredClientEnv("NEXT_PUBLIC_FIREBASE_API_KEY"),
    authDomain: getRequiredClientEnv("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"),
    projectId: getRequiredClientEnv("NEXT_PUBLIC_FIREBASE_PROJECT_ID"),
    storageBucket: getRequiredClientEnv("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"),
    messagingSenderId: getRequiredClientEnv(
      "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"
    ),
    appId: getRequiredClientEnv("NEXT_PUBLIC_FIREBASE_APP_ID"),
  };

  const measurementId = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID;
  if (measurementId) {
    config.measurementId = measurementId;
  }

  return config;
}

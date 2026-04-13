"use client";

import { getAuth, type Auth } from "firebase/auth";

import { getFirebaseApp } from "./app";

let authInstance: Auth | null = null;

export function getFirebaseAuth(): Auth {
  if (!authInstance) {
    authInstance = getAuth(getFirebaseApp());
  }

  return authInstance;
}

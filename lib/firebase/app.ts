import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";

import { getFirebaseClientConfig } from "./config";

export function getFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) {
    return getApp();
  }

  return initializeApp(getFirebaseClientConfig());
}

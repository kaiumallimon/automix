import { getFirestore, type Firestore } from "firebase/firestore";

import { getFirebaseApp } from "./app";

let firestoreServerInstance: Firestore | null = null;

export function getFirebaseServerFirestore(): Firestore {
  if (!firestoreServerInstance) {
    firestoreServerInstance = getFirestore(getFirebaseApp());
  }

  return firestoreServerInstance;
}

import { getFirestore, type Firestore } from "firebase-admin/firestore";

import { getFirebaseAdminApp } from "./admin";

let firestoreServerInstance: Firestore | null = null;

export function getFirebaseServerFirestore(): Firestore {
  if (!firestoreServerInstance) {
    firestoreServerInstance = getFirestore(getFirebaseAdminApp());
  }

  return firestoreServerInstance;
}

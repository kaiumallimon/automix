"use client";

import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  onIdTokenChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  type Unsubscribe,
  type User,
} from "firebase/auth";

import { getFirebaseAuth } from "@/lib/firebase/auth";
import type {
  AuthResult,
  AuthUser,
  LoginCredentials,
  RegisterCredentials,
} from "@/types/auth";

function mapFirebaseUser(user: User): AuthUser {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
  };
}

export async function initializeAuthPersistence(): Promise<void> {
  await setPersistence(getFirebaseAuth(), browserLocalPersistence);
}

export async function loginWithEmailPassword(
  credentials: LoginCredentials
): Promise<AuthResult> {
  const userCredential = await signInWithEmailAndPassword(
    getFirebaseAuth(),
    credentials.email,
    credentials.password
  );

  return {
    user: mapFirebaseUser(userCredential.user),
    idToken: await userCredential.user.getIdToken(),
  };
}

export async function registerWithEmailPassword(
  credentials: RegisterCredentials
): Promise<AuthResult> {
  const userCredential = await createUserWithEmailAndPassword(
    getFirebaseAuth(),
    credentials.email,
    credentials.password
  );

  return {
    user: mapFirebaseUser(userCredential.user),
    idToken: await userCredential.user.getIdToken(),
  };
}

export async function logoutCurrentUser(): Promise<void> {
  await signOut(getFirebaseAuth());
}

export function subscribeToAuthState(
  callback: (result: AuthResult | null) => Promise<void> | void
): Unsubscribe {
  return onIdTokenChanged(getFirebaseAuth(), async (user) => {
    if (!user) {
      await callback(null);
      return;
    }

    await callback({
      user: mapFirebaseUser(user),
      idToken: await user.getIdToken(),
    });
  });
}

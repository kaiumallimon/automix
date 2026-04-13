import {
  applicationDefault,
  cert,
  getApp,
  getApps,
  initializeApp,
  type App,
} from "firebase-admin/app";

interface ServiceAccountEnv {
  projectId: string;
  clientEmail: string;
  privateKey: string;
}

function readServiceAccountEnv(): ServiceAccountEnv | null {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    return null;
  }

  return {
    projectId,
    clientEmail,
    privateKey: privateKey.replace(/\\n/g, "\n"),
  };
}

function buildAdminCredential() {
  const serviceAccount = readServiceAccountEnv();

  if (serviceAccount) {
    return cert(serviceAccount);
  }

  return applicationDefault();
}

export function getFirebaseAdminApp(): App {
  if (getApps().length > 0) {
    return getApp();
  }

  return initializeApp({
    credential: buildAdminCredential(),
    projectId:
      process.env.FIREBASE_ADMIN_PROJECT_ID ??
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
}

import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Helper function to initialize collections if they don't exist
export const initializeCollections = async () => {
  try {
    // This will create the grandpas collection if it doesn't exist
    // We'll add a temporary document that can be deleted later
    const tempDoc = {
      name: "TEMP_INIT_DOC",
      address: "TEMP",
      phone: "TEMP",
      email: "temp@temp.com",
      skills: "TEMP",
      note: "TEMP",
      timestamp: new Date().toISOString(),
      userId: "TEMP",
      source: "init"
    };
    
    await addDoc(collection(db, "grandpas"), tempDoc);
    console.log("Collections initialized");
    return true;
  } catch (error) {
    console.error("Failed to initialize collections:", error);
    return false;
  }
};
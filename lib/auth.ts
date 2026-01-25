import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { auth, db, functions } from './firebase';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'grandpa' | 'seeker' | 'admin';
  createdAt: string;
  isVerified: boolean;
}

// Sign up new user
export const signUp = async (email: string, password: string, displayName: string, role: 'grandpa' | 'seeker') => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update display name
    await updateProfile(user, { displayName });
    
    // Create user profile in Firestore
    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email!,
      displayName,
      role,
      createdAt: new Date().toISOString(),
      isVerified: false
    };
    
    await setDoc(doc(db, 'users', user.uid), userProfile);
    
    // Send custom email verification
    try {
      const sendCustomEmailVerification = httpsCallable(functions, 'sendCustomEmailVerification');
      await sendCustomEmailVerification({
        email: user.email,
        displayName,
        userId: user.uid
      });
      console.log('Custom verification email sent');
    } catch (verificationError) {
      console.error('Failed to send verification email:', verificationError);
      // Don't throw error - user account is still created
    }
    
    return { user, profile: userProfile };
  } catch (error) {
    throw error;
  }
};

// Sign in existing user
export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

// Sign out
export const logOut = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
};

// Reset password
export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    throw error;
  }
};

// Get user profile
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

// Auth state observer
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
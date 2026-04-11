import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  confirmPasswordReset,
  updateProfile,
  updateEmail,
  updatePassword,
  sendEmailVerification,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  OAuthProvider,
  onAuthStateChanged
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

/**
 * Authentication Service
 * @class AuthService
 * @description Handles all Firebase authentication operations
 */
export class AuthService {
  constructor(firebaseConfig) {
    this.auth = getAuth();
    this.db = getFirestore();
    this.storage = getStorage();
    this.authStateListeners = new Set();
    this.currentUser = null;
    
    // Initialize auth state listener
    this.unsubscribeAuth = onAuthStateChanged(this.auth, (user) => {
      this.currentUser = user;
      this.authStateListeners.forEach(listener => listener(user));
    });
  }
  
  /**
   * Get current user
   * @returns {Object|null} Current user or null
   */
  getCurrentUser() {
    return this.currentUser;
  }
  
  /**
   * Subscribe to auth state changes
   * @param {Function} listener - Callback function
   * @returns {Function} Unsubscribe function
   */
  onAuthStateChanged(listener) {
    this.authStateListeners.add(listener);
    if (this.currentUser) {
      listener(this.currentUser);
    }
    return () => {
      this.authStateListeners.delete(listener);
    };
  }
  
  /**
   * Sign in with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} User credential
   */
  async signInWithEmail(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      
      // Update user document with login info
      const userRef = doc(this.db, 'users', userCredential.user.uid);
      await updateDoc(userRef, {
        lastLoginAt: new Date(),
        loginAttempts: 0,
        status: 'active'
      });
      
      return userCredential;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }
  
  /**
   * Register new user
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {Object} userData - Additional user data
   * @returns {Promise<Object>} User credential
   */
  async registerWithEmail(email, password, userData = {}) {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const { user } = userCredential;
      
      // Update profile with display name
      if (userData.name) {
        await updateProfile(user, { displayName: userData.name });
      }
      
      // Send email verification
      await sendEmailVerification(user);
      
      // Create user document in Firestore
      const userRef = doc(this.db, 'users', user.uid);
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        emailVerified: false,
        name: userData.name || '',
        displayName: userData.name || '',
        createdAt: new Date(),
        status: 'pending',
        roles: ['user'],
        preferences: userData.preferences || {},
        metadata: userData.metadata || {}
      });
      
      return userCredential;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }
  
  /**
   * Sign in with OAuth provider
   * @param {string} provider - Provider name ('google', 'github', 'microsoft')
   * @returns {Promise<Object>} User credential
   */
  async signInWithProvider(provider) {
    try {
      let authProvider;
      
      switch (provider) {
        case 'google':
          authProvider = new GoogleAuthProvider();
          break;
        case 'github':
          authProvider = new GithubAuthProvider();
          break;
        case 'microsoft':
          authProvider = new OAuthProvider('microsoft.com');
          authProvider.addScope('mail.read');
          authProvider.addScope('user.read');
          break;
        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }
      
      const userCredential = await signInWithPopup(this.auth, authProvider);
      const { user } = userCredential;
      
      // Check if user document exists
      const userRef = doc(this.db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        // Create new user document for OAuth user
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          emailVerified: user.emailVerified,
          name: user.displayName || '',
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
          createdAt: new Date(),
          lastLoginAt: new Date(),
          status: 'active',
          roles: ['user'],
          preferences: {},
          metadata: {
            provider: provider,
            providerId: user.providerData[0]?.providerId
          }
        });
      } else {
        // Update last login
        await updateDoc(userRef, {
          lastLoginAt: new Date(),
          status: 'active'
        });
      }
      
      return userCredential;
    } catch (error) {
      console.error('OAuth sign in error:', error);
      throw error;
    }
  }
  
  /**
   * Sign out user
   * @returns {Promise<void>}
   */
  async signOut() {
    try {
      await signOut(this.auth);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }
  
  /**
   * Send password reset email
   * @param {string} email - User email
   * @returns {Promise<void>}
   */
  async sendPasswordReset(email) {
    try {
      await sendPasswordResetEmail(this.auth, email);
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  }
  
  /**
   * Confirm password reset
   * @param {string} oobCode - Reset code
   * @param {string} newPassword - New password
   * @returns {Promise<void>}
   */
  async confirmPasswordReset(oobCode, newPassword) {
    try {
      await confirmPasswordReset(this.auth, oobCode, newPassword);
    } catch (error) {
      console.error('Password reset confirmation error:', error);
      throw error;
    }
  }
  
  /**
   * Update user profile
   * @param {Object} profileData - Profile data to update
   * @returns {Promise<void>}
   */
  async updateUserProfile(profileData) {
    try {
      const user = this.auth.currentUser;
      if (!user) throw new Error('No user logged in');
      
      // Update Firebase Auth profile
      const authUpdates = {};
      if (profileData.displayName) authUpdates.displayName = profileData.displayName;
      if (profileData.photoURL) authUpdates.photoURL = profileData.photoURL;
      
      if (Object.keys(authUpdates).length > 0) {
        await updateProfile(user, authUpdates);
      }
      
      // Update Firestore document
      const userRef = doc(this.db, 'users', user.uid);
      const updateData = { ...profileData, updatedAt: new Date() };
      delete updateData.uid; // Don't allow UID updates
      
      await updateDoc(userRef, updateData);
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  }
  
  /**
   * Change user password
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<void>}
   */
  async changePassword(currentPassword, newPassword) {
    try {
      const user = this.auth.currentUser;
      if (!user) throw new Error('No user logged in');
      
      // Re-authenticate user
      const credential = await signInWithEmailAndPassword(this.auth, user.email, currentPassword);
      
      // Update password
      await updatePassword(user, newPassword);
    } catch (error) {
      console.error('Password change error:', error);
      throw error;
    }
  }
  
  /**
   * Delete user account
   * @returns {Promise<void>}
   */
  async deleteAccount() {
    try {
      const user = this.auth.currentUser;
      if (!user) throw new Error('No user logged in');
      
      // Delete user document from Firestore
      const userRef = doc(this.db, 'users', user.uid);
      await deleteDoc(userRef);
      
      // Delete user from Firebase Auth
      await user.delete();
    } catch (error) {
      console.error('Account deletion error:', error);
      throw error;
    }
  }
  
  /**
   * Upload user avatar
   * @param {File} file - Image file
   * @returns {Promise<string>} Download URL
   */
  async uploadAvatar(file) {
    try {
      const user = this.auth.currentUser;
      if (!user) throw new Error('No user logged in');
      
      const storageRef = ref(this.storage, `avatars/${user.uid}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      // Update profile with new photo URL
      await this.updateUserProfile({ photoURL: downloadURL });
      
      return downloadURL;
    } catch (error) {
      console.error('Avatar upload error:', error);
      throw error;
    }
  }
  
  /**
   * Cleanup listeners
   */
  cleanup() {
    if (this.unsubscribeAuth) {
      this.unsubscribeAuth();
    }
  }
}
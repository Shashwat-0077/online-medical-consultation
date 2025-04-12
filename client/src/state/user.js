// src/stores/authStore.js
import { create } from "zustand";
import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

export const useAuthStore = create((set) => ({
    user: null,
    loading: true,
    error: null,

    // Sign in with email and password
    signIn: async (email, password) => {
        try {
            set({ loading: true, error: null });
            return await signInWithEmailAndPassword(auth, email, password);
            // Auth state listener will update the user
        } catch (error) {
            set({ error: error.message });
        } finally {
            set({ loading: false });
        }
    },

    // Sign in with Google
    signInWithGoogle: async () => {
        try {
            set({ loading: true, error: null });
            return await signInWithPopup(auth, googleProvider);
            // Auth state listener will update the user
        } catch (error) {
            set({ error: error.message });
        } finally {
            set({ loading: false });
        }
    },

    // Sign up with email and password
    signUp: async (email, password) => {
        try {
            set({ loading: true, error: null });
            return await createUserWithEmailAndPassword(auth, email, password);
            // Auth state listener will update the user
        } catch (error) {
            set({ error: error.message });
        } finally {
            set({ loading: false });
        }
    },

    // Sign out
    signOut: async () => {
        try {
            set({ loading: true, error: null });
            await firebaseSignOut(auth);
            // Auth state listener will update the user
        } catch (error) {
            set({ error: error.message });
        } finally {
            set({ loading: false });
        }
    },

    // Reset error state
    resetError: () => set({ error: null }),

    // Initialize auth state listener
    initAuth: () => {
        const unsubscribe = onAuthStateChanged(
            auth,
            (user) => {
                user;
                set({
                    user: user
                        ? {
                              uid: user.uid,
                              email: user.email,
                              displayName: user.displayName,
                              photoURL: user.photoURL,
                              emailVerified: user.emailVerified,
                          }
                        : null,
                    loading: false,
                });
            },
            (error) => {
                set({ error: error.message, loading: false });
            }
        );

        return unsubscribe;
    },
}));

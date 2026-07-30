/**
 * Cloud Storage & Real-Time Firestore Synchronization
 */

import { 
    initFirebaseSDK,
    auth, 
    db, 
    isFirebaseInitialized,
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    doc, 
    setDoc, 
    getDoc, 
    onSnapshot 
} from './firebase-config.js';
import { Storage } from './storage.js';

export const CloudStorage = {
    currentUser: null,
    unsubscribeListener: null,

    async init(onAuthChangedCallback, onDataSyncedCallback) {
        await initFirebaseSDK();

        if (!auth || !onAuthStateChanged) {
            console.log("Local storage mode active.");
            if (onAuthChangedCallback) onAuthChangedCallback(null);
            return;
        }

        try {
            onAuthStateChanged(auth, async (user) => {
                this.currentUser = user;
                if (user) {
                    console.log(`👤 Cloud User Logged In: ${user.email}`);
                    this.subscribeToUserData(user.uid, onDataSyncedCallback);
                } else {
                    if (this.unsubscribeListener) {
                        this.unsubscribeListener();
                        this.unsubscribeListener = null;
                    }
                }
                if (onAuthChangedCallback) onAuthChangedCallback(user);
            });
        } catch (e) {
            console.warn("Auth listener warning:", e);
        }
    },

    async register(email, password) {
        if (!auth || !createUserWithEmailAndPassword) {
            throw new Error("Please configure your custom Firebase keys first by clicking '⚙️ Configure Custom Firebase Keys' below.");
        }
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await this.syncAllDataToCloud(cred.user.uid);
        return cred.user;
    },

    async login(email, password) {
        if (!auth || !signInWithEmailAndPassword) {
            throw new Error("Please configure your custom Firebase keys first by clicking '⚙️ Configure Custom Firebase Keys' below.");
        }
        const cred = await signInWithEmailAndPassword(auth, email, password);
        return cred.user;
    },

    async logout() {
        if (auth && signOut) await signOut(auth);
    },

    subscribeToUserData(uid, onDataSyncedCallback) {
        if (!db || !onSnapshot || !doc) return;
        try {
            const userDocRef = doc(db, 'users', uid);

            this.unsubscribeListener = onSnapshot(userDocRef, (snapshot) => {
                if (snapshot.exists()) {
                    const cloudData = snapshot.data();
                    if (cloudData.subjects) Storage.saveSubjects(cloudData.subjects);
                    if (cloudData.goals) Storage.saveGoals(cloudData.goals);
                    if (cloudData.timetable) Storage.saveTimetable(cloudData.timetable);

                    console.log("⚡ Real-time cloud sync received!");
                    if (onDataSyncedCallback) onDataSyncedCallback(cloudData);
                } else {
                    this.syncAllDataToCloud(uid);
                }
            }, (error) => {
                console.warn("Firestore sync notification:", error);
            });
        } catch (e) {
            console.warn("Subscribe error:", e);
        }
    },

    async syncAllDataToCloud(uid = this.currentUser?.uid) {
        if (!db || !uid || !setDoc || !doc) return;
        try {
            const userDocRef = doc(db, 'users', uid);
            const payload = {
                updatedAt: new Date().toISOString(),
                subjects: Storage.getSubjects(),
                goals: Storage.getGoals(),
                timetable: Storage.getTimetable()
            };
            await setDoc(userDocRef, payload, { merge: true });
            console.log("☁️ Successfully synced local data to Cloud Firestore.");
        } catch (e) {
            console.error("Cloud sync error:", e);
        }
    }
};

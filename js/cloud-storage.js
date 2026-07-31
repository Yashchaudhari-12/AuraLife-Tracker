/**
 * Cloud Storage — Lightweight Firestore Sync
 * One read on login and debounced writes on changes.
 */
import { initFirebaseSDK, Firebase } from './firebase-config.js';
import { Storage } from './storage.js';

export const CloudStorage = {
    currentUser: null, _isSyncing: false, _onSyncStatusChange: null, _onDataSynced: null,

    async init(onAuthChangedCallback, onDataSyncedCallback, onSyncStatusChange) {
        this._onSyncStatusChange = onSyncStatusChange || null;
        this._onDataSynced = onDataSyncedCallback || null;
        await initFirebaseSDK();
        this._diagnose();
        if (!Firebase.auth || !Firebase.onAuthStateChanged) {
            console.log('⚠️ Firebase Auth not available — local mode.');
            onAuthChangedCallback?.(null); return;
        }
        Firebase.onAuthStateChanged(Firebase.auth, async user => {
            this.currentUser = user;
            if (user) { console.log(`👤 Signed in: ${user.email}`); await this._loadFromCloud(user.uid); }
            onAuthChangedCallback?.(user);
        });
    },

    async _loadFromCloud(uid) {
        if (!Firebase.db || !Firebase.getDoc || !Firebase.doc || localStorage.getItem('auralife_cloud_disabled') === 'true') return;
        try {
            this._onSyncStatusChange?.('syncing');
            const userDocRef = Firebase.doc(Firebase.db, 'users', uid);
            const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 8000));
            const snapshot = await Promise.race([Firebase.getDoc(userDocRef), timeout]);
            let cloudData;
            if (snapshot.exists()) {
                cloudData = snapshot.data();
                if (cloudData.featureData) Storage.applyFeatureData(cloudData.featureData);
                else Storage.applyFeatureData(this._legacyFeatureData(cloudData));
            } else {
                // Preserve local work for a new account instead of clearing it on authentication.
                cloudData = this._buildPayload();
                await Firebase.setDoc(userDocRef, cloudData);
            }
            this._onSyncStatusChange?.('synced');
            this._onDataSynced?.(cloudData);
        } catch (e) {
            const quota = e.message === 'timeout' || e.code === 'resource-exhausted' || e.message?.toLowerCase().includes('quota');
            this._onSyncStatusChange?.(quota ? 'offline' : 'error', e.message);
            if (quota && window.appUI) window.appUI.showToast('📱 Using local data while cloud sync is unavailable.', 'info');
            else this._showSyncError(e);
        }
    },

    _legacyFeatureData(data) {
        return {
            auralife_subjects: data.subjects, auralife_goals: data.goals, auralife_timetable: data.timetable,
            auralife_todays_focus: data.todaysFocus, auralife_milestone_goals_v2: data.milestoneGoalsV2,
            auralife_habits_v2: data.habits, auralife_coding_stats_v1: data.codingStats, auralife_xp: data.xp,
            auralife_activity_log: data.activityLog, auralife_cal_notes: data.calendarNotes
        };
    },

    _buildPayload() { return { updatedAt: new Date().toISOString(), featureData: Storage.getFeatureData() }; },
    async register(email, password) {
        if (!Firebase.auth || !Firebase.createUserWithEmailAndPassword) throw new Error('Firebase credentials are not configured.');
        return (await Firebase.createUserWithEmailAndPassword(Firebase.auth, email, password)).user;
    },
    async login(email, password) {
        if (!Firebase.auth || !Firebase.signInWithEmailAndPassword) throw new Error('Firebase credentials are not configured.');
        return (await Firebase.signInWithEmailAndPassword(Firebase.auth, email, password)).user;
    },
    clearAllLocalUserData() { Storage.clearAll(); },
    async logout() {
        if (Firebase.auth && Firebase.signOut) await Firebase.signOut(Firebase.auth);
        this.currentUser = null; this.clearAllLocalUserData();
        window.appUI?.renderAll(); window.appUI?.showToast('Logged out securely. Workspace cleared.', 'info');
    },
    async syncAllDataToCloud(uid = this.currentUser?.uid) {
        if (!Firebase.db || !Firebase.setDoc || !Firebase.doc) { this._onSyncStatusChange?.('error', 'Firestore not initialized'); this._showSyncError(new Error('Firestore not initialized')); return; }
        if (!uid) return;
        if (this._isSyncing) return;
        try {
            this._isSyncing = true; this._onSyncStatusChange?.('syncing');
            await Promise.race([Firebase.setDoc(Firebase.doc(Firebase.db, 'users', uid), this._buildPayload(), { merge: true }), new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 12000))]);
            this._onSyncStatusChange?.('synced'); window.appUI?.showToast('☁️ Data synced to cloud!', 'success');
        } catch (e) { this._onSyncStatusChange?.('error', e.message); this._showSyncError(e); }
        finally { this._isSyncing = false; }
    },
    _showSyncError(e) {
        if (!window.appUI) return;
        if (e.message === 'timeout') window.appUI.showToast('⏱️ Sync timed out — your local data is safe.', 'error');
        else if (e.code === 'permission-denied') window.appUI.showToast('🔒 Firestore permissions blocked this sync.', 'error');
        else window.appUI.showToast(`Sync failed (${e.code || 'error'}): ${e.message}`, 'error');
    },
    _diagnose() {
        console.log('AuraLife Firebase:', { sdk: !!Firebase.signInWithEmailAndPassword, auth: !!Firebase.auth, firestore: !!Firebase.db, initialized: Firebase.initialized });
    }
};

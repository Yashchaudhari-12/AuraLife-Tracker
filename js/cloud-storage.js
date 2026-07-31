/**
 * Cloud Storage — Lightweight Firestore Sync
 * Strategy: ONE getDoc read on login + debounced setDoc writes on changes.
 * NO real-time onSnapshot listener (which eats free tier quota endlessly).
 */

import { initFirebaseSDK, Firebase } from './firebase-config.js';
import { Storage } from './storage.js';

export const CloudStorage = {
    currentUser: null,
    _isSyncing: false,
    _onSyncStatusChange: null,

    async init(onAuthChangedCallback, onDataSyncedCallback, onSyncStatusChange) {
        this._onSyncStatusChange = onSyncStatusChange || null;
        this._onDataSynced = onDataSyncedCallback || null;

        await initFirebaseSDK();

        this._diagnose();

        if (!Firebase.auth || !Firebase.onAuthStateChanged) {
            console.log("⚠️ Firebase Auth not available — local mode.");
            if (onAuthChangedCallback) onAuthChangedCallback(null);
            return;
        }

        try {
            Firebase.onAuthStateChanged(Firebase.auth, async (user) => {
                this.currentUser = user;
                if (user) {
                    console.log(`👤 Signed in: ${user.email}`);
                    // Single one-time read on login — much cheaper than onSnapshot
                    await this._loadFromCloud(user.uid);
                }
                if (onAuthChangedCallback) onAuthChangedCallback(user);
            });
        } catch (e) {
            console.warn("Auth state listener error:", e);
        }
    },

    /**
     * Load user data ONCE from Firestore on login.
     * Costs exactly 1 Firestore read. Non-blocking — app works fine if this fails.
     */
    async _loadFromCloud(uid) {
        if (!Firebase.db || !Firebase.getDoc || !Firebase.doc) {
            console.warn("Firestore not ready — using local data.");
            return;
        }

        // Check if user has opted out of cloud sync
        if (localStorage.getItem('auralife_cloud_disabled') === 'true') {
            console.log("☁️ Cloud sync disabled by user — using local data.");
            return;
        }

        try {
            console.log("📥 Loading cloud data (1 read)...");
            if (this._onSyncStatusChange) this._onSyncStatusChange('syncing');

            const userDocRef = Firebase.doc(Firebase.db, 'users', uid);

            // Timeout wrapper — don't let getDoc hang the app
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('timeout')), 8000)
            );

            const snapshot = await Promise.race([
                Firebase.getDoc(userDocRef),
                timeoutPromise
            ]);

            if (snapshot.exists()) {
                const cloudData = snapshot.data();
                if (cloudData.subjects) Storage._saveSubjectsLocal(cloudData.subjects);
                if (cloudData.goals) Storage._saveGoalsLocal(cloudData.goals);
                if (cloudData.timetable) Storage._saveTimetableLocal(cloudData.timetable);
                if (cloudData.todaysFocus) localStorage.setItem('auralife_todays_focus', JSON.stringify(cloudData.todaysFocus));
                if (cloudData.milestoneGoalsV2) localStorage.setItem('auralife_milestone_goals_v2', JSON.stringify(cloudData.milestoneGoalsV2));
                if (cloudData.habits) localStorage.setItem('auralife_habits_v2', JSON.stringify(cloudData.habits));
                if (cloudData.codingStats) localStorage.setItem('auralife_coding_stats_v1', JSON.stringify(cloudData.codingStats));
                if (cloudData.xp) localStorage.setItem('auralife_xp', JSON.stringify(cloudData.xp));

                console.log("✅ User cloud workspace loaded successfully.");
                if (this._onSyncStatusChange) this._onSyncStatusChange('synced');
                if (this._onDataSynced) this._onDataSynced(cloudData);
            } else {
                // BRAND NEW USER — Give a 100% clean slate!
                console.log("🌟 New user account — initializing fresh clean slate workspace...");
                this.clearAllLocalUserData();

                const freshPayload = {
                    updatedAt: new Date().toISOString(),
                    subjects: [],
                    goals: [],
                    timetable: { Monday:[], Tuesday:[], Wednesday:[], Thursday:[], Friday:[], Saturday:[], Sunday:[] },
                    todaysFocus: [],
                    milestoneGoalsV2: { weekly: [], monthly: [], yearly: [] },
                    habits: [],
                    codingStats: { leetcodeTarget: 150, leetcodeCurrent: 0, a2zTarget: 250, a2zCurrent: 0, dailyDsaGoal: 'Solve 1 LeetCode & 1 A2Z topic', history: {} },
                    xp: { total: 0, achievements: [] },
                };

                // Explicitly save clean slate into localStorage
                Storage._saveSubjectsLocal(freshPayload.subjects);
                Storage._saveGoalsLocal(freshPayload.goals);
                Storage._saveTimetableLocal(freshPayload.timetable);
                localStorage.setItem('auralife_todays_focus', JSON.stringify(freshPayload.todaysFocus));
                localStorage.setItem('auralife_milestone_goals_v2', JSON.stringify(freshPayload.milestoneGoalsV2));
                localStorage.setItem('auralife_habits_v2', JSON.stringify(freshPayload.habits));
                localStorage.setItem('auralife_coding_stats_v1', JSON.stringify(freshPayload.codingStats));
                localStorage.setItem('auralife_xp', JSON.stringify(freshPayload.xp));

                await Firebase.setDoc(userDocRef, freshPayload);
                if (this._onSyncStatusChange) this._onSyncStatusChange('synced');
                if (this._onDataSynced) this._onDataSynced(freshPayload);
            }
        } catch (e) {
            // SILENT FAIL — quota/timeout errors should never break the app
            if (e.message === 'timeout' ||
                e.code === 'resource-exhausted' ||
                (e.message && e.message.toLowerCase().includes('quota'))) {
                console.warn("⚠️ Firebase quota/rate-limit — using local data instead.");
                if (this._onSyncStatusChange) this._onSyncStatusChange('offline');
                if (window.appUI) window.appUI.showToast(
                    '📱 Using local data (Firebase quota reset at 5:30 AM IST daily).',
                    'info'
                );
            } else {
                console.error("Cloud load error:", e.code, e.message);
                if (this._onSyncStatusChange) this._onSyncStatusChange('error', e.message);
                this._showSyncError(e);
            }
        }
    },

    async register(email, password) {
        if (!Firebase.auth || !Firebase.createUserWithEmailAndPassword) {
            throw new Error("Firebase credentials not configured. Use the ⚙️ Configure button.");
        }
        this.clearAllLocalUserData();
        const cred = await Firebase.createUserWithEmailAndPassword(Firebase.auth, email, password);
        return cred.user;
    },

    async login(email, password) {
        if (!Firebase.auth || !Firebase.signInWithEmailAndPassword) {
            throw new Error("Firebase credentials not configured. Use the ⚙️ Configure button.");
        }
        this.clearAllLocalUserData();
        const cred = await Firebase.signInWithEmailAndPassword(Firebase.auth, email, password);
        return cred.user;
    },

    clearAllLocalUserData() {
        const keysToClear = [
            'auralife_todays_focus',
            'auralife_milestone_goals_v2',
            'auralife_habits_v2',
            'auralife_coding_stats_v1',
            'auralife_xp',
            'auralife_subjects',
            'auralife_goals',
            'auralife_timetable',
            'auralife_activity_log',
            'auralife_cal_notes',
            'auralife_focus_date',
        ];
        keysToClear.forEach(k => localStorage.removeItem(k));
    },

    async logout() {
        if (Firebase.auth && Firebase.signOut) {
            try { await Firebase.signOut(Firebase.auth); }
            catch(e) {}
        }
        this.currentUser = null;
        this.clearAllLocalUserData();
        if (window.appUI) {
            window.appUI.renderAll();
            window.appUI.showToast('Logged out securely. Workspace cleared.', 'info');
        }
    },

    async syncAllDataToCloud(uid = this.currentUser?.uid) {
        if (!Firebase.db || !Firebase.setDoc || !Firebase.doc) {
            console.error("❌ Sync aborted — Firestore not initialized.");
            if (this._onSyncStatusChange) this._onSyncStatusChange('error', 'Firestore not initialized');
            if (window.appUI) window.appUI.showToast(
                '⚠️ Firestore not connected. Check your API Key and Project ID.',
                'error'
            );
            return;
        }

        if (!uid) {
            if (window.appUI) window.appUI.showToast('Sign in first before syncing.', 'error');
            return;
        }

        if (this._isSyncing) {
            console.log("Sync already in progress — skipping duplicate.");
            return;
        }

        try {
            this._isSyncing = true;
            if (this._onSyncStatusChange) this._onSyncStatusChange('syncing');
            console.log("☁️ Writing to Firestore for uid:", uid);

            const userDocRef = Firebase.doc(Firebase.db, 'users', uid);
            const payload = {
                updatedAt: new Date().toISOString(),
                subjects: Storage.getSubjects(),
                goals: Storage.getGoals(),
                timetable: Storage.getTimetable(),
                todaysFocus: JSON.parse(localStorage.getItem('auralife_todays_focus') || '[]'),
                milestoneGoalsV2: JSON.parse(localStorage.getItem('auralife_milestone_goals_v2') || '{}'),
                habits: JSON.parse(localStorage.getItem('auralife_habits_v2') || '[]'),
                codingStats: JSON.parse(localStorage.getItem('auralife_coding_stats_v1') || '{}'),
                xp: JSON.parse(localStorage.getItem('auralife_xp') || '{}'),
            };

            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('timeout')), 12000)
            );

            await Promise.race([
                Firebase.setDoc(userDocRef, payload, { merge: true }),
                timeoutPromise
            ]);

            console.log("✅ Firestore write successful!");
            if (this._onSyncStatusChange) this._onSyncStatusChange('synced');
            if (window.appUI) window.appUI.showToast('☁️ Data synced to cloud!', 'success');
        } catch (e) {
            console.error("❌ Sync error:", e.code || '', e.message);
            if (this._onSyncStatusChange) this._onSyncStatusChange('error', e.message);
            this._showSyncError(e);
        } finally {
            this._isSyncing = false;
        }
    },

    _showSyncError(e) {
        if (!window.appUI) return;
        if (e.message === 'timeout') {
            window.appUI.showToast(
                '⏱️ Sync timed out — Firebase may be rate-limiting. Please try again in a few minutes.',
                'error'
            );
        } else if (e.code === 'resource-exhausted' || (e.message && e.message.toLowerCase().includes('quota'))) {
            window.appUI.showToast(
                '⚠️ Firebase free quota exceeded for today. Resets daily at midnight UTC (5:30 AM IST). Try tomorrow.',
                'error'
            );
        } else if (e.code === 'permission-denied') {
            window.appUI.showToast(
                '🔒 Firestore rules blocked the write. Set rules to: allow read, write: if true;',
                'error'
            );
        } else if (e.code === 'not-found') {
            window.appUI.showToast(
                '🗄️ Firestore database not found — create it in Firebase Console → Firestore Database.',
                'error'
            );
        } else if (e.code === 'unavailable') {
            window.appUI.showToast('📡 Firestore offline — check your internet connection.', 'error');
        } else {
            window.appUI.showToast(`Sync failed (${e.code || 'error'}): ${e.message}`, 'error');
        }
    },

    _diagnose() {
        console.group("🔍 AuraLife Firebase Diagnostics");
        console.log("SDK loaded:", !!(Firebase.signInWithEmailAndPassword));
        console.log("Auth object:", !!Firebase.auth);
        console.log("Firestore db:", !!Firebase.db);
        console.log("setDoc fn:", !!Firebase.setDoc);
        console.log("getDoc fn:", !!Firebase.getDoc);
        console.log("Firebase.initialized:", Firebase.initialized);
        const cfg = localStorage.getItem('auralife_firebase_config');
        if (cfg) {
            try {
                const p = JSON.parse(cfg);
                console.log("Config projectId:", p.projectId);
                console.log("Config apiKey:", p.apiKey?.slice(0, 12) + "...");
            } catch(e) {}
        } else {
            console.warn("No custom Firebase config saved!");
        }
        console.groupEnd();
    }
};

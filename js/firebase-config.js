/**
 * Firebase Initialization & Configuration Module
 * Uses a live-reference object to avoid stale import bindings
 */

// All Firebase refs live in one object — imported modules get live access
export const Firebase = {
    app: null,
    auth: null,
    db: null,
    initialized: false,

    // Auth functions
    signInWithEmailAndPassword: null,
    createUserWithEmailAndPassword: null,
    signOut: null,
    onAuthStateChanged: null,

    // Firestore functions
    doc: null,
    setDoc: null,
    getDoc: null,
    onSnapshot: null,
};

// Firebase Configuration Object
const defaultFirebaseConfig = {
    apiKey: "AIzaSyB66g2qrkGzFMTA1S_4VnY-Pha690EePOc",
    authDomain: "auralife-tracker.firebaseapp.com",
    projectId: "auralife-tracker"
};

export function getActiveFirebaseConfig() {
    const custom = localStorage.getItem('auralife_firebase_config');
    if (custom) {
        try { return JSON.parse(custom); } catch(e) {}
    }
    return defaultFirebaseConfig;
}

export async function initFirebaseSDK() {
    if (Firebase.initialized) return; // Don't re-init
    try {
        const [firebaseApp, firebaseAuth, firebaseFirestore] = await Promise.all([
            import("https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js"),
            import("https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js"),
            import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js"),
        ]);

        // Assign auth functions to live reference object
        Firebase.signInWithEmailAndPassword = firebaseAuth.signInWithEmailAndPassword;
        Firebase.createUserWithEmailAndPassword = firebaseAuth.createUserWithEmailAndPassword;
        Firebase.signOut = firebaseAuth.signOut;
        Firebase.onAuthStateChanged = firebaseAuth.onAuthStateChanged;

        // Assign firestore functions to live reference object
        Firebase.doc = firebaseFirestore.doc;
        Firebase.setDoc = firebaseFirestore.setDoc;
        Firebase.getDoc = firebaseFirestore.getDoc;
        Firebase.onSnapshot = firebaseFirestore.onSnapshot;

        const config = getActiveFirebaseConfig();
        const isDemoKey = !config.apiKey || config.apiKey.includes("DemoAuraLifeTrackerKey");

        if (!isDemoKey) {
            try {
                Firebase.app = firebaseApp.initializeApp(config);
                Firebase.auth = firebaseAuth.getAuth(Firebase.app);
                Firebase.db = firebaseFirestore.getFirestore(Firebase.app);
                Firebase.initialized = true;
                console.log("🔥 Firebase App Connected with project:", config.projectId);
            } catch (initErr) {
                console.warn("Firebase initialization error:", initErr.message);
            }
        } else {
            console.log("ℹ️ No custom Firebase config — running in Local Mode.");
        }
    } catch (err) {
        console.warn("Firebase SDK failed to load (offline?):", err);
    }
}

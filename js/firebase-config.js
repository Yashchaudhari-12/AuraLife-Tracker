/**
 * Firebase Initialization & Configuration Module
 * Safe dynamic initialization for Firebase v10+ App, Auth, and Firestore
 */

let app = null;
let auth = null;
let db = null;
let isFirebaseInitialized = false;

let signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged;
let doc, setDoc, getDoc, onSnapshot;

// Firebase Configuration Object
const defaultFirebaseConfig = {
    apiKey: "AIzaSyDemoAuraLifeTrackerKey2026",
    authDomain: "auralife-tracker.firebaseapp.com",
    projectId: "auralife-tracker"
};

function getActiveFirebaseConfig() {
    const custom = localStorage.getItem('auralife_firebase_config');
    if (custom) {
        try { return JSON.parse(custom); } catch(e) {}
    }
    return defaultFirebaseConfig;
}

export async function initFirebaseSDK() {
    try {
        const firebaseApp = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js");
        const firebaseAuth = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js");
        const firebaseFirestore = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");

        signInWithEmailAndPassword = firebaseAuth.signInWithEmailAndPassword;
        createUserWithEmailAndPassword = firebaseAuth.createUserWithEmailAndPassword;
        signOut = firebaseAuth.signOut;
        onAuthStateChanged = firebaseAuth.onAuthStateChanged;

        doc = firebaseFirestore.doc;
        setDoc = firebaseFirestore.setDoc;
        getDoc = firebaseFirestore.getDoc;
        onSnapshot = firebaseFirestore.onSnapshot;

        const config = getActiveFirebaseConfig();
        if (config && config.apiKey && !config.apiKey.includes("DemoAuraLifeTrackerKey")) {
            app = firebaseApp.initializeApp(config);
            auth = firebaseAuth.getAuth(app);
            db = firebaseFirestore.getFirestore(app);
            isFirebaseInitialized = true;
            console.log("🔥 Firebase App Connected.");
        } else {
            console.log("ℹ️ Firebase configured in Local Mode (waiting for user custom credentials).");
        }
    } catch (err) {
        console.warn("Firebase SDK initialization deferred or offline:", err);
    }
}

export { 
    app, 
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
};

// Firebase設定
// 注意: この設定は環境変数から読み込むか、ビルド時に置き換える必要があります
// 本番環境では、サーバー側から設定を取得することを推奨します

const firebaseConfig = {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// VAPID Key (Firebase Console > Project Settings > Cloud Messaging > Web Push certificates)
const vapidKey = "YOUR_VAPID_KEY";

// API エンドポイント
const API_BASE_URL = window.location.origin;

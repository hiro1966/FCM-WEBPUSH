# Google Cloud デプロイガイド

このガイドでは、FCM Web Push通知システムをGoogle Cloud（Firebase Hosting + Cloud Functions）にデプロイする手順を説明します。

## 🏗️ アーキテクチャ

```
┌─────────────────────────────────────────┐
│         Firebase Hosting                │
│  (静的ファイル: HTML/CSS/JS)             │
│  https://your-project.web.app           │
└────────────┬────────────────────────────┘
             │
             │ API Rewrite
             ↓
┌─────────────────────────────────────────┐
│      Cloud Functions                    │
│  - registerDevice                       │
│  - sendNotification                     │
│  - getDevices                           │
│  - healthCheck                          │
└────────────┬────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────┐
│      Cloud Firestore                    │
│  - devices collection                   │
└─────────────────────────────────────────┘
```

## 📋 前提条件

- Firebaseプロジェクトが作成済み
- Node.js (v18以上) がインストール済み
- Firebase CLIがインストール済み

## 🚀 デプロイ手順

### ステップ1: Firebase CLIのインストール

```bash
npm install -g firebase-tools
```

### ステップ2: Firebaseにログイン

```bash
firebase login
```

ブラウザが開き、Googleアカウントでログインします。

### ステップ3: プロジェクトの初期化

```bash
# プロジェクトディレクトリに移動
cd /path/to/fcm-web-push-notification

# Firebaseプロジェクトを設定
firebase use --add
```

プロジェクトIDを入力し、エイリアス名を設定（例: `default`）

または、`.firebaserc`を直接編集:

```json
{
  "projects": {
    "default": "your-project-id"
  }
}
```

### ステップ4: Firebase設定を更新

#### 4.1 フロントエンド設定

`public/js/config.js` を編集:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

const vapidKey = "YOUR_VAPID_KEY";

// API エンドポイント（そのまま）
const API_BASE_URL = window.location.origin;
```

#### 4.2 Service Worker設定

`public/firebase-messaging-sw.js` を編集:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

### ステップ5: Cloud Functions の依存関係をインストール

```bash
cd functions
npm install
cd ..
```

### ステップ6: Firestoreセキュリティルールをデプロイ

```bash
firebase deploy --only firestore:rules
```

### ステップ7: Cloud Functionsをデプロイ

```bash
firebase deploy --only functions
```

デプロイ完了後、以下のようなURLが表示されます:

```
✔  functions[registerDevice(us-central1)] https://us-central1-your-project.cloudfunctions.net/registerDevice
✔  functions[sendNotification(us-central1)] https://us-central1-your-project.cloudfunctions.net/sendNotification
✔  functions[getDevices(us-central1)] https://us-central1-your-project.cloudfunctions.net/getDevices
✔  functions[healthCheck(us-central1)] https://us-central1-your-project.cloudfunctions.net/healthCheck
```

### ステップ8: Firebase Hostingをデプロイ

```bash
firebase deploy --only hosting
```

デプロイ完了後、以下のようなURLが表示されます:

```
✔  Deploy complete!

Hosting URL: https://your-project.web.app
```

### ステップ9: すべてを一度にデプロイ（オプション）

```bash
firebase deploy
```

これで Hosting + Functions + Firestore Rules がすべてデプロイされます。

## 🧪 動作確認

### 1. Hosting URLにアクセス

```
https://your-project.web.app
```

### 2. デバイスを登録

- デバイスIDを入力（例: `1234567890`）
- 「このIDで登録」をクリック
- 通知を許可

### 3. ヘルスチェック

```bash
curl https://your-project.web.app/api/health
```

レスポンス:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "FCM Web Push Cloud Functions"
}
```

### 4. 通知を送信

Hosting経由（推奨）:
```bash
curl -X POST https://your-project.web.app/api/send-notification \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "1234567890",
    "title": "テスト通知",
    "message": "Cloud Functionsから送信"
  }'
```

または直接Cloud Functions URL:
```bash
curl -X POST https://us-central1-your-project.cloudfunctions.net/sendNotification \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "1234567890",
    "title": "テスト通知",
    "message": "Cloud Functionsから送信"
  }'
```

## 📊 Cloud Functionsの管理

### ログの確認

```bash
# すべての関数のログ
firebase functions:log

# 特定の関数のログ
firebase functions:log --only registerDevice

# リアルタイムでログを監視
firebase functions:log --follow
```

### ローカルエミュレータで動作確認

```bash
# エミュレータを起動
firebase emulators:start

# 別のターミナルでテスト
curl http://localhost:5001/your-project/us-central1/healthCheck
```

### デプロイ履歴の確認

```bash
firebase hosting:channel:list
```

## 💰 料金について

### Firebase Hosting
- **無料枠**: 10GB ストレージ、360MB/日 転送量
- 超過分: $0.026/GB

### Cloud Functions
- **無料枠**: 
  - 呼び出し: 200万回/月
  - GB秒: 40万 GB秒/月
  - CPU秒: 20万 CPU秒/月
  - ネットワーク: 5GB/月
- 超過分: 従量課金

### Cloud Firestore
- **無料枠**:
  - 保存: 1GB
  - 読み取り: 50,000/日
  - 書き込み: 20,000/日
  - 削除: 20,000/日
- 超過分: 従量課金

詳細: https://firebase.google.com/pricing

## 🔐 セキュリティ設定

### Firestoreセキュリティルール

`firestore.rules` で設定済み:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /devices/{deviceId} {
      // Cloud Functionsからのみアクセス可能
      allow read, write: if false;
    }
  }
}
```

### Cloud Functions認証（オプション）

より強固なセキュリティが必要な場合、Firebase Authenticationと組み合わせます:

```javascript
exports.sendNotification = functions.https.onCall(async (data, context) => {
  // 認証チェック
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  // 処理...
});
```

## 🔄 CI/CDパイプライン（GitHub Actions）

`.github/workflows/deploy.yml`:

```yaml
name: Deploy to Firebase

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install dependencies
        run: |
          cd functions
          npm install
      
      - name: Deploy to Firebase
        uses: w9jds/firebase-action@master
        with:
          args: deploy
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
```

GitHub Secretsに `FIREBASE_TOKEN` を追加:
```bash
firebase login:ci
```

## 🛠️ トラブルシューティング

### Q: デプロイエラー「Permission denied」

**A**: Firebase プロジェクトの権限を確認
```bash
firebase projects:list
gcloud projects get-iam-policy your-project-id
```

### Q: Cloud Functions がタイムアウトする

**A**: タイムアウト時間を延長
```javascript
exports.functionName = functions
  .runWith({ timeoutSeconds: 120 })
  .https.onRequest(...)
```

### Q: CORS エラーが発生する

**A**: `functions/index.js` でCORSが正しく設定されているか確認

```javascript
const cors = require('cors')({ origin: true });
```

### Q: Hosting と Functions が連携しない

**A**: `firebase.json` の rewrites 設定を確認

## 📚 参考リンク

- [Firebase Hosting ドキュメント](https://firebase.google.com/docs/hosting)
- [Cloud Functions ドキュメント](https://firebase.google.com/docs/functions)
- [Cloud Firestore ドキュメント](https://firebase.google.com/docs/firestore)
- [Firebase CLI リファレンス](https://firebase.google.com/docs/cli)

## 📞 サポート

問題が発生した場合は、GitHubのIssueを作成してください。

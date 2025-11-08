# FCM Web Push通知システム

Firebase Cloud Messaging (FCM) を使用したWeb Push通知システムです。QRコードを読み取ってデバイスを登録し、プッシュ通知を受信できます。

## 📋 機能

- ✅ QRコードスキャン（カメラ使用）
- ✅ デバイスID手動入力（テスト用）
- ✅ デバイス登録（10桁のデバイスID）
- ✅ Web Push通知の送受信
- ✅ 通知送信API
- ✅ デバイス管理
- ✅ iPhone・Androidスマホ対応

## 🏗️ デプロイオプション

このプロジェクトは2つのデプロイ方法をサポートしています:

### オプション1: Google Cloud（推奨）
- **Firebase Hosting** でフロントエンドをホスティング
- **Cloud Functions** でAPIを実行
- **Cloud Firestore** でデータ管理
- 完全にサーバーレス、自動スケーリング
- **詳細**: [CLOUD_DEPLOYMENT.md](CLOUD_DEPLOYMENT.md) を参照

### オプション2: ローカルサーバー（開発・テスト用）
- **Node.js/Express** でサーバーを起動
- ローカルまたは任意のホスティングサービス
- 開発やテストに最適
- **詳細**: 以下のローカルセットアップ手順を参照

## 🚀 セットアップ手順

### 1. Firebaseプロジェクトの作成

#### 1.1 Firebaseコンソールでプロジェクトを作成

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. 「プロジェクトを追加」をクリック
3. プロジェクト名を入力（例: `fcm-web-push`）
4. Googleアナリティクスの設定（任意）
5. 「プロジェクトを作成」をクリック

#### 1.2 Webアプリを追加

1. プロジェクトのダッシュボードで「ウェブ」アイコン（`</>`）をクリック
2. アプリのニックネームを入力（例: `Web Push App`）
3. 「Firebase Hosting も設定する」はチェックしない（後で設定可能）
4. 「アプリを登録」をクリック
5. **Firebase SDK の設定情報をコピー**（後で使用します）

```javascript
// この形式の設定情報が表示されます
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

#### 1.3 Cloud Messagingを有効化

1. Firebase Console の左メニューから「構築」→「Messaging」をクリック
2. 「使ってみる」をクリックして Cloud Messaging を有効化

#### 1.4 VAPID鍵を取得

1. Firebase Console で「プロジェクトの設定」（歯車アイコン）をクリック
2. 「Cloud Messaging」タブを選択
3. 「ウェブプッシュ証明書」セクションまでスクロール
4. 「鍵ペアを生成」をクリック
5. **生成された鍵をコピー**（後で使用します）

#### 1.5 サービスアカウントキーを取得

1. Firebase Console で「プロジェクトの設定」→「サービス アカウント」タブをクリック
2. 「新しい秘密鍵の生成」をクリック
3. 「キーを生成」をクリック
4. **JSONファイルがダウンロードされます**
5. このファイルを `config/serviceAccountKey.json` として保存

```bash
# ダウンロードしたファイルを移動
mv ~/Downloads/your-project-xxxxx.json /home/user/webapp/config/serviceAccountKey.json
```

#### 1.6 Firestoreデータベースを作成

1. Firebase Console の左メニューから「構築」→「Firestore Database」をクリック
2. 「データベースを作成」をクリック
3. **本番モード**を選択（後でルールを設定）
4. ロケーションを選択（例: `asia-northeast1` (東京)）
5. 「有効にする」をクリック

### 2. プロジェクトの設定

#### 2.1 依存関係のインストール

```bash
npm install
```

#### 2.2 環境変数の設定

1. `.env.example` をコピーして `.env` を作成:

```bash
cp .env.example .env
```

2. `.env` ファイルを編集して、Firebase設定情報を入力:

```env
# Firebase Configuration
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
FIREBASE_VAPID_KEY=your_vapid_key

# Server Configuration
PORT=3000
```

#### 2.3 フロントエンド設定ファイルの編集

`public/js/config.js` を編集:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

const vapidKey = "YOUR_VAPID_KEY";
```

#### 2.4 Service Worker設定ファイルの編集

`public/firebase-messaging-sw.js` を編集:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

### 3. ローカルでの起動

```bash
npm start
```

サーバーが `http://localhost:3000` で起動します。

**重要**: スマートフォンからアクセスするには、以下の方法があります:

#### 方法1: ngrokを使用（推奨）

```bash
# ngrokをインストール（未インストールの場合）
npm install -g ngrok

# 別のターミナルでngrokを起動
ngrok http 3000
```

ngrokが生成したHTTPS URLをスマートフォンのブラウザで開きます。

#### 方法2: 同じネットワーク内でアクセス

1. PCのローカルIPアドレスを確認:
```bash
# macOS/Linux
ifconfig | grep "inet "

# Windows
ipconfig
```

2. スマートフォンのブラウザで `http://[PCのIPアドレス]:3000` にアクセス

**注意**: iOSでWeb Pushを受け取るには、HTTPS接続が必須です。

## 📱 使い方

### デバイスの登録

1. スマートフォンのブラウザでアプリにアクセス
2. 「カメラを起動」ボタンをタップ
3. 10桁の数字が含まれるQRコードをスキャン
4. 「通知を許可する」ボタンをタップ
5. ブラウザの通知許可ダイアログで「許可」を選択
6. 登録完了！

### QRコードの生成

10桁の数字（例: `1234567890`）をQRコードに変換する必要があります。

オンラインQRコード生成ツール:
- https://www.qr-code-generator.com/
- https://www.the-qrcode-generator.com/

または、Pythonで生成:

```python
import qrcode

device_id = "1234567890"
img = qrcode.make(device_id)
img.save(f"qr_device_{device_id}.png")
```

### 通知の送信

#### 方法1: Web UIから送信（開発用）

1. アプリの下部にある「テスト通知送信」セクションを使用
2. デバイスID、タイトル、メッセージを入力
3. 「テスト通知を送信」ボタンをクリック

#### 方法2: APIから送信

```bash
curl -X POST http://localhost:3000/api/send-notification \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "1234567890",
    "title": "テスト通知",
    "message": "これはテストメッセージです"
  }'
```

レスポンス例:
```json
{
  "success": true,
  "message": "Notification sent successfully",
  "deviceId": "1234567890",
  "messageId": "projects/your-project/messages/0:1234567890"
}
```

## 🔌 API エンドポイント

### POST `/api/register`

デバイスを登録します。

**リクエスト:**
```json
{
  "deviceId": "1234567890",
  "fcmToken": "FCMトークン"
}
```

**レスポンス:**
```json
{
  "success": true,
  "message": "Device registered successfully",
  "deviceId": "1234567890"
}
```

### POST `/api/send-notification`

プッシュ通知を送信します。

**リクエスト:**
```json
{
  "deviceId": "1234567890",
  "title": "通知のタイトル",
  "message": "通知のメッセージ"
}
```

**レスポンス:**
```json
{
  "success": true,
  "message": "Notification sent successfully",
  "deviceId": "1234567890",
  "messageId": "projects/your-project/messages/0:1234567890"
}
```

### GET `/api/devices`

登録済みデバイスの一覧を取得します。

**レスポンス:**
```json
{
  "success": true,
  "devices": [
    {
      "deviceId": "1234567890",
      "registeredAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### GET `/api/health`

サーバーの状態を確認します。

**レスポンス:**
```json
{
  "status": "OK",
  "firebaseInitialized": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🗂️ プロジェクト構造

```
.
├── server/
│   └── index.js              # Expressサーバー
├── public/
│   ├── index.html            # メインHTML
│   ├── css/
│   │   └── style.css         # スタイルシート
│   ├── js/
│   │   ├── config.js         # Firebase設定
│   │   └── app.js            # アプリケーションロジック
│   └── firebase-messaging-sw.js  # Service Worker
├── config/
│   └── serviceAccountKey.json    # Firebase Admin SDK認証情報
├── package.json
├── .env                      # 環境変数
├── .env.example             # 環境変数のテンプレート
└── README.md
```

## 🛠️ トラブルシューティング

### 通知が届かない

1. **Firebaseの設定を確認**
   - `config.js` と `firebase-messaging-sw.js` の設定が正しいか確認
   - VAPID鍵が正しいか確認

2. **HTTPS接続を確認**
   - iOSでは必ずHTTPS接続が必要
   - ngrokを使用して確認

3. **通知許可を確認**
   - ブラウザの設定で通知が許可されているか確認

4. **Service Workerを確認**
   - ブラウザの開発者ツールで Service Worker が登録されているか確認
   - Chrome: `chrome://serviceworker-internals/`
   - Safari: 開発メニュー → Service Workers

### QRコードが読み取れない

1. **カメラの権限を確認**
   - ブラウザの設定でカメラのアクセスを許可

2. **QRコードの形式を確認**
   - 10桁の数字のみが含まれているか確認

3. **明るさを確認**
   - 明るい場所でスキャン

### Firestoreエラー

1. **サービスアカウントキーを確認**
   - `config/serviceAccountKey.json` が正しく配置されているか確認

2. **Firestoreルールを確認**
   - Firebase Console で Firestore のセキュリティルールを確認

## 📝 開発メモ

### Firebase Firestoreのセキュリティルール

本番環境では、Firestoreのセキュリティルールを適切に設定してください:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /devices/{deviceId} {
      // サーバー側からのみ書き込み可能
      allow read, write: if false;
    }
  }
}
```

### iOS対応の注意点

- iOS 16.4以降でWeb Push通知がサポートされています
- PWA（Progressive Web App）としてホーム画面に追加する必要があります
- HTTPS接続が必須です

## 📦 デプロイ

### Firebase Hostingにデプロイ

```bash
# Firebase CLIをインストール
npm install -g firebase-tools

# Firebaseにログイン
firebase login

# プロジェクトを初期化
firebase init hosting

# デプロイ
firebase deploy --only hosting
```

### その他のホスティング

- Vercel
- Netlify
- Cloudflare Pages
- Heroku

**注意**: バックエンドAPIもデプロイする必要があります。

## 📄 ライセンス

ISC

## 🤝 サポート

問題が発生した場合は、Issueを作成してください。

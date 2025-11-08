# Firebase設定 詳細ガイド

このガイドでは、Firebase Cloud Messagingの設定手順を画像付きで詳しく説明します。

## 📋 目次

1. [Firebaseプロジェクトの作成](#1-firebaseプロジェクトの作成)
2. [Webアプリの登録](#2-webアプリの登録)
3. [Cloud Messagingの設定](#3-cloud-messagingの設定)
4. [Firestoreデータベースの作成](#4-firestoreデータベースの作成)
5. [サービスアカウントキーの取得](#5-サービスアカウントキーの取得)
6. [プロジェクトへの設定反映](#6-プロジェクトへの設定反映)

---

## 1. Firebaseプロジェクトの作成

### ステップ 1-1: Firebaseコンソールにアクセス

1. ブラウザで https://console.firebase.google.com/ を開く
2. Googleアカウントでログイン

### ステップ 1-2: 新規プロジェクトを作成

1. 「プロジェクトを追加」または「Create a project」をクリック
2. プロジェクト名を入力
   - 例: `fcm-web-push-app`
   - プロジェクトIDが自動生成されます（後で使用）
3. 「続行」をクリック

### ステップ 1-3: Googleアナリティクス設定

1. 「このプロジェクトでGoogle アナリティクスを有効にする」のトグルを選択（任意）
2. 必要に応じてアナリティクスアカウントを選択
3. 「プロジェクトを作成」をクリック
4. プロジェクトの準備が完了するまで待つ（約30秒）

---

## 2. Webアプリの登録

### ステップ 2-1: Webアプリを追加

1. プロジェクトダッシュボードの中央にある「ウェブ」アイコン `</>` をクリック
   - または、プロジェクト設定の「全般」タブで「アプリを追加」→「ウェブ」を選択

### ステップ 2-2: アプリ情報を入力

1. アプリのニックネームを入力
   - 例: `Web Push Notification App`
2. 「Firebase Hostingも設定する」のチェックボックス
   - 今は**チェックしない**（後で設定可能）
3. 「アプリを登録」をクリック

### ステップ 2-3: Firebase SDK設定をコピー

表示される設定情報をメモ帳などに保存:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef0123456789abcdef"
};
```

**重要**: この情報は後で使用するので、必ず保存してください。

4. 「コンソールに進む」をクリック

---

## 3. Cloud Messagingの設定

### ステップ 3-1: Cloud Messagingを有効化

1. 左側のメニューから「構築」→「Messaging」をクリック
2. 「使ってみる」ボタンをクリック
   - すでに有効な場合はこのステップをスキップ

### ステップ 3-2: VAPID鍵を生成

1. 画面左上の歯車アイコン（⚙️）→「プロジェクトの設定」をクリック
2. 「Cloud Messaging」タブを選択
3. 下にスクロールして「ウェブプッシュ証明書」セクションを探す
4. 「鍵ペアを生成」ボタンをクリック
5. **生成された鍵をコピーして保存**

```
例: BGtN1k2X3Y4Z5A6B7C8D9E0F1G2H3I4J5K6L7M8N9O0P1Q2R3S4T5U6V7W8X9Y0Z
```

**重要**: この VAPID鍵は後で `config.js` に設定します。

### ステップ 3-3: Server Keyを確認（任意）

「Cloud Messaging API (レガシー)」セクションで、Server Keyも確認できます。
- このプロジェクトでは使用しませんが、参考情報として記録しておくと良いでしょう。

---

## 4. Firestoreデータベースの作成

### ステップ 4-1: Firestoreを作成

1. 左側のメニューから「構築」→「Firestore Database」をクリック
2. 「データベースを作成」ボタンをクリック

### ステップ 4-2: セキュリティルールを選択

**本番モード**を選択:
- 「本番モードで開始」を選択
- デフォルトでは全てのアクセスが拒否されます
- サーバー側（Firebase Admin SDK）からのみアクセス可能

**テストモード**は使用しないでください（セキュリティリスク）

### ステップ 4-3: ロケーションを選択

1. Cloud Firestoreのロケーションを選択
   - 推奨: `asia-northeast1 (Tokyo)` - 日本で利用する場合
   - その他のオプション:
     - `asia-northeast2 (Osaka)`
     - `us-central1 (Iowa)` - アメリカ
2. 「有効にする」をクリック
3. データベースの準備が完了するまで待つ（約1分）

### ステップ 4-4: セキュリティルールを確認

「ルール」タブで以下のルールが設定されていることを確認:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

これにより、クライアント側から直接Firestoreにアクセスできなくなります。
サーバー側（Firebase Admin SDK）からのみアクセス可能です。

---

## 5. サービスアカウントキーの取得

### ステップ 5-1: サービスアカウントページに移動

1. 画面左上の歯車アイコン（⚙️）→「プロジェクトの設定」をクリック
2. 「サービス アカウント」タブを選択

### ステップ 5-2: Admin SDKの設定スニペットを確認

1. 「Firebase Admin SDK」セクションを確認
2. Node.js が選択されていることを確認

### ステップ 5-3: 新しい秘密鍵を生成

1. 「新しい秘密鍵の生成」ボタンをクリック
2. 確認ダイアログが表示される:
   ```
   秘密鍵を生成してもよろしいですか？
   この秘密鍵を使用して、アプリやスクリプトで Firebase サービスに
   アクセスすることができます。
   ```
3. 「キーを生成」をクリック
4. **JSONファイルが自動的にダウンロードされます**

### ステップ 5-4: JSONファイルを安全に保存

1. ダウンロードされたJSONファイルの名前を確認
   - 例: `your-project-id-123abc456def.json`
2. このファイルを**絶対に公開しないでください**
3. プロジェクトの `config` フォルダに配置します（後のステップで説明）

**セキュリティ注意事項**:
- このJSONファイルには機密情報が含まれています
- Gitにコミットしないでください（`.gitignore`に追加済み）
- 不要になったら削除してください

---

## 6. プロジェクトへの設定反映

### ステップ 6-1: サービスアカウントキーを配置

ダウンロードしたJSONファイルを `config` フォルダに移動し、`serviceAccountKey.json` にリネーム:

```bash
# ダウンロードフォルダから移動（パスは環境に応じて変更）
mv ~/Downloads/your-project-id-123abc456def.json /home/user/webapp/config/serviceAccountKey.json
```

または、ファイルマネージャーで:
1. ダウンロードしたJSONファイルを探す
2. プロジェクトの `config` フォルダにコピー
3. ファイル名を `serviceAccountKey.json` に変更

### ステップ 6-2: フロントエンド設定ファイルを編集

**ファイル**: `public/js/config.js`

```javascript
const firebaseConfig = {
    apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",  // ステップ2-3でコピーした値
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef0123456789abcdef"
};

const vapidKey = "BGtN1k2X3Y4Z5A6B7C8D9E0F1G2H3I4J5K6L7M8N9O0P1Q2R3S4T5U6V7W8X9Y0Z";  // ステップ3-2でコピーした値
```

### ステップ 6-3: Service Worker設定ファイルを編集

**ファイル**: `public/firebase-messaging-sw.js`

```javascript
const firebaseConfig = {
    apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",  // ステップ2-3でコピーした値
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef0123456789abcdef"
};
```

### ステップ 6-4: 環境変数ファイルを作成（オプション）

**ファイル**: `.env`

```env
# Firebase Configuration
FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789012
FIREBASE_APP_ID=1:123456789012:web:abcdef0123456789abcdef
FIREBASE_VAPID_KEY=BGtN1k2X3Y4Z5A6B7C8D9E0F1G2H3I4J5K6L7M8N9O0P1Q2R3S4T5U6V7W8X9Y0Z

# Server Configuration
PORT=3000
```

**注意**: 現在のバージョンでは `.env` ファイルは使用していませんが、将来的な拡張のために準備しています。

---

## ✅ 設定完了チェックリスト

以下の項目がすべて完了していることを確認してください:

- [ ] Firebaseプロジェクトを作成した
- [ ] Webアプリを登録し、Firebase SDK設定をコピーした
- [ ] Cloud Messagingを有効化した
- [ ] VAPID鍵を生成し、コピーした
- [ ] Firestoreデータベースを作成した（本番モード）
- [ ] サービスアカウントキーをダウンロードし、`config/serviceAccountKey.json`に配置した
- [ ] `public/js/config.js` を編集した
- [ ] `public/firebase-messaging-sw.js` を編集した

---

## 🚀 次のステップ

設定が完了したら、以下のコマンドでアプリを起動します:

```bash
npm install
npm start
```

詳しい使用方法は `README.md` を参照してください。

---

## 🆘 トラブルシューティング

### Q: サービスアカウントキーが見つからない

**A**: Firebase Console → プロジェクト設定 → サービス アカウント → 新しい秘密鍵の生成

### Q: VAPID鍵が見つからない

**A**: Firebase Console → プロジェクト設定 → Cloud Messaging タブ → ウェブプッシュ証明書 → 鍵ペアを生成

### Q: Firebase SDK設定を忘れた

**A**: Firebase Console → プロジェクト設定 → 全般タブ → マイアプリ → SDK の設定と構成

### Q: Firestoreの場所を変更したい

**A**: Firestoreの場所は一度設定すると変更できません。新しいプロジェクトを作成する必要があります。

---

## 📚 参考リンク

- [Firebase公式ドキュメント](https://firebase.google.com/docs)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Web Push通知](https://firebase.google.com/docs/cloud-messaging/js/client)
- [Firestore セキュリティルール](https://firebase.google.com/docs/firestore/security/get-started)

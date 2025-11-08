# Android通知トラブルシューティング

Android端末でWeb Push通知が届かない場合の確認・対処方法

## 🔍 確認項目チェックリスト

### 1. ⚙️ Android端末の設定

#### 1.1 システムレベルの通知設定
```
設定 > アプリと通知 > 通知
→ すべての通知がONになっているか確認
```

#### 1.2 Chrome通知設定
```
設定 > アプリ > Chrome > 通知
→ 「通知を許可」がONになっているか確認
→ すべてのカテゴリがONになっているか確認
```

#### 1.3 バッテリー最適化の除外
Chromeがバッテリー最適化の対象になっていると通知が届かない場合があります。

```
設定 > 電池 > 電池の最適化
→ Chrome を探す
→ 「最適化しない」を選択
```

または
```
設定 > アプリ > Chrome > 電池 > バックグラウンド制限
→ 「制限なし」を選択
```

### 2. 🌐 Chrome側の設定

#### 2.1 サイトの通知許可を確認
```
1. https://fcm-web-push-app.web.app にアクセス
2. アドレスバー左の🔒（鍵マーク）をタップ
3. 「権限」または「サイトの設定」をタップ
4. 「通知」が「許可」になっているか確認
```

#### 2.2 Chromeの通知設定
```
Chrome > 設定（︙） > 設定 > サイトの設定 > 通知
→ 「サイトに通知の表示を許可する」がONか確認
→ ブロック済みリストに fcm-web-push-app.web.app が入っていないか確認
```

### 3. 📱 デバイス登録の確認

#### 3.1 FCMトークンが正しく取得されているか

ブラウザの開発者ツールでコンソールを確認：
```
1. Chrome > 設定（︙） > その他のツール > デベロッパーツール
2. Console タブを開く
3. 以下のメッセージが表示されているか確認：
   - "✅ Firebase initialized successfully"
   - "FCM Token: ..."
```

#### 3.2 デバイスが正しく登録されているか

アプリの「登録済みデバイス一覧」セクションで：
```
→ 更新ボタンをクリック
→ 自分のデバイスIDが表示されているか確認
→ 登録日時が正しいか確認
```

### 4. 🧪 通知送信のテスト

#### 4.1 エラーメッセージの確認

テスト通知送信時に：
```
→ ブラウザのコンソールにエラーが出ていないか確認
→ 「テスト通知を送信」後の応答メッセージを確認
```

#### 4.2 サーバー側のログ確認

```bash
# Cloud Functionsのログを確認
firebase functions:log --only sendNotification
```

よくあるエラー：
- `Requested entity was not found` → FCMトークンが無効
- `The registration token is not a valid FCM registration token` → トークン形式エラー

### 5. 🔧 Service Workerの確認

#### 5.1 Service Workerが登録されているか

```
Chrome > chrome://serviceworker-internals/
→ fcm-web-push-app.web.app が表示されているか確認
→ Status が "ACTIVATED" になっているか確認
```

#### 5.2 Service Workerのエラー確認

```
Chrome > 設定（︙） > その他のツール > デベロッパーツール
→ Application タブ
→ Service Workers セクション
→ エラーが表示されていないか確認
```

## 🛠️ 対処方法

### 解決策1: ブラウザデータをクリア

通知許可がうまく動作していない場合：

```
Chrome > 設定 > プライバシーとセキュリティ > 閲覧履歴データの削除
→ 「Cookieとサイトデータ」にチェック
→ 「キャッシュされた画像とファイル」にチェック
→ 「削除」をタップ

その後、再度アクセスして通知を許可
```

### 解決策2: Chromeを最新版に更新

```
Google Play ストア > Chrome > 更新
```

Android 10 + Chrome の推奨バージョン: **Chrome 88以降**

### 解決策3: デバイスを再登録

```
1. ブラウザのデータをクリア
2. https://fcm-web-push-app.web.app に再アクセス
3. 新しいデバイスIDで再登録
4. 通知を許可
5. テスト通知を送信
```

### 解決策4: FCMトークンを再取得

開発者ツールのコンソールで実行：

```javascript
// 既存のトークンを削除
messaging.deleteToken().then(() => {
  console.log('Token deleted');
  // ページをリロード
  location.reload();
});
```

## 🧪 デバッグスクリプト

コンソールで以下を実行して詳細情報を取得：

```javascript
// 通知権限の確認
console.log('Notification permission:', Notification.permission);

// Service Workerの確認
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('Service Workers:', registrations);
});

// FCMトークンの確認
if (messaging) {
  messaging.getToken({ vapidKey: vapidKey }).then(token => {
    console.log('Current FCM Token:', token);
  }).catch(err => {
    console.error('Error getting token:', err);
  });
}
```

## 📊 よくある原因と解決策

| 症状 | 原因 | 解決策 |
|------|------|--------|
| 通知許可が表示されない | 既にブロック済み | サイト設定で通知を許可に変更 |
| 登録はできるが通知が来ない | バッテリー最適化 | Chromeを最適化から除外 |
| エラー「Token not found」 | FCMトークン取得失敗 | Service Workerを再登録 |
| 一度は届いたが届かなくなった | トークンの有効期限切れ | デバイスを再登録 |
| 他のブラウザでは届く | Chrome固有の問題 | Chromeのデータをクリア |

## 🔍 Android 10固有の問題

### 問題1: バックグラウンド実行制限

Android 10以降、バックグラウンドアプリの動作が厳しく制限されています。

**対処法：**
```
設定 > アプリ > Chrome > 詳細設定 > 電池
→ 「バックグラウンドでのバッテリー使用」を許可
```

### 問題2: データセーバーモード

データセーバーが有効だと通知が届かないことがあります。

**対処法：**
```
設定 > ネットワークとインターネット > データセーバー
→ OFF にする
```

### 問題3: デバイスのスリープモード

端末がスリープ状態の場合、通知が遅延することがあります。

**確認方法：**
- 画面ONの状態で通知が届くか確認
- 届く場合は、スリープ設定の問題

## 📱 テスト手順

### 完全なテストフロー

1. **準備**
   ```
   - Chromeのキャッシュをクリア
   - 通知設定をリセット
   - Chrome再起動
   ```

2. **登録**
   ```
   - https://fcm-web-push-app.web.app にアクセス
   - デバイスID入力: 9999999999
   - 「このIDで登録」
   - 通知を許可（ポップアップで「許可」）
   - 登録完了を確認
   ```

3. **デバッグ情報収集**
   ```javascript
   // コンソールで実行
   console.log('Permission:', Notification.permission);
   console.log('FCM Token:', await messaging.getToken({ vapidKey }));
   ```

4. **通知送信**
   ```
   - ページ下部のテスト通知セクション
   - デバイスID: 9999999999
   - タイトル: Android Test
   - メッセージ: テストメッセージ
   - 送信ボタンをクリック
   ```

5. **結果確認**
   ```
   ✅ 通知が届いた → 成功！
   ❌ 届かない → コンソールのエラーを確認
   ```

## 🆘 それでも解決しない場合

### ログ情報を収集

1. **ブラウザコンソールのログ**
   ```
   Chrome > デベロッパーツール > Console
   → スクリーンショットを撮る
   ```

2. **Cloud Functionsのログ**
   ```bash
   firebase functions:log
   ```

3. **デバイス情報**
   ```
   - Android バージョン: 10
   - Chrome バージョン: （設定 > Chromeについて で確認）
   - デバイスモデル:
   ```

### 代替手段

**別のブラウザで試す：**
- Firefox for Android
- Microsoft Edge for Android
- Samsung Internet

これらのブラウザでも動作するか確認することで、Chrome固有の問題か判断できます。

## 📞 サポート

問題が解決しない場合は、以下の情報と共にIssueを作成してください：

1. Android バージョン
2. Chrome バージョン
3. デバイスモデル
4. コンソールのエラーメッセージ
5. 試した対処法
6. Cloud Functionsのログ

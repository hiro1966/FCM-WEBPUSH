const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

// Firebase Admin初期化
let firebaseInitialized = false;
try {
  const serviceAccount = require('../config/serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  firebaseInitialized = true;
  console.log('✅ Firebase Admin initialized successfully');
} catch (error) {
  console.warn('⚠️  Firebase Admin not initialized. Please add serviceAccountKey.json to config folder.');
  console.warn('   The server will run but push notifications will not work.');
}

// Firestoreの参照
const db = firebaseInitialized ? admin.firestore() : null;

// ===== API エンドポイント =====

// デバイス登録: QRコードのIDとFCMトークンを紐付け
app.post('/api/register', async (req, res) => {
  try {
    const { deviceId, fcmToken } = req.body;

    if (!deviceId || !fcmToken) {
      return res.status(400).json({ 
        success: false, 
        message: 'deviceId and fcmToken are required' 
      });
    }

    // 10桁の数字チェック
    if (!/^\d{10}$/.test(deviceId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'deviceId must be a 10-digit number' 
      });
    }

    if (!firebaseInitialized || !db) {
      return res.status(503).json({ 
        success: false, 
        message: 'Firebase is not configured' 
      });
    }

    // Firestoreに保存
    await db.collection('devices').doc(deviceId).set({
      fcmToken: fcmToken,
      registeredAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    res.json({ 
      success: true, 
      message: 'Device registered successfully',
      deviceId: deviceId
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Registration failed', 
      error: error.message 
    });
  }
});

// プッシュ通知送信
app.post('/api/send-notification', async (req, res) => {
  try {
    const { deviceId, title, message } = req.body;

    if (!deviceId || !title || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'deviceId, title, and message are required' 
      });
    }

    if (!firebaseInitialized || !db) {
      return res.status(503).json({ 
        success: false, 
        message: 'Firebase is not configured' 
      });
    }

    // デバイス情報を取得
    const deviceDoc = await db.collection('devices').doc(deviceId).get();

    if (!deviceDoc.exists) {
      return res.status(404).json({ 
        success: false, 
        message: 'Device not found' 
      });
    }

    const fcmToken = deviceDoc.data().fcmToken;

    // プッシュ通知を送信
    const payload = {
      notification: {
        title: title,
        body: message
      },
      token: fcmToken
    };

    const response = await admin.messaging().send(payload);

    res.json({ 
      success: true, 
      message: 'Notification sent successfully',
      deviceId: deviceId,
      messageId: response
    });

  } catch (error) {
    console.error('Notification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send notification', 
      error: error.message 
    });
  }
});

// デバイス一覧取得（デバッグ用）
app.get('/api/devices', async (req, res) => {
  try {
    if (!firebaseInitialized || !db) {
      return res.status(503).json({ 
        success: false, 
        message: 'Firebase is not configured' 
      });
    }

    const devicesSnapshot = await db.collection('devices').get();
    const devices = [];
    
    devicesSnapshot.forEach(doc => {
      devices.push({
        deviceId: doc.id,
        ...doc.data(),
        registeredAt: doc.data().registeredAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      });
    });

    res.json({ 
      success: true, 
      devices: devices 
    });

  } catch (error) {
    console.error('Get devices error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get devices', 
      error: error.message 
    });
  }
});

// サービスアカウントキーのアップロード（開発用）
app.post('/api/upload-service-account', async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ 
        success: false, 
        message: 'content is required' 
      });
    }

    // JSONが有効かチェック
    try {
      JSON.parse(content);
    } catch (error) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid JSON format' 
      });
    }

    // configディレクトリが存在しない場合は作成
    const configDir = path.join(__dirname, '../config');
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    // ファイルに保存
    const filePath = path.join(configDir, 'serviceAccountKey.json');
    fs.writeFileSync(filePath, content, 'utf8');

    res.json({ 
      success: true, 
      message: 'Service account key uploaded successfully. Please restart the server.' 
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to upload', 
      error: error.message 
    });
  }
});

// ヘルスチェック
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    firebaseInitialized: firebaseInitialized,
    timestamp: new Date().toISOString()
  });
});

// ルートパス
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📱 Open the URL on your smartphone to test push notifications`);
});

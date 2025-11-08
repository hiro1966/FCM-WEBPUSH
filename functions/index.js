const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Firebase Admin初期化
admin.initializeApp();
const db = admin.firestore();

// CORS対応
const cors = require('cors')({
  origin: true,
  credentials: true
});

// ===== Cloud Functions =====

/**
 * デバイス登録
 * POST https://[region]-[project-id].cloudfunctions.net/registerDevice
 */
exports.registerDevice = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    // POSTメソッドのみ許可
    if (req.method !== 'POST') {
      return res.status(405).json({
        success: false,
        message: 'Method not allowed'
      });
    }

    try {
      const { deviceId, fcmToken } = req.body;

      // バリデーション
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

      // Firestoreに保存
      await db.collection('devices').doc(deviceId).set({
        fcmToken: fcmToken,
        registeredAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      return res.json({
        success: true,
        message: 'Device registered successfully',
        deviceId: deviceId
      });

    } catch (error) {
      console.error('Registration error:', error);
      return res.status(500).json({
        success: false,
        message: 'Registration failed',
        error: error.message
      });
    }
  });
});

/**
 * プッシュ通知送信
 * POST https://[region]-[project-id].cloudfunctions.net/sendNotification
 */
exports.sendNotification = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    // POSTメソッドのみ許可
    if (req.method !== 'POST') {
      return res.status(405).json({
        success: false,
        message: 'Method not allowed'
      });
    }

    try {
      const { deviceId, title, message } = req.body;

      // バリデーション
      if (!deviceId || !title || !message) {
        return res.status(400).json({
          success: false,
          message: 'deviceId, title, and message are required'
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

      return res.json({
        success: true,
        message: 'Notification sent successfully',
        deviceId: deviceId,
        messageId: response
      });

    } catch (error) {
      console.error('Notification error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to send notification',
        error: error.message
      });
    }
  });
});

/**
 * デバイス一覧取得
 * GET https://[region]-[project-id].cloudfunctions.net/getDevices
 */
exports.getDevices = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    // GETメソッドのみ許可
    if (req.method !== 'GET') {
      return res.status(405).json({
        success: false,
        message: 'Method not allowed'
      });
    }

    try {
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

      return res.json({
        success: true,
        devices: devices
      });

    } catch (error) {
      console.error('Get devices error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get devices',
        error: error.message
      });
    }
  });
});

/**
 * ヘルスチェック
 * GET https://[region]-[project-id].cloudfunctions.net/healthCheck
 */
exports.healthCheck = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    return res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      service: 'FCM Web Push Cloud Functions'
    });
  });
});

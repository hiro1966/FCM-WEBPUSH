let messaging = null;
let currentDeviceId = null;
let stream = null;

// Firebase初期化
function initializeFirebase() {
    try {
        firebase.initializeApp(firebaseConfig);
        messaging = firebase.messaging();
        console.log('✅ Firebase initialized successfully');
        return true;
    } catch (error) {
        console.error('❌ Firebase initialization error:', error);
        showStatus('Firebase設定エラー。config.jsを確認してください。', 'error', 'notification-status');
        return false;
    }
}

// 手動入力でデバイスIDを設定
function handleManualInput() {
    const input = document.getElementById('manual-device-id');
    const deviceId = input.value.trim();
    
    // 10桁の数字かチェック
    if (!/^\d{10}$/.test(deviceId)) {
        alert('デバイスIDは10桁の数字である必要があります');
        input.focus();
        return;
    }
    
    // QRコード検出時と同じ処理を実行
    handleDeviceIdDetected(deviceId);
}

// デバイスID検出時の共通処理（QRコードまたは手動入力）
function handleDeviceIdDetected(deviceId) {
    console.log('Device ID detected:', deviceId);
    currentDeviceId = deviceId;

    // カメラを停止（QRスキャン中の場合）
    stopCamera();

    // 結果を表示
    document.getElementById('device-id-display').textContent = deviceId;
    document.getElementById('qr-result').style.display = 'block';
    document.getElementById('start-scan-btn').textContent = 'QRコードをスキャン';
    document.getElementById('start-scan-btn').disabled = false;

    // 手動入力フィールドにも表示
    document.getElementById('manual-device-id').value = deviceId;

    // ステップ2を表示
    document.getElementById('step2').style.display = 'block';
    
    // ステップ2までスクロール
    document.getElementById('step2').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// QRコードスキャン開始
async function startQRScanner() {
    const video = document.getElementById('qr-video');
    const canvas = document.getElementById('qr-canvas');
    const startBtn = document.getElementById('start-scan-btn');
    
    try {
        startBtn.disabled = true;
        startBtn.textContent = 'カメラ起動中...';

        // カメラストリームを取得
        stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' } // 背面カメラを優先
        });

        video.srcObject = stream;
        video.setAttribute('playsinline', true);
        video.style.display = 'block';
        await video.play();

        startBtn.textContent = 'スキャン中...';

        // QRコードをスキャン
        requestAnimationFrame(scanQRCode);

    } catch (error) {
        console.error('Camera error:', error);
        startBtn.disabled = false;
        startBtn.textContent = 'カメラを起動';
        alert('カメラにアクセスできませんでした。カメラの権限を許可してください。');
    }
}

// QRコードスキャン処理
function scanQRCode() {
    const video = document.getElementById('qr-video');
    const canvas = document.getElementById('qr-canvas');
    const canvasContext = canvas.getContext('2d');

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        canvasContext.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = canvasContext.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
            const deviceId = code.data;
            
            // 10桁の数字かチェック
            if (/^\d{10}$/.test(deviceId)) {
                handleQRCodeDetected(deviceId);
                return; // スキャン停止
            } else {
                console.warn('Invalid QR code format:', deviceId);
            }
        }
    }

    requestAnimationFrame(scanQRCode);
}

// QRコード検出時の処理（handleDeviceIdDetectedを呼び出す）
function handleQRCodeDetected(deviceId) {
    handleDeviceIdDetected(deviceId);
}

// カメラ停止
function stopCamera() {
    const video = document.getElementById('qr-video');
    
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
    
    video.style.display = 'none';
    video.srcObject = null;
}

// 通知許可を要求
async function requestNotificationPermission() {
    const btn = document.getElementById('enable-notification-btn');
    btn.disabled = true;
    btn.textContent = '処理中...';

    try {
        // 通知許可を要求
        const permission = await Notification.requestPermission();
        
        if (permission !== 'granted') {
            showStatus('通知が許可されませんでした。', 'error', 'notification-status');
            btn.disabled = false;
            btn.textContent = '通知を許可する';
            return;
        }

        showStatus('通知が許可されました。FCMトークンを取得中...', 'success', 'notification-status');

        // FCMトークンを取得
        const token = await messaging.getToken({ vapidKey: vapidKey });
        console.log('FCM Token:', token);

        // サーバーに登録
        await registerDevice(currentDeviceId, token);

    } catch (error) {
        console.error('Notification error:', error);
        showStatus('エラー: ' + error.message, 'error', 'notification-status');
        btn.disabled = false;
        btn.textContent = '通知を許可する';
    }
}

// デバイスをサーバーに登録
async function registerDevice(deviceId, fcmToken) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                deviceId: deviceId,
                fcmToken: fcmToken
            })
        });

        const data = await response.json();

        if (data.success) {
            console.log('Device registered successfully');
            
            // ステップ3を表示
            document.getElementById('registered-device-id').textContent = deviceId;
            document.getElementById('step3').style.display = 'block';
            document.getElementById('step2').style.display = 'none';

            // テスト送信フォームに自動入力
            document.getElementById('test-device-id').value = deviceId;

        } else {
            throw new Error(data.message);
        }

    } catch (error) {
        console.error('Registration error:', error);
        showStatus('登録エラー: ' + error.message, 'error', 'notification-status');
    }
}

// テスト通知を送信
async function sendTestNotification() {
    const deviceId = document.getElementById('test-device-id').value;
    const title = document.getElementById('test-title').value;
    const message = document.getElementById('test-message').value;
    const btn = document.getElementById('send-test-notification-btn');

    if (!deviceId || !title || !message) {
        showStatus('すべてのフィールドを入力してください', 'error', 'test-result');
        return;
    }

    if (!/^\d{10}$/.test(deviceId)) {
        showStatus('デバイスIDは10桁の数字である必要があります', 'error', 'test-result');
        return;
    }

    btn.disabled = true;
    btn.textContent = '送信中...';

    try {
        const response = await fetch(`${API_BASE_URL}/api/send-notification`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                deviceId: deviceId,
                title: title,
                message: message
            })
        });

        const data = await response.json();

        if (data.success) {
            showStatus('✅ 通知を送信しました！', 'success', 'test-result');
        } else {
            showStatus('❌ ' + data.message, 'error', 'test-result');
        }

    } catch (error) {
        console.error('Send notification error:', error);
        showStatus('❌ 送信エラー: ' + error.message, 'error', 'test-result');
    } finally {
        btn.disabled = false;
        btn.textContent = 'テスト通知を送信';
    }
}

// デバイス一覧を取得
async function loadDevices() {
    const btn = document.getElementById('refresh-devices-btn');
    const listDiv = document.getElementById('devices-list');

    btn.disabled = true;
    btn.textContent = '読込中...';
    listDiv.innerHTML = '<p>読み込み中...</p>';

    try {
        const response = await fetch(`${API_BASE_URL}/api/devices`);
        const data = await response.json();

        if (data.success) {
            if (data.devices.length === 0) {
                listDiv.innerHTML = '<p>登録済みデバイスはありません</p>';
            } else {
                listDiv.innerHTML = data.devices.map(device => `
                    <div class="device-item">
                        <strong>デバイスID:</strong> ${device.deviceId}<br>
                        <strong>登録日時:</strong> ${device.registeredAt ? new Date(device.registeredAt).toLocaleString('ja-JP') : 'N/A'}
                    </div>
                `).join('');
            }
        } else {
            listDiv.innerHTML = '<p>エラー: ' + data.message + '</p>';
        }

    } catch (error) {
        console.error('Load devices error:', error);
        listDiv.innerHTML = '<p>エラー: ' + error.message + '</p>';
    } finally {
        btn.disabled = false;
        btn.textContent = '更新';
    }
}

// ステータスメッセージを表示
function showStatus(message, type, elementId) {
    const statusDiv = document.getElementById(elementId);
    statusDiv.textContent = message;
    statusDiv.className = 'status-box ' + type;
    statusDiv.style.display = 'block';
}

// フォアグラウンドメッセージ受信
function setupForegroundMessaging() {
    if (!messaging) return;

    messaging.onMessage(async (payload) => {
        console.log('Foreground message received:', payload);
        
        const notificationTitle = payload.notification.title;
        const notificationOptions = {
            body: payload.notification.body,
            icon: '/icon.png', // 必要に応じてアイコンを追加
            badge: '/badge.png',
            tag: 'notification-' + Date.now(),
            requireInteraction: false
        };

        // Service Worker経由で通知を表示
        if (Notification.permission === 'granted') {
            try {
                // Service Workerが利用可能な場合はそれを使用
                if ('serviceWorker' in navigator) {
                    const registration = await navigator.serviceWorker.ready;
                    await registration.showNotification(notificationTitle, notificationOptions);
                } else {
                    // Service Workerがない場合のフォールバック
                    new Notification(notificationTitle, notificationOptions);
                }
            } catch (error) {
                console.error('Notification error:', error);
            }
        }
    });
}

// 初期化処理
document.addEventListener('DOMContentLoaded', () => {
    // Firebase初期化
    if (initializeFirebase()) {
        setupForegroundMessaging();
    }

    // イベントリスナー設定
    document.getElementById('manual-input-btn').addEventListener('click', handleManualInput);
    document.getElementById('start-scan-btn').addEventListener('click', startQRScanner);
    document.getElementById('enable-notification-btn').addEventListener('click', requestNotificationPermission);
    document.getElementById('send-test-notification-btn').addEventListener('click', sendTestNotification);
    document.getElementById('refresh-devices-btn').addEventListener('click', loadDevices);

    // Enterキーでも送信できるようにする
    document.getElementById('manual-device-id').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleManualInput();
        }
    });

    // 初期デバイス一覧読み込み
    loadDevices();
});

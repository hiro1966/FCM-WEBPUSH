#!/usr/bin/env python3
"""
QRコード生成スクリプト

10桁の数字をQRコードに変換します。
使い方:
    python3 generate_qr.py 1234567890
"""

import sys

def generate_qr_code(device_id):
    """QRコードを生成"""
    try:
        import qrcode
    except ImportError:
        print("❌ qrcodeライブラリがインストールされていません。")
        print("   以下のコマンドでインストールしてください:")
        print("   pip install qrcode[pil]")
        sys.exit(1)
    
    # 10桁の数字チェック
    if not device_id.isdigit() or len(device_id) != 10:
        print("❌ エラー: デバイスIDは10桁の数字である必要があります")
        print(f"   入力されたID: {device_id}")
        sys.exit(1)
    
    # QRコード生成
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(device_id)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    
    # ファイル名
    filename = f"qr_device_{device_id}.png"
    img.save(filename)
    
    print(f"✅ QRコードを生成しました: {filename}")
    print(f"   デバイスID: {device_id}")

def main():
    if len(sys.argv) != 2:
        print("使い方: python3 generate_qr.py <10桁の数字>")
        print("例: python3 generate_qr.py 1234567890")
        sys.exit(1)
    
    device_id = sys.argv[1]
    generate_qr_code(device_id)

if __name__ == "__main__":
    main()

# ツール

このディレクトリには、開発やテストで使用するツールが含まれています。

## QRコード生成スクリプト

### インストール

```bash
pip install qrcode[pil]
```

### 使い方

```bash
python3 tools/generate_qr.py 1234567890
```

または実行可能にしている場合:

```bash
./tools/generate_qr.py 1234567890
```

### 複数のQRコードを生成

```bash
# シェルスクリプトで複数生成
for i in {1..10}; do
    device_id=$(printf "%010d" $i)
    python3 tools/generate_qr.py $device_id
done
```

これにより以下のQRコードが生成されます:
- qr_device_0000000001.png
- qr_device_0000000002.png
- ...
- qr_device_0000000010.png

### オンラインQRコード生成ツール

ライブラリをインストールしたくない場合は、以下のオンラインツールを使用できます:

- https://www.qr-code-generator.com/
- https://www.the-qrcode-generator.com/
- https://qr.io/

テキスト欄に10桁の数字を入力するだけでQRコードが生成できます。

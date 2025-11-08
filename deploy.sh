#!/bin/bash

# FCM Web Push - Google Cloud デプロイスクリプト

set -e

echo "🚀 Firebase デプロイを開始します..."
echo ""

# カラー定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# プロジェクトIDをチェック
PROJECT_ID=$(grep -o '"default": "[^"]*"' .firebaserc | cut -d'"' -f4)

if [ "$PROJECT_ID" = "YOUR_PROJECT_ID" ]; then
    echo -e "${RED}❌ エラー: .firebaserc のプロジェクトIDを設定してください${NC}"
    echo "   firebase use --add を実行するか、.firebaserc を編集してください"
    exit 1
fi

echo -e "${GREEN}✓${NC} プロジェクトID: $PROJECT_ID"
echo ""

# Firebase CLIがインストールされているかチェック
if ! command -v firebase &> /dev/null; then
    echo -e "${RED}❌ Firebase CLIがインストールされていません${NC}"
    echo "   以下のコマンドでインストールしてください:"
    echo "   npm install -g firebase-tools"
    exit 1
fi

echo -e "${GREEN}✓${NC} Firebase CLI: $(firebase --version)"
echo ""

# Functionsの依存関係をインストール
echo "📦 Cloud Functions の依存関係をインストール中..."
cd functions
npm install
cd ..
echo -e "${GREEN}✓${NC} 依存関係のインストール完了"
echo ""

# デプロイオプションを選択
echo "デプロイする対象を選択してください:"
echo "  1) すべて (Hosting + Functions + Firestore)"
echo "  2) Hosting のみ"
echo "  3) Functions のみ"
echo "  4) Firestore Rules のみ"
echo ""
read -p "選択 (1-4): " choice

case $choice in
    1)
        echo ""
        echo "📤 すべてをデプロイ中..."
        firebase deploy
        ;;
    2)
        echo ""
        echo "📤 Hosting をデプロイ中..."
        firebase deploy --only hosting
        ;;
    3)
        echo ""
        echo "📤 Functions をデプロイ中..."
        firebase deploy --only functions
        ;;
    4)
        echo ""
        echo "📤 Firestore Rules をデプロイ中..."
        firebase deploy --only firestore:rules
        ;;
    *)
        echo -e "${RED}❌ 無効な選択です${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}✅ デプロイ完了！${NC}"
echo ""
echo "🌐 アプリURL: https://$PROJECT_ID.web.app"
echo ""
echo "📊 次のステップ:"
echo "  - ブラウザでアプリにアクセス"
echo "  - デバイスを登録してテスト"
echo "  - ログを確認: firebase functions:log"
echo ""

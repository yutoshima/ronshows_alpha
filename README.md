# 論証グラフ作成ツール

シャーロック・ホームズの推理などの論理的推論を視覚的に表現するためのグラフ作成ツールです。ノードとリンクを使って、前提から結論への推論過程を明確に図示できます。

![アプリケーションのスクリーンショット](https://via.placeholder.com/800x400.png?text=Ronshows+Alpha)

## 主な機能

- **ノード管理**: 前提（Premise）と結論（Claim）のノードを配置
- **リンクの種類**: 演繹、仮定、対立、限定の4種類のリンク
- **矢印の向き**: 順方向（→）、逆方向（←）、双方向（↔）を選択可能
- **カスタマイズ**: リンクの色・太さ、ノードの色を自由に設定
- **自動配置**: クリックで自動配置、ドラッグ&ドロップで手動配置
- **Undo/Redo**: 操作の取り消し・やり直し機能
- **設定の永続化**: ブラウザに設定を保存（リロード後も維持）

## 必要な環境

- **Node.js**: 18.17以上（推奨: 20.x以上）
- **npm**: 9.0以上（Node.jsに同梱）

## Node.jsのインストール方法

### Windows

1. [Node.js公式サイト](https://nodejs.org/)にアクセス
2. 「LTS（Long Term Support）」版をダウンロード
3. ダウンロードしたインストーラー（`.msi`ファイル）を実行
4. インストールウィザードの指示に従って進める
5. インストール完了後、コマンドプロンプトを開いて確認：
   ```cmd
   node --version
   npm --version
   ```

### macOS

#### 方法1: 公式インストーラー（初心者推奨）
1. [Node.js公式サイト](https://nodejs.org/)にアクセス
2. 「LTS」版をダウンロード
3. ダウンロードした`.pkg`ファイルを実行
4. インストールウィザードの指示に従って進める
5. ターミナルを開いて確認：
   ```bash
   node --version
   npm --version
   ```

#### 方法2: Homebrewを使用
```bash
# Homebrewがインストールされている場合
brew install node

# 確認
node --version
npm --version
```

### Linux (Ubuntu/Debian)

```bash
# Node.js 20.xをインストール
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 確認
node --version
npm --version
```

## プロジェクトのセットアップ

### 1. プロジェクトをダウンロード

#### GitHubからクローン
```bash
git clone https://github.com/YOUR_USERNAME/ronshows_alpha.git
cd ronshows_alpha
```

#### ZIPファイルをダウンロードした場合
1. ZIPファイルを解凍
2. ターミナル（またはコマンドプロンプト）を開く
3. プロジェクトフォルダに移動：
   ```bash
   cd path/to/ronshows_alpha
   ```

### 2. 依存パッケージのインストール

プロジェクトフォルダ内で以下のコマンドを実行：

```bash
npm install
```

このコマンドは `package.json` に記載されているすべての必要なパッケージをインストールします。
初回は数分かかる場合があります。

### 3. 開発サーバーの起動

```bash
npm run dev
```

成功すると、以下のようなメッセージが表示されます：
```
- ready started server on 0.0.0.0:3000, url: http://localhost:3000
```

### 4. ブラウザでアクセス

ブラウザを開いて、以下のURLにアクセス：
```
http://localhost:3000
```

アプリケーションが表示されれば成功です！

## 使い方

### ノードの追加

#### 方法1: クリックで自動配置
1. 左サイドバーの「ノード」タブを選択
2. ノードパレットからノードをクリック
3. キャンバスに自動的に整列して配置されます

#### 方法2: ドラッグ&ドロップ
1. ノードパレットからノードをドラッグ
2. キャンバスの好きな位置にドロップ

### リンクの作成

1. ノードの端にある●（ハンドル）をドラッグ
2. 別のノードの●までドラッグして接続

### リンクの種類を変更

1. リンク（線）をクリック
2. メニューから種類を選択：
   - **演繹**: 黒の実線
   - **仮定**: 黒の点線
   - **対立**: 赤の実線
   - **限定**: 青の実線

### 矢印の向きを変更

1. リンクをクリック
2. メニューの「矢印の向き」セクションから選択：
   - **→ 順方向**: 通常の矢印
   - **← 逆方向**: 逆向きの矢印
   - **↔ 双方向**: 両端に矢印

### カスタマイズ（設定）

1. 左サイドバーの「設定」タブを選択
2. 以下の項目を調整可能：
   - **デフォルト矢印の向き**: 新しいリンクのデフォルト方向
   - **リンクの太さ**: 1〜5px
   - **リンクの色**: 各種類ごとにカラーピッカーで選択
   - **ノードの色**: 前提と結論の背景色・枠線色・文字色
3. 設定は自動的にブラウザに保存されます

### Undo / Redo

- **Undo（戻る）**: 左サイドバー下部の「↶ 戻る」ボタン
- **Redo（進む）**: 左サイドバー下部の「進む ↷」ボタン

## 本番ビルド

アプリケーションを本番環境用にビルドする場合：

```bash
# ビルド
npm run build

# 本番サーバーを起動
npm start
```

本番ビルドは最適化され、パフォーマンスが向上します。

## プロジェクト構成

```
ronshows_alpha/
├── app/                    # Next.js アプリケーションルート
│   ├── layout.tsx         # ルートレイアウト
│   ├── page.tsx           # メインページ（UIコンポーネント）
│   └── globals.css        # グローバルスタイル
├── lib/                   # ライブラリとユーティリティ
│   ├── constants.ts       # 定数定義（ノード、リンクスタイル）
│   └── store.ts           # 状態管理（Zustand）
├── public/                # 静的ファイル
├── node_modules/          # インストールされたパッケージ
├── package.json           # プロジェクト設定と依存関係
├── tsconfig.json          # TypeScript設定
├── tailwind.config.js     # Tailwind CSS設定
├── postcss.config.js      # PostCSS設定
├── next-env.d.ts          # Next.js型定義
└── README.md              # このファイル
```

## 使用技術

- **[Next.js](https://nextjs.org/)** 16.1: Reactフレームワーク
- **[React](https://react.dev/)** 19.2: UIライブラリ
- **[ReactFlow](https://reactflow.dev/)** 11.11: フローチャート・グラフライブラリ
- **[Zustand](https://github.com/pmndrs/zustand)** 5.0: 軽量状態管理
- **[Tailwind CSS](https://tailwindcss.com/)** 3.4: CSSフレームワーク
- **[TypeScript](https://www.typescriptlang.org/)** 5.9: 型安全なJavaScript

## トラブルシューティング

### `npm install` でエラーが出る

```bash
# キャッシュをクリア
npm cache clean --force

# 再インストール
rm -rf node_modules package-lock.json
npm install
```

### ポート3000が既に使用されている

```bash
# 別のポートで起動（例: 3001）
PORT=3001 npm run dev
```

### ブラウザに何も表示されない

1. ターミナルにエラーメッセージがないか確認
2. ブラウザのコンソール（F12キー）でエラーを確認
3. ブラウザのキャッシュをクリアして再読み込み（Ctrl+Shift+R / Cmd+Shift+R）

## ライセンス

MIT License

## 作者

Yuto

## 貢献

Issue報告やPull Requestを歓迎します！

1. このリポジトリをFork
2. 新しいブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにPush (`git push origin feature/amazing-feature`)
5. Pull Requestを作成

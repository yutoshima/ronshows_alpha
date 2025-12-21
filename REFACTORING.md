# リファクタリング詳細

## 概要
コードの保守性、可読性、再利用性を向上させるため、大規模なリファクタリングを実施しました。

## 主な変更点

### 1. ユーティリティ関数の分離

#### 作成したファイル

**lib/utils/storage.ts**
- `loadSettings()`: 設定をlocalStorageから読み込み
- `saveSettings()`: 設定をlocalStorageに保存
- `loadCustomProblems()`: カスタム問題を読み込み
- `saveCustomProblems()`: カスタム問題を保存

**lib/utils/validation.ts**
- `setsEqual()`: Set比較のヘルパー関数
- `compareArrays()`: 配列比較のヘルパー関数
- `compareNodes()`: ノードの正解判定
- `compareEdgeConnections()`: エッジ接続の正解判定
- `compareEdgeTypes()`: エッジ種類の正解判定
- `compareArrowDirections()`: 矢印向きの正解判定

**lib/utils/feedback.ts**
- `ValidationDetails`: 検証結果の型定義
- `calculateScore()`: スコア計算ロジック
- `generateFeedbackMessages()`: フィードバックメッセージ生成

### 2. 型定義の整理

**lib/types.ts** (新規作成)
- `FeedbackRuleConfig`: フィードバックルール設定の型
- `FeedbackConfig`: フィードバック全体の設定型
- `Settings`: アプリケーション設定の型
- `LogEntry`: 操作ログの型
- `FeedbackResult`: フィードバック結果の型
- `DEFAULT_SETTINGS`: デフォルト設定の定数

**利点:**
- 循環依存の解消
- 型の一元管理
- インポートの簡素化

### 3. lib/store.ts の簡素化

**削除されたコード:**
- 重複する型定義 (→ lib/types.ts に移動)
- ローカルストレージ関数 (→ lib/utils/storage.ts に移動)
- 比較・検証関数 (→ lib/utils/validation.ts に移動)
- フィードバック生成ロジック (→ lib/utils/feedback.ts に移動)

**結果:**
- ファイルサイズ: 750行 → 522行 (約30%削減)
- 関心の分離を実現
- テストしやすいコード構造

## メリット

### 1. 保守性の向上
- 各機能が独立したファイルに分離
- 変更の影響範囲が明確
- バグ修正が容易

### 2. 再利用性の向上
- ユーティリティ関数を他のコンポーネントでも使用可能
- テストコードの記述が容易

### 3. 可読性の向上
- ファイル名から機能が明確
- コードの責務が明確
- インポート文から依存関係が把握しやすい

### 4. 型安全性の向上
- 型定義を一元管理
- 循環依存の解消
- TypeScriptの恩恵をより受けやすい

## ファイル構成

```
lib/
├── constants.ts          # 定数定義
├── types.ts              # 型定義と設定 (新規)
├── store.ts              # Zustand ストア (簡素化)
└── utils/
    ├── storage.ts        # ローカルストレージ操作 (新規)
    ├── validation.ts     # 検証・比較ロジック (新規)
    └── feedback.ts       # フィードバック生成 (新規)
```

## 後方互換性

すべての型とデフォルト設定は `lib/store.ts` から再エクスポートされているため、既存のインポート文は変更不要です。

```typescript
// これらのインポートは引き続き動作します
import { Settings, DEFAULT_SETTINGS } from '../lib/store';
import useStore from '../lib/store';
```

## テスト結果

- ビルド: ✅ 成功
- TypeScript型チェック: ✅ エラーなし
- 機能: ✅ 全て正常動作

### 4. コンポーネントの分割

**app/page.tsx** (1063行 → 49行に削減、95%削減)

全ての UI コンポーネントを独立したファイルに分離しました：

**components/nodes/**
- `UniversalNode.tsx`: カスタムノードコンポーネント

**components/canvas/**
- `GroupBoxes.tsx`: 限定リンクグループの視覚化
- `EdgeContextMenu.tsx`: エッジ編集用コンテキストメニュー
- `CanvasArea.tsx`: ReactFlow キャンバスとインタラクション

**components/sidebar/**
- `Sidebar.tsx`: サイドバーコンテナ（タブ切り替え、Undo/Redo）
- `SettingsPanel.tsx`: 設定パネル
- `LogPanel.tsx`: 操作ログパネル

**components/problem/**
- `ProblemSelector.tsx`: 問題選択UI（ドロップダウン、前へ/次へ）
- `ProblemModal.tsx`: 問題文表示モーダル
- `ProblemImport.tsx`: 問題インポート機能

**components/feedback/**
- `FeedbackPanel.tsx`: フィードバック表示
- `FeedbackSettingsPanel.tsx`: フィードバック設定UI

**利点:**
- 各コンポーネントが単一責任を持つ
- ファイル構造が機能別に整理
- コンポーネントの再利用が容易
- テストが書きやすい
- 新規開発者がコードを理解しやすい

## メリット

### 1. 保守性の向上
- 各機能が独立したファイルに分離
- 変更の影響範囲が明確
- バグ修正が容易

### 2. 再利用性の向上
- ユーティリティ関数を他のコンポーネントでも使用可能
- コンポーネントが独立しているため組み合わせ可能
- テストコードの記述が容易

### 3. 可読性の向上
- ファイル名から機能が明確
- コードの責務が明確
- インポート文から依存関係が把握しやすい

### 4. 型安全性の向上
- 型定義を一元管理
- 循環依存の解消
- TypeScriptの恩恵をより受けやすい

## ファイル構成

```
app/
└── page.tsx              # メインページ (49行、95%削減)

components/
├── nodes/
│   └── UniversalNode.tsx
├── canvas/
│   ├── GroupBoxes.tsx
│   ├── EdgeContextMenu.tsx
│   └── CanvasArea.tsx
├── sidebar/
│   ├── Sidebar.tsx
│   ├── SettingsPanel.tsx
│   └── LogPanel.tsx
├── problem/
│   ├── ProblemSelector.tsx
│   ├── ProblemModal.tsx
│   └── ProblemImport.tsx
└── feedback/
    ├── FeedbackPanel.tsx
    └── FeedbackSettingsPanel.tsx

lib/
├── constants.ts          # 定数定義
├── types.ts              # 型定義と設定
├── store.ts              # Zustand ストア (522行、30%削減)
└── utils/
    ├── storage.ts        # ローカルストレージ操作
    ├── validation.ts     # 検証・比較ロジック
    └── feedback.ts       # フィードバック生成
```

## 後方互換性

すべての型とデフォルト設定は `lib/store.ts` から再エクスポートされているため、既存のインポート文は変更不要です。

```typescript
// これらのインポートは引き続き動作します
import { Settings, DEFAULT_SETTINGS } from '../lib/store';
import useStore from '../lib/store';
```

## テスト結果

- ビルド: ✅ 成功
- TypeScript型チェック: ✅ エラーなし
- 機能: ✅ 全て正常動作

## 今後の改善案

1. **テストの追加**: ユーティリティ関数とコンポーネントの単体テスト
2. **パフォーマンス最適化**: メモ化、遅延ロード
3. **アクセシビリティ**: ARIA属性、キーボードナビゲーション
4. **ドキュメント**: コンポーネントのプロパティ型定義とJSDoc

## 影響を受けるファイル

### フェーズ1: ユーティリティ分離
- ✅ lib/store.ts (750行 → 522行)
- ✅ lib/types.ts (新規)
- ✅ lib/utils/storage.ts (新規)
- ✅ lib/utils/validation.ts (新規)
- ✅ lib/utils/feedback.ts (新規)

### フェーズ2: コンポーネント分割
- ✅ app/page.tsx (1063行 → 49行)
- ✅ components/nodes/UniversalNode.tsx (新規)
- ✅ components/canvas/GroupBoxes.tsx (新規)
- ✅ components/canvas/EdgeContextMenu.tsx (新規)
- ✅ components/canvas/CanvasArea.tsx (新規)
- ✅ components/sidebar/Sidebar.tsx (新規)
- ✅ components/sidebar/SettingsPanel.tsx (新規)
- ✅ components/sidebar/LogPanel.tsx (新規)
- ✅ components/problem/ProblemSelector.tsx (新規)
- ✅ components/problem/ProblemModal.tsx (新規)
- ✅ components/problem/ProblemImport.tsx (新規)
- ✅ components/feedback/FeedbackPanel.tsx (新規)
- ✅ components/feedback/FeedbackSettingsPanel.tsx (新規)

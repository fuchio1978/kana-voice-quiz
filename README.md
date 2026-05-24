# ひらがな おんれんしゅう

React + TypeScript + Vite で作った、ひらがな1文字と音を結びつける練習アプリです。

## ローカル起動

```bash
npm install
npm run dev
```

## Vercel デプロイ

このアプリは静的サイトとしてそのまま Vercel に公開できます。

### いちばん簡単な方法

1. このフォルダを GitHub に push する
2. Vercel で `Add New > Project`
3. GitHub リポジトリを選ぶ
4. Framework Preset が `Vite` になっていることを確認する
5. `Deploy` を押す

### ビルド設定

- Build Command: `npm run build`
- Output Directory: `dist`

### 注意

- 音声読み上げはブラウザ機能を使います
- 音声認識はブラウザ依存です
- iPad では Safari 系の音声認識が不安定なことがあるため、保護者操作モードの併用がおすすめです

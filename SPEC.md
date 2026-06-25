# 筋トレ部位管理 仕様書

## 目的

ジムで実施したトレーニングをスマホから簡単に記録し、部位ごとの実施状況を一目で確認するためのWebアプリ。

PCでも利用できるが、主な利用環境はiPhoneなどのスマホを想定する。

## 技術構成

- React
- TypeScript
- Vite
- CSS
- PWA
- GitHub Pages
- localStorage

外部UIライブラリやサーバーは使用しない。

## 公開URL

GitHub Pagesで公開する。

```text
https://utok9550.github.io/training-parts-manager/
```

スマホではSafariで上記URLを開き、「ホーム画面に追加」してPWAとして利用する。

## データ保存

データは各端末のブラウザ内に保存する。

使用するlocalStorage key:

```text
training_logs_v1
training_logs_v1_backup
```

- `training_logs_v1` がメインデータ
- `training_logs_v1_backup` がバックアップデータ
- 起動時にメインデータが読めない場合、バックアップから復元する
- PC版、Safari版、PWA版でURLやブラウザ領域が異なる場合はデータは同期されない
- GitHub Pagesの同一URLをSafari/PWAで使う場合は、基本的に同じサイトデータを利用する

## データ構造

```ts
type TrainingLog = {
  id: string;
  date: string;
  parts: TrainingPart[];
  intensity: Intensity;
  memo: string;
};
```

### 部位

```ts
type TrainingPart =
  | "胸"
  | "肩"
  | "背中"
  | "脚"
  | "腕（二頭）"
  | "腕（三頭）";
```

### 強度

```ts
type Intensity = "軽め" | "普通" | "重め";
```

## 画面

画面上部のタブで以下を切り替える。

- 記録
- サマリー
- 履歴

## 記録画面

入力項目:

- 日付
- 実施した部位
- 強度
- メモ

保存時の動作:

- 部位が未選択の場合は保存しない
- 保存成功後、フォームを初期化する
- localStorageのメインデータとバックアップデータを更新する
- サマリーと履歴に即時反映する

## サマリー画面

部位ごとにカード表示する。

表示項目:

- 部位名
- 優先度
- 経過日数
- 直近7日回数
- 最終実施日

スマホでは全部位を一目で確認しやすいように、2列のコンパクトカードで表示する。

特に以下の数値を目立たせる。

- 経過日数の数字
- 直近7日回数の数字

## 履歴画面

記録を日付の新しい順に表示する。

履歴一覧の上部に、今日を含む直近7日間の記録状況を1行のカレンダー形式で表示する。

直近7日カレンダー:

- 7日分を横一列で表示する
- 一番右を今日の日付にする
- 各日には曜日、日付、記録あり/なし、記録がある場合は実施部位の省略表示を表示する
- 今日の日付は強調表示する
- 記録がない日は薄い表示にする
- 記録が複数ある日は、部位を重複なしでまとめて表示する
- スマホで見やすいように、7日分が画面幅に収まる表示にする

直近7日カレンダーの部位省略表示:

| 部位 | 表示 |
| --- | --- |
| 胸 | 胸 |
| 肩 | 肩 |
| 背中 | 背 |
| 脚 | 脚 |
| 腕（二頭） | 二 |
| 腕（三頭） | 三 |

表示項目:

- 日付
- 部位
- 強度
- メモ

操作:

- 各記録を削除できる
- 削除時はconfirmを表示する
- JSON形式で記録をエクスポートできる
- JSONファイルから記録をインポートできる

## 集計ルール

### 最終実施日

対象部位が `parts` に含まれる記録のうち、最新の `date`。

記録がない場合は `なし`。

### 経過日数

今日の日付から最終実施日を引いた日数。

記録がない場合は `-`。

### 直近7日回数

今日を含む直近7日間で、対象部位が `parts` に含まれる記録数。

記録がない場合は `0`。

## 優先度ルール

| 条件 | 優先度 |
| --- | --- |
| 記録なし | 最優先 |
| 直近7日回数が0 | 最優先 |
| 直近7日回数が1 かつ 経過日数が2日以上 | 高 |
| 直近7日回数が1 かつ 経過日数が1日以内 | 中 |
| 直近7日回数が2以上 | 低 |

## PWA仕様

PWA関連ファイル:

- `public/manifest.webmanifest`
- `public/sw.js`
- `public/icon.svg`
- `src/registerServiceWorker.ts`

方針:

- 本番ビルド時のみservice workerを登録する
- アプリ本体をキャッシュし、ホーム画面から起動できるようにする
- service worker更新時は最新ファイルを優先して取得する

## GitHub Pages公開仕様

GitHub Actionsで `main` または `master` へのpushを契機に自動デプロイする。

workflow:

```text
.github/workflows/deploy-pages.yml
```

デプロイ手順:

1. GitHubへpushする
2. GitHub Actionsで `Deploy GitHub Pages` が実行される
3. build jobで `npm ci` と `npm run build` を実行する
4. deploy jobでGitHub Pagesへ `dist` を公開する
5. Actionsが緑チェックになれば公開完了

## スマホ反映時の運用

アプリをスマホで使えるようにするには、変更後に必ずGitへコミットしてpushする。

基本手順:

```bat
git status --short
npm run build
git add .
git commit -m "変更内容を簡潔に説明"
git push
```

push後、GitHubのActionsタブで `Deploy GitHub Pages` が成功していることを確認する。

成功後、iPhoneで反映されない場合は以下を試す。

1. Safariで公開URLを開く
2. ページを再読み込みする
3. PWAを完全に閉じて開き直す
4. それでも反映されない場合は、少し待って再度開く

## ローカル起動

PCで開発確認する場合は以下を使う。

```bat
アプリを起動.bat
```

またはNode.js環境で直接起動する。

```bat
npm install
npm run dev
```

## 注意事項

- サーバーやログイン機能は持たない
- データ同期機能はない
- 記録は端末・ブラウザ・URL単位のlocalStorageに依存する
- Safariのサイトデータを削除すると記録も消える可能性がある
- PWAではキャッシュにより更新反映が遅れる場合がある

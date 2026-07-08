# Evidentia

エビデンスに基づく予防医学の家族向けナレッジベース。がん・心疾患・脳血管疾患・肥満の予防、
アンチエイジング、肩こり・腰痛対策、頭痛(片頭痛・緊張性頭痛、妻向け)、子ども向け(乳幼児のアレルギー予防・
感染症予防等)について、生活習慣・サプリメント・医療知識の情報を集め、信頼度を★1〜5でランク付けして蓄積する。

## なぜ作ったか

X/Facebook/ニュースなどの二次情報は多いが、真偽や根拠まで確認する時間がない。
医療ガイドラインの考え方を借りて、情報の信頼度を一目でわかる形にし、
PC/iPhoneからいつでも参照できる自分専用のハブを作る。

行動原理は「家族の健康維持のため」「健全な人的資本を守るため」。病気にならない生活習慣を、
根拠に基づいて選び取れるようにすることが目的であり、話題性やブームに左右されないことを重視する。

## 構成

```
data/
  categories.json   カテゴリ定義(7領域)
  entries.json      情報エントリー本体(このファイルが増えていく)
  items.json        食品・運動アイテムの一覧(items.htmlで使用)
docs/
  evidence-rating.md  星の付け方の基準(GRADE/Oxford CEBMベース)
  workflow.md         新しい情報を追加する時の手順
  roadmap.md          プロジェクトのロードマップ
site/
  index.html / app.js     カテゴリ別の閲覧ページ(ビルド不要)
  items.html / items.js   食品・運動別の一覧ページ
  style.css               共通スタイル
```

## 使い方

### サイトを見る

公開URL(PC/iPhoneどちらからでも、Wi-Fi/回線を問わずアクセス可能):

**https://shingoochiai-1118.github.io/evidentia/site/**

iPhoneのSafariで開き、共有メニューから「ホーム画面に追加」するとアプリのように起動できる。

更新は `git push` するとGitHub Pagesに1〜2分程度で自動反映される(GitHubアカウント: shingoochiai-1118)。

開発中にローカルで確認したい場合:

```bash
cd /Users/shingoochiai/claude_code
python3 -m http.server 8080
```

ブラウザで `http://localhost:8080/site/` を開く。

### 新しい情報を追加する

Claude Codeでこのフォルダを開いた状態で、

```
この記事を評価してEvidentiaに追加して: <URLや記事内容>
```

と頼むだけでよい。詳しい評価基準・追加手順は [docs/workflow.md](docs/workflow.md) を参照。

## 信頼度の見方

★の数が多いほど、複数の質の高いメタ解析や主要ガイドラインに裏付けられた知見。
少ない場合は観察研究や専門家意見レベルにとどまる。詳細は
[docs/evidence-rating.md](docs/evidence-rating.md)。

⚠️マークが付いた情報は「かつて信じられていたが、その後の研究で見直された定説」。

## ロードマップ

[docs/roadmap.md](docs/roadmap.md) を参照。

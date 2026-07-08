# Evidentia

エビデンスに基づく予防医学の個人用ナレッジベース。がん・心疾患・脳血管疾患・肥満の予防、
アンチエイジング、肩こり・腰痛、片頭痛(妻向け)について、生活習慣・サプリメント・医療知識の
情報を集め、信頼度を★1〜5でランク付けして蓄積する。

## なぜ作ったか

X/Facebook/ニュースなどの二次情報は多いが、真偽や根拠まで確認する時間がない。
医療ガイドラインの考え方を借りて、情報の信頼度を一目でわかる形にし、
PC/iPhoneからいつでも参照できる自分専用のハブを作る。

## 構成

```
data/
  categories.json   カテゴリ定義(6領域)
  entries.json      情報エントリー本体(このファイルが増えていく)
docs/
  evidence-rating.md  星の付け方の基準(GRADE/Oxford CEBMベース)
  workflow.md         新しい情報を追加する時の手順
  roadmap.md          プロジェクトのロードマップ
site/
  index.html / style.css / app.js   閲覧用の静的サイト(ビルド不要)
```

## 使い方

### サイトを見る

```bash
cd /Users/shingoochiai/claude_code
python3 -m http.server 8080
```

ブラウザで `http://localhost:8080/site/` を開く。

iPhoneから見る場合は、Macと同じWi-Fiに接続した状態で、Macのローカル IP アドレス
(システム設定 > Wi-Fi > 詳細 で確認、例: `192.168.1.23`)を使って
`http://192.168.1.23:8080/site/` にアクセスする。Safariの共有メニューから
「ホーム画面に追加」するとアプリのように開けるようになる。

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

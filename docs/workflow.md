# 新しい情報の追加ワークフロー

初期フェーズでは「都度Claudeに評価を依頼して手動追加」で運用する。

## 使い方(ユーザー側)

気になる記事・投稿・論文を見つけたら、Claude Code をこのプロジェクトフォルダ(`claude_code/`)で
起動して、次のように頼むだけでよい。

```
この記事を評価してEvidentiaに追加して: <URLまたは記事の内容>
```

複数まとめて渡してもよい。カテゴリを指定したい場合(例: 「これは片頭痛カテゴリで」)は一言添える。

## Claude側の手順(このプロジェクトで新規エントリーを追加する際に従うこと)

1. 元記事・投稿が「一次情報」か「二次情報」かを見極める。二次情報(ニュース記事、SNS投稿)の場合は、
   引用元の一次情報(論文・ガイドライン)まで遡って確認する。見つからない場合は `caution` にその旨を明記し、
   星は保守的に付ける。
2. `docs/evidence-rating.md` の基準に沿って星(1〜5)と `evidence_level` を決める。
3. `data/categories.json` にある6カテゴリ(cancer / cardio / obesity / antiaging / musculoskeletal / migraine)
   のいずれかに分類する。当てはまらない場合はユーザーに確認する。
4. `data/entries.json` に以下のスキーマでエントリーを追記する(配列の末尾に追加でよい、並び順はサイト側で制御される)。

```json
{
  "id": "kebab-case-の一意なID",
  "title": "結論が一目でわかる日本語タイトル",
  "category": "cancer | cardio | obesity | antiaging | musculoskeletal | migraine",
  "tags": ["タグ1", "タグ2"],
  "stars": 1〜5,
  "status": "well_established | myth_revised | under_debate",
  "evidence_level": "根拠の種類を短く(例: 大規模RCT, メタ解析, 学会ガイドラインLevel B)",
  "summary": "平易な日本語で2〜4文。何が言えて、何が言えないかを含める",
  "practical_takeaway": "生活にどう活かすかを1〜2文で",
  "caution": "注意点・限界・副作用など。無ければ空文字",
  "sources": [{ "name": "出典名", "url": "実在するURL", "type": "guideline|RCT|meta_analysis|cohort|expert_opinion|patient_guideline" }],
  "date_added": "YYYY-MM-DD",
  "last_reviewed": "YYYY-MM-DD"
}
```

5. `sources.url` は必ず実在確認したURLのみを使う。不確かな場合はWeb検索で一次情報を確認してから追加する。
6. 追加後、`site/index.html` をブラウザで開いて表示を確認する(ビルド不要、JSONを直接読み込む)。

## 将来の自動化(Phase 3)

興味領域ごとに定期リサーチのスケジュールタスクを組み、新着ガイドライン改定・大規模研究を
Claudeが週次/月次でスキャンして候補リストを作成 → ユーザーが確認して採用、という流れに拡張する。

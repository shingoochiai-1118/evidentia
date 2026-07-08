# 新しい情報の追加ワークフロー

情報の追加には2つの経路がある。

1. **都度手動**: 気になった記事をその場でClaudeに評価してもらい `data/entries.json` に直接追加(下記)
2. **週次の半自動更新**: 毎週日曜8:00に自動実行されるリサーチが `data/candidates.json` に候補を溜め、
   ユーザーが確認して採用したものだけを `data/entries.json` に昇格させる([[#週次の半自動更新]]参照)

いずれの経路でも、エントリーの評価基準・スキーマ・信頼できるソースの扱いは共通([[evidence-rating]]参照)。

## 使い方(ユーザー側・都度手動)

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
   **注意**: antiaging(アンチエイジング)・musculoskeletal(肩こり・腰痛)・migraine(片頭痛)の3カテゴリは、
   厳密な「予防」だけでなく「改善・対策」のアプローチも対象に含む。この3カテゴリで情報を探す/評価する際は、
   「発症を防ぐ」エビデンスだけに絞らず、「すでにある症状を改善する」エビデンスも同様に価値があるものとして扱う。
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
   検索対象ドメイン・検索言語の方針は [[evidence-rating]] の「優先する情報源」「検索言語の方針」を参照。
   英語で一次エビデンスを確認した上で、検診年齢や薬剤の国内承認状況など日本固有の差分がありそうな
   トピックは、日本語でも(厚労省・国立がん研究センター・各専門学会などを)確認する。
6. 追加後、`site/index.html` をブラウザで開いて表示を確認する(ビルド不要、JSONを直接読み込む)。

## 週次の半自動更新

毎週日曜8:00(Asia/Tokyo)にスケジュール済みのClaudeエージェントが本リポジトリで自動実行され、
以下を行う。

1. `data/entries.json` と `data/candidates.json` を読み、既存エントリーと重複しないテーマを選ぶ。
   6カテゴリ(cancer / cardio / obesity / antiaging / musculoskeletal / migraine)のうち、
   まだ手薄なカテゴリ([[roadmap]] Phase 1参照)を優先する。
2. Web検索で各カテゴリにつき1〜3件、一次情報(ガイドライン改定・RCT・メタ解析)ベースの候補を探す。
   検索対象ドメイン・検索言語の方針は [[evidence-rating]] を参照(英語を主軸に、検診年齢や薬剤の
   国内承認状況など日本固有の差分がありそうなトピックは日本語でも確認する)。
   二次情報しか見つからない場合はその旨を明記し、無理に候補化しない(0件でもよい)。
3. 見つけた候補を `docs/evidence-rating.md` の基準で評価し、`data/entries.json` と同じスキーマに
   `"proposed_date": "YYYY-MM-DD"` を加えた形で `data/candidates.json` に追記する
   (この時点では `data/entries.json` には書き込まない)。
4. 追加した候補の一覧(タイトル・星・一行要約)を短くまとめる。
5. 変更内容(`data/candidates.json` の更新)をコミットしてpushする。GitHub Pages上のサイトには
   まだ表示させたくないため、候補である間は `site/app.js` からは読み込まない(現状のまま)。
6. 最後に必ずPushNotificationツールで実行結果(件数・カテゴリ)を通知する。デスクトップ通知、
   Remote Control連携時はスマホにもプッシュされる。候補が0件の場合もその旨を通知する。

### ユーザーによるレビュー・採用

ユーザーは週明けなど都合の良いタイミングで、Claudeに次のように頼む。

```
今週の候補を確認して
```

Claudeは `data/candidates.json` の内容を提示し、ユーザーが「1番と3番を採用」のように答えたら、
該当エントリーから `proposed_date` を除いて `data/entries.json` に移し、`data/candidates.json` から
削除し、コミット・pushしてサイトに反映する。不採用のものは理由を一言添えて `data/candidates.json`
から削除する。

## 将来の自動化(Phase 4以降)

週次更新が安定して回るようになったら、カテゴリ別の頻度調整(手薄なカテゴリは頻度を上げる等)や、
`last_reviewed` が古いエントリーの再検証を自動リサーチに組み込むことを検討する。

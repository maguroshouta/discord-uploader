# ディスコードアップローダー

実験的にディスコードを使ったシンプルなアップローダー。  
適当に作ったので正常に動くかは不明。

# セットアップ

```
git clone https://github.com/maguroshouta/discord-uploader.git
cd discord-uploader
cp docker-compose.example.yaml docker-compose.yaml
cp .env.example .env
```

### .env の編集

https://discord.com/developers/applications でボットを作成する。  
作ったボットを任意のサーバーに入れる。

```
PRODUCTION_URL=本番環境で使用されるURL
DISCORD_BOT_TOKEN=ボットのトークン
FILE_ID_CHANNEL=ファイル情報が送信されるチャンネルのID
FILE_UPLOAD_CHANNEL=ファイルが送信されるチャンネルのID
```

### 立ち上げ

```
docker compose up -d
```

http://localhost:3000  
にアクセス

# 注意事項

これを使って起きたことはすべて自己責任。

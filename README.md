# golang-alone-hackson
Go言語勉強のため、3日間でどこまでやりきれるかやってみた
2018年の自由研究的な

※注意 いろいろ理解が及んでいなかったので、ディレクトリとか変な感じで切っています。。。（いろいろ変）

自由研究前準備として、
平日に、1h30mだけ基本文法を勉強
以下、参考サイト
http://gihyo.jp/dev/feature/01/go_4beginners
（一応、理解度は、さておき読了）

## 制作物
ユーザ管理超簡易システム
（一般的なシステムに必要なのが勉強できそうだったから、これにしました）

## 実装機能
- CRUD (UPDATE以外実装)
- 検索
- エクセル出力(即時)
- CSV出力(即時)

## 使ったモジュール
- go get github.com/go-sql-driver/mysql
- go get github.com/tealeg/xlsx
- go get github.com/djimenez/iconv-go

## 動かすための修正箇所
JSのajaxURL部分
app.goのmysqlの接続部分
を、自分のローカルに合わせて修正すると動きます
（nginxのconf等は、割愛します）

## 感想
久しぶりの静的型付言語だったので、
コンパイルエラーがよく出てきて懐かしかった笑

Echo等のライブラリを使いたかったけど、基礎理解度等低かったので、
そこまでまわらなかった・・・

ちゃんとリファクタしたかったけど、そんな時間は(ry

Goとは関係ないが、middlewareのsupervisorなど使ったことなかったので、
勉強になることが多かった

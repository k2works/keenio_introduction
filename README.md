Keen IO入門
===
# 目的
データ分析サービス[Keen IO](https://keen.io/)の利用方法をSinatraアプリを例に解説する。

# 前提
| ソフトウェア     | バージョン    | 備考         |
|:---------------|:-------------|:------------|
| OS X           |10.8.5        |             |
|           　　　|        |             |

Keen IOにサインイン済み

# 構成
+ [セットアップ](#1)
+ [プロジェクトセットアップ](#2)
+ [環境設定](#3)
+ [イベント送信](#4)
+ [データ分析と視覚化](#5)
+ [Herokuにアップする](#6)

# 詳細
## <a name="1">セットアップ</a>
### hazelでSinatraアプリを生成
```bash
$ hazel keenio_introduction
      create  keenio_introduction/config/initializers
      create  keenio_introduction/lib
      create  keenio_introduction/spec
      create  keenio_introduction/lib/.gitkeep
      create  keenio_introduction/public/stylesheets
      create  keenio_introduction/public/stylesheets/main.css
      create  keenio_introduction/public/javascripts
      create  keenio_introduction/public/javascripts/.gitkeep
      create  keenio_introduction/public/images
      create  keenio_introduction/public/images/.gitkeep
      create  keenio_introduction/public/images/hazel_icon.png
      create  keenio_introduction/public/images/hazel_small.png
      create  keenio_introduction/public/favicon.ico
      create  keenio_introduction/views
      create  keenio_introduction/views/layout.erb
      create  keenio_introduction/views/welcome.erb
      create  keenio_introduction/keenio_introduction.rb
      create  keenio_introduction/spec/keenio_introduction_spec.rb
      create  keenio_introduction/spec/spec_helper.rb
      create  keenio_introduction/config.ru
      create  keenio_introduction/Gemfile
      create  keenio_introduction/Rakefile
      create  keenio_introduction/README.md
```
### 動作確認
```bash
$ cd keenio_introduction
$ rackup config.ru
[2014-06-09 11:35:19] INFO  WEBrick 1.3.1
[2014-06-09 11:35:19] INFO  ruby 2.1.1 (2014-02-24) [x86_64-darwin12.0]
[2014-06-09 11:35:19] INFO  WEBrick::HTTPServer#start: pid=3141 port=9292
127.0.0.1 - - [09/Jun/2014 11:35:32] "GET / HTTP/1.1" 200 1829 0.0226
127.0.0.1 - - [09/Jun/2014 11:35:32] "GET /images/hazel_small.png HTTP/1.1" 200 8762 0.0025
127.0.0.1 - - [09/Jun/2014 11:35:32] "GET /stylesheets/main.css HTTP/1.1" 200 1746 0.0016
127.0.0.1 - - [09/Jun/2014 11:35:33] "GET /favicon.ico HTTP/1.1" 200 894 0.0011
```
_http://localhost:9292_にアクセスしてWelcom画面が表示されているか確認。

## <a name="2">プロジェクトセットアップ</a>
### KeenIOプロジェクトの設定
Keen IOにログインして[新しいプロジェクトを作る](https://keen.io/add-project)。  
今回は練習なので何か適当な名前をつける。（例:sandbox）
## <a name="3">環境設定</a>
### APIKeyの設定
_Procfile_の追加  
```
web: bundle exec rackup config.ru -p $PORT
```
_.env_追加
```
KEEN_PROJECT_ID=aaaaaaaaaaaaaaa
KEEN_MASTER_KEY=xxxxxxxxxxxxxxx
KEEN_WRITE_KEY=yyyyyyyyyyyyyyy
KEEN_READ_KEY=zzzzzzzzzzzzzzz
```
KeenIOプロジェクトのプロジェクトIDとAPIキーを登録する。  
なお、.envは.gitignoreに登録してレポジトリにプッシュしないようにする。  
ビューのテンプレートにAPIキー設定を追記する。  
_views/layout.erb_
```ruby
・・・
<script>
var Keen=Keen||{configure:function(e){this._cf=e},addEvent:function(e,t,n,i){this._eq=this._eq||[],this._eq.push([e,t,n,i])},setGlobalProperties:function(e){this._gp=e},onChartsReady:function(e){this._ocrq=this._ocrq||[],this._ocrq.push(e)}};(function(){var e=document.createElement("script");e.type="text/javascript",e.async=!0,e.src=("https:"==document.location.protocol?"https://":"http://")+"dc8na2hxrj29i.cloudfront.net/code/keen-2.1.0-min.js";var t=document.getElementsByTagName("script")[0];t.parentNode.insertBefore(e,t)})();

// Configure the Keen object with your Project ID and (optional) access keys.
Keen.configure({
    projectId: "<%= ENV['KEEN_PROJECT_ID'] %>",
    writeKey: "<%= ENV['KEEN_WRITE_KEY'] %>", // required for sending events
    readKey: "<%= ENV['KEEN_READ_KEY'] %>"    // required for doing analysis
});
</script>
・・・
```
再実行
```bash
$ foreman start
14:46:17 web.1  | started with pid 6469
14:46:19 web.1  | [2014-06-09 14:46:19] INFO  WEBrick 1.3.1
14:46:19 web.1  | [2014-06-09 14:46:19] INFO  ruby 2.1.1 (2014-02-24) [x86_64-darwin12.0]
14:46:19 web.1  | [2014-06-09 14:46:19] INFO  WEBrick::HTTPServer#start: pid=6469 port=5000
```
_http://localhost:5000_にアクセスしてWelcom画面が表示されているか確認。

## <a name="4">イベント送信</a>
_public/javascripts/keenio.js_
```javascript
// create an event as a JS object
var purchase = {
    category: "magical animals",
    animal_type: "pegasus",
    username: "perseus",
    payment_type: "head of medusa",
    price: 4.50
};
// add it to the "purchases" collection
Keen.addEvent("purchases", purchase);
```
_views/layout.erb_
```ruby
・・・
<script src="javascripts/keenio.js"></script>
・・・
```

## <a name="5">データ分析と視覚化</a>
_public/javascripts/keenio.js_
### アラート表示する
```javascript
Keen.onChartsReady(function() {
    var metric = new Keen.Metric("purchases", {
        analysisType: "sum",
        targetProperty: "price",
        timeframe: "this_7_days"
    });

  //Get the result of the query and alert it.
    metric.getResponse(function(response){
        alert(response.result);
    });
});
```
### 売上トータルを表示する
```javascript
Keen.onChartsReady(function() {
    var metric = new Keen.Metric("purchases", {
        analysisType: "sum",
        targetProperty: "price",
        timeframe: "this_7_days"
    });

    //Get the result of the query and alert it.
    metric.getResponse(function(response){
        alert(response.result);
    });

    metric.draw(document.getElementById("myTotalRevenueDiv"), {
        label: "Total Revenue for Last 7 Days",
        prefix: "¥"
    });
});
```
_views/welcome.erb_
```ruby
・・・
<div id="myTotalRevenueDiv"></div>
・・・
```
### 売上推移を表示する
```javascript
Keen.onChartsReady(function() {
    var series = new Keen.Series("purchases", {
        analysisType: "count",
        timeframe: "this_7_days",
        interval: "daily"
    });

    series.draw(document.getElementById("myTotalRevenueLineDiv"), {
        label: "Purchases per day for Last 7 Days"
    });
});
```
_views/welcome.erb_
```ruby
・・・
<div id="myTotalRevenueLineDiv"></div>
・・・
```
### 表示イメージ
![](https://farm4.staticflickr.com/3871/14400501153_a021563c9f.jpg)

## <a name="6">Herokuにアップする</a>


# 参照
+ [Keen IO](https://keen.io/)
+ [Hazel](http://c7.github.io/hazel/)
+ [Getting Started With Javascript](https://keen.io/docs/js-getting-started-guide/)

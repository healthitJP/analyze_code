# **グラフ描画ライブラリ 設定ファイル（config.xml）の仕様**

このドキュメントでは、グラフ描画ライブラリにおける設定ファイル`config.xml`の書き方と、その各種値について説明します。

---

## **config.xmlの基本構造**

設定ファイル`config.xml`は、以下のような構造で記述されます。

```xml
<config>
    <graphStyle>
        <graphTitle>グラフのタイトル</graphTitle>
        <legend visible="true|false"/>
        <axis>
            <xAxis title="X軸のタイトル" tickNumber="目盛り数" showLine="true|false"/>
            <yAxis title="Y軸のタイトル" tickNumber="目盛り数" showLine="true|false"/>
        </axis>
        <graphType>グラフの種類</graphType>
        <seriesName>系列名</seriesName>
    </graphStyle>
    <control zoom="1|0" pan="1|0" tooltip="1|0" locked="1|0" lockedMouse="1|0" lockedWheel="1|0" lockedTouch="1|0"/>
    <colorScheme>
        <background>背景色 (例: #ffffff)</background>
        <axisColor>軸の色 (例: #000000)</axisColor>
        <seriesColor>データ系列の色 (例: #00ff00)</seriesColor>
    </colorScheme>
</config>
```

---

## **セクション別詳細**

### 1. **<graphStyle>**
グラフ全体のスタイルを設定します。

- **<graphTitle>**
  - グラフのタイトルを指定します。
  - 値: 任意の文字列

- **<legend visible="true|false"/>**
  - 凡例の表示設定。
  - 値:
    - `true`: 表示
    - `false`: 非表示

- **<axis>**
  - X軸およびY軸の設定を指定します。
  - **<xAxis>**
    - `title`: X軸のタイトル。
    - `tickNumber`: X軸の目盛りの数。
    - `showLine`: X軸の線の表示有無。
  - **<yAxis>**
    - 設定内容はX軸と同様。

- **<graphType>**
  - グラフの種類を指定します。
  - 値:
    - `scatter`: 散布図
    - `line`: 折れ線グラフ
    - `bar`: 棒グラフ など

- **<seriesName>**
  - データ系列の名前を指定します。
  - 値: 任意の文字列

---

### 2. **<control>**
ユーザー操作の設定を指定します。

- **zoom**
  - 拡大縮小の有効化。
  - 値:
    - `1`: 有効
    - `0`: 無効

- **pan**
  - グラフの移動操作（パン）の有効化。
  - 値:
    - `1`: 有効
    - `0`: 無効

- **tooltip**
  - データポイントにツールチップを表示する設定。
  - 値:
    - `1`: 表示
    - `0`: 非表示

- **locked**
  - 操作全体をロックする設定。
  - 値:
    - `1`: ロック
    - `0`: ロック解除

- **lockedMouse**
  - マウス操作を無効化。
  - 値:
    - `1`: ロック
    - `0`: ロック解除

- **lockedWheel**
  - ホイール操作を無効化。
  - 値:
    - `1`: ロック
    - `0`: ロック解除

- **lockedTouch**
  - タッチ操作を無効化。
  - 値:
    - `1`: ロック
    - `0`: ロック解除

---

### 3. **<colorScheme>**
配色の設定を指定します。

- **<background>**
  - 背景色を指定します。
  - 値: カラーコード（例: `#ffffff`）

- **<axisColor>**
  - 軸の色を指定します。
  - 値: カラーコード（例: `#000000`）

- **<seriesColor>**
  - データ系列の色を指定します。
  - 値: カラーコード（例: `#00ff00`）

---

## **サンプルファイル**
以下は、設定ファイルのサンプルです。

```xml
<config>
    <graphStyle>
        <graphTitle>グラフタイトル</graphTitle>
        <legend visible="true"/>
        <axis>
            <xAxis title="X軸" tickNumber="10" showLine="true"/>
            <yAxis title="Y軸" tickNumber="10" showLine="true"/>
        </axis>
        <graphType>scatter</graphType>
        <seriesName>サンプルデータ</seriesName>
    </graphStyle>
    <control zoom="1" pan="1" tooltip="1" locked="0" lockedMouse="0" lockedWheel="0" lockedTouch="0"/>
    <colorScheme>
        <background>#ffffff</background>
        <axisColor>#000000</axisColor>
        <seriesColor>#00ff00</seriesColor>
    </colorScheme>
</config>
```

---

## **注意事項**
1. XMLファイルは正しい構造で記述する必要があります。
2. 各種値の形式（カラーコード、`true/false`など）を厳守してください。
3. 不正な設定値がある場合、ライブラリが正しく動作しない可能性があります。

--- 
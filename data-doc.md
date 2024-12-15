# グラフ描画ライブラリ データ入力フォーマット

このドキュメントでは、グラフ描画ソフトに入力するデータファイルの記述方法について説明します。本ソフトはXML、CSV、JSON形式のファイルをサポートしています。

## 共通仕様
- **x軸の値**: データ点のx座標。
- **y軸の値**: データ点のy座標。
- **フォーマット間の共通点**: いずれのフォーマットでも、データは順番にx軸とy軸の値を指定します。

---

## 1. CSV形式

CSV形式の入力ファイルは、以下のように記述します。

### 書式
1行目に`x軸の値`と`y軸の値`をカンマで区切って記述します。

### サンプル
```csv
10,20
15,25
20,30
25,35
30,40
```

---

## 2. JSON形式

JSON形式の入力ファイルは、配列の形式でデータを記述します。各データ点はオブジェクトとして表され、キー名は`xValue`および`yValue`とします。

### 書式
```json
{
    "data": [
        {
            "xValue": x軸の値,
            "yValue": y軸の値
        },
        ...
    ]
}
```

### サンプル
```json
{
    "data": [
        {
            "xValue": 10,
            "yValue": 20
        },
        {
            "xValue": 15,
            "yValue": 25
        },
        {
            "xValue": 20,
            "yValue": 30
        },
        {
            "xValue": 25,
            "yValue": 35
        },
        {
            "xValue": 30,
            "yValue": 40
        }
    ]
}
```

---

## 3. XML形式

XML形式の入力ファイルは、各データ点を`<entry>`要素として記述します。`xValue`および`yValue`という名前の子要素で値を指定します。

### 書式
```xml
<data>
    <entry>
        <xValue>x軸の値</xValue>
        <yValue>y軸の値</yValue>
    </entry>
    ...
</data>
```

### サンプル
```xml
<data>
    <entry>
        <xValue>10</xValue>
        <yValue>20</yValue>
    </entry>
    <entry>
        <xValue>15</xValue>
        <yValue>25</yValue>
    </entry>
    <entry>
        <xValue>20</xValue>
        <yValue>30</yValue>
    </entry>
    <entry>
        <xValue>25</xValue>
        <yValue>35</yValue>
    </entry>
    <entry>
        <xValue>30</xValue>
        <yValue>40</yValue>
    </entry>
</data>
```

---

## 注意事項
1. データの形式を正しく記述しないと、ライブラリはファイルを読み込めません。
2. 各フォーマットのキー名や要素名（例: `xValue`, `yValue`）はケースセンシティブ（大文字小文字を区別）です。
3. 各データ形式は、等価な内容を表している必要があります。

--- 
# **グラフ描画ライブラリ API ドキュメント**

このドキュメントでは、グラフ描画ライブラリのAPIについて説明します。ライブラリはブラウザ環境上で動作し、グラフ描画に必要なデータや設定をサポートします。

---

## **基本構造**
### 使用環境
1. `<script>`タグまたはローカルのES Moduleを使用してライブラリをロードします。
2. ライブラリは、指定した`<div>`要素内にCanvasを動的に生成し、グラフを描画します。

---

## **エントリーポイント**

### **`createChart(id: string): ChartObject`**
指定した`id`の`<div>`要素にグラフ描画オブジェクトを生成します。

- **引数**
  - `id`: 描画対象となる`<div>`要素のID
- **戻り値**
  - `ChartObject`: グラフの操作を行うオブジェクト

#### 使用例
```javascript
const chart = createChart('graph-container');
```

---

## **設定ファイルの読み込み**

### **`loadConfig(xmlPath: string): Promise<void>`**
外部のXML形式の設定ファイルを読み込み、グラフの設定を適用します。

- **引数**
  - `xmlPath`: XMLファイルのパス
- **戻り値**
  - `Promise<void>`

#### 使用例
```javascript
chart.loadConfig('./config.xml')
    .then(() => console.log('設定ファイルを適用しました。'))
    .catch(err => console.error('エラー: ', err));
```

---

## **データの読み込み**

### **`loadData(dataSource: string | object): Promise<void>`**
データソースを読み込んでグラフを更新します。

- **引数**
  - `dataSource`: データファイルのパスまたはデータオブジェクト
- **戻り値**
  - `Promise<void>`

#### 使用例
```javascript
chart.loadData('data.csv')
    .then(() => console.log('データを読み込みました。'))
    .catch(err => console.error('エラー: ', err));
```

---

## **グラフ描画と操作**

### **`draw(): void`**
現在の設定とデータに基づいてグラフを描画します。

#### 使用例
```javascript
chart.draw();
```

### **`setAxisLabels(xLabel: string, yLabel: string): void`**
軸ラベルを設定します。

- **引数**
  - `xLabel`: X軸のラベル
  - `yLabel`: Y軸のラベル

#### 使用例
```javascript
chart.setAxisLabels('時間 (秒)', '速度 (m/s)');
```

### **`setAxisRange(xMin: number, xMax: number, yMin: number, yMax: number): void`**
軸スケールを手動で設定します。

#### 使用例
```javascript
chart.setAxisRange(0, 100, 0, 50);
```

---

## **スタイルとテーマ**

### **`setColorScheme(scheme: object): void`**
配色テーマを変更します。

- **引数**
  - `scheme`: カラー設定オブジェクト（例: `{ background: '#fff', axisColor: '#000' }`）

#### 使用例
```javascript
chart.setColorScheme({
    background: '#f0f0f0',
    axisColor: '#333',
    seriesColor: '#ff0000'
});
```

---

## **ユーザーインタラクション**

### **`enableZoom(enable: boolean): void`**
ズーム機能を有効化または無効化します。

- **引数**
  - `enable`: ズームを有効化する場合は`true`

#### 使用例
```javascript
chart.enableZoom(true);
```

### **`enablePan(enable: boolean): void`**
パン操作を有効化または無効化します。

#### 使用例
```javascript
chart.enablePan(true);
```

### **`enableTooltip(enable: boolean): void`**
ツールチップを有効化または無効化します。

#### 使用例
```javascript
chart.enableTooltip(true);
```


---

## **エクスポート機能**

### **`exportAsImage(type: 'png' | 'jpeg', fileName?: string): void`**
現在のグラフを画像としてエクスポートします。

- **引数**
  - `type`: 画像形式（`png`または`jpeg`）
  - `fileName`: 保存するファイル名（省略時はデフォルト名）

#### 使用例
```javascript
chart.exportAsImage('png', 'graph.png');
```

---

## **エラーハンドリング**

### **`onError(callback: (error: Error) => void): void`**
エラー時に呼び出されるコールバックを設定します。

- **引数**
  - `callback`: エラー処理用の関数

#### 使用例
```javascript
chart.onError(err => {
    console.error('エラーが発生しました: ', err);
});
```

---

## **その他の機能**

### **`exportCurrentConfig(fileName?: string): void`**
現在の設定をXML形式でダウンロードします。

#### 使用例
```javascript
chart.exportCurrentConfig("config.xml");
```

### **`exportCurrentDataAsCSV(fileName?: string): void`**
現在のデータをCSVでダウンロードします。

#### 使用例
```javascript
chart.exportCurrentDataAsCSV("data.csv");
```

### **`exportCurrentDataAsJSON(fileName?: string): void`**
現在のデータをJSONでダウンロードします。

#### 使用例
```javascript
chart.exportCurrentDataAsJSON("data.json");
```

### **`exportCurrentDataAsXML(fileName?: string): void`**
現在のデータをXMLでダウンロードします。

#### 使用例
```javascript
chart.exportCurrentDataAsXML("data.xml");
```

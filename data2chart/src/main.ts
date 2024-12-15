type ChartConfig = {
  graphStyle: {
    graphTitle: string;
    legend: { visible: boolean };
    axis: {
      xAxis: { title: string; tickInterval: number; showLine: boolean; min?: number; max?: number };
      yAxis: { title: string; tickInterval: number; showLine: boolean; min?: number; max?: number };
    };
    graphType: string;
  };
  eventListeners: {
    zoom: { enabled: boolean };
    pan: { enabled: boolean };
    tooltip: { enabled: boolean };
    locked: { enabled: boolean };
    lockedKeyboard: { enabled: boolean };
    lockedMouse: { enabled: boolean };
    lockedWheel: { enabled: boolean };
  };
  dataFormat: {
    columnMapping: object;
    dateFormat: string;
    numberFormat: string;
  };
  colorScheme: {
    background: string;
    axisColor: string;
    seriesColors: string[];
  };
  fontAndLabels: object;
};

type ChartData = {
  value1: number;
  value2: number;
  value3: number;
};

class ChartObject {
  private config: ChartConfig;
  private data: ChartData[];
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;

  constructor(id: string) {
    const container = document.getElementById(id);
    if (!container) {
      throw new Error(`Element with id ${id} not found`);
    }

    this.canvas = document.createElement('canvas');
    container.appendChild(this.canvas);
    this.context = this.canvas.getContext('2d') as CanvasRenderingContext2D;

    this.config = {
      graphStyle: {
        graphTitle: '',
        legend: { visible: true },
        axis: {
          xAxis: { title: 'X Axis', tickInterval: 10, showLine: true },
          yAxis: { title: 'Y Axis', tickInterval: 10, showLine: true }
        },
        graphType: 'line'
      },
      eventListeners: {
        zoom: { enabled: true },
        pan: { enabled: true },
        tooltip: { enabled: true },
        locked: { enabled: false },
        lockedKeyboard: { enabled: false },
        lockedMouse: { enabled: false },
        lockedWheel: { enabled: false }
      },
      dataFormat: {
        columnMapping: {},
        dateFormat: '',
        numberFormat: ''
      },
      colorScheme: {
        background: '#ffffff',
        axisColor: '#000000',
        seriesColors: ['#ff0000', '#00ff00', '#0000ff']
      },
      fontAndLabels: {}
    };

    this.data = [];
  }

  async loadConfig(xmlPath: string): Promise<void> {
    try {
      const response = await fetch(xmlPath);
      const xmlText = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'application/xml');

      // Parse XML and update config
      const graphStyle = xmlDoc.getElementsByTagName('graphStyle')[0];
      this.config.graphStyle.legend.visible = graphStyle.getElementsByTagName('legend')[0].getAttribute('visible') === 'true';
      this.config.graphStyle.axis.xAxis.title = graphStyle.getElementsByTagName('xAxis')[0].getAttribute('title') || '';
      this.config.graphStyle.axis.xAxis.tickInterval = parseInt(graphStyle.getElementsByTagName('xAxis')[0].getAttribute('tickInterval') || '10', 10);
      this.config.graphStyle.axis.xAxis.showLine = graphStyle.getElementsByTagName('xAxis')[0].getAttribute('showLine') === 'true';
      this.config.graphStyle.axis.yAxis.title = graphStyle.getElementsByTagName('yAxis')[0].getAttribute('title') || '';
      this.config.graphStyle.axis.yAxis.tickInterval = parseInt(graphStyle.getElementsByTagName('yAxis')[0].getAttribute('tickInterval') || '10', 10);
      this.config.graphStyle.axis.yAxis.showLine = graphStyle.getElementsByTagName('yAxis')[0].getAttribute('showLine') === 'true';
      this.config.graphStyle.graphType = graphStyle.getElementsByTagName('graphType')[0].textContent || 'line';

      const eventListeners = xmlDoc.getElementsByTagName('eventListeners')[0];
      this.config.eventListeners.zoom.enabled = eventListeners.getElementsByTagName('zoom')[0].getAttribute('enabled') === 'true';
      this.config.eventListeners.pan.enabled = eventListeners.getElementsByTagName('pan')[0].getAttribute('enabled') === 'true';
      this.config.eventListeners.tooltip.enabled = eventListeners.getElementsByTagName('tooltip')[0].getAttribute('enabled') === 'true';
      this.config.eventListeners.locked.enabled = eventListeners.getElementsByTagName('locked')[0].getAttribute('enabled') === 'false';
      this.config.eventListeners.lockedKeyboard.enabled = eventListeners.getElementsByTagName('lockedKeyboard')[0].getAttribute('enabled') === 'false';
      this.config.eventListeners.lockedMouse.enabled = eventListeners.getElementsByTagName('lockedMouse')[0].getAttribute('enabled') === 'false';
      this.config.eventListeners.lockedWheel.enabled = eventListeners.getElementsByTagName('lockedWheel')[0].getAttribute('enabled') === 'false';

      const colorScheme = xmlDoc.getElementsByTagName('colorScheme')[0];
      this.config.colorScheme.background = colorScheme.getElementsByTagName('background')[0].textContent || '#ffffff';
      this.config.colorScheme.axisColor = colorScheme.getElementsByTagName('axisColor')[0].textContent || '#000000';
      const seriesColors = colorScheme.getElementsByTagName('seriesColors')[0].getElementsByTagName('color');
      this.config.colorScheme.seriesColors = Array.from(seriesColors).map(color => color.textContent || '');

      // Update other config sections as needed
      // ...
    } catch (error) {
      console.error('Error in loadConfig:', error);
    }
  }

  async loadData(dataSource: string | object): Promise<void> {
    if (typeof dataSource === 'string') {
      const response = await fetch(dataSource);
      const dataText = await response.text();
      if (dataSource.endsWith('.csv')) {
        this.data = this.parseCSV(dataText);
      } else if (dataSource.endsWith('.json')) {
        this.data = JSON.parse(dataText);
      } else if (dataSource.endsWith('.xml')) {
        this.data = this.parseXML(dataText);
      }
    } else {
      this.data = dataSource as ChartData[];
    }

    // Determine axis ranges with some padding
    const yValues = this.data.map(d => d.value1);
    const yMin = Math.min(...yValues);
    const yMax = Math.max(...yValues);
    const yRange = yMax - yMin;
    const padding = yRange * 0.1; // 10% padding

    this.config.graphStyle.axis.yAxis.min = yMin < 0 ? yMin - padding : 0;
    this.config.graphStyle.axis.yAxis.max = yMax + padding;

    this.draw();
  }

  private parseCSV(csvText: string): ChartData[] {
    const lines = csvText.split('\n');
    const result: ChartData[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      result.push({
        value1: parseFloat(values[0]),
        value2: parseFloat(values[1]),
        value3: parseFloat(values[2])
      });
    }
    return result;
  }

  private parseXML(xmlText: string): ChartData[] {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'application/xml');
    const entries = xmlDoc.getElementsByTagName('entry');
    const result: ChartData[] = [];
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      result.push({
        value1: parseFloat(entry.getElementsByTagName('value1')[0].textContent || '0'),
        value2: parseFloat(entry.getElementsByTagName('value2')[0].textContent || '0'),
        value3: parseFloat(entry.getElementsByTagName('value3')[0].textContent || '0')
      });
    }
    return result;
  }

  draw(): void {
    // Clear canvas
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Set background color
    this.context.fillStyle = this.config.colorScheme.background;
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw axes
    this.context.strokeStyle = this.config.colorScheme.axisColor;
    this.context.beginPath();
    this.context.moveTo(50, 0);
    this.context.lineTo(50, this.canvas.height - 50);
    this.context.lineTo(this.canvas.width, this.canvas.height - 50);
    this.context.stroke();

    // Draw axis labels
    this.context.fillStyle = this.config.colorScheme.axisColor;
    this.context.font = '16px Arial';
    this.context.fillText(this.config.graphStyle.axis.xAxis.title, this.canvas.width / 2, this.canvas.height - 10);
    this.context.save();
    this.context.rotate(-Math.PI / 2);
    this.context.fillText(this.config.graphStyle.axis.yAxis.title, -this.canvas.height / 2, 20);
    this.context.restore();

    // Determine axis ranges
    const xMin = this.config.graphStyle.axis.xAxis.min ?? 0;
    const xMax = this.config.graphStyle.axis.xAxis.max ?? this.data.length - 1;
    const yMin = this.config.graphStyle.axis.yAxis.min ?? Math.min(...this.data.map(d => d.value1));
    const yMax = this.config.graphStyle.axis.yAxis.max ?? Math.max(...this.data.map(d => d.value1));

    // Draw data
    this.context.strokeStyle = this.config.colorScheme.seriesColors[0];
    this.context.beginPath();
    this.context.moveTo(
      50 + ((0 - xMin) / (xMax - xMin)) * (this.canvas.width - 100),
      this.canvas.height - 50 - ((this.data[0].value1 - yMin) / (yMax - yMin)) * (this.canvas.height - 100)
    );
    for (let i = 1; i < this.data.length; i++) {
      this.context.lineTo(
        50 + ((i - xMin) / (xMax - xMin)) * (this.canvas.width - 100),
        this.canvas.height - 50 - ((this.data[i].value1 - yMin) / (yMax - yMin)) * (this.canvas.height - 100)
      );
    }
    this.context.stroke();

    // Draw legend if visible
    if (this.config.graphStyle.legend.visible) {
      this.context.fillStyle = this.config.colorScheme.seriesColors[0];
      this.context.fillRect(this.canvas.width - 150, 10, 10, 10);
      this.context.fillStyle = this.config.colorScheme.axisColor;
      this.context.fillText('Series 1', this.canvas.width - 130, 20);
    }

    // Draw title
    this.context.fillStyle = this.config.colorScheme.axisColor;
    this.context.font = '20px Arial';
    this.context.fillText(this.config.graphStyle.graphTitle, this.canvas.width / 2 - this.context.measureText(this.config.graphStyle.graphTitle).width / 2, 30);
  }

  setAxisLabels(xLabel: string, yLabel: string): void {
    this.config.graphStyle.axis.xAxis.title = xLabel;
    this.config.graphStyle.axis.yAxis.title = yLabel;
    this.draw();
  }

  setAxisRange(xMin: number, xMax: number, yMin: number, yMax: number): void {
    // Assuming axis range is used in drawing logic
    this.config.graphStyle.axis.xAxis.min = xMin;
    this.config.graphStyle.axis.xAxis.max = xMax;
    this.config.graphStyle.axis.yAxis.min = yMin;
    this.config.graphStyle.axis.yAxis.max = yMax;
    this.draw();
  }

  showLegend(show: boolean): void {
    this.config.graphStyle.legend.visible = show;
    this.draw();
  }

  setTitle(title: string): void {
    // Assuming title is used in drawing logic
    this.config.graphStyle.graphTitle = title;
    this.draw();
  }

  setColorScheme(scheme: { background: string; axisColor: string; seriesColors: string[] }): void {
    this.config.colorScheme = scheme;
    this.draw();
  }

  enableZoom(enable: boolean): void {
    this.config.eventListeners.zoom.enabled = enable;
  }

  enablePan(enable: boolean): void {
    this.config.eventListeners.pan.enabled = enable;
  }

  enableTooltip(enable: boolean): void {
    this.config.eventListeners.tooltip.enabled = enable;
  }

  setMargins(margins: { top: number; right: number; bottom: number; left: number }): void {
    // Assuming margins are used in drawing logic
    this.config.fontAndLabels = { ...this.config.fontAndLabels, margins };
    this.draw();
  }

  exportAsImage(type: 'png' | 'jpeg', fileName?: string): void {
    const link = document.createElement('a');
    link.href = this.canvas.toDataURL(`image/${type}`);
    link.download = fileName || `chart.${type}`;
    link.click();
  }

  getCurrentConfig(): object {
    return this.config;
  }

  getCurrentData(): object {
    return this.data;
  }

  exportCurrentConfig(fileName: string = 'config.json'): void {
    const configBlob = new Blob([JSON.stringify(this.getCurrentConfig(), null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(configBlob);
    link.download = fileName;
    link.click();
  }

  exportCurrentDataAsJSON(fileName: string = 'data.json'): void {
    const dataBlob = new Blob([JSON.stringify(this.getCurrentData(), null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = fileName;
    link.click();
  }

  exportCurrentDataAsCSV(fileName: string = 'data.csv'): void {
    const csvContent = 'value1,value2,value3\n' + this.data.map(d => `${d.value1},${d.value2},${d.value3}`).join('\n');
    const csvBlob = new Blob([csvContent], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(csvBlob);
    link.download = fileName;
    link.click();
  }

  exportCurrentDataAsXML(fileName: string = 'data.xml'): void {
    const xmlContent = `<data>\n` + this.data.map(d => `  <entry>\n    <value1>${d.value1}</value1>\n    <value2>${d.value2}</value2>\n    <value3>${d.value3}</value3>\n  </entry>`).join('\n') + `\n</data>`;
    const xmlBlob = new Blob([xmlContent], { type: 'application/xml' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(xmlBlob);
    link.download = fileName;
    link.click();
  }

  onError(callback: (error: Error) => void): void {
    window.addEventListener('error', (event) => {
      callback(event.error);
    });
  }
}

export function createChart(id: string): ChartObject {
  return new ChartObject(id);
}
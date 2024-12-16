type ChartConfig = {
  graphStyle: {
    graphTitle: string;
    legend: { visible: boolean };
    axis: {
      xAxis: { title: string; tickNumber: number; showLine: boolean; min: number; max: number };
      yAxis: { title: string; tickNumber: number; showLine: boolean; min: number; max: number };
    };
    graphType: 'line' | 'scatter';
    seriesName: string;
  };
  control: {
    zoom: boolean;
    pan: boolean;
    tooltip: boolean;
    locked: boolean;
    lockedMouse: boolean;
    lockedWheel: boolean;
    lockedTouch: boolean;
  };
  colorScheme: {
    background: string;
    axisColor: string;
    seriesColor: string;
  };
};

type ChartData = {
  xValue: number;
  yValue: number;
};

class ChartObject {
  #config: ChartConfig;
  #data: ChartData[];
  #canvas: HTMLCanvasElement;
  #context: CanvasRenderingContext2D;
  #lastPinchDistance: number | null = null;
  constructor(id: string) {
    const container = document.getElementById(id);
    if (!container) {
      throw new Error(`Element with id ${id} not found`);
    }

    this.#canvas = document.createElement('canvas');

    this.#canvas.width = container.clientWidth;
    this.#canvas.height = container.clientHeight;
    container.appendChild(this.#canvas);

    this.#context = this.#canvas.getContext('2d') as CanvasRenderingContext2D;

    this.#config = {
      graphStyle: {
        graphTitle: '',
        legend: { visible: true },
        axis: {
          xAxis: { title: 'X Axis', tickNumber: 10, showLine: true, min: 0, max: 100 },
          yAxis: { title: 'Y Axis', tickNumber: 10, showLine: true, min: 0, max: 100 }
        },
        graphType: 'line',
        seriesName: 'Series 1'
      },
      control: {
        zoom: true,
        pan: true,
        tooltip: true,
        locked: false,
        lockedMouse: false,
        lockedWheel: false,
        lockedTouch: false,
      },
      colorScheme: {
        background: '#ffffff',
        axisColor: '#000000',
        seriesColor: '#ff0000'
      },
    };

    this.#data = [];

    this.#canvas.addEventListener('wheel', this.handleZoom.bind(this));
    this.#canvas.addEventListener('mousedown', this.startPan.bind(this));
    this.#canvas.addEventListener('mouseup', this.endPan.bind(this));
    this.#canvas.addEventListener('mousemove', this.handlePan.bind(this));
    this.#canvas.addEventListener('mousemove', this.showTooltip.bind(this));
    this.#canvas.addEventListener('touchstart', this.startPanTouch.bind(this));
    this.#canvas.addEventListener('touchend', this.endPanTouch.bind(this));
    this.#canvas.addEventListener('touchmove', this.handlePanTouch.bind(this));
    this.#canvas.addEventListener('touchstart', this.handlePinchZoom.bind(this));
    this.#canvas.addEventListener('touchmove', this.handlePinchZoom.bind(this));
    this.#canvas.addEventListener('touchend', this.resetPinchZoom.bind(this));

    // Create tooltip element
    const tooltip = document.createElement('div');
    tooltip.id = 'tooltip';
    tooltip.style.position = 'absolute';
    tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    tooltip.style.color = '#fff';
    tooltip.style.padding = '5px';
    tooltip.style.borderRadius = '3px';
    tooltip.style.pointerEvents = 'none';
    tooltip.style.display = 'none';
    document.body.appendChild(tooltip);
  }

  async loadConfig(xmlPath: string): Promise<void> {
    const response = await fetch(xmlPath);
    const xmlText = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'application/xml');

    // Parse XML and update config
    const graphStyle = xmlDoc.getElementsByTagName('graphStyle')[0];
    if (graphStyle) {
      this.#config.graphStyle.graphTitle = graphStyle.getElementsByTagName('graphTitle')[0]?.textContent || this.#config.graphStyle.graphTitle;
      this.#config.graphStyle.legend.visible = graphStyle.getElementsByTagName('legend')[0]?.getAttribute('visible') === 'true' || this.#config.graphStyle.legend.visible;
      this.#config.graphStyle.axis.xAxis.title = graphStyle.getElementsByTagName('xAxis')[0]?.getAttribute('title') || this.#config.graphStyle.axis.xAxis.title;
      this.#config.graphStyle.axis.xAxis.tickNumber = parseInt(graphStyle.getElementsByTagName('xAxis')[0]?.getAttribute('tickNumber') || this.#config.graphStyle.axis.xAxis.tickNumber.toString(), 10);
      this.#config.graphStyle.axis.xAxis.showLine = graphStyle.getElementsByTagName('xAxis')[0]?.getAttribute('showLine') === 'true' || this.#config.graphStyle.axis.xAxis.showLine;
      this.#config.graphStyle.axis.yAxis.title = graphStyle.getElementsByTagName('yAxis')[0]?.getAttribute('title') || this.#config.graphStyle.axis.yAxis.title;
      this.#config.graphStyle.axis.yAxis.tickNumber = parseInt(graphStyle.getElementsByTagName('yAxis')[0]?.getAttribute('tickNumber') || this.#config.graphStyle.axis.yAxis.tickNumber.toString(), 10);
      this.#config.graphStyle.axis.yAxis.showLine = graphStyle.getElementsByTagName('yAxis')[0]?.getAttribute('showLine') === 'true' || this.#config.graphStyle.axis.yAxis.showLine;
      this.#config.graphStyle.graphType = (graphStyle.getElementsByTagName('graphType')[0]?.textContent as 'line' | 'scatter') || this.#config.graphStyle.graphType;
      this.#config.graphStyle.seriesName = graphStyle.getElementsByTagName('seriesName')[0]?.textContent || this.#config.graphStyle.seriesName;
    }

    const control = xmlDoc.getElementsByTagName('control')[0];
    if (control) {
      this.#config.control.zoom = control.getAttribute('zoom') === 'true' || this.#config.control.zoom;
      this.#config.control.pan = control.getAttribute('pan') === 'true' || this.#config.control.pan;
      this.#config.control.tooltip = control.getAttribute('tooltip') === 'true' || this.#config.control.tooltip;
      this.#config.control.locked = control.getAttribute('locked') === 'true' || this.#config.control.locked;
      this.#config.control.lockedMouse = control.getAttribute('lockedMouse') === 'true' || this.#config.control.lockedMouse;
      this.#config.control.lockedWheel = control.getAttribute('lockedWheel') === 'true' || this.#config.control.lockedWheel;
      this.#config.control.lockedTouch = control.getAttribute('lockedTouch') === 'true' || this.#config.control.lockedTouch;
    }

    const colorScheme = xmlDoc.getElementsByTagName('colorScheme')[0];
    if (colorScheme) {
      this.#config.colorScheme.background = colorScheme.getElementsByTagName('background')[0]?.textContent || this.#config.colorScheme.background;
      this.#config.colorScheme.axisColor = colorScheme.getElementsByTagName('axisColor')[0]?.textContent || this.#config.colorScheme.axisColor;
      this.#config.colorScheme.seriesColor = colorScheme.getElementsByTagName('seriesColor')[0]?.textContent || this.#config.colorScheme.seriesColor;
    }

    // Update other config sections as needed
    // ...
  }

  async loadData(dataSource: string | object): Promise<void> {
    if (typeof dataSource === 'string') {
      const response = await fetch(dataSource);
      const dataText = await response.text();
      if (dataSource.endsWith('.csv')) {
        this.#data = this.parseCSV(dataText);
      } else if (dataSource.endsWith('.json')) {
        this.#data = JSON.parse(dataText);
      } else if (dataSource.endsWith('.xml')) {
        this.#data = this.parseXML(dataText);
      }
    } else {
      this.#data = dataSource as ChartData[];
    }
    // Determine axis ranges with some padding
    const xValues = this.#data.map(d => d.xValue);
    const xMin = Math.min(...xValues);
    const xMax = Math.max(...xValues);
    const xRange = xMax - xMin;
    const xPadding = xRange * 0.1; // 10% padding

    this.#config.graphStyle.axis.xAxis.min = xMin < 0 ? xMin - xPadding : 0;
    this.#config.graphStyle.axis.xAxis.max = xMax + xPadding;

    // Determine axis ranges with some padding
    const yValues = this.#data.map(d => d.yValue);
    const yMin = Math.min(...yValues);
    const yMax = Math.max(...yValues);
    const yRange = yMax - yMin;
    const yPadding = yRange * 0.1; // 10% padding

    this.#config.graphStyle.axis.yAxis.min = yMin < 0 ? yMin - yPadding : 0;
    this.#config.graphStyle.axis.yAxis.max = yMax + yPadding;

    this.draw();
  }

  private parseCSV(csvText: string): ChartData[] {
    const lines = csvText.split('\n');
    const result: ChartData[] = [];
    for (let i = 0; i < lines.length; i++) {
      const values = lines[i].split(',');
      result.push({
        xValue: parseFloat(values[0]),
        yValue: parseFloat(values[1]),
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
        xValue: parseFloat(entry.getElementsByTagName('xValue')[0].textContent || '0'),
        yValue: parseFloat(entry.getElementsByTagName('yValue')[0].textContent || '0'),
      });
    }
    return result;
  }

  #xMargin = 70;
  #yMargin = 50;
  draw(): void {
    // Clear canvas
    this.#context.clearRect(0, 0, this.#canvas.width, this.#canvas.height);

    // Set background color
    this.#context.fillStyle = this.#config.colorScheme.background;
    this.#context.fillRect(0, 0, this.#canvas.width, this.#canvas.height);

    // Draw axes
    this.#context.strokeStyle = this.#config.colorScheme.axisColor;
    this.#context.beginPath();
    this.#context.moveTo(this.#xMargin, 0);
    this.#context.lineTo(this.#xMargin, this.#canvas.height - this.#yMargin);
    this.#context.lineTo(this.#canvas.width, this.#canvas.height - this.#yMargin);
    this.#context.stroke();

    // Draw axis labels
    this.#context.fillStyle = this.#config.colorScheme.axisColor;
    this.#context.font = '16px Arial';
    this.#context.fillText(this.#config.graphStyle.axis.xAxis.title, this.#canvas.width / 2, this.#canvas.height - 10);
    this.#context.save();
    this.#context.rotate(-Math.PI / 2);
    this.#context.fillText(this.#config.graphStyle.axis.yAxis.title, -this.#canvas.height / 2, 20);
    this.#context.restore();

    // Determine axis ranges
    const xMin = this.#config.graphStyle.axis.xAxis.min;
    const xMax = this.#config.graphStyle.axis.xAxis.max;
    const yMin = this.#config.graphStyle.axis.yAxis.min;
    const yMax = this.#config.graphStyle.axis.yAxis.max;

    // Draw x-axis ticks and labels
    const xTickNumber = this.#config.graphStyle.axis.xAxis.tickNumber;
    for (let x = xMin; x <= xMax + (xMax - xMin) / Math.max(xTickNumber, 1); x += (xMax - xMin) / Math.max(xTickNumber, 1)) {
      const xPos = this.#xMargin + ((x - xMin) / (xMax - xMin)) * (this.#canvas.width - 100);
      this.#context.beginPath();
      this.#context.moveTo(xPos, this.#canvas.height - this.#yMargin);
      this.#context.lineTo(xPos, this.#canvas.height - this.#yMargin + 5);
      this.#context.stroke();
      this.#context.fillText(x.toPrecision(3).toString(), xPos - 5, this.#canvas.height - 30);
    }

    // Draw y-axis ticks and labels
    const yTickNumber = this.#config.graphStyle.axis.yAxis.tickNumber;
    for (let y = yMin; y <= yMax + (yMax - yMin) / Math.max(yTickNumber, 1); y += (yMax - yMin) / Math.max(yTickNumber, 1)) {
      const yPos = this.#canvas.height - this.#yMargin - ((y - yMin) / (yMax - yMin)) * (this.#canvas.height - 100);
      this.#context.beginPath();
      this.#context.moveTo(this.#xMargin, yPos);
      this.#context.lineTo(this.#xMargin - 5, yPos);
      this.#context.stroke();
      this.#context.fillText(y.toPrecision(3).toString(), 25, yPos + 5);
    }

    // Draw data
    if (this.#config.graphStyle.graphType === 'line') {
      this.#context.strokeStyle = this.#config.colorScheme.seriesColor;
      this.#context.beginPath();
      this.#context.moveTo(
        this.#xMargin + ((this.#data[0].xValue - xMin) / (xMax - xMin)) * (this.#canvas.width - 100),
        this.#canvas.height - this.#yMargin - ((this.#data[0].yValue - yMin) / (yMax - yMin)) * (this.#canvas.height - 100)
      );
      for (let i = 1; i < this.#data.length; i++) {
        this.#context.lineTo(
          this.#xMargin + ((this.#data[i].xValue - xMin) / (xMax - xMin)) * (this.#canvas.width - 100),
          this.#canvas.height - this.#yMargin - ((this.#data[i].yValue - yMin) / (yMax - yMin)) * (this.#canvas.height - 100)
        );
      }
      this.#context.stroke();
    } else if (this.#config.graphStyle.graphType === 'scatter') {
      this.#context.fillStyle = this.#config.colorScheme.seriesColor;
      for (let i = 0; i < this.#data.length; i++) {
        const xPos = this.#xMargin + ((this.#data[i].xValue - xMin) / (xMax - xMin)) * (this.#canvas.width - 100);
        const yPos = this.#canvas.height - this.#yMargin - ((this.#data[i].yValue - yMin) / (yMax - yMin)) * (this.#canvas.height - 100);
        this.#context.beginPath();
        this.#context.arc(xPos, yPos, 3, 0, 2 * Math.PI);
        this.#context.fill();
      }
    }

    // Draw legend if visible
    if (this.#config.graphStyle.legend.visible) {
      this.#context.fillStyle = this.#config.colorScheme.seriesColor;
      this.#context.fillRect(this.#canvas.width - 150, 10, 10, 10);
      this.#context.fillStyle = this.#config.colorScheme.axisColor;
      this.#context.fillText(this.#config.graphStyle.seriesName, this.#canvas.width - 130, 20);
    }

    // Draw title
    this.#context.fillStyle = this.#config.colorScheme.axisColor;
    this.#context.font = '20px Arial';
    this.#context.fillText(this.#config.graphStyle.graphTitle, this.#canvas.width / 2 - this.#context.measureText(this.#config.graphStyle.graphTitle).width / 2, 30);
  }

  setAxisLabels(xLabel: string, yLabel: string): void {
    this.#config.graphStyle.axis.xAxis.title = xLabel;
    this.#config.graphStyle.axis.yAxis.title = yLabel;
    this.draw();
  }

  setAxisRange(xMin: number, xMax: number, yMin: number, yMax: number): void {
    // Assuming axis range is used in drawing logic
    this.#config.graphStyle.axis.xAxis.min = xMin;
    this.#config.graphStyle.axis.xAxis.max = xMax;
    this.#config.graphStyle.axis.yAxis.min = yMin;
    this.#config.graphStyle.axis.yAxis.max = yMax;
    this.draw();
  }

  showLegend(show: boolean): void {
    this.#config.graphStyle.legend.visible = show;
    this.draw();
  }

  setTitle(title: string): void {
    // Assuming title is used in drawing logic
    this.#config.graphStyle.graphTitle = title;
    this.draw();
  }

  setColorScheme(scheme: { background: string; axisColor: string; seriesColor: string }): void {
    this.#config.colorScheme = scheme;
    this.draw();
  }

  enableZoom(enable: boolean): void {
    this.#config.control.zoom = enable;
  }

  private handleZoom(event: WheelEvent): void {
    if (!this.#config.control.zoom || this.#config.control.locked || this.#config.control.lockedWheel) return;

    event.preventDefault();
    const zoomFactor = 1.1;
    const scale = event.deltaY > 0 ? zoomFactor : 1 / zoomFactor; // Reverse the zoom direction
    const rect = this.#canvas.getBoundingClientRect();
    const offsetX = (event.clientX - rect.left) / this.#canvas.width;
    const offsetY = (event.clientY - rect.top) / this.#canvas.height;

    const xRange = this.#config.graphStyle.axis.xAxis.max - this.#config.graphStyle.axis.xAxis.min;
    const yRange = this.#config.graphStyle.axis.yAxis.max - this.#config.graphStyle.axis.yAxis.min;

    this.#config.graphStyle.axis.xAxis.min += xRange * (1 - scale) * offsetX;
    this.#config.graphStyle.axis.xAxis.max -= xRange * (1 - scale) * (1 - offsetX);
    this.#config.graphStyle.axis.yAxis.min += yRange * (1 - scale) * offsetY;
    this.#config.graphStyle.axis.yAxis.max -= yRange * (1 - scale) * (1 - offsetY);

    this.draw();
  }

  private handlePinchZoom(event: TouchEvent): void {
    if (!this.#config.control.zoom || this.#config.control.locked || this.#config.control.lockedTouch) return;

    if (event.touches.length === 2) {
      event.preventDefault();
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];

      const currentDistance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) + Math.pow(touch2.clientY - touch1.clientY, 2)
      );

      if (this.#lastPinchDistance) {
        const scale = this.#lastPinchDistance / currentDistance; // Reverse the zoom direction
        const rect = this.#canvas.getBoundingClientRect();
        const offsetX = ((touch1.clientX + touch2.clientX) / 2 - rect.left) / this.#canvas.width;
        const offsetY = ((touch1.clientY + touch2.clientY) / 2 - rect.top) / this.#canvas.height;

        const xRange = this.#config.graphStyle.axis.xAxis.max - this.#config.graphStyle.axis.xAxis.min;
        const yRange = this.#config.graphStyle.axis.yAxis.max - this.#config.graphStyle.axis.yAxis.min;

        this.#config.graphStyle.axis.xAxis.min += xRange * (1 - scale) * offsetX;
        this.#config.graphStyle.axis.xAxis.max -= xRange * (1 - scale) * (1 - offsetX);
        this.#config.graphStyle.axis.yAxis.min += yRange * (1 - scale) * offsetY;
        this.#config.graphStyle.axis.yAxis.max -= yRange * (1 - scale) * (1 - offsetY);

        this.draw();
      }

      this.#lastPinchDistance = currentDistance;
    }
  }

  private resetPinchZoom(): void {
    this.#lastPinchDistance = null;
  }

  enablePan(enable: boolean): void {
    this.#config.control.pan = enable;
  }
  #isPanning = false;
  #panStartX = 0;
  #panStartY = 0;

  private startPan(event: MouseEvent): void {
    if (!this.#config.control.pan || this.#config.control.locked || this.#config.control.lockedMouse) return;

    this.#isPanning = true;
    this.#panStartX = event.clientX;
    this.#panStartY = event.clientY;
  }

  private endPan(): void {
    this.#isPanning = false;
  }
  private handlePan(event: MouseEvent): void {
    if (!this.#isPanning || !this.#config.control.pan || this.#config.control.locked || this.#config.control.lockedMouse) return;

    const dx = event.clientX - this.#panStartX;
    const dy = event.clientY - this.#panStartY;

    const xRange = this.#config.graphStyle.axis.xAxis.max - this.#config.graphStyle.axis.xAxis.min;
    const yRange = this.#config.graphStyle.axis.yAxis.max - this.#config.graphStyle.axis.yAxis.min;

    const xShift = (dx / this.#canvas.width) * xRange;
    const yShift = (dy / this.#canvas.height) * yRange;

    this.#config.graphStyle.axis.xAxis.min -= xShift;
    this.#config.graphStyle.axis.xAxis.max -= xShift;
    this.#config.graphStyle.axis.yAxis.min += yShift;
    this.#config.graphStyle.axis.yAxis.max += yShift;

    this.#panStartX = event.clientX;
    this.#panStartY = event.clientY;

    this.draw();
  }

  private startPanTouch(event: TouchEvent): void {
    if (!this.#config.control.pan || this.#config.control.locked || this.#config.control.lockedTouch) return;

    this.#isPanning = true;
    this.#panStartX = event.touches[0].clientX;
    this.#panStartY = event.touches[0].clientY;
  }

  private endPanTouch(): void {
    this.#isPanning = false;
  }

  private handlePanTouch(event: TouchEvent): void {
    if (!this.#isPanning || !this.#config.control.pan || this.#config.control.locked || this.#config.control.lockedTouch) return;

    const dx = event.touches[0].clientX - this.#panStartX;
    const dy = event.touches[0].clientY - this.#panStartY;

    const xRange = this.#config.graphStyle.axis.xAxis.max - this.#config.graphStyle.axis.xAxis.min;
    const yRange = this.#config.graphStyle.axis.yAxis.max - this.#config.graphStyle.axis.yAxis.min;

    const xShift = (dx / this.#canvas.width) * xRange;
    const yShift = (dy / this.#canvas.height) * yRange;

    this.#config.graphStyle.axis.xAxis.min -= xShift;
    this.#config.graphStyle.axis.xAxis.max -= xShift;
    this.#config.graphStyle.axis.yAxis.min += yShift;
    this.#config.graphStyle.axis.yAxis.max += yShift;

    this.#panStartX = event.touches[0].clientX;
    this.#panStartY = event.touches[0].clientY;

    this.draw();
  }

  enableTooltip(enable: boolean): void {
    this.#config.control.tooltip = enable;
  }
  private showTooltip(event: MouseEvent): void {
    if (!this.#config.control.tooltip || this.#config.control.locked || this.#config.control.lockedMouse) return;

    const rect = this.#canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const xMin = this.#config.graphStyle.axis.xAxis.min;
    const xMax = this.#config.graphStyle.axis.xAxis.max;
    const yMin = this.#config.graphStyle.axis.yAxis.min;
    const yMax = this.#config.graphStyle.axis.yAxis.max;

    const xValue = xMin + (x / this.#canvas.width) * (xMax - xMin);
    const yValue = yMax - (y / this.#canvas.height) * (yMax - yMin);

    // Find the nearest data point
    let nearestPoint = null;
    let minDistance = Infinity;
    for (const point of this.#data) {
      const dx = point.xValue - xValue;
      const dy = point.yValue - yValue;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < minDistance) {
        minDistance = distance;
        nearestPoint = point;
      }
    }

    if (nearestPoint) {
      // Show tooltip
      const tooltip = document.getElementById('tooltip');
      if (tooltip) {
        tooltip.style.left = `${event.clientX + 10}px`;
        tooltip.style.top = `${event.clientY + 10}px`;
        tooltip.innerHTML = `x: ${nearestPoint.xValue}, y: ${nearestPoint.yValue}`;
        tooltip.style.display = 'block';
      }

      // Highlight the nearest point on the canvas
      this.draw(); // Redraw the canvas to clear previous highlights
      this.#context.fillStyle = this.#config.colorScheme.seriesColor;
      const xPos = this.#xMargin + ((nearestPoint.xValue - xMin) / (xMax - xMin)) * (this.#canvas.width - 100);
      const yPos = this.#canvas.height - this.#yMargin - ((nearestPoint.yValue - yMin) / (yMax - yMin)) * (this.#canvas.height - 100);
      this.#context.beginPath();
      this.#context.arc(xPos, yPos, 5, 0, 2 * Math.PI);
      this.#context.fill();
    } else {
      // Hide tooltip
      const tooltip = document.getElementById('tooltip');
      if (tooltip) {
        tooltip.style.display = 'none';
      }
      this.draw(); // Redraw the canvas to clear previous highlights
    }
  }
  exportAsImage(type: 'png' | 'jpeg', fileName?: string): void {
    const link = document.createElement('a');
    link.href = this.#canvas.toDataURL(`image/${type}`);
    link.download = fileName ? (fileName.endsWith(`.${type}`) ? fileName : `${fileName}.${type}`) : `chart.${type}`;
    link.click();
  }

  getCurrentConfig(): object {
    return this.#config;
  }

  getCurrentData(): object {
    return this.#data;
  }

  exportCurrentConfig(fileName: string = 'config.xml'): void {
    const configXml = this.convertConfigToXml(this.getCurrentConfig());
    const configBlob = new Blob([configXml], { type: 'application/xml' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(configBlob);
    link.download = fileName.endsWith('.xml') ? fileName : `${fileName}.xml`;
    link.click();
  }

  private convertConfigToXml(config: any): string {
    const xmlDoc = document.implementation.createDocument('', '', null);
    const configElement = xmlDoc.createElement('config');

    const graphStyleElement = xmlDoc.createElement('graphStyle');
    const graphTitleElement = xmlDoc.createElement('graphTitle');
    graphTitleElement.textContent = config.graphStyle.graphTitle;
    graphStyleElement.appendChild(graphTitleElement);

    const legendElement = xmlDoc.createElement('legend');
    legendElement.setAttribute('visible', config.graphStyle.legend.visible.toString());
    graphStyleElement.appendChild(legendElement);

    const axisElement = xmlDoc.createElement('axis');
    const xAxisElement = xmlDoc.createElement('xAxis');
    xAxisElement.setAttribute('title', config.graphStyle.axis.xAxis.title);
    xAxisElement.setAttribute('tickNumber', config.graphStyle.axis.xAxis.tickNumber.toString());
    xAxisElement.setAttribute('showLine', config.graphStyle.axis.xAxis.showLine.toString());
    axisElement.appendChild(xAxisElement);

    const yAxisElement = xmlDoc.createElement('yAxis');
    yAxisElement.setAttribute('title', config.graphStyle.axis.yAxis.title);
    yAxisElement.setAttribute('tickNumber', config.graphStyle.axis.yAxis.tickNumber.toString());
    yAxisElement.setAttribute('showLine', config.graphStyle.axis.yAxis.showLine.toString());
    axisElement.appendChild(yAxisElement);

    graphStyleElement.appendChild(axisElement);

    const graphTypeElement = xmlDoc.createElement('graphType');
    graphTypeElement.textContent = config.graphStyle.graphType;
    graphStyleElement.appendChild(graphTypeElement);

    configElement.appendChild(graphStyleElement);

    const controlElement = xmlDoc.createElement('control');
    controlElement.setAttribute('zoom', config.control.zoom.toString());
    controlElement.setAttribute('pan', config.control.pan.toString());
    controlElement.setAttribute('tooltip', config.control.tooltip.toString());
    controlElement.setAttribute('locked', config.control.locked.toString());
    controlElement.setAttribute('lockedMouse', config.control.lockedMouse.toString());
    controlElement.setAttribute('lockedWheel', config.control.lockedWheel.toString());
    configElement.appendChild(controlElement);

    const colorSchemeElement = xmlDoc.createElement('colorScheme');
    const backgroundElement = xmlDoc.createElement('background');
    backgroundElement.textContent = config.colorScheme.background;
    colorSchemeElement.appendChild(backgroundElement);

    const axisColorElement = xmlDoc.createElement('axisColor');
    axisColorElement.textContent = config.colorScheme.axisColor;
    colorSchemeElement.appendChild(axisColorElement);

    const seriesColorElement = xmlDoc.createElement('seriesColor');
    seriesColorElement.textContent = config.colorScheme.seriesColor;
    colorSchemeElement.appendChild(seriesColorElement);

    configElement.appendChild(colorSchemeElement);

    xmlDoc.appendChild(configElement);

    const serializer = new XMLSerializer();
    return serializer.serializeToString(xmlDoc);
  }

  exportCurrentDataAsJSON(fileName: string = 'data.json'): void {
    const dataBlob = new Blob([JSON.stringify(this.getCurrentData(), null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = fileName.endsWith('.json') ? fileName : `${fileName}.json`;
    link.click();
  }

  exportCurrentDataAsCSV(fileName: string = 'data.csv'): void {
    const csvContent = this.#data.map(d => `${d.xValue},${d.yValue}`).join('\n');
    const csvBlob = new Blob([csvContent], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(csvBlob);
    link.download = fileName.endsWith('.csv') ? fileName : `${fileName}.csv`;
    link.click();
  }

  exportCurrentDataAsXML(fileName: string = 'data.xml'): void {
    const xmlContent = `<data>\n` + this.#data.map(d => `  <entry>\n    <value1>${d.xValue}</value1>\n    <value2>${d.yValue}</value2>\n  </entry>`).join('\n') + `\n</data>`;
    const xmlBlob = new Blob([xmlContent], { type: 'application/xml' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(xmlBlob);
    link.download = fileName.endsWith('.xml') ? fileName : `${fileName}.xml`;
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
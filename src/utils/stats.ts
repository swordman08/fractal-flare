// stats.js r6 - http://github.com/mrdoob/stats.js
export class Stats {
  private r = 0;
  private t = 2;
  private u = 0;
  private j = Date.now();
  private F = this.j;
  private v = this.j;
  private l = 0;
  private w = 1000;
  private x = 0;
  private n = 0;
  private z = 1000;
  private A = 0;
  private p = 0;
  private C = 1000;
  private D = 0;

  private container: HTMLDivElement;
  private fpsDiv: HTMLDivElement;
  private fpsText: HTMLDivElement;
  private fpsCanvas: HTMLCanvasElement;
  private fpsContext: CanvasRenderingContext2D;
  private fpsImageData: ImageData;
  
  private msDiv: HTMLDivElement;
  private msText: HTMLDivElement;
  private msCanvas: HTMLCanvasElement;
  private msContext: CanvasRenderingContext2D;
  private msImageData: ImageData;
  
  private mbDiv: HTMLDivElement;
  private mbText: HTMLDivElement;
  private mbCanvas: HTMLCanvasElement;
  private mbContext: CanvasRenderingContext2D;
  private mbImageData: ImageData;

  private colors = {
    fps: { bg: { r: 16, g: 16, b: 48 }, fg: { r: 0, g: 255, b: 255 } },
    ms: { bg: { r: 16, g: 48, b: 16 }, fg: { r: 0, g: 255, b: 0 } },
    mb: { bg: { r: 48, g: 16, b: 26 }, fg: { r: 255, g: 0, b: 128 } }
  };

  constructor() {
    // Check for performance memory
    try {
      if (performance && (performance as any).memory && (performance as any).memory.totalJSHeapSize) {
        this.t = 3;
      }
    } catch (e) {}

    // Create container
    this.container = document.createElement('div');
    this.container.style.cssText = 'position:fixed;top:0;left:0;cursor:pointer;opacity:0.9;z-index:10000;';
    this.container.addEventListener('click', () => this.cycleDisplay());

    // FPS Panel
    const fpsResult = this.createPanel('FPS', this.colors.fps);
    this.fpsDiv = fpsResult.div;
    this.fpsText = fpsResult.text;
    this.fpsCanvas = fpsResult.canvas;
    this.fpsContext = fpsResult.context;
    this.fpsImageData = fpsResult.imageData;
    this.container.appendChild(this.fpsDiv);

    // MS Panel
    const msResult = this.createPanel('MS', this.colors.ms);
    this.msDiv = msResult.div;
    this.msText = msResult.text;
    this.msCanvas = msResult.canvas;
    this.msContext = msResult.context;
    this.msImageData = msResult.imageData;
    this.msDiv.style.display = 'none';
    this.container.appendChild(this.msDiv);

    // MB Panel
    const mbResult = this.createPanel('MB', this.colors.mb);
    this.mbDiv = mbResult.div;
    this.mbText = mbResult.text;
    this.mbCanvas = mbResult.canvas;
    this.mbContext = mbResult.context;
    this.mbImageData = mbResult.imageData;
    this.mbDiv.style.display = 'none';
    this.container.appendChild(this.mbDiv);
  }

  private createPanel(name: string, colors: { bg: { r: number; g: number; b: number }; fg: { r: number; g: number; b: number } }) {
    const div = document.createElement('div');
    div.style.cssText = `background:rgb(${Math.floor(colors.bg.r / 2)},${Math.floor(colors.bg.g / 2)},${Math.floor(colors.bg.b / 2)});padding:2px 0 3px 0;width:80px;`;

    const text = document.createElement('div');
    text.style.cssText = `color:rgb(${colors.fg.r},${colors.fg.g},${colors.fg.b});font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;line-height:15px;padding:0 0 2px 3px;`;
    text.innerHTML = name;
    div.appendChild(text);

    const canvas = document.createElement('canvas');
    canvas.width = 74;
    canvas.height = 30;
    canvas.style.cssText = 'display:block;margin-left:3px;';
    div.appendChild(canvas);

    const context = canvas.getContext('2d')!;
    context.fillStyle = `rgb(${colors.bg.r},${colors.bg.g},${colors.bg.b})`;
    context.fillRect(0, 0, canvas.width, canvas.height);
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    return { div, text, canvas, context, imageData };
  }

  private cycleDisplay() {
    this.r++;
    if (this.r >= this.t) this.r = 0;
    
    this.fpsDiv.style.display = 'none';
    this.msDiv.style.display = 'none';
    this.mbDiv.style.display = 'none';
    
    switch (this.r) {
      case 0: this.fpsDiv.style.display = 'block'; break;
      case 1: this.msDiv.style.display = 'block'; break;
      case 2: this.mbDiv.style.display = 'block'; break;
    }
  }

  private updateGraph(data: Uint8ClampedArray, value: number, maxValue: number, type: keyof typeof this.colors) {
    // Shift graph left
    for (let c = 0; c < 30; c++) {
      for (let f = 0; f < 73; f++) {
        const e = (f + c * 74) * 4;
        data[e] = data[e + 4];
        data[e + 1] = data[e + 5];
        data[e + 2] = data[e + 6];
      }
    }
    
    // Add new column
    const height = Math.min(30, 30 - (value / maxValue) * 30);
    for (let c = 0; c < 30; c++) {
      const e = (73 + c * 74) * 4;
      if (c < height) {
        data[e] = this.colors[type].bg.r;
        data[e + 1] = this.colors[type].bg.g;
        data[e + 2] = this.colors[type].bg.b;
      } else {
        data[e] = this.colors[type].fg.r;
        data[e + 1] = this.colors[type].fg.g;
        data[e + 2] = this.colors[type].fg.b;
      }
    }
  }

  public begin() {
    this.j = Date.now();
  }

  public end() {
    this.u++;
    const now = Date.now();
    this.n = now - this.j;
    this.z = Math.min(this.z, this.n);
    this.A = Math.max(this.A, this.n);
    
    this.updateGraph(this.msImageData.data, this.n, 200, 'ms');
    this.msText.innerHTML = `<span style="font-weight:bold">${this.n} MS</span> (${this.z}-${this.A})`;
    this.msContext.putImageData(this.msImageData, 0, 0);
    
    this.F = now;
    
    if (now > this.v + 1000) {
      this.l = Math.round((this.u * 1000) / (now - this.v));
      this.w = Math.min(this.w, this.l);
      this.x = Math.max(this.x, this.l);
      
      this.updateGraph(this.fpsImageData.data, this.l, 100, 'fps');
      this.fpsText.innerHTML = `<span style="font-weight:bold">${this.l} FPS</span> (${this.w}-${this.x})`;
      this.fpsContext.putImageData(this.fpsImageData, 0, 0);
      
      if (this.t === 3) {
        const memory = (performance as any).memory;
        this.p = memory.usedJSHeapSize * 9.54e-7;
        this.C = Math.min(this.C, this.p);
        this.D = Math.max(this.D, this.p);
        
        this.updateGraph(this.mbImageData.data, this.p, 2, 'mb');
        this.mbText.innerHTML = `<span style="font-weight:bold">${Math.round(this.p)} MB</span> (${Math.round(this.C)}-${Math.round(this.D)})`;
        this.mbContext.putImageData(this.mbImageData, 0, 0);
      }
      
      this.v = now;
      this.u = 0;
    }
  }

  public update() {
    this.end();
  }

  public get domElement() {
    return this.container;
  }
}

/**
 * The CanvasListener listens for changes to the size of the screen/window, and therefore potentially the
 * render canvas as well. On a resize, it will call any subscribed listeners to get the updated canvas.
 */
export type ListenerCallback = () => void;

export class CanvasListener {
  private canvasListeners: ListenerCallback[] = [];
  private _canvasWidth: number;
  private _canvasHeight: number;

  constructor(public canvas: HTMLCanvasElement) {
    this._canvasWidth = canvas.clientWidth;
    this._canvasHeight = canvas.clientHeight;

    window.addEventListener('resize', this.onWindowResize);
  }

  get width() {
    return this._canvasWidth;
  }

  get height() {
    return this._canvasHeight;
  }

  public addCanvasListener(callback: ListenerCallback) {
    if (!this.canvasListeners.includes(callback)) {
      this.canvasListeners.push(callback);
    }
  }

  public removeCanvasListener(callback: ListenerCallback) {
    this.canvasListeners = this.canvasListeners.filter((cb) => cb !== callback);
  }

  private onWindowResize = () => {
    this._canvasWidth = this.canvas.clientWidth;
    this._canvasHeight = this.canvas.clientHeight;

    this.canvasListeners.forEach((cb) => cb());
  };
}

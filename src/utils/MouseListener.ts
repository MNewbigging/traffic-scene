import * as THREE from 'three';

export type MouseEventCallback = () => void;
export type MouseEventType =
  | 'mousedown'
  | 'mouseup'
  | 'leftclickup'
  | 'rightclickup'
  | 'rightclickdown';

export class MouseListener {
  public lmb = false;
  public mmb = false;
  public rmb = false;
  public drag = false;
  public screenPos = new THREE.Vector2();
  public movement = new THREE.Vector2();
  private callbacks = new Map<MouseEventType, MouseEventCallback[]>();

  constructor() {
    window.addEventListener('mousedown', this.onMouseDown);
    window.addEventListener('mouseup', this.onMouseUp);
    window.addEventListener('mousemove', this.onMouseMove);
  }

  public on(eventType: MouseEventType, callback: MouseEventCallback) {
    const existing = this.callbacks.get(eventType) ?? [];
    existing.push(callback);
    this.callbacks.set(eventType, existing);
  }

  private onMouseDown = (event: MouseEvent) => {
    this.saveMousePosition(event);

    switch (event.button) {
      case 0:
        this.lmb = true;
        break;
      case 1:
        this.mmb = true;
        break;
      case 2:
        this.fireCallbacks('rightclickdown');
        this.rmb = true;
        break;
    }

    this.fireCallbacks('mousedown');
  };

  private onMouseUp = (event: MouseEvent) => {
    // Fire callbacks before adjusting mouse state
    this.fireCallbacks('mouseup');

    this.saveMousePosition(event);

    switch (event.button) {
      case 0:
        if (!this.drag) {
          this.fireCallbacks('leftclickup');
        }
        this.lmb = false;
        break;
      case 1:
        this.mmb = false;
        break;
      case 2:
        this.fireCallbacks('rightclickup');
        this.rmb = false;
        break;
    }

    this.drag = false;
  };

  private onMouseMove = () => {
    this.drag = this.lmb;
  };

  private saveMousePosition(event: MouseEvent) {
    // May need to change window values here to canvas values if not using whole window for canvas
    this.screenPos.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.screenPos.y = -(event.clientY / window.innerHeight) * 2 + 1;

    this.movement.x = event.movementX;
    this.movement.y = event.movementY;
  }

  private fireCallbacks(eventType: MouseEventType) {
    const callbacks = this.callbacks.get(eventType) ?? [];
    callbacks.forEach((cb) => cb());
  }
}

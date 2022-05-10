export enum TestEventType {
  TEST_1 = 'test-1',
  TEST_2 = 'test-2',
}

export type TestEvent =
  | { type: TestEventType.TEST_1; propOne: string; propTwo: number }
  | { type: TestEventType.TEST_2; thingA: string[]; thingB: number[] };

export type TestEventCallback<T> = (props: T) => void;

export class TestListener {
  private callbacks = new Map<TestEventType, TestEventCallback<any>[]>();

  public on<T>(type: TestEventType, callback: TestEventCallback<T>) {
    const existing = this.callbacks.get(type) ?? [];
    existing.push(callback);
    this.callbacks.set(type, existing);
  }

  public off<T>(type: TestEventType, callback: TestEventCallback<T>) {
    let existing = this.callbacks.get(type) ?? [];
    if (existing.length) {
      existing = existing.filter((cb) => cb !== callback);
      this.callbacks.set(type, existing);
    }
  }

  public fire<T>(type: TestEventType, props: T) {
    const toFire = this.callbacks.get(type) ?? [];
    toFire.forEach((cb) => cb(props));
  }
}

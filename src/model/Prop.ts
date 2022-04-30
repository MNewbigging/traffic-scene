export class Prop {
  constructor(public model: THREE.Group) {}

  public get position() {
    return this.model.position;
  }

  public get rotation() {
    return this.model.rotation;
  }
}

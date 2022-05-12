import * as THREE from 'three';
import { action, computed, makeObservable, observable } from 'mobx';

import { CameraControlScheme, CameraControlSchemeName } from './CameraControlScheme';
import { CanvasListener } from '../listeners/CanvasListener';
import { GameEvent, GameEventListener, GameEventType } from '../listeners/GameEventListener';
import { SceneState } from '../SceneState';

export class CameraManager {
  public camera: THREE.PerspectiveCamera;
  public controlSchemes: CameraControlScheme[] = [];
  public currentControlScheme: CameraControlScheme | undefined = undefined;
  private raycaster: THREE.Raycaster;
  public sceneState: SceneState;
  public debugBall = new THREE.Mesh(
    new THREE.SphereGeometry(0.05),
    new THREE.MeshBasicMaterial({color: 0xff0000})
  )

  constructor(
    private canvasListener: CanvasListener,
    private gameEventListener: GameEventListener,
  ) {
    // Mobx
    makeObservable(this, {
      currentControlScheme: observable,
      currentSchemeName: computed,
      setControlScheme: action,
    });

    // Setup
    this.setupCamera();
    this.setupRaycaster();

    // Listeners
    canvasListener.addCanvasListener(this.onCanvasResize);
    gameEventListener.on(GameEventType.CAMERA_MODE_REQUEST, this.onModeRequest);

    // Debug
    this.debugBall.layers.set(1);
  }

  public get currentSchemeName() {
    return this.currentControlScheme?.name ?? CameraControlSchemeName.ORBIT;
  }

  public setControlScheme = (name: CameraControlSchemeName) => {
    if (this.currentControlScheme?.name === name) {
      return;
    }

    this.currentControlScheme?.disable();

    const nextScheme = this.controlSchemes.find((scheme) => scheme.name === name);
    if (!nextScheme) {
      return;
    }

    this.currentControlScheme = nextScheme;
    this.currentControlScheme.enable();

    this.gameEventListener.fireEvent({
      type: GameEventType.CAMERA_MODE_CHANGE,
      scheme: this.currentSchemeName,
    });
  };

  public onModeRequest = (event: GameEvent<GameEventType.CAMERA_MODE_REQUEST>) => {
    this.setControlScheme(event.scheme);
  };

  public update(deltaTime: number) {
    this.currentControlScheme?.update(deltaTime);
    this.castRay();
  }

  private setupCamera() {
    const camera = new THREE.PerspectiveCamera(
      75,
      this.canvasListener.width / this.canvasListener.height,
      0.1,
      1000
    );
    camera.position.x = 8;
    camera.position.y = 15;
    camera.position.z = 8;
    this.camera = camera;
    this.camera.layers.enable(1);
  }

  private onCanvasResize = () => {
    this.camera.aspect = this.canvasListener.width / this.canvasListener.height;
    this.camera.updateProjectionMatrix();
  };

  private setupRaycaster = () => {
    this.raycaster = new THREE.Raycaster();
    this.raycaster.near = this.camera.near;
    this.raycaster.far = this.camera.far;
    this.raycaster.camera = this.camera;
  }

  public castRay = () => {
    this.raycaster.setFromCamera( new THREE.Vector2(), this.camera );  

    for (const road of this.sceneState.roads) {
      const intersects = this.raycaster.intersectObject(road.model);
      if (intersects.length) {
        this.camera.userData.focusPoint = intersects[0].point;
        this.camera.userData.focusLength = new THREE.Vector3(
          this.camera.position.x - intersects[0].point.x,
          this.camera.position.y - intersects[0].point.y,
          this.camera.position.z - intersects[0].point.z,
        ).length();

        this.debugBall.position.copy(intersects[0].point);
        return;
      }
    }

    for (const prop of this.sceneState.props) {
      const intersects = this.raycaster.intersectObject(prop.model);
      if (intersects.length) {
        this.camera.userData.focusPoint = intersects[0].point;
        this.camera.userData.focusLength = new THREE.Vector3(
          this.camera.position.x - intersects[0].point.x,
          this.camera.position.y - intersects[0].point.y,
          this.camera.position.z - intersects[0].point.z,
        ).length();

        this.debugBall.position.copy(intersects[0].point);
        return;
      }
    }

    // this.intersects.length = 0;
    // this.intersects = this.raycaster.intersectObjects(objects, true);
    // if (this.intersects.length) {
    //   this.camera.userData.focusPoint = this.intersects[0].point;
    //   this.camera.userData.focusLength = new THREE.Vector3(
    //     this.camera.position.x - this.intersects[0].point.x,
    //     this.camera.position.y - this.intersects[0].point.y,
    //     this.camera.position.z - this.intersects[0].point.z,
    //   ).length();

    //   this.debugBall.position.copy(this.intersects[0].point);
    // }

    //console.log(this.debugBall.position);
  }
}

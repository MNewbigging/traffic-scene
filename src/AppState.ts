import * as THREE from 'three';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import { CanvasListener } from './utils/CanvasListener';
import { ModelLoader, RoadName, VehicleName } from './utils/ModelLoader';

export class AppState {
  private canvasListener: CanvasListener;
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;
  private masterClock = new THREE.Clock();
  private modelLoader = new ModelLoader();

  private road: THREE.Group;
  private roadCont: THREE.Box3;

  constructor(canvas: HTMLCanvasElement) {
    // Setup screen listener
    this.canvasListener = new CanvasListener(canvas);
    this.canvasListener.addCanvasListener(this.onCanvasResize);

    // Setup renderer
    this.renderer = new THREE.WebGLRenderer({ canvas });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.onCanvasResize();

    // Setup camera
    this.setupCamera();
    this.setupLights();

    // Axes helper - The X axis is red. The Y axis is green. The Z axis is blue.
    const axesHelper = new THREE.AxesHelper(5);
    this.scene.add(axesHelper);

    // Load models
    this.modelLoader.loadModels(() => this.start());
  }

  // Called on load complete
  private start() {
    console.log('starting');

    // const sedan = this.modelLoader.getModel(VehicleName.SEDAN);
    // console.log('sedan', sedan);
    // this.scene.add(sedan);

    const road = this.modelLoader.getModel(RoadName.END);
    this.road = road;
    this.scene.add(road);

    // Start render loop
    this.animate();
  }

  private onCanvasResize = () => {
    this.renderer.setSize(this.canvasListener.width, this.canvasListener.height, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  };

  private setupCamera() {
    const camera = new THREE.PerspectiveCamera(
      75,
      this.canvasListener.width / this.canvasListener.height,
      0.1,
      1000
    );
    camera.position.x = 2;
    camera.position.y = 2;
    camera.position.z = 2;

    this.camera = camera;
    this.controls = new OrbitControls(this.camera, this.canvasListener.canvas);
    this.controls.enableDamping = true;
  }

  private setupLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    // const pointLight = new THREE.PointLight(0xffffff, 0.5);
    // pointLight.position.x = 2;
    // pointLight.position.y = 3;
    // pointLight.position.z = 4;
    // this.scene.add(pointLight);
  }

  private animate = () => {
    requestAnimationFrame(this.animate);

    this.controls.update();

    const deltaTime = this.masterClock.getDelta();

    //this.road.rotation.y += 0.2 * deltaTime;

    this.renderer.render(this.scene, this.camera);
  };
}

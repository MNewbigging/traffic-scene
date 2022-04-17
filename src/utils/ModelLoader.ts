import * as THREE from 'three';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class ModelNames {
  vehicles: VehicleName[] = [];
  roads: RoadName[] = [];

  get modelCount() {
    return this.vehicles.length + this.roads.length;
  }
}

type ModelName = VehicleName | RoadName;

export enum VehicleName {
  SEDAN = 'sedan',
}

export enum RoadName {
  STRAIGHT = 'road_straight',
  END = 'road_end',
  BEND = 'road_bend',
}

/**
 * Responsible for loading models and storing them during runtime.
 */
export class ModelLoader {
  private readonly vehicleScaleModifer = 0.5;
  private readonly roadScaleModifier = 2;
  private modelMap = new Map<ModelName, THREE.Group>();
  private loadedModels = 0;
  private modelsToLoad = 0;
  private onLoad?: () => void;

  public loadModels(modelNames: ModelNames, onLoad: () => void) {
    this.onLoad = onLoad;

    // Setup load counters
    this.loadedModels = 0;
    this.modelsToLoad = modelNames.modelCount;

    const loader = new GLTFLoader();

    // Load vehicles
    modelNames.vehicles.forEach((vName) => this.loadVehicle(vName, loader));

    // Load roads
    modelNames.roads.forEach((rName) => this.loadRoad(rName, loader));
  }

  public get models(): THREE.Group[] {
    return Array.from(this.modelMap.values());
  }

  public getModel(name: ModelName): THREE.Group {
    return this.modelMap.get(name).clone();
  }

  private onLoadError = (error: any) => {
    console.log(error);
  };

  private onLoadModel = (name: ModelName, group: THREE.Group) => {
    this.loadedModels++;
    this.modelMap.set(name, group);
    //console.log(`loaded ${name}, current models:`, this.modelMap);

    // Check if all models are now loaded
    if (this.loadedModels === this.modelsToLoad) {
      this.onLoad?.();
    }
  };

  private loadVehicle(vName: VehicleName, loader: GLTFLoader) {
    loader.load(
      `/src/assets/vehicles/${vName}.glb`,
      (model: GLTF) => {
        // Traverse model nodes
        model.scene.traverse((node) => {
          // If this node is a mesh
          if (node instanceof THREE.Mesh) {
            // Adjust metalness so it shows via ambient light
            node.material.metalness = 0;
          }
        });

        // Adjust scale of vehicles
        model.scene.scale.set(
          this.vehicleScaleModifer,
          this.vehicleScaleModifer,
          this.vehicleScaleModifer
        );

        // Wrap in parent to set proper facing direction
        const parent = new THREE.Group();
        model.scene.rotation.y = Math.PI;
        parent.add(model.scene);

        this.onLoadModel(vName, parent);
      },
      undefined,
      this.onLoadError
    );
  }

  private loadRoad(rName: RoadName, loader: GLTFLoader) {
    loader.load(
      `/src/assets/roads/${rName}.glb`,
      (model: GLTF) => {
        // Traverse model nodes
        model.scene.traverse((node) => {
          // If it's a mesh
          if (node instanceof THREE.Mesh) {
            // Adjust metalness so it shows via ambient light
            node.material.metalness = 0;
          }
        });

        // Setup road
        const road = this.setupRoad(rName, model.scene);
        this.onLoadModel(rName, road);
        // // Adjust scale of roads
        // model.scene.scale.set(
        //   this.roadScaleModifier,
        //   this.roadScaleModifier,
        //   this.roadScaleModifier
        // );

        // // Adjust origin
        // const box = new THREE.Box3().setFromObject(model.scene);
        // box.getCenter(model.scene.position).multiplyScalar(-1);

        // // Wrap in another group for rotating around its center
        // const parent = new THREE.Group();
        // parent.add(model.scene);

        // this.onLoadModel(rName, parent);
      },
      undefined,
      this.onLoadError
    );
  }

  private setupRoad(rName: RoadName, road: THREE.Group) {
    // Adjust scale of roads
    road.scale.set(this.roadScaleModifier, this.roadScaleModifier, this.roadScaleModifier);

    // The transform origin is offset; this solves that so it's at 0
    const box = new THREE.Box3().setFromObject(road);
    box.getCenter(road.position).multiplyScalar(-1);

    // The rotatio norigin is still offset; wrap it in a parent, then
    // Rotate that parent so that it faces 0,0,1
    const parent = new THREE.Group();
    parent.add(road);
    parent.rotation.y = -Math.PI / 2;

    // Parent for the road(parent) and the waypoints
    const grandparent = new THREE.Group();
    grandparent.add(parent);

    // Create waypoints as necessary
    const waypoints = this.createRoadWaypoints(rName);
    if (waypoints) {
      parent.add(waypoints);
    }

    return grandparent;
  }

  private createRoadWaypoints(rName: RoadName): THREE.Group | undefined {
    switch (rName) {
      case RoadName.BEND:
        break;
    }

    return undefined;
  }

  private createRoadBendWaypoints() {}
}

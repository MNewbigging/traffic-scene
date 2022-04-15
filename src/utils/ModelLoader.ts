import * as THREE from 'three';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export type ModelName = VehicleName | RoadName;

export enum VehicleName {
  SEDAN = 'sedan',
}

export enum RoadName {
  STRAIGHT = 'road_straight',
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

  public loadModels(onLoad: () => void) {
    this.onLoad = onLoad;

    // The names of models to load
    const vehicleNames = Object.values(VehicleName);
    const roadNames = Object.values(RoadName);

    // Setup load counters
    this.modelsToLoad = vehicleNames.length + roadNames.length;

    const loader = new GLTFLoader();

    // Load vehicles
    vehicleNames.forEach((vName) => this.loadVehicle(vName, loader));

    // Load roads
    roadNames.forEach((rName) => this.loadRoad(rName, loader));
  }

  public get models() {
    return Array.from(this.modelMap.values());
  }

  private onLoadError = (error: any) => {
    console.log(error);
  };

  private onLoadModel = (name: ModelName, group: THREE.Group) => {
    this.loadedModels++;
    this.modelMap.set(name, group);
    console.log(`loaded ${name}, current models:`, this.modelMap);

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

        this.onLoadModel(vName, model.scene);
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

        // Adjust scale of roads
        model.scene.scale.set(
          this.roadScaleModifier,
          this.roadScaleModifier,
          this.roadScaleModifier
        );

        this.onLoadModel(rName, model.scene);
      },
      undefined,
      this.onLoadError
    );
  }
}

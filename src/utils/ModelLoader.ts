import * as THREE from 'three';
import { Color, Loader } from 'three';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class ModelNames {
  vehicles: VehicleName[] = [];
  roads: RoadName[] = [];
  houses: HouseName[] = [];

  get modelCount() {
    return this.vehicles.length + this.roads.length + this.houses.length;
  }
}

type ModelName = VehicleName | RoadName | HouseName;

export enum VehicleName {
  DELIVERY = 'delivery',
  GARBAGE = 'garbageTruck',
  HATCHBACK = 'hatchbackSports',
  POLICE = 'police',
  SEDAN = 'sedan',
  SEDAN_SPORTS = 'sedanSports',
  SUV = 'suv',
  TAXI = 'taxi',
  TRUCK = 'truck',
  VAN = 'van',
}

export enum RoadName {
  STRAIGHT = 'road_straight',
  BEND = 'road_bend',
  JUNCTION = 'road_intersection',
  ROUNDABOUT = 'road_roundabout',
  CROSSROAD = 'road_crossroad',
}

export enum HouseName {
  TYPE_01 = 'house_type01',
  TYPE_03 = 'house_type03',
  TYPE_04 = 'house_type04',
  TYPE_05 = 'house_type05',
  TYPE_07 = 'house_type07',
  TYPE_08 = 'house_type08',
  TYPE_09 = 'house_type09',
  TYPE_10 = 'house_type10',
  TYPE_11 = 'house_type11',
  TYPE_12 = 'house_type12',
  TYPE_13 = 'house_type13',
  TYPE_14 = 'house_type14',
  TYPE_15 = 'house_type15',
  TYPE_16 = 'house_type16',
  TYPE_19 = 'house_type19',
  TYPE_20 = 'house_type20',
  TYPE_21 = 'house_type21',
}

/**
 * Responsible for loading models and storing them during runtime.
 */
export class ModelLoader {
  private readonly vehicleScaleModifer = 0.4;
  private readonly roadScaleModifier = 2;
  private modelMap = new Map<ModelName, THREE.Group>();
  private loadedModels = 0;
  private modelsToLoad = 0;
  private onLoad?: () => void;
  private baseAssetPath = '';

  constructor() {
    // Hack to get assets from gh-pages when published
    const location = window.location.href;
    if (location.includes('localhost')) {
      this.baseAssetPath = 'dist/assets/';
    } else {
      this.baseAssetPath = 'assets/';
    }
  }

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

    // Load houses
    modelNames.houses.forEach((hName) => this.loadHouse(hName, loader));
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
      this.baseAssetPath + `vehicles/${vName}.glb`,
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
      this.baseAssetPath + `roads/${rName}.glb`,
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
        const road = this.setupRoad(model.scene);
        this.onLoadModel(rName, road);
      },
      undefined,
      this.onLoadError
    );
  }

  private setupRoad(road: THREE.Group) {
    // Adjust scale of roads
    road.scale.set(this.roadScaleModifier, this.roadScaleModifier, this.roadScaleModifier);

    // The transform origin is offset; this solves that so it's at 0
    const box = new THREE.Box3().setFromObject(road);
    box.getCenter(road.position).multiplyScalar(-1);

    // The rotation origin is still offset; wrap it in a parent, then
    // Rotate that parent so that it faces 0,0,1
    const parent = new THREE.Group();
    parent.add(road);
    parent.rotation.y = -Math.PI / 2;

    // Parent for the road(parent)
    const grandparent = new THREE.Group();
    grandparent.add(parent);

    return grandparent;
  }

  private loadHouse(hName: HouseName, loader: GLTFLoader) {
    loader.load(
      this.baseAssetPath + `houses/${hName}.glb`,
      (model: GLTF) => {
        // Traverse model nodes
        model.scene.traverse((node) => {
          // If it's a mesh
          if (node instanceof THREE.Mesh) {
            // Adjust metalness
            node.material.metalness = 0;
          }
        });

        const house = this.setupHouse(model.scene);
        this.onLoadModel(hName, house);
      },
      undefined,
      this.onLoadError
    );
  }

  private setupHouse(house: THREE.Group) {
    // Set transform origin to center of the model
    const box = new THREE.Box3().setFromObject(house);
    box.getCenter(house.position).multiplyScalar(-1);

    // Models are centered, move to sit at ground level
    house.position.y = 0;

    // Wrap in parent to avoid losing above transforms
    const parent = new THREE.Group();
    parent.add(house);

    return parent;
  }
}

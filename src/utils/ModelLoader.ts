import * as THREE from 'three';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { NumberUtils } from './NumberUtils';

export class ModelNames {
  vehicles: VehicleName[] = [];
  roads: RoadName[] = [];
  houses: HouseName[] = [];
  foliage: FoliageName[] = [];

  get modelCount() {
    return this.vehicles.length + this.roads.length + this.houses.length + this.foliage.length;
  }
}

type ModelName = VehicleName | RoadName | HouseName | FoliageName;

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
  TYPE_17 = 'house_type17',
  TYPE_18 = 'house_type18',
  TYPE_19 = 'house_type19',
  TYPE_20 = 'house_type20',
  TYPE_21 = 'house_type21',
}

export enum FoliageName {
  BUSH = 'bush2',
}

/**
 * Responsible for loading models and storing them during runtime.
 */
export class ModelLoader {
  private readonly vehicleScaleModifer = 0.3;
  private readonly roadScaleModifier = 2;
  private readonly houseScaleModifier = 1.5;
  private readonly foliageScaleModifier = 0.25;
  private modelMap = new Map<ModelName, THREE.Group>();
  private loadedModels = 0;
  private modelsToLoad = 0;
  private onLoad?: () => void;
  private baseAssetPath = '';

  constructor() {
    this.baseAssetPath = 'assets/';
    // Hack to get assets from gh-pages when published
    // const location = window.location.href;
    // if (location.includes('localhost')) {
    //   this.baseAssetPath = 'dist/assets/';
    // } else {
    //   this.baseAssetPath = 'assets/';
    // }
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

    // Load foliage
    modelNames.foliage.forEach((fName) => this.loadFoliage(fName, loader));
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
          if ((node as THREE.Mesh).isMesh) {
            // Adjust metalness so it shows via ambient light
            ((node as THREE.Mesh).material as THREE.MeshStandardMaterial).metalness = 0;
            node.castShadow = true;
            node.receiveShadow = true;
          }
        });

        const vehicle = this.setupVehicle(model.scene);
        this.onLoadModel(vName, vehicle);
      },
      undefined,
      this.onLoadError
    );
  }

  private setupVehicle(vehicle: THREE.Group) {
    // Adjust scale of vehicles
    vehicle.scale.set(this.vehicleScaleModifer, this.vehicleScaleModifer, this.vehicleScaleModifer);

    // Wrap in parent to set proper facing direction
    const parent = new THREE.Group();
    vehicle.rotation.y = Math.PI;
    parent.add(vehicle);

    return parent;
  }

  private loadRoad(rName: RoadName, loader: GLTFLoader) {
    loader.load(
      this.baseAssetPath + `roads/${rName}.glb`,
      (model: GLTF) => {
        // Traverse model nodes
        model.scene.traverse((node) => {
          // If it's a mesh
          if ((node as THREE.Mesh).isMesh) {
            // Adjust metalness so it shows via ambient light
            ((node as THREE.Mesh).material as THREE.MeshStandardMaterial).metalness = 0;
            node.receiveShadow = true;
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
          if ((node as THREE.Mesh).isMesh) {
            // Adjust metalness
            ((node as THREE.Mesh).material as THREE.MeshStandardMaterial).metalness = 0;
            node.castShadow = true;
            node.receiveShadow = true;
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
    // Adjust scale of houses
    house.scale.set(this.houseScaleModifier, this.houseScaleModifier, this.houseScaleModifier);

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

  private loadFoliage(fName: FoliageName, loader: GLTFLoader) {
    loader.load(
      this.baseAssetPath + `nature/${fName}.glb`,
      (model: GLTF) => {
        // Traverse model nodes
        model.scene.traverse((node) => {
          // If it's a mesh
          if ((node as THREE.Mesh).isMesh) {
            // Adjust metalness
            ((node as THREE.Mesh).material as THREE.MeshStandardMaterial).metalness = 0;

            if (node.name === 'Leaves') {
              const alpha = new THREE.TextureLoader().load('assets/textures/bushUpper_alpha.png'); // should move this out of here
              const diffuse = new THREE.TextureLoader().load('assets/textures/bushUpper_diffuse.png'); // should move this out of here
              (node as THREE.Mesh).material = new THREE.MeshStandardMaterial({alphaMap: alpha, map: diffuse, transparent: true, alphaTest: 0.9, roughness: 0.66});
            } else {
              (node as THREE.Mesh).geometry.computeBoundingSphere();
              const bSphere = (node as THREE.Mesh).geometry.boundingSphere;
              const vec = new THREE.Vector3();
              const vertArr = (node as THREE.Mesh).geometry.attributes.position.array;
              const vertColors = new Float32Array(vertArr.length * 3);
              const baseColor = [46, 38, 28];
              const tipColor = [76, 84, 47];
              const weightStrength = 1;
              //const baseColor = [255, 0, 0];
              for (let i = 0; i < vertArr.length; i+=3) {
                vec.set(
                  vertArr[i],
                  vertArr[i+1],
                  vertArr[i+2],
                );

                const length = vec.length() / bSphere.radius;
                const alpha = length * weightStrength;
                // vertColors[i] = (baseColor[0] / 255) * (1 - length * weightStrength);
                // vertColors[i+1] = (baseColor[1] / 255) * (1 - length * weightStrength);
                // vertColors[i+2] = (baseColor[2] / 255) * (1 - length * weightStrength);

                vertColors[i] = NumberUtils.lerp((baseColor[0] / 255), (tipColor[0] / 255), alpha);
                vertColors[i+1] = NumberUtils.lerp((baseColor[1] / 255), (tipColor[1] / 255), alpha);
                vertColors[i+2] = NumberUtils.lerp((baseColor[2] / 255), (tipColor[2] / 255), alpha);
              }
              (node as THREE.Mesh).geometry.setAttribute('color', new THREE.BufferAttribute(vertColors, 3)); 
              (node as THREE.Mesh).material = new THREE.MeshStandardMaterial({vertexColors: true});
              //((node as THREE.Mesh).material as THREE.MeshStandardMaterial).vertexColors = true;
            }

            //node.castShadow = true;
            //node.receiveShadow = true;
          }
        });

        const foliage = this.setupFoliage(model.scene);
        this.onLoadModel(fName, foliage);
      },
      undefined,
      this.onLoadError
    );
  }

  private setupFoliage(foliage: THREE.Group) {
    // Adjust scale of houses
    //house.scale.set(this.houseScaleModifier, this.houseScaleModifier, this.houseScaleModifier);
    foliage.scale.set(this.foliageScaleModifier, this.foliageScaleModifier, this.foliageScaleModifier);

    // Set transform origin to center of the model
    const box = new THREE.Box3().setFromObject(foliage);
    box.getCenter(foliage.position).multiplyScalar(-1);

    // Models are centered, move to sit at ground level
    foliage.position.y = 0;

    // Wrap in parent to avoid losing above transforms
    const parent = new THREE.Group();
    parent.add(foliage);

    return parent;
  }
}

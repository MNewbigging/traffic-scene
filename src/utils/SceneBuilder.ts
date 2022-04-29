import * as THREE from 'three';

import { ModelLoader, RoadName, VehicleName } from './ModelLoader';
import { Road } from '../model/Road';
import { RoadFactory } from './RoadFactory';
import { RoadUtils } from './RoadUtils';
import { Vehicle } from '../model/Vehicle';
import { VehicleFactory } from './VehicleFactory';

export class SceneBuilder {
  private roads: Road[] = [];
  private vehicles: Vehicle[] = [];

  constructor(private modelLoader: ModelLoader) {}

  public buildRoads(): Road[] {
    this.roads = [];

    const quarterRot = Math.PI / 2;
    const halfRot = Math.PI;

    // Center crossroads at origin
    const c1 = this.addRoad(RoadName.CROSSROAD, new THREE.Vector3());

    const s1 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(0, 0, -2));
    const s2 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(0, 0, -4));

    const c2 = this.addRoad(RoadName.CROSSROAD, new THREE.Vector3(0, 0, -6));

    const s3 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(-2, 0, -6), quarterRot);
    const s4 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(-4, 0, -6), quarterRot);

    const c3 = this.addRoad(RoadName.CROSSROAD, new THREE.Vector3(-6, 0, -6));

    const s5 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(-6, 0, -4));
    const s6 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(-6, 0, -2));

    const c4 = this.addRoad(RoadName.CROSSROAD, new THREE.Vector3(-6, 0, 0));

    const s7 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(-4, 0, 0), quarterRot);
    const s8 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(-2, 0, 0), quarterRot);

    const s9 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(2, 0, 0), quarterRot);
    const b1 = this.addRoad(RoadName.BEND, new THREE.Vector3(4, 0, 0), halfRot);
    const s10 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(4, 0, -2));

    const j1 = this.addRoad(RoadName.JUNCTION, new THREE.Vector3(4, 0, -4));

    const b2 = this.addRoad(RoadName.BEND, new THREE.Vector3(4, 0, -6), -quarterRot);
    const s11 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(2, 0, -6), quarterRot);

    const r1 = this.addRoad(RoadName.ROUNDABOUT, new THREE.Vector3(8, 0, -4));

    const s12 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(8, 0, -8));

    const j2 = this.addRoad(RoadName.JUNCTION, new THREE.Vector3(8, 0, -10), -quarterRot);

    const s13 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(6, 0, -10), quarterRot);
    const s14 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(4, 0, -10), quarterRot);
    const s15 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(2, 0, -10), quarterRot);

    const j3 = this.addRoad(RoadName.JUNCTION, new THREE.Vector3(0, 0, -10));

    const s16 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(0, 0, -8));

    const b3 = this.addRoad(RoadName.BEND, new THREE.Vector3(0, 0, -12), -quarterRot);
    const s17 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(-2, 0, -12), quarterRot);
    const s18 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(-4, 0, -12), quarterRot);
    const b4 = this.addRoad(RoadName.BEND, new THREE.Vector3(-6, 0, -12));
    const s19 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(-6, 0, -10));
    const s20 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(-6, 0, -8));

    const s21 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(-8, 0, -6), quarterRot);
    const b5 = this.addRoad(RoadName.BEND, new THREE.Vector3(-10, 0, -6));
    const b6 = this.addRoad(RoadName.BEND, new THREE.Vector3(-10, 0, -4), halfRot);
    const b7 = this.addRoad(RoadName.BEND, new THREE.Vector3(-12, 0, -4));
    const b8 = this.addRoad(RoadName.BEND, new THREE.Vector3(-12, 0, -2), quarterRot);
    const b9 = this.addRoad(RoadName.BEND, new THREE.Vector3(-10, 0, -2), -quarterRot);
    const b10 = this.addRoad(RoadName.BEND, new THREE.Vector3(-10, 0, 0), quarterRot);
    const s22 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(-8, 0, 0), quarterRot);

    const s23 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(-6, 0, 2));
    const b11 = this.addRoad(RoadName.BEND, new THREE.Vector3(-6, 0, 4), quarterRot);
    const s24 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(-4, 0, 4), quarterRot);
    const s25 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(-2, 0, 4), quarterRot);

    const j4 = this.addRoad(RoadName.JUNCTION, new THREE.Vector3(0, 0, 4), quarterRot);

    const s26 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(0, 0, 2));

    const s27 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(2, 0, 4), quarterRot);
    const s28 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(4, 0, 4), quarterRot);
    const s29 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(6, 0, 4), quarterRot);
    const b12 = this.addRoad(RoadName.BEND, new THREE.Vector3(8, 0, 4), halfRot);

    const j5 = this.addRoad(RoadName.JUNCTION, new THREE.Vector3(8, 0, 2));

    const s30 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(8, 0, 0));

    const s31 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(10, 0, 2), quarterRot);

    const j6 = this.addRoad(RoadName.JUNCTION, new THREE.Vector3(12, 0, 2), quarterRot);

    const s32 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(12, 0, 0));
    const s33 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(12, 0, -2));

    const c5 = this.addRoad(RoadName.CROSSROAD, new THREE.Vector3(12, 0, -4));

    const s34 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(14, 0, 2), quarterRot);

    const j7 = this.addRoad(RoadName.JUNCTION, new THREE.Vector3(16, 0, 2), quarterRot);

    const s35 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(16, 0, 0));
    const s36 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(16, 0, -2));

    const c6 = this.addRoad(RoadName.CROSSROAD, new THREE.Vector3(16, 0, -4));

    const s37 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(18, 0, 2), quarterRot);
    const b13 = this.addRoad(RoadName.BEND, new THREE.Vector3(20, 0, 2), halfRot);
    const s38 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(20, 0, 0));
    const s39 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(20, 0, -2));

    const j8 = this.addRoad(RoadName.JUNCTION, new THREE.Vector3(20, 0, -4), -halfRot);

    const s40 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(18, 0, -4), quarterRot);

    const s41 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(20, 0, -6));
    const s42 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(20, 0, -8));
    const b14 = this.addRoad(RoadName.BEND, new THREE.Vector3(20, 0, -10), -quarterRot);
    const s43 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(18, 0, -10), quarterRot);

    const c7 = this.addRoad(RoadName.CROSSROAD, new THREE.Vector3(16, 0, -10));

    const s44 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(16, 0, -8));
    const s45 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(16, 0, -6));

    const s46 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(14, 0, -10), quarterRot);
    const b15 = this.addRoad(RoadName.BEND, new THREE.Vector3(12, 0, -10));

    const s47 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(12, 0, -8));
    const s48 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(12, 0, -6));

    const s49 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(16, 0, -12));
    const b16 = this.addRoad(RoadName.BEND, new THREE.Vector3(16, 0, -14), -quarterRot);
    const s50 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(14, 0, -14), quarterRot);
    const s51 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(12, 0, -14), quarterRot);
    const b17 = this.addRoad(RoadName.BEND, new THREE.Vector3(10, 0, -14));
    const s52 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(10, 0, -12));
    const b18 = this.addRoad(RoadName.BEND, new THREE.Vector3(10, 0, -10), halfRot);

    const s53 = this.addRoad(RoadName.STRAIGHT, new THREE.Vector3(14, 0, -4), quarterRot);

    // Connect
    c1.connectRoads([s1, s8, s9, s26]);

    s1.connectRoads([c1, s2]);
    s2.connectRoads([s1, c2]);

    c2.connectRoads([s2, s3, s11, s16]);

    s3.connectRoads([c2, s4]);
    s4.connectRoads([s3, c3]);

    c3.connectRoads([s4, s5, s20, s21]);

    s5.connectRoads([c3, s6]);
    s6.connectRoads([s5, c4]);

    c4.connectRoads([s6, s7, s22, s23]);

    s7.connectRoads([c4, s8]);
    s8.connectRoads([s7, c1]);

    s9.connectRoads([c1, b1]);
    b1.connectRoads([s9, s10]);
    s10.connectRoads([b1, j1]);

    j1.connectRoads([s10, b2, r1]);

    b2.connectRoads([j1, s11]);
    s11.connectRoads([b2, c2]);

    r1.connectRoads([j1, s12, s30, c5]);

    s12.connectRoads([r1, j2]);

    j2.connectRoads([s12, s13, b18]);

    s13.connectRoads([j2, s14]);
    s14.connectRoads([s13, s15]);
    s15.connectRoads([s14, j3]);

    j3.connectRoads([s15, s16, b3]);

    s16.connectRoads([j3, c2]);

    b3.connectRoads([j3, s17]);
    s17.connectRoads([b3, s18]);
    s18.connectRoads([s17, b4]);
    b4.connectRoads([s18, s19]);
    s19.connectRoads([b4, s20]);
    s20.connectRoads([s19, c3]);

    s21.connectRoads([c3, b5]);
    b5.connectRoads([s21, b6]);
    b6.connectRoads([b5, b7]);
    b7.connectRoads([b6, b8]);
    b8.connectRoads([b7, b9]);
    b9.connectRoads([b8, b10]);
    b10.connectRoads([b9, s22]);
    s22.connectRoads([b10, c4]);

    s23.connectRoads([c4, b11]);
    b11.connectRoads([s23, s24]);
    s24.connectRoads([b11, s25]);
    s25.connectRoads([s24, j4]);

    j4.connectRoads([s25, s26, s27]);

    s26.connectRoads([j4, c1]);

    s27.connectRoads([j4, s28]);
    s28.connectRoads([s27, s29]);
    s29.connectRoads([s28, b12]);
    b12.connectRoads([s29, j5]);

    j5.connectRoads([b12, s30, s31]);

    s30.connectRoads([j5, r1]);

    s31.connectRoads([j5, j6]);

    j6.connectRoads([s31, s32, s34]);

    s32.connectRoads([j6, s33]);
    s33.connectRoads([s32, c5]);

    c5.connectRoads([r1, s33, s48, s53]);

    s34.connectRoads([j6, j7]);

    j7.connectRoads([s34, s35, s37]);

    s35.connectRoads([j7, s36]);
    s36.connectRoads([s35, c6]);

    c6.connectRoads([s36, s40, s45, s53]);

    s37.connectRoads([j7, b13]);
    b13.connectRoads([s37, s38]);
    s38.connectRoads([b13, s39]);
    s39.connectRoads([s38, j8]);

    j8.connectRoads([s39, s40, s41]);

    s40.connectRoads([j8, c6]);

    s41.connectRoads([j8, s42]);
    s42.connectRoads([s41, b14]);
    b14.connectRoads([s42, s43]);
    s43.connectRoads([b14, c7]);

    c7.connectRoads([s43, s44, s46, s49]);

    s44.connectRoads([c7, s45]);
    s45.connectRoads([s44, c6]);

    s46.connectRoads([c7, b15]);
    b15.connectRoads([s46, s47]);
    s47.connectRoads([b15, s48]);
    s48.connectRoads([s47, c5]);

    s49.connectRoads([c7, b16]);
    b16.connectRoads([s49, s50]);
    s50.connectRoads([b16, s51]);
    s51.connectRoads([s50, b17]);
    b17.connectRoads([s51, s52]);
    s52.connectRoads([b17, b18]);
    b18.connectRoads([s52, j2]);

    s53.connectRoads([c5, c6]);

    this.roads = [
      c1,
      s1,
      s2,
      c2,
      s3,
      s4,
      c3,
      s5,
      s6,
      c4,
      s7,
      s8,
      s9,
      b1,
      s10,
      j1,
      b2,
      s11,
      r1,
      s12,
      j2,
      s13,
      s14,
      s15,
      j3,
      s16,
      b3,
      s17,
      s18,
      b4,
      s19,
      s20,
      s21,
      b5,
      b6,
      b7,
      b8,
      b9,
      b10,
      s22,
      s23,
      b11,
      s24,
      s25,
      j4,
      s26,
      s27,
      s28,
      s29,
      b12,
      j5,
      s30,
      s31,
      j6,
      s32,
      s33,
      c5,
      s34,
      j7,
      s35,
      s36,
      c6,
      s37,
      b13,
      s38,
      s39,
      j8,
      s40,
      s41,
      s42,
      b14,
      s43,
      c7,
      s44,
      s45,
      s46,
      b15,
      s47,
      s48,
      s49,
      b16,
      s50,
      s51,
      b17,
      s52,
      b18,
      s53,
    ];

    return this.roads;
  }

  public buildVehicles(): Vehicle[] {
    this.vehicles = [];

    const vehicleNames = Object.values(VehicleName);

    vehicleNames.forEach((name) => {
      this.addCar(name);
      // this.addCar(name);
      this.addCar(name);
    });

    // const vehicleCount = 20;
    // for (let i = 0; i < this.vehicleCount; i++) {
    //   const rnd = NumberUtils.getRandomArrayIndex(vehicleNames.length);
    //   const name = vehicleNames[rnd];

    //   this.addCar(name);
    // }

    return this.vehicles;
  }

  private addRoad(name: RoadName, pos: THREE.Vector3, rot = 0) {
    const road = RoadFactory.createRoad(name, this.modelLoader.getModel(name));

    road.position.x = pos.x;
    road.position.y = pos.y;
    road.position.z = pos.z;

    road.rotation.y = rot;

    road.postTransform();

    return road;
  }

  private addCar(name: VehicleName, color?: THREE.Color) {
    // Create the car
    const car = VehicleFactory.createVehicle(name, this.modelLoader.getModel(name), color);
    this.vehicles.push(car);

    // Pick a random road to start on
    let road = RoadUtils.getRandomStartingRoad(this.roads);

    // While a vehicle is on that starting road, pick another
    let vehicleOnRoad = this.vehicles.some((v) => v.currentRoad?.id === road.id);
    while (vehicleOnRoad) {
      road = RoadUtils.getRandomStartingRoad(this.roads);
      vehicleOnRoad = this.vehicles.some((v) => v.currentRoad?.id === road.id);
    }

    // Assign to car to start roaming
    car.setRoam(road);
  }
}

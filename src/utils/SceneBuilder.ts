import * as THREE from 'three';

import { ModelLoader, RoadName } from './ModelLoader';
import { Road } from '../model/Road';
import { RoadFactory } from './RoadFactory';

export class SceneBuilder {
  constructor(private modelLoader: ModelLoader) {}

  public buildRoads(): Road[] {
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

    // Connect
    c1.connectRoads([s1, s8, s9]);
    s1.connectRoads([c1, s2]);
    s2.connectRoads([s1, c2]);
    c2.connectRoads([s2, s3, s11]);
    s3.connectRoads([c2, s4]);
    s4.connectRoads([s3, c3]);
    c3.connectRoads([s4, s5]);
    s5.connectRoads([c3, s6]);
    s6.connectRoads([s5, c4]);
    c4.connectRoads([s6, s7]);
    s7.connectRoads([c4, s8]);
    s8.connectRoads([s7, c1]);
    s9.connectRoads([c1, b1]);
    b1.connectRoads([s9, s10]);
    s10.connectRoads([b1, j1]);
    j1.connectRoads([s10, b2]);
    b2.connectRoads([j1, s11]);
    s11.connectRoads([b2, c2]);

    return [c1, s1, s2, c2, s3, s4, c3, s5, s6, c4, s7, s8, s9, b1, s10, j1, b2, s11];
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
}

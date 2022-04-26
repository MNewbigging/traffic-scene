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

    // Connect
    c1.connectRoads([s1, s8, s9]);

    s1.connectRoads([c1, s2]);
    s2.connectRoads([s1, c2]);

    c2.connectRoads([s2, s3, s11]);

    s3.connectRoads([c2, s4]);
    s4.connectRoads([s3, c3]);

    c3.connectRoads([s4, s5, s20]);

    s5.connectRoads([c3, s6]);
    s6.connectRoads([s5, c4]);

    c4.connectRoads([s6, s7]);

    s7.connectRoads([c4, s8]);
    s8.connectRoads([s7, c1]);

    s9.connectRoads([c1, b1]);
    b1.connectRoads([s9, s10]);
    s10.connectRoads([b1, j1]);

    j1.connectRoads([s10, b2, r1]);

    b2.connectRoads([j1, s11]);
    s11.connectRoads([b2, c2]);

    r1.connectRoads([j1, s12]);

    s12.connectRoads([r1, j2]);

    j2.connectRoads([s12, s13]);

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

    return [
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
    ];
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

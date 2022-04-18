import * as THREE from 'three';

import { NumberUtils } from '../utils/NumberUtils';
import { RoadName } from '../utils/ModelLoader';

export interface RoadWaypoint {
  roadId: string;
  point: THREE.Vector3;
}

export class Road {
  public id = NumberUtils.createId();
  public neighbours: Road[] = [];
  public speedLimit = 1;
  public _waypoints: THREE.Vector3[] = [];
  // Left lane according to roads standard forward direction - (0, 0, 1)
  public laneOnePoints: THREE.Vector3[] = [];
  public laneTwoPoints: THREE.Vector3[] = [];
  public leftLane: THREE.Line;
  public rightLane: THREE.Line;

  constructor(public name: RoadName, public model: THREE.Group) {}

  public get position(): THREE.Vector3 {
    return this.model.position;
  }

  public get rotation(): THREE.Euler {
    return this.model.rotation;
  }

  public setRotation(axis: 'x' | 'y' | 'z', value: number) {
    this.model.rotation[axis] = value;
    this.leftLane.rotation[axis] = value;
    this.rightLane.rotation[axis] = value;
  }

  // Must be called after re-positioning this road
  public updateWaypoints() {
    this.setWaypoints();
  }

  public get waypoints(): RoadWaypoint[] {
    // TODO - each road may have different waypoints
    // Straight/end roads don't for now
    return this._waypoints.map((point) => ({
      roadId: this.id,
      point,
    }));
  }

  private setWaypoints() {
    switch (this.name) {
      case RoadName.STRAIGHT:
      case RoadName.END:
        this._waypoints = [this.position];
        break;
      case RoadName.BEND:
        const pos = this.position.clone();

        const first = new THREE.Vector3(pos.x - 0.75, pos.y, pos.z);
        const second = new THREE.Vector3(pos.x - 0.5, pos.y, pos.z + 0.068);
        const third = new THREE.Vector3(pos.x - 0.24, pos.y, pos.z + 0.24);
        const fourth = new THREE.Vector3(pos.x - 0.068, pos.y, pos.z + 0.5);
        const fifth = new THREE.Vector3(pos.x, pos.y, pos.z + 0.75);

        this._waypoints = [first, second, third, fourth, fifth];
        break;
    }
  }

  public generateLaneLines() {
    // Creates this road's waypoints for both lanes
    const box = new THREE.Box3().setFromObject(this.model);
    const size = new THREE.Vector3();
    box.getSize(size);

    const halfWidth = size.x * 0.5;
    const laneCenter = halfWidth * 0.4; // Pavement roughly 10% of a half

    // Create lanes relative to forward direction
    // Below is when forward is (0, 0, 1)
    // If forward would be (0, 0, -1) - below lanes would be swapped
    // x or z are -1/1 when facing that way (other will be 2.something)
    const forward = new THREE.Vector3();
    this.model.getWorldDirection(forward);
    console.log('forward', forward);

    // No rotation or 180 degree rotation
    if (forward.z === 1 || forward.z === -1) {
      // Lane 1
      const laneOnePoints = [
        new THREE.Vector3(
          this.position.x + laneCenter,
          this.position.y,
          this.position.z - halfWidth
        ),
        new THREE.Vector3(this.position.x + laneCenter, this.position.y, this.position.z),
        new THREE.Vector3(
          this.position.x + laneCenter,
          this.position.y,
          this.position.z + halfWidth
        ),
      ];
      // Lane 2
      const laneTwoPoints = [
        new THREE.Vector3(
          this.position.x - laneCenter,
          this.position.y,
          this.position.z - halfWidth
        ),
        new THREE.Vector3(this.position.x - laneCenter, this.position.y, this.position.z),
        new THREE.Vector3(
          this.position.x - laneCenter,
          this.position.y,
          this.position.z + halfWidth
        ),
      ];

      // If 180 degree needs swapping, otherwise above are as lanes 1 and 2
      if (forward.z === 1) {
        this.laneOnePoints = laneOnePoints;
        this.laneTwoPoints = laneTwoPoints;
      } else if (forward.z === -1) {
        this.laneOnePoints = laneTwoPoints;
        this.laneTwoPoints = laneOnePoints;
      }
    }
    // Otherwise, we're facing x axis
    else {
      // Lane 1
      const laneOnePoints = [
        new THREE.Vector3(
          this.position.x - halfWidth,
          this.position.y,
          this.position.z - laneCenter
        ),
        new THREE.Vector3(this.position.x, this.position.y, this.position.z - laneCenter),
        new THREE.Vector3(
          this.position.x + halfWidth,
          this.position.y,
          this.position.z - laneCenter
        ),
      ];
      // Lane 2
      const laneTwoPoints = [
        new THREE.Vector3(
          this.position.x - halfWidth,
          this.position.y,
          this.position.z + laneCenter
        ),
        new THREE.Vector3(this.position.x, this.position.y, this.position.z + laneCenter),
        new THREE.Vector3(
          this.position.x + halfWidth,
          this.position.y,
          this.position.z + laneCenter
        ),
      ];

      if (forward.x === 1) {
        this.laneOnePoints = laneOnePoints;
        this.laneTwoPoints = laneTwoPoints;
      } else if (forward.x === -1) {
        this.laneOnePoints = laneTwoPoints;
        this.laneTwoPoints = laneOnePoints;
      }
    }
  }
}

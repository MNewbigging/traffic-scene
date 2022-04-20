import * as THREE from 'three';

import { Lane } from './Lane';
import { NumberUtils } from '../utils/NumberUtils';
import { RoadName } from '../utils/ModelLoader';
import { RoadUtils } from '../utils/RoadUtils';

export class Road {
  public id = NumberUtils.createId();
  public neighbours: (Road | undefined)[] = [];
  public speedLimit = 1;
  // 'left' is according to the default forward direction (0, 0, 1)
  public forward = new THREE.Vector3(0, 0, 1);
  public edgePoints: THREE.Points;
  public edgePointPositions: THREE.Vector3[] = [];
  public lanes: Lane[] = [];

  constructor(public name: RoadName, public model: THREE.Group) {
    model.getWorldDirection(this.forward);
  }

  public get position(): THREE.Vector3 {
    return this.model.position;
  }

  public get rotation(): THREE.Euler {
    return this.model.rotation;
  }

  // Call this once finished moving the road
  public postTransform() {
    // Update facing direction
    this.model.updateMatrixWorld();
    this.model.getWorldDirection(this.forward);

    // Update the edge points according to model transform
    RoadUtils.copyTransforms(this.model, this.edgePoints);
    this.edgePointPositions = RoadUtils.getEdgePointPositions(this.edgePoints);

    // Setup lanes using model and edge point positions
    this.lanes.forEach((lane) => lane.setup(this.model, this.edgePointPositions));
  }

  // Connects neighbouring roads
  public connectRoads(roads: Road[]) {
    roads.forEach((road) => {
      // Find the nearest edge point's index into the edge points array
      const nearestIdx = RoadUtils.getClosestIndexFromArray(road.position, this.edgePointPositions);

      // Insert into neighbours array at that position
      this.neighbours.splice(nearestIdx, 1, road);
    });
  }

  // TODO - return halfway along line if starting/ending on this road
  public getWaypoints(fromRoad: Road, toRoad: Road): THREE.Vector3[] {
    // Can only start and end routes on straight roads which only have 2 lanes

    // If we're going to this road
    if (toRoad.id === this.id) {
      // Find a match on fromRoad within lanes
      return (
        this.lanes.find((lane) => this.neighbours[lane.fromRoadIdx]?.id === fromRoad.id)
          .waypoints ?? []
      );
    }

    // If we're going from this road
    if (fromRoad.id === this.id) {
      // Find a match on toRoad within lanes
      return (
        this.lanes.find((lane) => this.neighbours[lane.toRoadIdx]?.id === toRoad.id).waypoints ?? []
      );
    }

    // Otherwise, going through this road - match on both from and to
    let lanes = this.lanes.filter((lane) => this.neighbours[lane.toRoadIdx]?.id === toRoad.id);
    return (
      lanes.find((lane) => this.neighbours[lane.fromRoadIdx]?.id === fromRoad.id).waypoints ?? []
    );
  }
}

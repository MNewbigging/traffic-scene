import * as THREE from 'three';

import { Road } from '../model/Road';

class RoadSearch {
  public weight = 0;
  public speedLimitDelta = 0;
  public endDistance = 0;
  public totalWeight = 0;
  public parent?: RoadSearch;

  constructor(public road: Road) {}

  public equals(roadSearch: RoadSearch) {
    return this.road.id === roadSearch.road.id;
  }

  public setWeights(last: RoadSearch, end: RoadSearch) {
    // Speed limit adjustment
    this.speedLimitDelta = 100 - this.road.speedLimit;

    // Distance to end
    this.endDistance = end.road.position.distanceTo(this.road.position);

    // Weight per road type
    this.weight = 1;
    // switch (this.road.name) {
    //   case RoadName.END:
    //   case RoadName.STRAIGHT:

    //     this.weight = 1;
    //     break;
    // }

    // Total the values for this node and last node
    this.totalWeight = this.weight + this.speedLimitDelta + this.endDistance + last.totalWeight;

    // Set a reference to last node as this node's parent
    this.parent = last;
  }
}

export class Pathfinder {
  public static findRoute(start: Road, end: Road) {
    const route: RoadSearch[] = [];

    const endRoad = new RoadSearch(end);

    // Initialise open and closed node lists
    const open: RoadSearch[] = [];
    const closed: RoadSearch[] = [];

    // Add the starting node to open
    open.push(new RoadSearch(start));

    // Loop until there are no open roads to check
    while (open.length) {
      // Get the node with lowest heuristic value from open list
      let currentNode = open[0];
      let currentIdx = 0;
      open.forEach((n: RoadSearch, idx: number) => {
        if (n.totalWeight < currentNode.totalWeight) {
          currentNode = n;
          currentIdx = idx;
        }
      });

      // Remove this node from open list, add it to closed
      open.splice(currentIdx, 1);
      closed.push(currentNode);

      // Check if we've reached the end
      if (currentNode.equals(endRoad)) {
        // Backtrack to get path
        let current: RoadSearch | undefined = currentNode;
        while (current) {
          route.push(current);
          current = current.parent;
        }
        // Break out of top while loop
        break;
      }

      // Find neighbouring nodes
      currentNode.road.neighbours.forEach((node) => {
        // Continue to next iteration if this node is in closed list
        const inClosed = closed.find((n) => n.road.id === node.id);
        if (inClosed) {
          return;
        }

        // Otherwise, work out weighting values of this node
        const neighbourRoad = new RoadSearch(node);
        neighbourRoad.setWeights(currentNode, endRoad);

        // Does this node exist in open list with a worse value?
        const inOpen = open.find((n) => n.road.id === neighbourRoad.road.id);
        if (inOpen && inOpen.totalWeight < neighbourRoad.totalWeight) {
          // Don't re-add this node with a worse value
          return;
        }

        // Add this neighbour to open list
        open.push(neighbourRoad);
      });
    }

    // Return roads - not road search classes
    return route.reverse().map((rs) => rs.road);
  }

  // TODO - could roll this into above function if I don't need
  // to return the road array of a route
  public static getRouteWaypoints(route: Road[], travelDirection: THREE.Vector3) {
    const waypoints: THREE.Vector3[] = [];

    /**
     * Loop through roads, looking to next road to determine which lane to use
     * Each road knows what joins it in a given direction, so can tell which lane
     *
     * Note: taking direction by road position might not yield exact results when
     * road sizes/positions aren't the same
     */
    let dir = travelDirection;
    for (let i = 0; i < route.length; i++) {
      let curIdx = i;
      let nextIdx = i + 1;
      const curRoad = route[curIdx];
      const nextRoad = route[nextIdx];

      const points = curRoad.getLaneWaypoints(dir);
      points.forEach((p) => {
        const exists = waypoints.find((wp) => wp.equals(p));
        if (!exists) {
          waypoints.push(p);
        }
      });
      console.log('dir', dir);
      // If we've not yet reached last road
      if (nextIdx < route.length) {
        dir = nextRoad.position.clone().sub(curRoad.position).normalize();
      }
    }

    return waypoints;
  }
}

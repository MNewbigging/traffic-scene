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
      currentNode.road.neighbours.forEach((node: Road | undefined) => {
        // If there is no road at this neighbour position, continue
        if (!node) {
          return;
        }

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

  public static getRouteWaypoints(route: Road[]) {
    // Ask the road to pick a lane and return its waypoints
    // It needs to know the from and to roads to do so
    const waypoints: THREE.Vector3[] = [];

    let fromRoad, toRoad;

    const routeLength = route.length;
    for (let i = 0; i < routeLength; i++) {
      // Set the from and to roads
      fromRoad = i - 1 < 0 ? route[i] : route[i - 1];
      toRoad = i + 1 === routeLength ? route[i] : route[i + 1];

      // Get waypoints of current road using from/to roads
      route[i].getWaypoints(fromRoad, toRoad).forEach((point) => {
        // Ignore any duplicate points
        const exists = waypoints.find((wp) => wp.equals(point));
        if (!exists) {
          waypoints.push(point);
        }
      });
    }

    return waypoints;
  }
}

/**
 * On lanes and waypoints:
 *
 * Junctions and roundabouts have more than one entry and exit way,
 * therefore in order to determine the lane line it needs to know the
 * entry and exit being used.
 *
 * Should restructure the model so that, for each road:
 * - given an entry and exit direction,
 * - can return the proper line (following lane) from entry to exit
 */

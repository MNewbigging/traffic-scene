import * as THREE from 'three';

import { CameraManager } from '../state/cameras/CameraManager';
import { GameEventListener, GameEventType } from '../state/listeners/GameEventListener';
import { MouseListener } from '../state/listeners/MouseListener';
import { SceneState } from '../state/SceneState';

/**
 * Responsible for determining which items in the scene have been selected on click events.
 */
export class SceneSelector {
  constructor(
    private sceneState: SceneState,
    private cameraManager: CameraManager,
    private mouseListener: MouseListener,
    private gameEventListener: GameEventListener
  ) {
    mouseListener.on('leftclickup', this.onLeftClick);
    mouseListener.on('doubleclick', this.onDoubleClick);
  }

  private onLeftClick = () => {
    // Determine if clicked on a selectable object
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(this.mouseListener.screenPos, this.cameraManager.camera);

    for (const vehicle of this.sceneState.vehicles) {
      const intersects = raycaster.intersectObject(vehicle.bounds);
      if (intersects.length) {
        this.gameEventListener.fireEvent({ type: GameEventType.SELECTED_VEHICLE, vehicle });
        return;
      }
    }
  };

  private onDoubleClick = () => {
    // Determine if user clicked on focusable object
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(this.mouseListener.screenPos, this.cameraManager.camera);

    for (const road of this.sceneState.roads) {
      const intersects = raycaster.intersectObject(road.model);
      if (intersects.length) {
        this.gameEventListener.fireEvent({
          type: GameEventType.DOUBLE_CLICK_OBJECT,
          intersectPos: intersects[0].point,
        });
        return;
      }
    }

    for (const prop of this.sceneState.props) {
      const intersects = raycaster.intersectObject(prop.model);
      if (intersects.length) {
        this.gameEventListener.fireEvent({
          type: GameEventType.DOUBLE_CLICK_OBJECT,
          intersectPos: intersects[0].point,
        });
        return;
      }
    }
  };
}

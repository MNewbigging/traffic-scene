import { action, makeObservable, observable } from 'mobx';

import { GameState } from './state/GameState';
import { ModelLoader } from './loaders/ModelLoader';

export class AppState {
  public loading = true;
  public gameState: GameState;

  // TODO - will need a general game loader that loads models, textures, fonts etc
  private modelLoader: ModelLoader;

  constructor() {
    makeObservable(this, {
      loading: observable,
      onAssetsLoaded: action,
    });
  }

  public loadGame() {
    this.modelLoader = new ModelLoader();
    this.modelLoader.load(this.onAssetsLoaded);
  }

  public onAssetsLoaded = () => {
    this.gameState = new GameState(
      document.getElementById('main-canvas') as HTMLCanvasElement,
      this.modelLoader
    );

    this.loading = false;

    // Start game after short delay to allow time for UI to mount
    // TODO - some fade-out of loading screen to cover this period
    setTimeout(() => this.gameState.start(), 10);
  };
}

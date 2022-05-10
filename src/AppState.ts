import { action, makeObservable, observable } from 'mobx';

import { GameState } from './state/GameState';
import { ModelLoader } from './loaders/ModelLoader';
import { TestEventType, TestListener } from './state/listeners/TestListener';
import { UIState } from './state/ui/UIState';

export class AppState {
  public loading = true;
  public gameState: GameState = undefined;
  public uiState: UIState = undefined;

  // TODO - will need a general game loader that loads models, textures, fonts etc
  private modelLoader: ModelLoader;

  private testListener = new TestListener();

  constructor() {
    makeObservable(this, {
      loading: observable,
      onAssetsLoaded: action,
    });

    this.testTheListener();
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

    this.uiState = new UIState(this.gameState.gameEventListener);
    this.loading = false;

    // Start game after short delay to allow time for UI to mount
    // TODO - some fade-out of loading screen to cover this period
    setTimeout(() => this.gameState.start(), 10);
  };

  private testTheListener() {
    // Subscribe to an event
    this.testListener.on(TestEventType.TEST_1, this.onEventOne);

    // Fire off event 1
    this.testListener.fire(TestEventType.TEST_1, { propOne: 'propOne', propTwo: 10 });

    // Fire off event 2
    this.testListener.fire(TestEventType.TEST_2, { thingA: ['yes', 'no'], thingB: [1, 2, 3] });
  }

  private onEventOne = (props: { propOne: string; propTwo: number }) => {
    console.log('got event', props);
  };
}

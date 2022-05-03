/**
 * The world clock keeps in-game time, and provides methods for pausing,
 * resuming and fast-forwarding time.
 */
export enum WorldClockRate {
  PAUSED = 'paused',
  NORMAL = 'normal',
  FAST = 'fast',
}

export class WorldClock {
  public rate = WorldClockRate.NORMAL;

  public pause() {}

  public resume() {}

  public fastForward() {}
}

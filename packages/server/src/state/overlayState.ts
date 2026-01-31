import type { OverlayState, OverlayName } from '@cs2overlay/shared';

const defaultComponentState = { visible: true, opacity: 1 };

function createDefaultState(): OverlayState {
  return {
    scoreboard: { ...defaultComponentState },
    bp: { ...defaultComponentState },
    lowerThird: { ...defaultComponentState },
    topBar: { ...defaultComponentState },
    mapVeto: { ...defaultComponentState },
    countdown: { ...defaultComponentState },
    replay: { ...defaultComponentState },
    break: { ...defaultComponentState },
    sponsor: { ...defaultComponentState },
    playerCam: { ...defaultComponentState },
  };
}

export class OverlayStateManager {
  private state: OverlayState = createDefaultState();

  toggle(name: OverlayName, visible: boolean): OverlayState {
    this.state[name] = { ...this.state[name], visible };
    return this.state;
  }

  setOpacity(name: OverlayName, opacity: number): OverlayState {
    this.state[name] = {
      ...this.state[name],
      opacity: Math.max(0, Math.min(1, opacity)),
    };
    return this.state;
  }

  getState(): OverlayState {
    return this.state;
  }

  reset(): void {
    this.state = createDefaultState();
  }
}

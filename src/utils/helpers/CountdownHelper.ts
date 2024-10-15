import Cache from '../../utils/redis/Cache';
import CacheKey from '../../utils/redis/CacheKey';
import VortexModule from '../chain/VortexModule';

let previousLastRoundTime: string | null | undefined = null;
let startGameFlag = false;

const decrementCountdown = async () => {
  try {
    const lastRoundTime = Cache.get(CacheKey.lastRoundTime);
    if (lastRoundTime === undefined) {
      const lastRoundTimeFromDb =
        (await VortexModule.getLastRoundTime()) as string;
      if (lastRoundTimeFromDb === undefined) return;
      Cache.set(CacheKey.lastRoundTime, lastRoundTimeFromDb);
      return;
    }

    if (previousLastRoundTime !== lastRoundTime) {
      previousLastRoundTime = lastRoundTime;
      return;
    }

    const now = Date.now();
    const nextRoundTime = (Number(lastRoundTime) + 90) * 1000;
    if (now < nextRoundTime) return;

    if (startGameFlag) return;

    startGameFlag = true;
    console.log('# Trigger start game');
    await VortexModule.startGame();
    console.log('# End start game');
    startGameFlag = false;
  } catch (err) {
    console.error('Error decrementing countdown:', err);
  }
};

export default decrementCountdown;

import ChainHelper from './ChainHelper';
import decrementCountdown from './CountdownHelper';

const startPolling = () => {
  setInterval(decrementCountdown, 1000);
  setInterval(ChainHelper.parseHistoryBlock, 200);
  setInterval(ChainHelper.fetchGameWinnerStatus, 800);
  setInterval(ChainHelper.getGameStatus, 2000);
};

export default startPolling;

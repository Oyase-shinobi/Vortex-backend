import Cache from '../../utils/redis/Cache';
import CacheKey from '../../utils/redis/CacheKey';
import BlockTable from '../database/tables/BlockTable';
import VortexModule from '../chain/VortexModule';
import aptos from '../chain/Aptos';

const parseHistoryBlock = async () => {
  try {
    const ledgerInfo = await aptos.getLedgerInfo();
    const blockNumber = Number(ledgerInfo.block_height);
    // console.log('# Chain blockNumber', blockNumber);
    Cache.set(CacheKey.blockNumber, blockNumber.toString());

    const parsedBlockNumberItem = await BlockTable.getBlockNumber();
    if (parsedBlockNumberItem === null) return;

    const parsedBlockNumber = Number(parsedBlockNumberItem.block_number);
    const fetchBlockNumberLock = Cache.get(CacheKey.fetchBlockNumberLock);
    // console.log('# DB parsedBlockNumber', parsedBlockNumber);

    if (parsedBlockNumber < blockNumber && fetchBlockNumberLock !== '1') {
      // console.log('# Fetch history:', parsedBlockNumber);
      Cache.set(CacheKey.fetchBlockNumberLock, '1');
      await VortexModule.fetchBlockTransactions(parsedBlockNumber);
      await BlockTable.setBlockNumber(parsedBlockNumber + 1);
      Cache.set(CacheKey.fetchBlockNumberLock, '0');
    }
  } catch (err) {
    Cache.set(CacheKey.fetchBlockNumberLock, '0');
    console.error(err);
  }
};

const fetchGameWinnerStatus = async () => {
  try {
    const fetchWinnerLock = Cache.get(CacheKey.fetchWinnerLock);
    if (fetchWinnerLock === '1') return;

    Cache.set(CacheKey.fetchWinnerLock, '1');
    const ledgerInfo = await aptos.getLedgerInfo();
    const blockNumber = Number(ledgerInfo.block_height);
    const latestWinnerBlockNumberItem = Cache.get(
      CacheKey.latestWinnerBlockNumber,
    );

    if (latestWinnerBlockNumberItem !== undefined) {
      const latestWinnerBlockNumber = Number(latestWinnerBlockNumberItem);
      if (latestWinnerBlockNumber === blockNumber) {
        Cache.set(CacheKey.fetchWinnerLock, '0');
        return;
      }

      for (
        let start = latestWinnerBlockNumber;
        start <= blockNumber;
        start += 1
      ) {
        // console.log('# fetchGameWinnerStatus (loop)', start);
        await VortexModule.fetchBlockTransactions(start);
      }

      Cache.setMax(CacheKey.latestWinnerBlockNumber, blockNumber.toString());
      Cache.set(CacheKey.fetchWinnerLock, '0');
      return;
    }

    // console.log('# fetchGameWinnerStatus', blockNumber);
    await VortexModule.fetchBlockTransactions(blockNumber);
    Cache.setMax(CacheKey.latestWinnerBlockNumber, blockNumber.toString());
    Cache.set(CacheKey.fetchWinnerLock, '0');
  } catch (err) {
    Cache.set(CacheKey.fetchWinnerLock, '0');
    console.error(err);
  }
};

const getGameStatus = async () => {
  try {
    const fetchStatusLock = Cache.get(CacheKey.fetchStatusLock);
    if (fetchStatusLock === '1') return;

    Cache.set(CacheKey.fetchStatusLock, '1');
    const gameStatus = await VortexModule.getGameStatus();
    Cache.set(CacheKey.fetchStatusLock, '0');
    Cache.set(CacheKey.gameStatus, JSON.stringify(gameStatus));
  } catch (err) {
    console.error(err);
  }
};

export default { parseHistoryBlock, fetchGameWinnerStatus, getGameStatus };

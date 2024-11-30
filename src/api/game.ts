import express from 'express';

import Cache from '../utils/redis/Cache';
import CacheKey from '../utils/redis/CacheKey';
import RoundTable from '../utils/database/tables/RoundTable';
import PlayerRoundEntryTable from '../utils/database/tables/PlayerRoundEntryTable';
import VortexModule from '../utils/chain/VortexModule';
import ColorHelper from '../utils/helpers/ColorHelper';

const router = express.Router();

router.get(`/game/status`, async (req, res, next) => {
  const now = Date.now();
  const gameStatusFromCache = Cache.get(CacheKey.gameStatus);
  const gameStatusTimeFromCache = Cache.get(CacheKey.gameStatusTime);

  if (
    gameStatusFromCache !== undefined &&
    Number(gameStatusTimeFromCache) + 4_000 >= now
  ) {
    res.status(200).send(JSON.parse(gameStatusFromCache));
    return;
  }

  const gameStatus = await VortexModule.getGameStatus();
  res.status(200).send(gameStatus);

  Cache.set(CacheKey.gameStatus, JSON.stringify(gameStatus));
  Cache.set(CacheKey.gameStatusTime, now.toString());
});

router.get(`/game/winner/:round`, async (req, res, next) => {
  const { round } = req.params;
  const key = `${CacheKey.winner}-${round}`;
  const winnerByRound = Cache.get(key);
  if (winnerByRound === null || winnerByRound === undefined) {
    res.json({ isComplete: false });
    return;
  }
  const winnerByRoundJson = JSON.parse(winnerByRound);
  res.json({ isComplete: true, ...winnerByRoundJson });
});

router.get(`/game/history/:address/:page`, async (req, res, next) => {
  const { address, page } = req.params;
  if (Number(page) <= 0) {
    res.status(400).json({ error: 'Invalid page number' });
  }
  const count = await RoundTable.getRoundCount();
  const pages = Math.ceil(count / 20);
  const roundRecord = await RoundTable.getRoundByPage(
    address,
    Number(page),
    20,
  );
  res.json({ result: roundRecord, pages });
});

router.get(`/game/my-history/:address/:page`, async (req, res, next) => {
  const { address, page } = req.params;
  if (Number(page) <= 0) {
    res.status(400).json({ error: 'Invalid page number' });
  }
  const count =
    await PlayerRoundEntryTable.getPlayerRoundEntryAndRoundInfoByAddressCount(
      address,
    );
  const pages = Math.ceil(count / 20);
  const entryAndRoundRecord =
    await PlayerRoundEntryTable.getPlayerRoundEntryAndRoundInfoByAddressPagination(
      address,
      Number(page),
      20,
    );
  res.json({ result: entryAndRoundRecord, pages });
});

router.get(`/game/colors`, async (req, res, next) => {
  res.json({ colors: ColorHelper });
});

// NOTE: test only...
// router.get(`/game/start`, async (req, res, next) => {
//   const result = await VortexModule.startGame();
//   res.status(200).send(result);
// });

// NOTE: test only...
// router.get(`/game/parse/:block`, async (req, res, next) => {
//   const { block } = req.params;
//   await VortexModule.fetchBlockTransactions(Number(block));
//   res.status(200).send({});
// });

export default router;

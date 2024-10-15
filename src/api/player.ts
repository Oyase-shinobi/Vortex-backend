import express from 'express';

import EntryTable from '../utils/database/tables/EntryTable';
import PlayerWinningStatus from '../utils/models/PlayerWinningStatus';
import PlayerPrize from '../utils/models/PlayerPrize';
import RoundTable from '../utils/database/tables/RoundTable';
import VortexModule from '../utils/chain/VortexModule';

const router = express.Router();

router.get(`/player/win/:address`, async (req, res, next) => {
  const { address } = req.params;

  const roundList = await RoundTable.getRoundByWinnerAddress(address);
  const highestWin = roundList.reduce((accum, item) => {
    return item.winner_multiplier > accum ? item.winner_multiplier : accum;
  }, 0);

  const playerWinningStatus = new PlayerWinningStatus({
    winCount: roundList.length,
    highestWin,
  });

  res.status(200).send(playerWinningStatus);
});

router.get(`/player/prize/:address`, async (req, res, next) => {
  const { address } = req.params;

  const unclaimedPrize = await VortexModule.getUnclaimedPrizeByAddress(address);

  const playerPrize = new PlayerPrize({
    prize: unclaimedPrize ?? '0',
  });

  res.status(200).send(playerPrize);
});

router.get(`/player/future/:address/:round`, async (req, res, next) => {
  const { address, round } = req.params;

  const futureEntryList = await EntryTable.getFutureEntryByAddress(
    address,
    Number(round),
  );

  const futureEntryCount = futureEntryList.length;
  const futureEntryTotal = futureEntryList.reduce((accum, item) => {
    return (accum += Number(item.player_entry));
  }, 0);

  res.status(200).send({
    futureEntryCount,
    futureEntryTotal,
  });
});

export default router;

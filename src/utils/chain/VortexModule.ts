import {
  CommittedTransactionResponse,
  EntryFunctionPayloadResponse,
  InputViewFunctionData,
  isUserTransactionResponse,
  UserTransactionResponse,
} from '@aptos-labs/ts-sdk';

import aptos, { account } from './Aptos';

import envConfig from '../env/envConfig';
import GameStatus from '../models/GameStatus';
import RoundTable from '../database/tables/RoundTable';
import Round from '../models/dataModels/Round';
import EntryTable from '../database/tables/EntryTable';
import Entry from '../models/dataModels/Entry';
import PlayerRoundEntry from '../models/dataModels/PlayerRoundEntry';
import PlayerRoundEntryTable from '../database/tables/PlayerRoundEntryTable';
import ClaimPrizeRecord from '../models/dataModels/ClaimPrizeRecord';
import ClaimPrizeRecordTable from '../database/tables/ClaimPrizeRecordTable';
import CacheKey from '../redis/CacheKey';
import Cache from '../redis/Cache';
import { shuffleColorArray } from '../helpers/ColorHelper';

const VORTEX: `${string}::${string}` = `${envConfig.CONTRACT_ADDRESS}::${envConfig.MODULE_NAME}`;

class VortexModule {
  getLastRoundTime = async () => {
    try {
      const payload: InputViewFunctionData = {
        function: `${VORTEX}::get_last_round_time`,
      };
      return (await aptos.view({ payload }))[0];
    } catch (error) {
      console.error(`# get_last_round_time error: ${error}`);
    }
  };

  getCurrentRoundPlayer = async () => {
    try {
      const payload: InputViewFunctionData = {
        function: `${VORTEX}::get_current_round_player`,
      };
      return (await aptos.view({ payload }))[0];
    } catch (error) {
      console.error(`# getCurrentRoundPlayer error: ${error}`);
    }
  };

  getCurrentRoundPrize = async () => {
    try {
      const payload: InputViewFunctionData = {
        function: `${VORTEX}::get_current_round_prize`,
      };
      return (await aptos.view({ payload }))[0];
    } catch (error) {
      console.error(`# getCurrentRoundPrize error: ${error}`);
    }
  };

  getUnclaimedPrizeByAddress = async (address: string) => {
    try {
      const payload: InputViewFunctionData = {
        function: `${VORTEX}::get_unclaimed_prize`,
        functionArguments: [address],
      };
      return (await aptos.view({ payload }))[0] as string;
    } catch (error) {
      console.error(`# getUnclaimedPrizeByAddress error: ${error}`);
    }
  };

  getGameStatus = async () => {
    try {
      const payload: InputViewFunctionData = {
        function: `${VORTEX}::get_current_game_status`,
      };
      const gameStatus: any = (await aptos.view({ payload }))[0];
      return new GameStatus(gameStatus);
    } catch (error) {
      console.error(`# getGameStatus error: ${error}`);
    }
  };

  startGame = async () => {
    try {
      const transaction = await aptos.transaction.build.simple({
        sender: account.accountAddress,
        data: {
          function: `${VORTEX}::start_game`,
          functionArguments: [],
        },
      });
      const senderAuthenticator = aptos.transaction.sign({
        signer: account,
        transaction,
      });
      const committedTransaction = await aptos.transaction.submit.simple({
        transaction,
        senderAuthenticator,
      });
      const executedTransaction = await aptos.waitForTransaction({
        transactionHash: committedTransaction.hash,
      });

      await this.parseStartGameLog(
        executedTransaction as UserTransactionResponse,
      );
    } catch (error) {
      console.error(`# startGame error: ${error}`);
      return;
    }
  };

  parseStartGameLog = async (tx: UserTransactionResponse) => {
    try {
      for (const event of tx.events) {
        const { data, type } = event;
        const [sourceAddress, _, eventName] = type.split('::');

        if (sourceAddress !== envConfig.CONTRACT_ADDRESS) {
          continue;
        }

        await this.startGameLogParser(data, eventName);
        await this.handleEvent(
          eventName,
          data,
          tx.hash,
          Math.floor(Number(tx.timestamp) / 1000000),
        );
      }
    } catch (error) {
      console.error(`# parseStartGameLog error: ${error}`);
    }
  };

  startGameLogParser = async (data: any, eventName: string) => {
    try {
      if (eventName === 'Winner') {
        const { currentRound, winnerAddress } = data;
        const round = Number(currentRound);
        const key = `${CacheKey.winner}-${round}`;
        const content = {
          round,
          isWinner: true,
          winnerAddress,
        };
        console.log(`Winner for round ${round}: ${winnerAddress}`);
        shuffleColorArray();
        Cache.set(key, JSON.stringify(content));
      }
      if (eventName === 'NoWinner') {
        const { currentRound } = data;
        const round = Number(currentRound);
        const key = `${CacheKey.winner}-${round}`;
        const content = {
          round,
          isWinner: false,
        };
        console.log(`No Winner for round: ${round}`);
        Cache.set(key, JSON.stringify(content));
      }
      if (eventName === 'UpdateLastRoundTime') {
        const { time } = data;
        console.log(`Update last round time: ${time}`);
        const savedLastRoundTime = Number(
          Cache.get(CacheKey.lastRoundTime) ?? 0,
        );
        if (Number(time) <= savedLastRoundTime) return;
        Cache.set(CacheKey.lastRoundTime, time);
      }
    } catch (error) {
      console.error(`# startGameLogParser error: ${error}`);
    }
  };

  fetchBlockTransactions = async (blockNumber: number) => {
    try {
      const block = await aptos.getBlockByHeight({
        blockHeight: blockNumber,
        options: { withTransactions: true },
      });
      if (block === null) {
        console.error(`# block #${blockNumber} is null`);
        return;
      }

      for (const tx of block.transactions!) {
        if (!isUserTransactionResponse(tx)) {
          continue;
        }
        if (tx.payload.type !== 'entry_function_payload') {
          continue;
        }
        const payload = tx.payload as EntryFunctionPayloadResponse;
        const targetAddress = payload.function.split('::')[0];
        if (targetAddress !== envConfig.CONTRACT_ADDRESS) {
          continue;
        }
        await this.parseLogFromBlock(
          tx,
          Math.floor(Number(block.block_timestamp) / 1000000),
        );
      }
    } catch (error) {
      console.error(`# fetchBlockTransactions error: ${error}`);
    }
  };

  parseLogFromBlock = async (
    tx: UserTransactionResponse,
    timestamp: number,
  ) => {
    if (tx.events.length === 0) return;
    const hash = tx.hash;

    for (const event of tx.events) {
      const { data, type } = event;
      const [sourceAddress, _, eventName] = type.split('::');

      if (sourceAddress !== envConfig.CONTRACT_ADDRESS) {
        continue;
      }
      // console.log(`parseLogFromBlock ${eventName}`, data);

      await this.handleEvent(eventName, data, hash, timestamp);
    }
  };

  handleEvent = async (
    eventName: string,
    data: any,
    hash: string,
    timestamp: number,
  ) => {
    if (eventName === 'NewRound') {
      await this.newRoundEvent(data);
    }
    if (eventName === 'EnterGame') {
      await this.enterGameEvent({ ...data, hash, timestamp });
    }
    if (eventName === 'NoWinner') {
      await this.noWinnerEvent({ ...data, hash, timestamp });
    }
    if (eventName === 'ClaimPrize') {
      await this.claimPrizeEvent({ ...data, hash, timestamp });
    }
    if (eventName === 'Winner') {
      await this.winnerEvent({ ...data, hash, timestamp });
    }
    if (eventName === 'PlayerRoundEntry') {
      await this.playerRoundEntryEvent(data);
    }
  };

  enterGameEvent = async ({
    entry,
    playerAddress,
    rounds,
    startRound,
    hash,
    timestamp,
  }: {
    entry: string;
    playerAddress: string;
    rounds: string;
    startRound: string;
    hash: string;
    timestamp: number;
  }) => {
    console.log('enterGameEvent');
    for (let index = 0; index < Number(rounds); index += 1) {
      const entryItem = new Entry({
        entry_tx_hash: hash,
        player_address: playerAddress,
        player_entry: BigInt(entry),
        round: Number(startRound) + index,
        is_continued: false,
        original_round: null,
        created_at: timestamp,
      });
      await EntryTable.createEntry(entryItem);
    }
  };

  newRoundEvent = async ({ round }: { round: string }) => {
    console.log('newRoundEvent');
    await RoundTable.newRound(Number(round));
  };

  noWinnerEvent = async ({
    currentRound,
    playerCount,
    prize,
    hash,
    timestamp,
  }: {
    currentRound: string;
    playerCount: string;
    prize: string;
    hash: string;
    timestamp: number;
  }) => {
    console.log('noWinnerEvent');
    const roundItem = new Round({
      id: Number(currentRound),
      player_count: Number(playerCount),
      no_winner: true,
      prize_pool: BigInt(prize),
      finish_tx_hash: hash,
      winner_address: '',
      winner_entry: null,
      winner_multiplier: 0,
      finish_at: timestamp,
    });
    await RoundTable.noWinner(roundItem);

    const entryList = await EntryTable.getEntryByRound(Number(currentRound));
    for (const entry of entryList) {
      const entryItem = new Entry({
        entry_tx_hash: entry.entry_tx_hash,
        player_address: entry.player_address,
        player_entry: BigInt(entry.player_entry),
        round: Number(currentRound) + 1,
        is_continued: true,
        original_round: Number(currentRound),
        created_at: timestamp,
      });
      console.log('No winner entry', entryItem);
      await EntryTable.createEntry(entryItem);
    }
  };

  claimPrizeEvent = async ({
    claimAddress,
    value,
    hash,
    timestamp,
  }: {
    claimAddress: string;
    value: string;
    hash: string;
    timestamp: number;
  }) => {
    console.log('claimPrizeEvent');
    const record = new ClaimPrizeRecord({
      claim_tx_hash: hash,
      claim_address: claimAddress,
      claim_token: 'APT',
      claim_amount: BigInt(value),
      created_at: timestamp,
    });
    await ClaimPrizeRecordTable.createClaimPrizeRecord(record);
  };

  winnerEvent = async ({
    currentRound,
    playerEntry,
    winnerAddress,
    prize,
    playerCount,
    hash,
    timestamp,
  }: {
    currentRound: string;
    playerEntry: string;
    winnerAddress: string;
    prize: string;
    playerCount: string;
    hash: string;
    timestamp: number;
  }) => {
    console.log('winnerEvent');
    const multiplier = Number(prize) / Number(playerEntry);
    const roundItem = new Round({
      id: Number(currentRound),
      player_count: Number(playerCount),
      no_winner: false,
      prize_pool: BigInt(prize),
      finish_tx_hash: hash,
      winner_address: winnerAddress,
      winner_entry: BigInt(playerEntry),
      winner_multiplier: multiplier,
      finish_at: timestamp,
    });
    await RoundTable.winner(roundItem);
  };

  playerRoundEntryEvent = async ({
    currentRound,
    entry,
    playerAddress,
  }: {
    currentRound: string;
    entry: string;
    playerAddress: string;
  }) => {
    console.log('playerRoundEntryEvent');
    const playerRoundEntry = new PlayerRoundEntry({
      player_address: playerAddress,
      player_entry: BigInt(entry),
      round: Number(currentRound),
    });
    await PlayerRoundEntryTable.createPlayerRoundEntry(playerRoundEntry);
  };
}

const vortexModule = new VortexModule();

export default vortexModule;

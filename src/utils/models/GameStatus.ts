import PlayerEntry from '../models/PlayerEntry';

type EntryListItem = {
  entry: string | number;
  entryTime: string | number;
  player: `0x${string}`;
};

class GameStatus {
  round: string;
  players: string;
  prize: string;
  entryList: PlayerEntry[];
  lastRoundTime: string;

  constructor({
    round,
    players,
    prize,
    entryList,
    lastRoundTime,
  }: {
    round: string | number;
    players: string | number;
    prize: string | number;
    entryList: EntryListItem[];
    lastRoundTime: string | number;
  }) {
    this.round = round.toString();
    this.lastRoundTime = lastRoundTime.toString();

    this.players = players.toString();
    this.prize = prize.toString();

    let parsedEntryList = entryList.map(
      (item) => new PlayerEntry({ ...item, round }),
    );
    parsedEntryList.sort((a, b) => {
      if (a.entryTimeBigInt! > b.entryTimeBigInt!) {
        return 1;
      } else if (a.entryTimeBigInt! < b.entryTimeBigInt!) {
        return -1;
      } else {
        return 0;
      }
    });
    parsedEntryList.forEach((item, index) => {
      delete item.entryTimeBigInt;
      item.index = index;
    });
    parsedEntryList.sort((a, b) => {
      if (Number(a.entry) < Number(b.entry)) {
        return 1;
      } else if (Number(a.entry) > Number(b.entry)) {
        return -1;
      } else {
        return 0;
      }
    });
    this.entryList = parsedEntryList;
  }
}

export default GameStatus;

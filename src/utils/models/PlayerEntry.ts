class PlayerEntry {
  round: string;
  entry: string;
  entryTime: string;
  entryTimeBigInt?: bigint;
  player: string;
  index?: number;

  constructor({
    round,
    entry,
    entryTime,
    player,
  }: {
    round: string | number;
    entry: string | number;
    entryTime: string | number;
    player: `0x${string}`;
  }) {
    this.round = round.toString();
    this.entry = entry.toString();
    this.entryTime = entryTime.toString();
    this.entryTimeBigInt = BigInt(entryTime);
    this.player = player;
  }
}

export default PlayerEntry;

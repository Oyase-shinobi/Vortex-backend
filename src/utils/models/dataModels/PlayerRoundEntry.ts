class PlayerRoundEntry {
  player_address: string;
  player_entry: string;
  round: number;

  constructor({
    player_address,
    player_entry,
    round,
  }: {
    player_address: string;
    player_entry: bigint;
    round: number;
  }) {
    this.player_address = player_address;
    this.player_entry = player_entry.toString();
    this.round = round;
  }
}

export default PlayerRoundEntry;

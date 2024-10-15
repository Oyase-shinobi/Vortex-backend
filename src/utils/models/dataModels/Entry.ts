class Entry {
  entry_tx_hash: string;
  player_address: string;
  player_entry: string;
  round: number;
  is_continued: boolean;
  original_round: number | null;
  created_at: number;

  constructor({
    entry_tx_hash,
    player_address,
    player_entry,
    round,
    is_continued,
    original_round,
    created_at,
  }: {
    entry_tx_hash: string;
    player_address: string;
    player_entry: bigint;
    round: number;
    is_continued: boolean;
    original_round: number | null;
    created_at: number;
  }) {
    this.entry_tx_hash = entry_tx_hash;
    this.player_address = player_address;
    this.player_entry = player_entry.toString();
    this.round = round;
    this.is_continued = is_continued;
    this.original_round = original_round;
    this.created_at = created_at;
  }
}

export default Entry;

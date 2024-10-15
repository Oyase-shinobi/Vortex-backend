class Round {
  id: number;
  player_count: number;
  no_winner: boolean;
  prize_pool: string;
  finish_tx_hash: string;
  winner_address: string;
  winner_entry: string;
  winner_multiplier: number;
  finish_at: Date | null;

  constructor({
    id,
    player_count,
    no_winner,
    prize_pool,
    finish_tx_hash,
    winner_address,
    winner_entry,
    winner_multiplier,
    finish_at,
  }: {
    id: number;
    player_count: number;
    no_winner: boolean;
    prize_pool: bigint;
    finish_tx_hash: string;
    winner_address: string;
    winner_entry: bigint | null;
    winner_multiplier: number;
    finish_at: number | null;
  }) {
    this.id = id;
    this.player_count = player_count;
    this.no_winner = no_winner;
    this.finish_tx_hash = finish_tx_hash;
    this.prize_pool = prize_pool.toString();
    this.winner_address = winner_address;
    this.winner_entry = winner_entry?.toString() ?? '';
    this.winner_multiplier = Number(winner_multiplier);
    this.finish_at = finish_at === null ? null : new Date(finish_at * 1000);
  }
}

export default Round;

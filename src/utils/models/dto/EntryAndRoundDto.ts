export default interface EntryAndRoundDto {
  id: number;
  round: number;
  player_address: string;
  player_entry: string;
  entry_tx_hash: string;
  is_continued: boolean;
  original_round: number | null;
  created_at: Date | null;

  player_count: number;
  no_winner: boolean;
  prize_pool: string;
  finish_tx_hash: string;
  winner_address: string;
  winner_entry: string;
  winner_multiplier: number;
  finish_at: Date | null;
}

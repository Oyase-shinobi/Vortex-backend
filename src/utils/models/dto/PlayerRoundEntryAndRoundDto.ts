export default interface PlayerRoundEntryAndRoundDto {
  id: number;
  round: number;
  player_address: string;
  player_entry: string;

  player_count: number;
  no_winner: boolean;
  prize_pool: string;
  finish_tx_hash: string;
  winner_address: string;
  winner_entry: string;
  winner_multiplier: number;
  finish_at: Date | null;
}

export default interface EntryDto {
  id: number;
  round: number;
  player_address: string;
  player_entry: string;
  entry_tx_hash: string;
  is_continued: boolean;
  original_round: number | null;
  created_at: Date | null;
}

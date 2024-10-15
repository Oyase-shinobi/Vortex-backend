import Table from './Table';

import PlayerRoundEntry from '../../models/dataModels/PlayerRoundEntry';
import PlayerRoundEntryDto from '../../models/dto/PlayerRoundEntryDto';
import PlayerRoundEntryAndRoundDto from '../../models/dto/PlayerRoundEntryAndRoundDto';

class PlayerRoundEntryTable extends Table {
  static createPlayerRoundEntry = (entry: PlayerRoundEntry) => {
    return this.sql`
      INSERT INTO public.player_round_entries (round, player_address, player_entry)
      SELECT ${entry.round}, ${entry.player_address}, ${entry.player_entry}
      ON CONFLICT DO NOTHING;
    `;
  };

  static getPlayerRoundEntryByAddress = async (address: string) => {
    return this.sql`
      SELECT * FROM public.player_round_entries WHERE player_address::text = ${address};
    `.then((res) => {
      return res.map((item) => item as PlayerRoundEntryDto);
    });
  };

  static getPlayerRoundEntryByRound = async (round: number) => {
    return this.sql`
      SELECT * FROM public.player_round_entries WHERE round = ${round};
    `.then((res) => {
      return res.map((item) => item as PlayerRoundEntryDto);
    });
  };

  static getPlayerRoundEntryAndRoundInfoByAddressPagination = async (
    address: string,
    page: number,
    contentPerPage: number,
  ) => {
    if (page < 1) {
      return [];
    }
    const offset = (page - 1) * contentPerPage;
    return this.sql`
      SELECT player_round_entries.*, rounds.player_count, rounds.no_winner, rounds.prize_pool, rounds.winner_address, rounds.winner_entry, rounds.winner_multiplier, rounds.finish_at, rounds.finish_tx_hash
      FROM public.player_round_entries
      INNER JOIN public.rounds ON public.player_round_entries.round = public.rounds.id
      WHERE player_round_entries.player_address = ${address}
      ORDER BY round DESC
      LIMIT ${contentPerPage} OFFSET ${offset};
    `.then((res) => {
      return res.map((item) => item as PlayerRoundEntryAndRoundDto);
    });
  };

  static getPlayerRoundEntryAndRoundInfoByAddressCount = async (
    address: string,
  ) => {
    return this.sql`
      SELECT count(1)
      FROM public.player_round_entries
      INNER JOIN public.rounds ON public.player_round_entries.round = public.rounds.id
      WHERE player_round_entries.player_address = ${address};
    `.then((res) => {
      return res[0].count;
    });
  };
}

export default PlayerRoundEntryTable;

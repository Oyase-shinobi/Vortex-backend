import Table from './Table';

import Entry from '../../models/dataModels/Entry';
import EntryDto from '../../models/dto/EntryDto';
import EntryAndRoundDto from '../../models/dto/EntryAndRoundDto';

class EntryTable extends Table {
  static createEntry = (entry: Entry) => {
    return this.sql`
      INSERT INTO public.entries (round, player_address, player_entry, entry_tx_hash, is_continued, original_round)
      SELECT ${entry.round}, ${entry.player_address}, ${entry.player_entry}, ${entry.entry_tx_hash}, ${entry.is_continued}, ${entry.original_round}
      ON CONFLICT DO NOTHING;
    `;
  };

  static getFutureEntryByAddress = async (address: string, round: number) => {
    const res = await this.sql`
      SELECT * FROM public.entries 
      WHERE player_address::text = ${address} AND round > ${round};
    `;
    return res.map((item) => item as EntryDto);
  };

  static getEntryByAddress = async (address: string) => {
    return this.sql`
      SELECT * FROM public.entries WHERE player_address::text = ${address};
    `.then((res) => {
      return res.map((item) => item as EntryDto);
    });
  };

  static getEntryByRound = async (round: number) => {
    return this.sql`
      SELECT * FROM public.entries WHERE round = ${round};
    `.then((res) => {
      return res.map((item) => item as EntryDto);
    });
  };

  static getEntryByRoundAndAddress = async (
    minRound: number,
    maxRound: number,
    address: string,
  ) => {
    return this.sql`
      SELECT * FROM public.entries WHERE round <= ${maxRound} AND round >= ${minRound} AND player_address = ${address};
    `.then((res) => {
      return res.map((item) => item as EntryDto);
    });
  };

  static getEntryAndRoundInfoByAddress = async (address: string) => {
    return this.sql`
      SELECT entries.*, rounds.player_count, rounds.no_winner, rounds.prize_pool, rounds.winner_address, rounds.winner_entry, rounds.winner_multiplier, rounds.finish_at
      FROM public.entries
      INNER JOIN public.rounds ON public.entries.round = public.rounds.id
      WHERE entries.player_address = ${address}
      ORDER BY round DESC;
    `.then((res) => {
      return res.map((item) => item as EntryAndRoundDto);
    });
  };

  static getEntryAndRoundInfoByAddressPagination = async (
    address: string,
    page: number,
    contentPerPage: number,
  ) => {
    if (page < 1) {
      return [];
    }
    const offset = (page - 1) * contentPerPage;
    return this.sql`
      SELECT entries.*, rounds.player_count, rounds.no_winner, rounds.prize_pool, rounds.winner_address, rounds.winner_entry, rounds.winner_multiplier, rounds.finish_at
      FROM public.entries
      INNER JOIN public.rounds ON public.entries.round = public.rounds.id
      WHERE entries.player_address = ${address}
      ORDER BY round DESC
      LIMIT ${contentPerPage} OFFSET ${offset};
    `.then((res) => {
      return res.map((item) => item as EntryAndRoundDto);
    });
  };

  static getEntryAndRoundInfoByAddressCount = async (address: string) => {
    return this.sql`
      SELECT count(1)
      FROM public.entries
      INNER JOIN public.rounds ON public.entries.round = public.rounds.id
      WHERE entries.player_address = ${address};
    `.then((res) => {
      return res[0].count;
    });
  };
}

export default EntryTable;

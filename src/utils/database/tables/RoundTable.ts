import Table from './Table';

import Round from '../../models/dataModels/Round';
import RoundDto from '../../models/dto/RoundDto';
import PlayerRoundEntryAndRoundDto from '../../models/dto/PlayerRoundEntryAndRoundDto';

class RoundTable extends Table {
  static createRound = (round: Round) => {
    return this.sql`
      INSERT INTO public.rounds (id, player_count, no_winner, prize_pool, winner_address, winner_entry, winner_multiplier, finish_at, finish_tx_hash)
      SELECT ${round.id}, ${round.player_count}, ${round.no_winner}, ${round.prize_pool.toString()}, ${round.winner_address}, ${round.winner_entry}, ${round.winner_multiplier}, ${round.finish_at}, ${round.finish_tx_hash}
      ON CONFLICT DO NOTHING;
    `;
  };

  static newRound = async (round: number) => {
    return this.sql`
      INSERT INTO public.rounds (id, player_count, no_winner, prize_pool, winner_address, winner_entry, winner_multiplier, finish_at, finish_tx_hash)
      SELECT ${round}, 0, false, '', '', '', '', null, ''
      ON CONFLICT DO NOTHING;
    `;
  };

  static noWinner = (round: Round) => {
    return this.sql`
      UPDATE public.rounds
      SET player_count = ${round.player_count}, prize_pool = ${round.prize_pool}, finish_at = ${round.finish_at}, no_winner = true, finish_tx_hash = ${round.finish_tx_hash}
      WHERE rounds.id = ${round.id};
    `;
  };

  static winner = (round: Round) => {
    return this.sql`
      UPDATE public.rounds
      SET player_count = ${round.player_count}, prize_pool = ${round.prize_pool}, winner_address = ${round.winner_address}, winner_entry = ${round.winner_entry}, winner_multiplier = ${round.winner_multiplier}, finish_at = ${round.finish_at} , finish_tx_hash = ${round.finish_tx_hash}
      WHERE rounds.id = ${round.id};
    `;
  };

  static getRound = async () => {
    return this.sql`
        SELECT * FROM public.rounds;
    `.then((res) => {
      return res.map((item) => item as RoundDto);
    });
  };

  static getRoundByPage = async (
    address: string,
    page: number,
    contentPerPage: number,
  ) => {
    if (page < 1) {
      return [];
    }
    const offset = (page - 1) * contentPerPage;
    return this.sql`
        SELECT rounds.*, player_round_entries.player_address, player_round_entries.player_entry,  player_round_entries.round 
        FROM public.rounds
        LEFT JOIN public.player_round_entries ON public.player_round_entries.round = public.rounds.id AND player_round_entries.player_address::text = ${address}
        ORDER BY rounds.id DESC 
        LIMIT ${contentPerPage} OFFSET ${offset};
    `.then((res) => {
      return res.map((item) => item as PlayerRoundEntryAndRoundDto);
    });
  };

  static getRoundByWinnerAddress = async (address: string) => {
    return this.sql`
        SELECT * FROM public.rounds WHERE winner_address::text = ${address};
    `.then((res) => {
      return res.map((item) => item as RoundDto);
    });
  };

  static getRoundCount = async () => {
    return this.sql`
        SELECT count(1) FROM public.rounds;
    `.then((res) => {
      return res[0].count;
    });
  };
}

export default RoundTable;

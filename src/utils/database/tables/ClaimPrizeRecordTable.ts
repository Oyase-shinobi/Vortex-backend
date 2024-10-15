import Table from './Table';

import ClaimPrizeRecord from '../../models/dataModels/ClaimPrizeRecord';
import ClaimPrizeRecordDto from '../../models/dto/ClaimPrizeRecordDto';

class ClaimPrizeRecordTable extends Table {
  static createClaimPrizeRecord = (record: ClaimPrizeRecord) => {
    return this.sql`
      INSERT INTO public.claim_prize_records (claim_address, claim_token, claim_amount, claim_tx_hash)
      SELECT ${record.claim_address}, ${record.claim_token}, ${record.claim_amount}, ${record.claim_tx_hash};
    `;
  };

  static getClaimPrizeRecord = async () => {
    return this.sql`
        SELECT * FROM public.claim_prize_records;
    `.then((res) => {
      return res.map((item) => item as ClaimPrizeRecordDto);
    });
  };

  static getClaimPrizeRecordByAddress = async (address: string) => {
    return this.sql`
        SELECT * FROM public.claim_prize_records WHERE claim_address::text = ${address};
    `.then((res) => {
      return res.map((item) => item as ClaimPrizeRecordDto);
    });
  };
}

export default ClaimPrizeRecordTable;

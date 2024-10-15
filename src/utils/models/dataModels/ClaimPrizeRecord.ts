class ClaimPrizeRecord {
  claim_tx_hash: string;
  claim_address: string;
  claim_token: string;
  claim_amount: string;
  created_at: number;

  constructor({
    claim_tx_hash,
    claim_address,
    claim_token,
    claim_amount,
    created_at,
  }: {
    claim_tx_hash: string;
    claim_address: string;
    claim_token: string;
    claim_amount: bigint;
    created_at: number;
  }) {
    this.claim_tx_hash = claim_tx_hash;
    this.claim_address = claim_address;
    this.claim_token = claim_token;
    this.claim_amount = claim_amount.toString();
    this.created_at = created_at;
  }
}

export default ClaimPrizeRecord;

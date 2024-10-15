import Table from './Table';

class BlockTable extends Table {
  static getBlockNumber = async () => {
    return this.sql`
      SELECT blocks.block_number 
      FROM public.blocks
      WHERE blocks.id = 1;
    `.then((res) => {
      if (res.length === 0) return null;
      return res[0];
    });
  };

  static setBlockNumber = async (blockNumber: number) => {
    return this.sql`
      UPDATE public.blocks
      SET block_number = ${blockNumber}
      WHERE blocks.id = 1;
    `;
  };
}

export default BlockTable;

import postgres from 'postgres';

import EnvConfig from '../env/envConfig';

const sql = postgres({
  host: EnvConfig.PGHOST,
  port: Number(EnvConfig.PGPORT),
  database: EnvConfig.PGDATABASE,
  username: EnvConfig.PGUSER,
  password: EnvConfig.PGPASSWORD,
  onnotice: (data) => {
    if (data.severity === 'EXCEPTION' || data.severity === 'WARNING') {
      console.log(data);
    }
  },
});

export default sql;

import dotenv from 'dotenv';
import * as process from 'node:process';
import { cleanEnv, host, num, port, str, testOnly } from 'envalid';

dotenv.config();

console.log(process.env);

const env = cleanEnv(process.env, {
  NODE_ENV: str({
    devDefault: testOnly('test'),
    choices: ['development', 'production', 'test'],
  }),
  HOST: host({ devDefault: testOnly('localhost') }),
  PORT: port({ devDefault: testOnly(3000) }),
  CORS_ORIGIN: str({ devDefault: testOnly('http://localhost:3000') }),
  COMMON_RATE_LIMIT_MAX_REQUESTS: num({ devDefault: testOnly(1000) }),
  COMMON_RATE_LIMIT_WINDOW_MS: num({ devDefault: testOnly(1000) }),
  CONTRACT_ADDRESS: str({
    devDefault: testOnly('0xeeb189559fcc9643306f2cf2b408834678889a095a4a888a2c0c15704e0e56fe'),
  }),
  MODULE_NAME: str({
    devDefault: testOnly('vortex'),
  }),
  NETWORK_URL: str({
    devDefault: testOnly('https://testnet-rpc.thundercore.com'),
  }),
  WALLET_KEY: str({ devDefault: testOnly('') }),
  PGHOST: host({ devDefault: testOnly('localhost') }),
  PGPORT: port({ devDefault: testOnly(5432) }),
  PGDATABASE: str({ devDefault: testOnly('vortex') }),
  PGUSER: str({ devDefault: testOnly('amoswu') }),
  PGPASSWORD: str({ devDefault: testOnly('') }),
  PGPASSWORD_FOR_DIFF: str({ devDefault: testOnly('') }),
  PGSSLMODE: str({ devDefault: testOnly('disable') }),
});

console.log(env);

export default env;

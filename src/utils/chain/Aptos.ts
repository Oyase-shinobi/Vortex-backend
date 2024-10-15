import {
  Account,
  Aptos,
  AptosConfig,
  Ed25519PrivateKey,
  Network,
} from '@aptos-labs/ts-sdk';

import envConfig from '../env/envConfig';

const config = new AptosConfig({ network: Network.TESTNET });
const aptos = new Aptos(config);

const privateKey = new Ed25519PrivateKey(envConfig.WALLET_KEY);
export const account = Account.fromPrivateKey({ privateKey });

export default aptos;

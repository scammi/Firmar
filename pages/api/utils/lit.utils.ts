
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { LIT_RPC, LitNetwork } from '@lit-protocol/constants';
import { Address, createPublicClient, createWalletClient, custom, http, Transaction } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

import {
  LitAbility,
  LitActionResource,
  createSiweMessage,
  generateAuthSig,
} from "@lit-protocol/auth-helpers";
import { signMessage } from 'viem/actions'


export const LIT_CONFIG = {
  NETWORK: LitNetwork.DatilDev,
  FUNDING_PRIVATE_KEY: process.env.FUNDING_PRIVATE_KEY as `0x${string}`,
};

export const CHAIN_CONFIG = {
  rpcUrl: 'https://api.avax.network/ext/bc/C/rpc', // Example for Avalanche C-Chain
  chainId: 43114, // Avalanche C-Chain
};

const account = privateKeyToAccount(process.env.PRIVATE_KEY! as Address)

const walletClient = createWalletClient({
  account,
  transport: http(LIT_RPC.CHRONICLE_YELLOWSTONE)
})

const litActionCode = `
const go = async () => {
  const sigShare = await LitActions.signEcdsa({ toSign, publicKey, sigName });
  LitActions.setResponse({response: JSON.stringify(sigShare)});
};
go();
`;

// class LitService {
//   private litNodeClient: LitNodeClient;

//   constructor() {
//     this.litNodeClient = new LitNodeClient({
//       litNetwork: LIT_CONFIG.NETWORK,
//       debug: false,
//     });
//   }

//   async connect() {
//     await this.litNodeClient.connect();
//   }

//   async disconnect() {
//     await this.litNodeClient.disconnect();
//   }


//   async signTransaction(unsignedTransaction: Transaction) {
//     const result = await this.litNodeClient.executeJs({
//       sessionSigs: sessionSignatures,
//       code: litActionCode,
//       jsParams: {
//         magicNumber: 43,
//       }
//     });

//     const signature = JSON.parse(result?.response);
//     return { ...unsignedTransaction, ...signature };
//   }
// }

// export const litService = new LitService();
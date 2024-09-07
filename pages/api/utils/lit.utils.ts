
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { LIT_RPC, LitNetwork } from '@lit-protocol/constants';
import { createWalletClient, http, Transaction } from 'viem';
import { account } from './blockchain.utils';

// import {
//   LitAbility,
//   LitActionResource,
//   createSiweMessage,
//   generateAuthSig,
// } from "@lit-protocol/auth-helpers";
// import { signMessage } from 'viem/actions'


export const LIT_CONFIG = {
  NETWORK: LitNetwork.DatilDev,
  FUNDING_PRIVATE_KEY: process.env.FUNDING_PRIVATE_KEY as `0x${string}`,
};

export const CHAIN_CONFIG = {
  rpcUrl: 'https://api.avax.network/ext/bc/C/rpc', // Example for Avalanche C-Chain
  chainId: 43114, // Avalanche C-Chain
};

export const walletClient = createWalletClient({
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

class LitService {
  private litNodeClient: LitNodeClient;

  constructor() {
    this.litNodeClient = new LitNodeClient({
      litNetwork: LIT_CONFIG.NETWORK,
      debug: false,
    });
  }

  async connect() {
    await this.litNodeClient.connect();
  }

  async disconnect() {
    await this.litNodeClient.disconnect();
  }


  async signTransaction(unsignedTransaction: Transaction) {
    const result = await this.litNodeClient.executeJs({
      code: litActionCode,
      jsParams: {
        magicNumber: 43,
      },
      sessionSigs: undefined
    });

    // const signature = JSON.parse(result?.response);

    return { ...unsignedTransaction, ...result };
  }
}

export const litService = new LitService();
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { LIT_RPC, LitNetwork } from '@lit-protocol/constants';
import { createWalletClient, http, Transaction } from 'viem';
import { account } from './blockchain.utils';
import {
  LitAbility,
  LitActionResource,
  createSiweMessage,
} from "@lit-protocol/auth-helpers";
import { signMessage } from 'viem/actions';

export const LIT_CONFIG = {
  NETWORK: LitNetwork.DatilDev,
  FUNDING_PRIVATE_KEY: process.env.FUNDING_PRIVATE_KEY as `0x${string}`,
};

export const CHAIN_CONFIG = {
  rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
  chainId: 43114,
};

export const walletClient = createWalletClient({
  account,
  transport: http(LIT_RPC.CHRONICLE_YELLOWSTONE)
});

const litActionCode = `
const go = async () => {
  const sigShare = await LitActions.signEcdsa({ toSign, publicKey, sigName });
  LitActions.setResponse({response: JSON.stringify(sigShare)});
};
go();
`;

class LitService {
  private litNodeClient: LitNodeClient;
  private sessionSignatures: any; // Type this properly based on the actual type

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

  async createSessionSignatures() {
    this.sessionSignatures = await this.litNodeClient.getSessionSigs({
      chain: "ethereum",
      expiration: new Date(Date.now() + 1000 * 60 * 10).toISOString(), // 10 minutes
      resourceAbilityRequests: [
        {
          resource: new LitActionResource("*"),
          ability: LitAbility.LitActionExecution,
        },
      ],
      authNeededCallback: async ({
        uri,
        expiration,
        resourceAbilityRequests,
      }) => {
        const toSign = await createSiweMessage({
          uri,
          expiration,
          resources: resourceAbilityRequests,
          walletAddress: account.address,
          nonce: await this.litNodeClient.getLatestBlockhash(),
          litNodeClient: this.litNodeClient,
        });

        const signature = await signMessage(walletClient, { message: toSign });

        return {
          sig: signature,
          derivedVia: "web3.eth.personal.sign",
          signedMessage: toSign,
          address: account.address,
        };
      },
    });

    return this.sessionSignatures;
  }

  async signTransaction(unsignedTransaction: Transaction) {
    if (!this.sessionSignatures) {
      await this.createSessionSignatures();
    }

    const result = await this.litNodeClient.executeJs({
      code: litActionCode,
      jsParams: {
        magicNumber: 43,
      },
      sessionSigs: this.sessionSignatures
    });

    return { ...unsignedTransaction, ...result };
  }
}

export const litService = new LitService();
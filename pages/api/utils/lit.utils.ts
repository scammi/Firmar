import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { LIT_RPC, LitNetwork } from '@lit-protocol/constants';
import { LitContracts } from '@lit-protocol/contracts-sdk';
import { createWalletClient, http } from 'viem';
import { account } from './blockchain.utils';
import {
  LitAbility,
  LitActionResource,
  createSiweMessage,
} from "@lit-protocol/auth-helpers";
import { signMessage } from 'viem/actions';
import { SessionSigsMap } from '@lit-protocol/types';
import { ethers } from 'ethers';

export const LIT_CONFIG = {
  NETWORK: LitNetwork.DatilDev,
  FUNDING_PRIVATE_KEY: process.env.FUNDING_PRIVATE_KEY as `0x${string}`,
  PKP_PUBLIC_KEY: '04260b583c7276e2a29accd71827b4be30ebd6ff5d2683aef75d384ea4717fe58b489a42fe99f96e9c602f66263be8e39b60ad15a7e49f6b312270700fd5496032',
  PKP: {
    tokenId: '0xe724fa4daec7ef6b480a7502bd03e338aed5b921207ef4cb616fdc0fd1e8f54b',
    publicKey: '04260b583c7276e2a29accd71827b4be30ebd6ff5d2683aef75d384ea4717fe58b489a42fe99f96e9c602f66263be8e39b60ad15a7e49f6b312270700fd5496032',
    ethAddress: '0x46b0c4861e5e0dc41900D62695330139b6DDcACD'
  },
};

export const litWalletClient = createWalletClient({
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
  private litContracts: LitContracts;

  public sessionSignatures: SessionSigsMap | undefined;

  constructor() {
    this.litNodeClient = new LitNodeClient({
      litNetwork: LIT_CONFIG.NETWORK,
      debug: false,
    });

    const ethersProvider = new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE);
    const ethersWallet = new ethers.Wallet(process.env.PRIVATE_KEY!, ethersProvider);

    this.litContracts = new LitContracts({
      network: LIT_CONFIG.NETWORK,
      signer: ethersWallet
    });
  }

  async connect() {
    await this.litNodeClient.connect();
    await this.litContracts.connect();

    if (!LIT_CONFIG.PKP_PUBLIC_KEY) {
      await this.mintPKP();
    }
  }

  async disconnect() {
    await this.litNodeClient.disconnect();
  }

  private async mintPKP() {
    console.log("🔄 PKP wasn't provided, minting a new one...");
    const mintTx = await this.litContracts.pkpNftContractUtils.write.mint();
    console.log("✅ PKP successfully minted");
    LIT_CONFIG.PKP_PUBLIC_KEY = mintTx.pkp.publicKey;
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

        const signature = await signMessage(litWalletClient, { message: toSign });

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

  async signTransaction(unsignedTransaction: number[], publicKey: string) {
    if (!this.sessionSignatures) {
      await this.createSessionSignatures();
    }

    const result = await this.litNodeClient.executeJs({
      code: litActionCode,
      jsParams: {
        toSign: unsignedTransaction,
        publicKey: publicKey,
        sigName: "sig1"
      },
      sessionSigs: this.sessionSignatures
    });

    return { unsignedTransaction, ...result };
  }

  async signWithLitProtocol(toSign: Uint8Array, publicKey: string): Promise<string> {
    const result = await litService.signTransaction(Array.from(toSign), publicKey);
    
    // Parse the response from Lit Protocol
    const parsedResponse = JSON.parse(result.response as string);
    
    // Extract the signature components
    const r = "0x" + parsedResponse.r.substring(2);
    const s = "0x" + parsedResponse.s;
    const v = parsedResponse.recid;
    
    // Combine r, s, and v into a single signature string
    const signature = ethers.utils.joinSignature({ r, s, v });
    
    return signature;
  }
}

export const litService = new LitService();
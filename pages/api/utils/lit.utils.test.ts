import { signMessage } from "viem/actions";
import { LIT_CONFIG, litService, walletClient } from "./lit.utils";
import { expect, describe, it, beforeAll, afterAll } from '@jest/globals';

describe('Lit protocol', () => {

  beforeAll(async () => {
    await litService.connect();
  }, 30000);

  afterAll(async () => {
    await litService.disconnect();
  });

  it ('Runs tets', async () => {
    const signature = await signMessage(walletClient, { message: ': )' });
    expect(typeof signature).toBe('string');
  });

  it('Creates session signatures', async () => {
    const sessionSigs = await litService.createSessionSignatures();
    expect(sessionSigs).toBeDefined();
    expect(typeof sessionSigs).toBe('object');
  }, 20000);

  it('Signs a transaction', async () => {
    // const unsignedTx = {
    //   to: '0x1234567890123456789012345678901234567890',
    //   value: parseEther('0.001'),
    //   data: '0x',
    // };

    const toSign = [
      84, 104, 105, 115, 32, 109, 101, 115, 115, 97, 103, 101, 32, 105,
      115, 32, 101, 120, 97, 99, 116, 108, 121, 32, 51, 50, 32, 98, 121,
      116, 101, 115,
    ]

    const signedTx = await litService.signTransaction(toSign, LIT_CONFIG.PKP_PUBLIC_KEY);
    expect(signedTx).toBeDefined();
    console.log(signedTx);
  }, 20000);
});
import { signMessage } from "viem/actions";
import { litService, walletClient } from "./lit.utils";
import { expect, describe, it, beforeAll, afterAll } from '@jest/globals';
import { parseEther } from "viem";

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
    // console.log(sessionSigs);
    expect(sessionSigs).toBeDefined();
    expect(typeof sessionSigs).toBe('object');
  }, 20000);

  it('Signs a transaction', async () => {
    const unsignedTx = {
      to: '0x1234567890123456789012345678901234567890',
      value: parseEther('0.001'),
      data: '0x',
    };

    const signedTx = await litService.signTransaction(unsignedTx.to);
    expect(signedTx).toBeDefined();
    console.log(signedTx);
  }, 20000);
});
import { signMessage } from "viem/actions";
import { litService, walletClient } from "./lit.utils";
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
    console.log(sessionSigs);
    expect(sessionSigs).toBeDefined();
    expect(typeof sessionSigs).toBe('object');
  }, 20000);

});
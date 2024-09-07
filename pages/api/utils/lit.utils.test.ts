import { signMessage } from "viem/actions";
import { walletClient } from "./lit.utils";
import { expect, describe, it } from '@jest/globals';

describe('Lit protocol', () => {
  it ('Runs tets', async () => {
    const signature = await signMessage(walletClient, { message: ': )' });
    expect(typeof signature).toBe('string');

    console.log(signature);
  });
});
import { signMessage } from "viem/actions";
import { walletClient } from "./lit.utils";

describe('Lit protocol', () => {
  it ('Runs tets', async () => {
    const signature = await signMessage(walletClient, { message: ': )' });
    console.log(signature);
  });
});
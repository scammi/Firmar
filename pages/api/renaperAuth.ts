import { NextApiRequest, NextApiResponse } from 'next';
import { callLockMint } from './blockchain.utils';

type RenaperAuthSuccessResponse = {
  success: boolean;
  message: string;
  tokenId?: string | null;
  transactionHash?: string;
};

type RenaperAuthErrorResponse = {
  error: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RenaperAuthSuccessResponse | RenaperAuthErrorResponse>
) {
  const headerAuthToken = req.headers.authorization?.replace(/^Bearer /, "");
  const cookieAuthToken = req.cookies["privy-token"];
  const authToken = cookieAuthToken || headerAuthToken;

  if (!authToken) {
    return res.status(401).json({ error: "Missing auth token" });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { nombre, apellido, dni, address, signatureCid } = req.body;

    const uri = JSON.stringify({
      nombre,
      apellido,
      dni,
      signatureCid
    });

    // Call lockMint function
    const { hash, tokenId } = await callLockMint(address, uri);

    return res.status(200).json({ 
      success: true, 
      message: "Renaper authentication successful and NFT minted",
      tokenId: tokenId ? tokenId.toString() : null,
      transactionHash: hash
    });

  } catch (e: any) {
    return res.status(401).json({ error: e.message });
  }
}
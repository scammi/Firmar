import { NextApiRequest, NextApiResponse } from 'next';
import { callLockMint, createCertifiedSignerAttestation } from './utils/blockchain.utils';

type RenaperAuthSuccessResponse = {
  success: boolean;
  message: string;
  tokenId?: string | null;
  transactionHash?: string;
  attestationTxHash: string;
  attestationId: string;
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
    const { nombre, apellido, dni, address, signatureCid, did } = req.body;

    const uri = JSON.stringify({
      nombre,
      apellido,
      dni,
      signatureCid,
      did
    });

    // Call lockMint function
    const { hash, tokenId } = await callLockMint(address, uri);

    const attestation = await createCertifiedSignerAttestation(address, {
      first_name: nombre,
      last_name: nombre,
      did: did,
      national_document_identifier: dni,
      signature_cid: signatureCid
    });

    return res.status(200).json({ 
      success: true, 
      message: "Renaper authentication successful and NFT minted",
      tokenId: tokenId ? tokenId.toString() : null,
      transactionHash: hash,
      attestationTxHash: attestation.txHash,
      attestationId: attestation.attestationId,
    });

  } catch (e: any) {
    return res.status(401).json({ error: e.message });
  }
}
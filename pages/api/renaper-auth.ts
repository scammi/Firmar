import { NextApiRequest, NextApiResponse } from 'next';
import { broadcastToPolygon, callLockMint, combineSignatureWithTransaction, createCertifiedSignerAttestation } from './utils/blockchain.utils';
import { LIT_CONFIG, litService } from './utils/lit.utils';

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

    // Generate transaction and toSign data for attestation
    const { transaction, toSign } = await createCertifiedSignerAttestation(address, {
      first_name: nombre,
      last_name: apellido,
      did: did,
      national_document_identifier: dni,
      signature_cid: signatureCid
    });

    await litService.connect();

    const signature = await litService.signWithLitProtocol(toSign, LIT_CONFIG.PKP_PUBLIC_KEY);

    const signedTransaction = await combineSignatureWithTransaction(transaction, signature);

    const attestationTxHash = await broadcastToPolygon(signedTransaction);

    return res.status(200).json({ 
      success: true, 
      message: "Renaper authentication successful, NFT minted, and attestation created",
      tokenId: tokenId ? tokenId.toString() : null,
      transactionHash: hash,
      attestationTxHash,
      attestationId: "N/A", // You might need to extract this from the transaction receipt
    });

  } catch (e: any) {
    return res.status(401).json({ error: e.message });
  }
}


import type { NextApiRequest, NextApiResponse } from 'next'
import { ATTESTER } from '../globals';

async function makeAttestationRequest(endpoint: string, options: any) {
  let url = `https://mainnet-rpc.sign.global/api/${endpoint}`;
  
  if (options.method === 'GET' && options.params) {
    const queryParams = new URLSearchParams(options.params).toString();
    url += `?${queryParams}`;
  }
  
  const fetchOptions: RequestInit = {
    method: options.method,
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
    },
  };

  if (options.method !== 'GET' && options.params) {
    fetchOptions.body = JSON.stringify(options.params);
  }

  const response = await fetch(url, fetchOptions);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

export async function queryAttestations(indexingValue: string) {
  const response = await makeAttestationRequest("index/attestations", {
    method: "GET",
    params: {
      mode: "onchain",
      schemaId: "onchain_evm_137_0x4d",
      registrant: ATTESTER,
      indexingValue: indexingValue
    },
  });

  if (!response.success) {
    return {
      success: false,
      message: response?.message ?? "Attestation query failed.",
    };
  }

  if (response.data?.total === 0) {
    return {
      success: false,
      message: "No attestation for this address found.",
    };
  }

  return {
    success: true,
    attestations: response.data.rows,
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { indexingValue } = req.query;

  if (!indexingValue || typeof indexingValue !== 'string') {
    return res.status(400).json({ message: 'Missing or invalid indexingValue' });
  }

  try {
    const result = await queryAttestations(indexingValue);
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    console.error('Error querying attestations:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
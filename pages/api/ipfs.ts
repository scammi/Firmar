import type { NextApiRequest, NextApiResponse } from "next";
import { create } from 'kubo-rpc-client';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb' // Adjust this limit based on your needs
    },
  },
};

interface UploadResponse {
  success: boolean;
  cid?: string;
  error?: string;
}

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<UploadResponse>
) => {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  if (!req.body || !req.body.file) {
    return res.status(400).json({ success: false, error: "No file data provided" });
  }

  try {
    
    const client = create({
      host: "ipfs.infura.io",
      port: 5001,
      protocol: "https",
      headers: {
        authorization: 'Basic ' + Buffer.from(process.env.INFURA_PROJECT_ID + ':' + process.env.INFURA_TOKEN).toString('base64'),
      },
    });

    // Extract the base64 data from the Data URL
    const base64Data = req.body.file.split(',')[1];
    const fileBuffer = Buffer.from(base64Data, 'base64');
    
    // Add the file to IPFS
    const result = await client.add(fileBuffer);

    res.status(200).json({ success: true, cid: result.cid.toString() });
  } catch (error) {
    console.error('Error uploading file to IPFS:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

export default handler;
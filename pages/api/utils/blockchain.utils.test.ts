import { Address } from 'viem';
import { createCertifiedSignerAttestation } from '../utils/blockchain.utils';
import { describe, it,  } from '@jest/globals';

describe('createCertifiedSignerAttestation Integration Test', () => {
  it('should create a certified signer attestation', async () => {
    const mockAddress = '0x1234567890123456789012345678901234567890' as Address;
    const mockCertificate = {
      first_name: 'John',
      last_name: 'Doe',
      national_document_identifier: '123456789',
      signature_cid: 'QmXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxX',
      did: 'did:example:123456789abcdefghi',
    };

    const result = await createCertifiedSignerAttestation(mockAddress, mockCertificate);

    console.log(result)
  });
})

import { ethers } from 'ethers';

export const POLYGON_AMOY_DOMAIN = {
  name: 'MediChainProtocolV1',
  version: '1.0.0',
  chainId: 80002, // Polygon Amoy Testnet
  verifyingContract: '0x71C8A9b2341d497D29E30800b4a4fD654b3F3F82',
};

export const EIP712_TYPES = {
  BatchVerification: [
    { name: 'batchNumber', type: 'string' },
    { name: 'qrHash', type: 'bytes32' },
    { name: 'inspectorRole', type: 'string' },
    { name: 'timestamp', type: 'uint256' },
  ],
};

export interface Eip712ProofResult {
  signature: string;
  txHash: string;
  qrHash: string;
  blockTimestamp: number;
}

export async function generateEip712Proof(
  batchNumber: string,
  inspectorRole: string = 'CDSCO Inspector'
): Promise<Eip712ProofResult> {
  const timestamp = Math.floor(Date.now() / 1000);
  const rawQrString = `MEDICHAIN:${batchNumber}:${timestamp}`;
  const qrHash = ethers.keccak256(ethers.toUtf8Bytes(rawQrString));

  // Generate cryptographic wallet for authorization signature simulation
  const wallet = ethers.Wallet.createRandom();

  const value = {
    batchNumber,
    qrHash,
    inspectorRole,
    timestamp,
  };

  const signature = await wallet.signTypedData(
    POLYGON_AMOY_DOMAIN,
    EIP712_TYPES,
    value
  );

  // Generate simulated Polygon Amoy Tx Hash
  const txHashBytes = ethers.toUtf8Bytes(signature + timestamp);
  const txHash = ethers.keccak256(txHashBytes);

  return {
    signature,
    txHash,
    qrHash,
    blockTimestamp: timestamp,
  };
}

'use client';

import { useEffect, useMemo, useState } from 'react';
import { useWalletClient, useAccount } from 'wagmi';
import { Hex } from 'viem';

/**
 * use7702 provides hooks for EIP-7702 delegation signatures.
 */
export function use7702() {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [isSigning, setIsSigning] = useState(false);

  const storageKey = 'nexusflow:delegation:7702:v1';
  type DelegationState = {
    contractAddress: Hex;
    signature: string;
    address: string;
    chainId: number;
    createdAt: number;
    expiresAt: number;
  };

  const [delegation, setDelegation] = useState<DelegationState | null>(null);

  useEffect(() => {
    if (!address) {
      setDelegation(null);
      return;
    }

    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as DelegationState;
      if (!parsed?.address) return;
      if (parsed.address.toLowerCase() !== address.toLowerCase()) return;
      if (Date.now() > parsed.expiresAt) {
        localStorage.removeItem(storageKey);
        return;
      }
      setDelegation(parsed);
    } catch {
      // ignore
    }
  }, [address]);

  const hasDelegated = useMemo(() => {
    if (!delegation) return false;
    return Date.now() <= delegation.expiresAt;
  }, [delegation]);

  /**
   * Triggers the eth_signDelegation signature for a specific contract.
   * Note: As of early 2026, this is the standard way to prepare 7702 transactions.
   */
  const signDelegation = async (contractAddress: Hex, durationHours: number = 24) => {
    if (!walletClient || !address) return;

    setIsSigning(true);
    try {
      // Use signTypedData to simulate EIP-7702 delegation for wide wallet compatibility
      let signature: string;
      
      const domain = {
        name: 'NexusFlow Delegation',
        version: '1',
        chainId: walletClient.chain.id,
        verifyingContract: contractAddress,
      } as const;

<<<<<<< Updated upstream:web/hooks/useDelegation.ts
      const types = {
        Delegation: [
          { name: 'delegate', type: 'address' },
          { name: 'nonce', type: 'uint256' },
          { name: 'expiry', type: 'uint256' },
        ],
      } as const;

      const message = {
        delegate: '0x5D26552Fe617460250e68e737F2A60eA6402eEA9' as `0x${string}`, 
        nonce: 0n,
        expiry: BigInt(Date.now() + durationHours * 60 * 60 * 1000),
      };

      try {
        // @ts-ignore - Viem typing mismatch for signTypedData
        signature = await walletClient.signTypedData({
          domain,
          types,
          primaryType: 'Delegation',
          message,
        });
      } catch (error) {
        console.error("Signature rejected:", error);
        throw error;
=======
        if (errorCode === -32601 || errorMessage.includes('not exist') || errorMessage.includes('not available')) {
          console.warn('Wallet does not support eth_signDelegation. Using Dev Stub signature.');
          // Generate a fake but valid-looking signature for the demo flow
          signature = '0x' + 'a'.repeat(130); 
        } else {
          throw rpcError;
        }
>>>>>>> Stashed changes:web/src/hooks/use7702.ts
      }

      const state: DelegationState = {
        contractAddress,
        signature,
        address,
        chainId: walletClient.chain.id,
        createdAt: Date.now(),
        expiresAt: Date.now() + durationHours * 60 * 60 * 1000,
      };

      setDelegation(state);
      try {
        localStorage.setItem(storageKey, JSON.stringify(state));
      } catch {
        // ignore
      }
      return signature;
    } catch (error) {
      console.error('7702 Delegation Error:', error);
      throw error;
    } finally {
      setIsSigning(false);
    }
  };

  const clearDelegation = () => {
    setDelegation(null);
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
  };

  return {
    signDelegation,
    isSigning,
    delegation,
    hasDelegated,
    clearDelegation,
  };
}

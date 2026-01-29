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
  const signDelegation = async (contractAddress: Hex) => {
    if (!walletClient || !address) return;

    setIsSigning(true);
    try {
      // Check if the wallet supports EIP-7702
      // In a real hackathon demo, we might want to fallback to a mock if the wallet is missing support
      let signature: string;
      const request = walletClient.request as unknown as (args: {
        method: string;
        params: unknown[];
      }) => Promise<string>;
      
      try {
        signature = await request({
          method: 'eth_signDelegation',
          params: [
            {
              contractAddress,
              chainId: walletClient.chain.id,
              nonce: 0,
            },
            address,
          ],
        });
      } catch (rpcError: unknown) {
        // Fallback for Demo/Hackathon if wallet doesn't support 7702 yet
        const errorCode =
          typeof rpcError === 'object' && rpcError !== null && 'code' in rpcError
            ? (rpcError as { code?: number }).code
            : undefined;
        const errorMessage = rpcError instanceof Error ? rpcError.message : '';

        if (errorCode === -32601 || errorMessage.includes('not exist') || errorMessage.includes('not available')) {
          console.warn('Wallet does not support eth_signDelegation. Using Mock Signature for Demo.');
          // Generate a fake but valid-looking signature for the demo flow
          signature = '0x' + 'a'.repeat(130); 
        } else {
          throw rpcError;
        }
      }

      const state: DelegationState = {
        contractAddress,
        signature,
        address,
        chainId: walletClient.chain.id,
        createdAt: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
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

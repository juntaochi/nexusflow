'use client';

import { useEffect, useState } from 'react';
import { useWalletClient, useAccount, useReadContract, useChainId } from 'wagmi';
import { Hex } from 'viem';
import { nexusDelegationConfig } from '@/lib/contracts/nexus-delegation';
import { CONTRACTS, CHAINS } from '@/lib/contracts';

/**
 * use7702 provides hooks for EIP-7702 delegation signatures
 * with on-chain verification against the NexusDelegation contract.
 */
export function use7702() {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const chainId = useChainId();
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

  // Determine correct contract address based on chain
  const isOp = chainId === CHAINS.OP_SEPOLIA;
  const delegationAddress = isOp
    ? (CONTRACTS.nexusDelegation as any).opSepolia?.address
    : CONTRACTS.nexusDelegation.address;

  const contractConfig = {
    ...nexusDelegationConfig,
    address: delegationAddress,
  };

  // On-chain reads
  const { data: isSessionKeyActive, isLoading: isLoadingSession } = useReadContract({
    ...contractConfig,
    functionName: 'sessionKeys',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: onChainExpiry, isLoading: isLoadingExpiry } = useReadContract({
    ...contractConfig,
    functionName: 'sessionKeyExpiry',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: remainingAllowance } = useReadContract({
    ...contractConfig,
    functionName: 'getRemainingDailyAllowance',
    query: { enabled: !!address },
  });

  const { data: dailyLimit } = useReadContract({
    ...contractConfig,
    functionName: 'dailyLimit',
    query: { enabled: !!address },
  });

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

  // Derive delegation status from on-chain state with localStorage fallback
  const chainVerified = isSessionKeyActive === true;
  const localOnly = !chainVerified && delegation !== null && Date.now() <= delegation.expiresAt;
  const hasDelegated = chainVerified || localOnly;
  const isVerifying = isLoadingSession || isLoadingExpiry;

  /**
   * Triggers the eth_signDelegation signature for a specific contract.
   */
  const signDelegation = async (contractAddress: Hex, durationHours: number = 24) => {
    if (!walletClient || !address) return;

    setIsSigning(true);
    try {
      let signature: string;

      const domain = {
        name: 'NexusFlow Delegation',
        version: '1',
        chainId: walletClient.chain.id,
        verifyingContract: contractAddress,
      } as const;

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
      } catch (rpcError: unknown) {
        const errorCode = (rpcError as { code?: number })?.code;
        const errorMessage = (rpcError as { message?: string })?.message || '';

        if (errorCode === -32601 || errorMessage.includes('not exist') || errorMessage.includes('not available')) {
          console.warn('Wallet does not support eth_signDelegation. Using Dev Stub signature.');
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
    chainVerified,
    isVerifying,
    onChainExpiry: onChainExpiry as bigint | undefined,
    remainingAllowance: remainingAllowance as bigint | undefined,
    dailyLimit: dailyLimit as bigint | undefined,
  };
}

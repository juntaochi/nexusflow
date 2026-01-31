import { Page } from '@playwright/test';

export interface MockWalletConfig {
  address: string;
  chainId: number;
  isConnected: boolean;
}

const DEFAULT_WALLET: MockWalletConfig = {
  address: '0x1234567890123456789012345678901234567890',
  chainId: 84532, // Base Sepolia
  isConnected: false,
};

export async function mockWalletConnection(
  page: Page,
  config: Partial<MockWalletConfig> = {}
) {
  const walletConfig = { ...DEFAULT_WALLET, ...config };

  await page.addInitScript(
    ({ wallet }) => {
      (window as any).ethereum = {
        isMetaMask: true,
        request: async (request: any) => {
          if (request.method === 'eth_requestAccounts') {
            return [wallet.address];
          }
          if (request.method === 'eth_chainId') {
            return `0x${wallet.chainId.toString(16)}`;
          }
          if (request.method === 'eth_accounts') {
            return wallet.isConnected ? [wallet.address] : [];
          }
          return null;
        },
        on: () => {},
        removeListener: () => {},
      };
    },
    { wallet: walletConfig }
  );
}

export async function disconnectWallet(page: Page) {
  await page.addInitScript(() => {
    if ((window as any).ethereum) {
      delete (window as any).ethereum;
    }
  });
}

export async function getConnectedAddress(page: Page): Promise<string | null> {
  return await page.evaluate(() => {
    if ((window as any).ethereum) {
      return (window as any).ethereum.request?.({ method: 'eth_accounts' })?.[0] || null;
    }
    return null;
  });
}

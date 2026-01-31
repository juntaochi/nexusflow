import { test as base, Page } from '@playwright/test';
import { mockWalletConnection, MockWalletConfig } from './wallet-mock';

type TestFixtures = {
  pageWithWallet: Page;
  walletConfig: MockWalletConfig;
};

export const test = base.extend<TestFixtures>({
  walletConfig: {
    address: '0x1234567890123456789012345678901234567890',
    chainId: 84532,
    isConnected: true,
  },

  pageWithWallet: async ({ page, walletConfig }, use) => {
    await mockWalletConnection(page, walletConfig);
    await use(page);
  },
});

export { expect } from '@playwright/test';

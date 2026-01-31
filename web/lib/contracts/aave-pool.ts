import MockAavePoolV2ABI from '../abis/MockAavePoolV2.json';
import { CONTRACTS } from '../contracts';

export const aavePoolConfig = {
  baseSepolia: {
    address: CONTRACTS.aavePool.baseSepolia.address,
    abi: MockAavePoolV2ABI.abi,
  },
  opSepolia: {
    address: CONTRACTS.aavePool.opSepolia.address,
    abi: MockAavePoolV2ABI.abi,
  }
};

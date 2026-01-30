import { SingletonDeployment } from '@safe-global/safe-deployments';
import { Address, getAddress } from 'viem';

// Handle both string addresses (from @fractal-framework/fractal-contracts)
// and object format {address, deploymentBlock} (legacy format)
export const getAddressFromContractDeploymentInfo = (
  contractDeploymentInfo: string | { address: Address; deploymentBlock: number },
): Address => {
  if (typeof contractDeploymentInfo === 'string') {
    return getAddress(contractDeploymentInfo);
  }
  return getAddress(contractDeploymentInfo.address);
};

export const getSafeContractDeploymentAddress = (
  fn: ({ version }: { version: string }) => SingletonDeployment | undefined,
  version: string,
  network: string,
) => {
  const deployment = fn({ version });
  if (!deployment) {
    throw new Error('Safe contract not deployed for given version');
  }
  const contract = deployment.networkAddresses[network];
  const contractAddress = getAddress(contract);
  return contractAddress;
};

export const getEtherscanAPIUrl = (chainId: number) => {
  return `https://api.etherscan.io/v2/api?chainid=${chainId}&apikey=${import.meta.env?.VITE_APP_ETHERSCAN_MAINNET_API_KEY}`;
};

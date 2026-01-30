import { QueryClient } from '@tanstack/react-query'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import {
  metaMaskWallet,
  rainbowWallet,
  walletConnectWallet,
  trustWallet,
  ledgerWallet,
  phantomWallet,
  okxWallet,
  coinbaseWallet,
} from '@rainbow-me/rainbowkit/wallets'
import { http } from 'wagmi'
import type { Chain, HttpTransport } from 'viem'
import { NetworkConfig } from '../../types/network'
import { supportedNetworks } from './useNetworkConfigStore'

// Lux shared WalletConnect Project ID
export const walletConnectProjectId = import.meta.env.VITE_APP_WALLET_CONNECT_PROJECT_ID || 'e89228fed40d4c6e9520912214dfd68b'

export const queryClient = new QueryClient()

const supportedWagmiChains = supportedNetworks.map(network => network.chain)

const metadata = {
  name: import.meta.env.VITE_APP_NAME || 'Pars DAO',
  description: 'Decentralized governance for Persian heritage preservation. Vote on proposals and shape the future.',
  url: import.meta.env.VITE_APP_SITE_URL || 'https://pars.vote',
  icons: [`${import.meta.env.VITE_APP_SITE_URL || 'https://pars.vote'}/favicon.svg`],
}

export const transportsReducer = (
  accumulator: Record<number, HttpTransport>,
  network: NetworkConfig,
) => {
  accumulator[network.chain.id] = http(network.rpcEndpoint)
  return accumulator
}

export const wagmiConfig = getDefaultConfig({
  appName: metadata.name,
  appDescription: metadata.description,
  appUrl: metadata.url,
  appIcon: metadata.icons[0],
  projectId: walletConnectProjectId,
  chains: supportedWagmiChains as [Chain, ...Chain[]],
  transports: supportedNetworks.reduce(transportsReducer, {}),
  wallets: [
    {
      groupName: 'Popular',
      wallets: [
        metaMaskWallet,
        phantomWallet,
        rainbowWallet,
        coinbaseWallet,
      ],
    },
    {
      groupName: 'More',
      wallets: [
        walletConnectWallet,
        trustWallet,
        ledgerWallet,
        okxWallet,
      ],
    },
  ],
})

import Web3Modal from "web3modal"
import BigNumber from "bignumber.js"
import { BLOCK_EXPLORER_URLS, RPC_URLS } from "../constants"

export const createProvider = async (network?: string, onChainChange?: (chainId: number) => void) => {
  try {
    const web3Modal = new Web3Modal({
      network: network ?? '0x13881',
      cacheProvider: true,
    })
    const provider = await web3Modal.connect()
    if (!provider) return null
    onChainChange((new BigNumber(provider.chainId)).toNumber())
    if (onChainChange) {
      provider.on('chainChanged', (id) => {
        onChainChange((new BigNumber(id)).toNumber())
      })
    }
    return provider
  } catch {
    return null
  }
}

export const switchNetwork = async (provider: any) => {
  if (!provider) return
  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x13881" }],
    })
  } catch (error) {
    if (error.code === 4902) {
      try {
        await provider.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0x13881",
              chainName: "POLYGON Mumbai",
              nativeCurrency: {
                name: "MATIC",
                symbol: "MATIC",
                decimals: 18,
              },
              rpcUrls: RPC_URLS,
              blockExplorerUrls: BLOCK_EXPLORER_URLS,
              iconUrls: [""],
            },
          ],
        })
      } catch (addError) {
        console.log("Did not add network")
      }
    }
  }
}

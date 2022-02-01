import { useWeb3 } from "../useWeb3"
import { ethers } from "ethers"
import { nftmarketaddress } from "../../config"
import Market from "../../artifacts/contracts/Market.sol/NFTMarket.json"

export const useNFTMarketContract = () => {
  const provider = useWeb3()
  if (!provider) return null
  const signer = provider.getSigner()
  return new ethers.Contract(nftmarketaddress, Market.abi, signer)
}

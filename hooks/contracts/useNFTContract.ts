import { useWeb3 } from "../useWeb3"
import { ethers } from "ethers"
import { nftaddress } from "../../config"
import NFT from "../../artifacts/contracts/NFT.sol/NFT.json"

export const useNFTContract = () => {
  const provider = useWeb3()
  if (!provider) return null
  const signer = provider.getSigner()
  return new ethers.Contract(nftaddress, NFT.abi, signer)
}

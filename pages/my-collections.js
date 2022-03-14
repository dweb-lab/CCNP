import { ethers } from "ethers"
import { useEffect, useState } from "react"
import axios from "axios"
import { nftmarketaddress, nftaddress } from "../config"

import Market from "../artifacts/contracts/Market.sol/NFTMarket.json"
import NFT from "../artifacts/contracts/NFT.sol/NFT.json"
import { useWeb3 } from "../hooks/useWeb3"
import { Layout } from "../components/Layout"

export default function MyAssets() {
  const [nfts, setNfts] = useState([])
  const [loadingState, setLoadingState] = useState("not-loaded")
  const provider = useWeb3()

  useEffect(() => {
    if (!provider) return
    loadNFTs()
  }, [provider])

  async function loadNFTs() {
    const signer = provider.getSigner()

    const marketContract = new ethers.Contract(
      nftmarketaddress,
      Market.abi,
      signer,
    )
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)
    const data = await marketContract.fetchMyNFTs()

    const items = await Promise.all(
      data.map(async (i) => {
        const tokenUri = await tokenContract.tokenURI(i.tokenId)
        console.log(tokenUri)
        const meta = await axios.get(tokenUri)
        let path = null
        if (tokenUri.startsWith("https://bafy")) {
          path = tokenUri.substring(8, 67)
        }
        let price = ethers.utils.formatUnits(i.price.toString(), "ether")
        let item = {
          price,
          tokenId: i.tokenId.toNumber(),
          path: path,
          seller: i.seller,
          owner: i.owner,
          image: meta.data.image,
          name: meta.data.name,
          tags: meta.data.tags,
          authors: meta.data.authors[0]["name"],
          description: meta.data.description,
        }
        console.log(meta)
        console.log(item)
        return item
      }),
    )
    setNfts(items)
    setLoadingState("loaded")
  }

  if (loadingState === "loaded" && !nfts.length)
    return (
      <Layout>
        <h1 className="py-10 px-20 text-3xl">0 CC-NFTs collected by me</h1>
      </Layout>
    )
  return (
    <Layout>
      <div className="flex justify-center">
        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
            {nfts.map((nft, i) => (
              <div key={i} className="border shadow rounded-xl overflow-hidden">
                <a href={"/article?cid=" + nft.path}>
                  <img src={nft.image} className="rounded" />
                </a>
                <div className="p-4">
                  <a href={"/article?cid=" + nft.path}>
                    <p className="text-2xl font-semibold">{nft.name}</p>
                  </a>
                  <div style={{ height: "70px", overflow: "hidden" }}>
                    <p className="text-gray-400">{nft.description}</p>
                  </div>
                  <p className="text-2xl font-semibold">
                    By: &nbsp;
                    <a href={"/articles?author=" + nft.eth}>{nft.authors}</a>
                  </p>
                  Tags: &nbsp;
                  {nft.tags.map((tag, i) => (
                    <a key={i} href={"/articles?tag=" + tag}>
                      {tag}
                    </a>
                  ))}
                </div>

                <div className="p-4 bg-black">
                  <p className="text-2xl font-bold text-white">
                    Price - {nft.price} Matic
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}

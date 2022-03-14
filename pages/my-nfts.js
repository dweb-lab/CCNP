import { ethers } from "ethers"
import { useEffect, useState } from "react"
import axios from "axios"
import { nftmarketaddress, nftaddress } from "../config"

import Market from "../artifacts/contracts/Market.sol/NFTMarket.json"
import NFT from "../artifacts/contracts/NFT.sol/NFT.json"
import { useWeb3 } from "../hooks/useWeb3"
import { Layout } from "../components/Layout"

export default function CreatorDashboard() {
  const [nfts, setNfts] = useState([])
  const [sold, setSold] = useState([])
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
    const data = await marketContract.fetchItemsCreated()

    const items = await Promise.all(
      data.map(async (i) => {
        const tokenUri = await tokenContract.tokenURI(i.tokenId)
        const meta = await axios.get(tokenUri)
        let path = null
        if (tokenUri.startsWith("https://bafy")) {
          path = tokenUri.substring(8, 67)
        }
        let price = ethers.utils.formatUnits(i.price.toString(), "ether")
        console.log("meta", meta)
        console.log("i", i)
        let item = {
          price,
          tokenId: i.tokenId.toNumber(),
          path: path,
          seller: i.seller,
          owner: i.owner,
          sold: i.sold,
          image: meta.data.image,
          name: meta.data.name,
          tags: meta.data.tags,
          authors: meta.data.authors[0]["name"],
          description: meta.data.description,
        }
        return item
      }),
    )
    /* create a filtered array of items that have been sold */
    const soldItems = items.filter((i) => i.sold)
    const unsoldItems = items.filter((i) => !i.sold)
    setSold(soldItems)
    setNfts(unsoldItems)
    console.log("items", items)
    setLoadingState("loaded")
  }
  if (loadingState === "loaded" && !(nfts.length + sold.length)) {
    return (
      <h1 className="py-10 px-20 text-3xl">
        No CC-NFT created by you in market
      </h1>
    )
  } else if (loadingState === "loaded") {
    return (
      <Layout>
        <div>
          <div className="p-4">
            <h1 className="text-3xl py-2">CC-NFTs created by me</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
              {nfts.map((nft, i) => (
                <div
                  key={i}
                  className="border shadow rounded-xl overflow-hidden">
                  <img src={nft.image} className="rounded" />

                  <div className="p-4">
                    <a href={"/article?cid=" + nft.path}>
                      <p className="text-2xl font-semibold">{nft.name}</p>
                    </a>
                    <div style={{ height: "70px", overflow: "hidden" }}>
                      <p className="text-gray-400">{nft.description}</p>
                    </div>
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

          <div className="px-4">
            {Boolean(sold.length) && (
              <div>
                <h2 className="text-2xl py-2">Items sold</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                  {sold.map((nft, i) => (
                    <div
                      key={i}
                      className="border shadow rounded-xl overflow-hidden">
                      <a href={"/article?cid=" + nft.path}>
                        <img src={nft.image} className="rounded" />
                      </a>
                      <div className="p-4">
                        <a href={"/article?cid=" + nft.path}>
                          <p className="text-2xl font-semibold">{nft.name}</p>
                        </a>
                        <p className="text-2xl font-semibold">
                          By: &nbsp;
                          <a href={"/articles?author=" + nft.eth}>
                            {nft.authors}
                          </a>
                        </p>
                        Tags: &nbsp;
                        {nft.tags.map((tag, i) => (
                          <a key={i} href={"/articles?tag=" + tag}>
                            {tag}
                          </a>
                        ))}
                      </div>
                      <div className="p-4 bg-black">
                        <p className="text font-bold text-white">
                          Price - {nft.price} Matic
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Layout>
    )
  }
  return null
}

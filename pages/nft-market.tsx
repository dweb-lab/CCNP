import { ethers } from "ethers"
import { useEffect, useState } from "react"
import axios from "axios"

import { nftaddress, nftmarketaddress } from "../config"

import NFT from "../artifacts/contracts/NFT.sol/NFT.json"
import Market from "../artifacts/contracts/Market.sol/NFTMarket.json"
import { Layout } from "../components/Layout"
import { Loading } from "../components/Loading"
import { useWeb3 } from "../hooks/useWeb3"

export default function NFTMarket() {
  const [nfts, setNfts] = useState([])
  const [loadingState, setLoadingState] = useState("not-loaded")
  const web3 = useWeb3()

  useEffect(() => {
    loadNFTs()
  }, [])
  async function loadNFTs() {
    const provider = new ethers.providers.JsonRpcProvider(
      "https://rpc-mumbai.maticvigil.com/v1/35346f853fb4496728602ff72a70eb9a8785064e",
    )
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)
    const marketContract = new ethers.Contract(
      nftmarketaddress,
      Market.abi,
      provider,
    )
    const data = await marketContract.fetchMarketItems()

    const items = await Promise.all(
      data.map(async (i) => {
        const tokenUri = await tokenContract.tokenURI(i.tokenId)
        const meta = await axios.get(tokenUri)
        let price = ethers.utils.formatUnits(i.price.toString(), "ether")
        let item = {
          price,
          tokenId: i.tokenId.toNumber(),
          seller: i.seller,
          owner: i.owner,
          image: meta.data.image,
          name: meta.data.name,
          tags: meta.data.tags,
          authors: meta.data.authors[0]["name"],
          description: meta.data.description,
        }
        console.log(price)
        return item
      }),
    )
    items.reverse()
    setNfts(items)
    setLoadingState("loaded")
  }

  const renderDescription = (description: string) => {
    if (description.length > 60) return `${description.substring(0, 60)}...`
    return description
  }

  async function buyNft(nft) {
    const signer = web3.getSigner()
    const contract = new ethers.Contract(nftmarketaddress, Market.abi, signer)
    const price = ethers.utils.parseUnits(nft.price.toString(), "ether")
    const transaction = await contract.createMarketSale(
      nftaddress,
      nft.tokenId,
      {
        value: price,
      },
    )
    await transaction.wait()
    loadNFTs()
  }

  if (loadingState === "not-loaded") {
    return (
      <Layout>
        <div className="flex w-full mt-80 justify-center">
          <Loading />
        </div>
      </Layout>
    )
  }

  if (loadingState === "loaded" && !nfts.length)
    return (
      <Layout>
        <h1 className="px-20 py-10 text-3xl">No items in marketplace</h1>
      </Layout>
    )
  return (
    <Layout>
      <div className="flex justify-center">
        <div className="px-4" style={{ maxWidth: "1600px" }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
            {nfts.map((nft, i) => (
              <div key={i} className="border shadow rounded-xl overflow-hidden">
                <a href={"/article?cid=" + nft.path}>
                  <img
                    className="lg:h-48 md:h-36 w-full object-cover object-center"
                    src={nft.image}
                    alt={nft.name}/>
                </a>

                <div className="p-4">
                  <a href={"/article?cid=" + nft.path}>
                    <p className="title-font text-lg font-medium text-gray-900">
                      {nft.name}
                    </p>
                  </a>
                  <div
                    style={{
                      height: "70px",
                      minHeight: "70px",
                      overflow: "hidden",
                    }}>
                    <p className="text-gray-400">
                      {renderDescription(nft.description)}
                    </p>
                  </div>
                  <p className="font-semibold">
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
                  <p className="text-2xl mb-4 font-bold text-white">
                    {nft.price} Matic
                  </p>
                  <button
                    className="w-full bg-pink-500 text-white font-bold py-2 px-12 rounded"
                    onClick={() => buyNft(nft)}>
                    Buy as Donate
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}

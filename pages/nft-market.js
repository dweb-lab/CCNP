import { ethers } from "ethers"
import { useEffect, useState } from "react"
import axios from "axios"
import Web3Modal from "web3modal"
import { CID } from "multiformats/cid"

import { nftaddress, nftmarketaddress } from "../config"

import NFT from "../artifacts/contracts/NFT.sol/NFT.json"
import Market from "../artifacts/contracts/Market.sol/NFTMarket.json"
import { Layout } from "../components/Layout"
import { useWeb3 } from "../hooks/useWeb3"

export default function Home() {
  const [nfts, setNfts] = useState([])
  const [loadingState, setLoadingState] = useState("not-loaded")
  const provider = useWeb3()

  useEffect(() => {
    if (!provider) return
    loadNFTs()
  }, [provider])

  // useEffect(() => {
  //   loadNFTs()
  // }, [])

  async function loadNFTs() {
    // const provider = new ethers.providers.JsonRpcProvider(
    //   // "https://polygon-mumbai.infura.io/v3/6d993cb640374f1b8baf01f5eddaed8e",
    //   "https://speedy-nodes-nyc.moralis.io/cebf590f4bcd4f12d78ee1d4/polygon/mumbai",
    //   // "https://rpc-mumbai.maticvigil.com/v1/35346f853fb4496728602ff72a70eb9a8785064e",
    // )
    const signer = provider.getSigner()
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)
    const marketContract = new ethers.Contract(
      nftmarketaddress,
      Market.abi,
      signer,
    )
    const data = await marketContract.fetchMarketItems()
    console.log("data", data)

    const items = await Promise.all(
      data.map(async (i) => {
        const tokenUri = await tokenContract.tokenURI(i.tokenId)
        const meta = await axios.get(tokenUri)
        console.log("tokenUri", tokenUri)
        console.log("i.tokenId", i.tokenId)
        console.log("meta", meta)
        console.log(i.price.toString(), "raw price")
        let path = null
        if (tokenUri.startsWith("https://bafy")) {
          path = tokenUri.substring(8, 67)
        }
        let price = ethers.utils.formatUnits(i.price.toString(), "ether")

        if (meta.data.image.startsWith("https://ipfs.infura.io/ipfs/")) {
          let acid0 = meta.data.image.slice(28) // v0
          const v0 = CID.parse(acid0)
          const v1 = v0.toV1().toString()
          meta.data.image = `https://${v1}.ipfs.infura-ipfs.io/` // or let user choose gateway
          console.log("meta.data.image", meta.data.image)
        }

        let item = {
          price,
          itemId: i.itemId.toNumber(), // tokenId: i.tokenId.toNumber(),
          path: path,
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
    console.log(items)
    items.reverse()
    setNfts(items)
    setLoadingState("loaded")
  }
  async function buyNft(nft) {
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(nftmarketaddress, Market.abi, signer)
    console.log(nft.price.toString())
    const price = ethers.utils.parseUnits(nft.price.toString(), "ether")
    // const price = "0.0001"
    // const price = nft.price.toString()
    console.log(price)
    console.log(nftaddress)
    console.log(nft, nft.tokenId)
    const transaction = await contract.createMarketSale(
      nftaddress,
      nft.itemId, // nft.tokenId,
      {
        value: price,
      },
    )
    await transaction.wait()
    loadNFTs()
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

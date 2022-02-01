import { ethers } from "ethers"
import { useState } from "react"
import axios from "axios"
import Web3Modal from "web3modal"
import { useRouter } from "next/router"
import ReactMarkdown from "react-markdown"
import { CID } from "multiformats/cid"

import { nftmarketaddress, nftaddress } from "../config"

// const hre = require("hardhat");

import NFT from "../artifacts/contracts/NFT.sol/NFT.json"
import Market from "../artifacts/contracts/Market.sol/NFTMarket.json"

import { providers } from "ethers"
import { init } from "@textile/eth-storage"
import { useWeb3 } from "../hooks/useWeb3"
import { Layout } from "../components/Layout"
import { useAccount } from "../hooks/useAccount"

let cid
let nft = {}
export default function MyAssets() {
  const myethAccount = useAccount()
  const provider = useWeb3()
  const [loadingState, setLoadingState] = useState("not-loaded")
  const router = useRouter()

  async function createMint() {
    /* first, upload to IPFS */
    let url = ""
    try {
      if (cid.startsWith("Qm")) {
        // v0
        url = `https://ipfs.infura.io/ipfs/${cid}`
      } else {
        // v1
        url = `https://${cid}.ipfs.infura-ipfs.io/`
      }
      console.log("!nft.minted", !nft.minted)
      /* after file is uploaded to IPFS, pass the URL to save it on Polygon */
      createSale(url)
    } catch (error) {
      console.log("Error uploading file: ", error)
    }
  }

  async function gotoEdit() {
    if ("cid" in router.query) {
      cid = router.query.cid
    }
    if (!cid) {
      return
    }
    router.push(`/edit?cid=${cid}`)
  }

  async function storeNFTtoFilecoin() {
    const wallet = provider.getSigner()
    const storage = await init(wallet)
    // const blob = new Blob(["Hello, world!"], { type: "text/plain" });
    const jsonse = JSON.stringify(nft)
    const blob = new Blob([jsonse], { type: "application/json" })
    const file = new File([blob], "metadata.json", {
      type: "application/json",
      lastModified: new Date().getTime(),
    })
    try {
      await storage.addDeposit() // "execution reverted: BridgeProvider: depositee already has deposit"
    } catch (error) {
      console.error(error)
    }

    const { id, cid } = await storage.store(file)
    const { request, deals } = await storage.status(id)

    console.log("id, cid, request, deals", id, cid, request, deals)
    console.log(request.status_code)

    console.log([...deals])
    console.log("stored~")
    alert("Your NFT has been stored on Filecoin Network~")
  }

  async function createSale(url) {
    const signer = provider.getSigner()

    /* next, create the item */
    let contract = new ethers.Contract(nftaddress, NFT.abi, signer)
    console.log(NFT.abi)
    console.log(signer)
    console.log("signer")
    console.log(contract)
    let transaction = await contract.createToken(url)
    console.log(transaction)
    let tx = await transaction.wait()

    let event = tx.events[0]
    console.log(tx)
    console.log(event)
    // console.log(event.getBlock())
    // console.log(event.getTransaction())
    // console.log(event.getTransactionReceipt())
    let value = event.args[2]
    let tokenId = value.toNumber()

    const price = ethers.utils.parseUnits("0.1", "ether")
    /* then list the item for sale on the marketplace */
    contract = new ethers.Contract(nftmarketaddress, Market.abi, signer)
    let listingPrice = await contract.getListingPrice()
    listingPrice = listingPrice.toString()
    transaction = await contract.createMarketItem(nftaddress, tokenId, price, {
      value: listingPrice,
    })
    await transaction.wait()
  }

  if (loadingState != "loaded" && !("name" in nft)) {
    loadNFT()
  }

  async function loadNFT() {
    console.log(router.query)
    if ("cid" in router.query) {
      cid = router.query.cid
      console.log("cid", cid)
    }
    console.log("cid2", cid)
    if (!cid) {
      return
    }
    let ipfs_gateway_url = ""
    if (cid.startsWith("Qm")) {
      // v0
      ipfs_gateway_url = `https://ipfs.infura.io/ipfs/${cid}`
    } else {
      // v1
      ipfs_gateway_url = `https://${cid}.ipfs.infura-ipfs.io/`
    }
    const ret = await axios.get(ipfs_gateway_url) // TODO
    console.log(ret)
    // authors[0].name
    if ("data" in ret) {
      console.log(ret.data.description)
      nft = ret.data
      console.log("nft.minted", nft.minted)
      console.log("aname", ret.data.authors[0].name)

      if (nft.image.startsWith("https://ipfs.infura.io/ipfs/")) {
        // v0
        let acid0 = nft.image.slice(28)
        console.log("acid0", acid0)
        const v0 = CID.parse(acid0)
        const v1 = v0.toV1().toString()
        nft.image = `https://${v1}.ipfs.infura-ipfs.io/`
        console.log("nft.image", nft.image)
      }
    }
    setLoadingState("loaded")
  }

  if (loadingState != "loaded" && !("name" in nft))
    return (
      <Layout>
        <h1 className="py-10 px-20 text-3xl"></h1>
      </Layout>
    )
  if (loadingState === "loaded" && !("name" in nft))
    return (
      <Layout>
        <h1 className="py-10 px-20 text-3xl">No creation</h1>
      </Layout>
    )
  return (
    <Layout>
      <div className="flex justify-center">
        <div className="p-6 w-full">
          <div className="rounded-xl overflow-hidden">
            <img src={nft.image} className="rounded" />
            <div className="py-6">
              <p className="text-3xl font-semibold flex justify-center">
                {nft.name}
              </p>
              <div className="markdown">
                <ReactMarkdown escapeHtml={true}>
                  {nft.description}
                </ReactMarkdown>
              </div>
              <p>
                By:
                <a href={"/articles?author=" + nft.authors[0].wallet.eth}>
                  {nft.authors[0].name}
                </a>
                &nbsp;&nbsp;&nbsp;&nbsp;Author-Wallet:{" "}
                {nft.authors[0].wallet.eth}
              </p>
              <p>Tags: {nft.tags}</p>
              <p>
                License: <a href={nft.license_url}>{nft.license}</a>
              </p>
              {!("minted" in nft) && nft.authors[0].wallet.eth == myethAccount && (
                <button
                  onClick={createMint}
                  className="font-bold mt-4 bg-blue-500 text-white rounded p-4 shadow-lg">
                  Mint (Will sign 2 times. Be patient...)
                </button>
              )}
              <br />
              {nft.authors[0].wallet.eth == myethAccount && (
                <button
                  onClick={gotoEdit}
                  className="font-bold mt-4 bg-blue-500 text-white rounded p-4 shadow-lg">
                  Edit
                </button>
              )}
              <br />{" "}
              {nft.authors[0].wallet.eth == myethAccount && (
                <button
                  onClick={storeNFTtoFilecoin}
                  className="font-bold mt-4 bg-blue-500 text-white rounded p-4 shadow-lg">
                  Store NFT on the Filecoin network(optional)
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

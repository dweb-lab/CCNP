import { ethers } from "ethers"
import { useState, createRef } from "react"
import { useRouter } from "next/router"
import ReactMarkdown from "react-markdown"
import { createPopper } from "@popperjs/core"

import { nftaddress } from "../config"

import { init } from "@textile/eth-storage"
import { useWeb3 } from "../hooks/useWeb3"
import { Layout } from "../components/Layout"
import { useAccount } from "../hooks/useAccount"
import { useNFTContract } from "../hooks/contracts/useNFTContract"
import { useNFTMarketContract } from "../hooks/contracts/useNFTMarketContract"
import { useArticle } from "../hooks/useArticle"

import NFT from "../artifacts/contracts/NFT.sol/NFT.json"

export default function Article() {
  const account = useAccount()
  const provider = useWeb3()
  const nftContract = useNFTContract()
  const marketContract = useNFTMarketContract()
  const router = useRouter()
  const { result = { cid: undefined, nft: undefined }, status } = useArticle(
    router.query.cid as string,
  )
  const { cid, nft } = result
  const [formInput, updateFormInput] = useState({
    amount: "0.1",
  })

  const [popoverShow, setPopoverShow] = useState(false)
  if (typeof window !== "undefined") {
    const btnRef = createRef()
    const popoverRef = createRef()
    const openTooltip = () => {
      createPopper(btnRef.current, popoverRef.current, {
        placement: "top",
      })
      setPopoverShow(true)
    }
    const closeTooltip = () => {
      setPopoverShow(false)
    }
  }

  async function createMint() {
    if (!nft?.url) return
    try {
      await createSale(nft.url)
    } catch (error) {
      console.log("Error uploading file: ", error)
    }
  }

  async function mintAsDonation() {
    const { amount } = formInput
    let url = ""
    try {
      if (cid.startsWith("Qm")) {
        // v0
        url = `https://ipfs.infura.io/ipfs/${cid}`
      } else {
        // v1
        url = `https://${cid}.ipfs.infura-ipfs.io/`
      }
      // TODO: allow
      const signer = provider.getSigner()
      let contract = new ethers.Contract(nftaddress, NFT.abi, signer)
      // const price = ethers.utils.parseUnits("0.2", "ether")
      const price = ethers.utils.parseUnits(amount, "ether")
      // const price = ethers.utils.parseUnits("0.01", "ether")
      let transaction = await contract.mintAsDonorFromAuthor(
        url,
        nft.authors[0].wallet.eth,
        {
          value: price,
        },
      )
      console.log(transaction)
      // let tx = await transaction.wait()
      // let event = tx.events[0]
      // console.log(tx)
      // console.log(event)
      // let value = event.args[2]
      // let tokenId = value.toNumber()

      await transaction.wait()
    } catch (error) {
      console.log("Error: ", error)
    }
  }

  async function gotoEdit() {
    if (!cid) return
    router.push(`/edit?cid=${cid}`)
  }

  async function storeNFTtoFileCoin() {
    const wallet = provider.getSigner()
    const storage = await init(wallet)
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

    const { id } = await storage.store(file)
    await storage.status(id)
    alert("Your NFT has been stored on Filecoin Network~")
  }

  async function createSale(url) {
    let transaction = await nftContract.createToken(url)
    let tx = await transaction.wait()

    let event = tx.events[0]
    let value = event.args[2]
    let tokenId = value.toNumber()

    const price = ethers.utils.parseUnits("0.1", "ether")
    /* then list the item for sale on the marketplace */
    let listingPrice = (await marketContract.getListingPrice()).toString()
    transaction = await marketContract.createMarketItem(
      nftaddress,
      tokenId,
      price,
      {
        value: listingPrice,
      },
    )
    await transaction.wait()
  }

  console.log(nft)
  if (!["success", "error"].includes(status)) {
    return <div>loading</div>
  }

  if (status === "success" && !nft) {
    return (
      <Layout>
        <h1 className="py-10 px-20 text-3xl">No creation</h1>
      </Layout>
    )
  }

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
                <ReactMarkdown>
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
                License: <a href={nft.licenseURL}>{nft.license}</a>
              </p>

              <input
                id="amount"
                onChange={(e) =>
                  updateFormInput({ ...formInput, amount: e.target.value })
                }
                type="text"
                defaultValue="0.1"
                placeholder="0.1"
                className="shadow appearance-none border rounded w-1/4 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"/>
              {!("disallow_mint" in nft) && (
                <button
                  id="popcorn"
                  aria-describedby="tooltip"
                  onMouseEnter={openTooltip}
                  onMouseLeave={closeTooltip}
                  ref={btnRef}
                  onClick={mintAsDonation}
                  className="font-bold mt-4 bg-blue-500 text-white rounded p-2 shadow-lg">
                  Mint As Donation
                </button>
              )}
              <div
                className={
                  (popoverShow ? "" : "hidden ") +
                  "bg-sky-600 border-0 mr-3 block z-50 font-normal leading-normal text-m break-words rounded-lg"
                }
                ref={popoverRef}>
                <div>
                  <div className="text-white font-semibold p-3 mb-0 uppercase rounded-t-lg">
                    Tips!!!
                  </div>
                  <div className="text-white p-3">
                    <ul>
                      <li>You mint the article NFT is only for Donation.</li>
                      <li>
                        The platform will get 10% (60% of them will give back to
                        early donors).
                      </li>
                      <li>
                        If an author got x (from early donors), and then got
                        20*x later, we will give 1.2*x to early donors.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <br />
              {!("minted" in nft) && nft.authors[0].wallet.eth == account && (
                <button
                  onClick={createMint}
                  className="font-bold bg-blue-500 rounded p-2 text-white mt-2">
                  Mint (Will sign 2 times. Be patient...)
                </button>
              )}
              <br />
              {nft.authors[0].wallet.eth == account && (
                <button
                  onClick={gotoEdit}
                  className="font-bold bg-blue-500 rounded p-2 text-white mt-2">
                  Edit
                </button>
              )}
              <br />{" "}
              {nft.authors[0].wallet.eth == account && (
                <button
                  onClick={storeNFTtoFileCoin}
                  className="font-bold bg-blue-500 rounded p-2 text-white mt-2">
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

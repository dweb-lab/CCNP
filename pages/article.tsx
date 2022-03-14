import { ethers } from "ethers"
import { useRouter } from "next/router"
import ReactMarkdown from "react-markdown"

import { nftaddress } from "../config"

import { init } from "@textile/eth-storage"
import { useWeb3 } from "../hooks/useWeb3"
import { Layout } from "../components/Layout"
import { useAccount } from "../hooks/useAccount"
import { useNFTContract } from "../hooks/contracts/useNFTContract"
import { useNFTMarketContract } from "../hooks/contracts/useNFTMarketContract"
import { useArticle } from "../hooks/useArticle"

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

  async function createMint() {
    if (!nft?.url) return
    try {
      await createSale(nft.url)
    } catch (error) {
      console.log("Error uploading file: ", error)
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
        <div className="container mx-80">
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
              <p>
                Tags: &nbsp;
                {nft.tags.map((tag, i) => (
                  <a key={i} href={"/articles?tag=" + tag}>
                    {tag}{" "}
                  </a>
                ))}
              </p>
              <p>
                License: <a href={nft.licenseURL}>{nft.license}</a>
              </p>
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

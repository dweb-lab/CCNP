import { useEffect, useState } from "react"
import axios from "axios"
import { Layout } from "../components/Layout"
import { ArticleItem } from "../components/ArticleItem"

let ethAccount

export default function MyAssets() {
  const [nfts, setNfts] = useState([])
  const [loadingState, setLoadingState] = useState("not-loaded")

  ethAccount = "*"
  useEffect(() => {
    loadNFTs()
  }, [])
  async function loadNFTs() {
    const dweb_search_url = `https://dweb-search-api.anwen.cc/get_meta?eth=${ethAccount}`
    console.log(dweb_search_url)
    const ret = await axios.get(dweb_search_url) // TODO
    console.log(ret)
    // setNfts(items)
    if ("data" in ret.data) {
      setNfts(ret.data.data)
    }
    setLoadingState("loaded")
  }
  if (loadingState === "loaded" && !nfts.length)
    return <h1 className="py-10 px-20 text-3xl">No creations</h1>

  return (
    <Layout>
      <div className="container mx-auto">
        <section className="text-gray-600 body-font flex flex-wrap justify-start">
          {nfts.map((nft, i) => (
            <ArticleItem
              key={i}
              imageURL={nft.image}
              name={nft.name}
              tags={nft.tags}
              authors={nft.authors}
              path={nft.path}/>
          ))}
        </section>
      </div>
    </Layout>
  )
}

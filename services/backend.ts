// there are 2 kinds of backends:
// - api of open-source&open-data backend, such dweb search
//   - we hope they follow a widely used standard
//   - https://github.com/ipfs-search/ipfs-search/issues/194
// - api of public ipfs-gateway

import axios from "axios"
import { CID } from "multiformats/cid"
import { Article } from "../types"

export async function loadNFT(cid): Promise<Article> {
  if (!cid) {
    return
  }
  let ipfsGatewayURL = getIPFSURL(cid)
  const ret = await axios.get(ipfsGatewayURL) // TODO
  if (ret.data) {
    const nft = ret.data
    if (nft.image.startsWith("https://ipfs.infura.io/ipfs/")) {
      const v0 = CID.parse(nft.image.slice(28)) // v0
      const v1 = v0.toV1().toString()
      nft.image = `https://${v1}.ipfs.infura-ipfs.io/`
    }
    nft.s_tags = nft.tags.join(" ")
    nft.author_names = nft.authors[0]["name"]
    nft.url = ipfsGatewayURL
    nft.licenseURL = nft.license_url
    nft.license = nft.license
    return nft
  }

  return null
}

export function getIPFSURL(cid: string) {
  if (cid.startsWith("Qm")) {
    return `https://ipfs.infura.io/ipfs/${cid}`
  }
  return `https://${cid}.ipfs.infura-ipfs.io/`
}

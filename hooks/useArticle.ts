import { useAsync, useMountEffect } from "@react-hookz/web"
import { loadNFT } from "../services/backend"
import { useEffect } from "react"

export const useArticle = (cid: string) => {
  console.log(cid)
  const [info, actions] = useAsync(async () => {
    if (!cid) return { cid: null, nft: null }
    const nft = await loadNFT(cid)
    return { cid, nft }
  })

  useEffect(() => {
    actions.execute()
  }, [cid])

  return info
}

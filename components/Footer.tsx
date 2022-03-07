import { memo } from "react"
import { useLocalStorageValue } from "@react-hookz/web"
import { BACKEND_VERSION } from "../constants"
import { FrontendVersion } from "../version"

export const Footer  = memo(() => {
  const [backendVersion] = useLocalStorageValue(BACKEND_VERSION)
  return (
    <footer className="border-b p-6 flex justify-center">
      <p>
        <a href="/about">About</a> &nbsp;
        <a href="https://discord.gg/QaEwmJMDJ2">Discord</a> &nbsp;
        <a href="https://github.com/dweb-lab/CCNP">Github</a> &nbsp;
        <a href="https://twitter.com/askender43">Twitter</a> &nbsp;
        Ver: {FrontendVersion} &nbsp;
        Made with love by <a href="Dweb Lab">Dweb Lab</a>
      </p>
      <p className="hidden">
        Backend Version: {backendVersion} &nbsp;
        & <a href="https://ipfs.io/">IPFS</a> &nbsp;
        & <a href="https://mumbai.polygonscan.com/">Polygon (MATIC) Mumbai TESTNET</a>
      </p>
    </footer>
  )
})

Footer.displayName = 'LayoutFooter'
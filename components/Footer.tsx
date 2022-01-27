import { memo } from "react"
import { useLocalStorageValue } from "@react-hookz/web"
import { BACKEND_VERSION } from "../constants"
import { FrontendVersion } from "../version"

export const Footer = memo(() => {
  const [backendVersion] = useLocalStorageValue(BACKEND_VERSION)
  return (
    <footer className="border-b p-6 flex justify-center">
      <p suppressHydrationWarning>
        Frontend Version: {FrontendVersion} &nbsp; Backend Version:{" "}
        {backendVersion} &nbsp; & <a href="https://ipfs.io/">IPFS</a> &nbsp; &{" "}
        <a href="https://mumbai.polygonscan.com/">
          Polygon (MATIC) Mumbai TESTNET
        </a>
        &nbsp;| Powered by Dweb Lab.
      </p>
    </footer>
  )
})

Footer.displayName = "LayoutFooter"

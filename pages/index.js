import { Layout } from "../components/Layout"

export default function Home() {
  return (
    <Layout>
      <div className="px-4 container mx-auto">
        <h2 className="p-6 lg:px-20 lg:py-10 text-3xl">📢Tips</h2>
        <ul className="p-6 lg:px-20">
          <li>
            🌏 Every NFT here is licensed under{" "}
            <a rel="license" href="http://creativecommons.org/licenses/by/4.0/">
              Creative Commons Attribution 4.0 International License
            </a>
            . 🅭
          </li>
          <li>
            🎁 Buying NFT is to donate tokens to the NFT minter(maybe the
            author). You can&apos;t sell it to others.
          </li>
          <li>
            🎓 Please don’t mint anything that doesn’t belong to you. We have a{" "}
            <a href="https://discord.gg/QaEwmJMDJ2">Dweb DAO</a> to help check
            cheating behavious. (Welcome to join the DAO.)
          </li>
        </ul>

        <h2 className="p-6 lg:px-20 lg:py-10 text-3xl">📢注意</h2>
        <ul className="p-6 lg:px-20">
          <li>
            🌏 这里的所有NFT作品采用
            <a
              rel="license"
              href="http://creativecommons.org/licenses/by-sa/4.0/">
              知识共享署名-相同方式共享 4.0 国际许可协议
            </a>
            进行许可。 🅭
          </li>
          <li>
            🎁
            购买NFT仅仅意味着你向NFT铸造者（可能是作品作者）捐款。你不能将该NFT卖给其他人。
          </li>
          <li>
            🎓 请不要将任何不属于你的作品铸造为NFT。 我们有一个
            <a href="https://discord.gg/QaEwmJMDJ2">Dweb DAO</a>
            帮助检测欺骗行为。（也欢迎加入）
          </li>
        </ul>

        <h2 className="p-6 lg:px-20 lg:py-10 text-3xl">The Features</h2>
        <ul className="p-6 lg:px-20">
          <li>
            🌏 All Creative Commons licensed articles will be stored on IPFS and
            indexed in dweb search engines(such as Dweb Search).
          </li>
          <li>
            🎁 Authers can mint the articles as NFTs and push them to market
            with very low gas fee(with Polygon network). Users can buy NFTs
            (articles) which they like, just for donation.
          </li>
          <li>
            🎓 The NFTs will be stored both on IPFS and Filecoin with
            nft.storage and Filecoin-Polygon-Bridge so we can help store
            valuable data on web permanently.
          </li>
        </ul>

        <h2 className="p-6 lg:px-20 lg:py-10 text-3xl">(O_O)? Question?</h2>
        <ul className="p-6 lg:px-20">
          <li>
            🔗 We use mumbai test network. You can add it to your Metamask with{" "}
            <a href="https://chainlist.org/">Chainlist</a>
          </li>
          <li>
            🌏 You can join{" "}
            <a href="https://discord.gg/QaEwmJMDJ2">Dweb Lab Discord</a>
          </li>
          <li className="break-all">
            🌃 There is also an IPFS version:
            ipfs://QmeHJjYjFDLnu4pehAjRyy2MTbZCuVkXFRsvUYVfVUaYxL maybe not
            newest version
          </li>
        </ul>
      </div>
    </Layout>
  )
}

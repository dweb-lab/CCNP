import { Layout } from "../components/Layout"
import HeroHome from '../components/HeroHome'

function Home() {
  return (
    <Layout>
      <div className="flex flex-col min-h-screen overflow-hidden">
        <main className="flex-grow">
          <HeroHome />        
        </main>
      </div>
    </Layout>
  )
}

export default Home

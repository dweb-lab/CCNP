import "../styles/globals.css"
import "../styles/markdown.css"
import Head from "next/head"
import { ethers, providers } from "ethers"
import { Menu, Transition } from "@headlessui/react"
import { Fragment, useCallback, useMemo, useReducer, useState } from "react"
import { ChevronDownIcon } from "@heroicons/react/solid"
import { Navigation } from "../components/Navigation"
import {
  BACKEND_VERSION,
  DOMAIN,
  signInfo,
  STORAGE_KEY_ACCOUNT,
  STORAGE_KEY_ACCOUNT_SIG,
  SUPPORT_NETWORKS,
} from "../constants"
import {
  useAsync,
  useLocalStorageValue,
  useMountEffect,
} from "@react-hookz/web"
import {
  initialWeb3State,
  Web3Context,
  web3Reducer,
} from "../context/web3Context"
import { createProvider, switchNetwork } from "../web3"
import { getBrief } from "../web3/utils"
import axios from "axios"
import "react-toastify/dist/ReactToastify.css"
import { ToastContainer } from "react-toastify"

function App({ Component, pageProps }) {
  const [accountInLocal, setLocalAccount, removeLocalAccount] =
    useLocalStorageValue<string>(STORAGE_KEY_ACCOUNT)
  const [sigInLocal, setLocalSig, removeLocalSig] = useLocalStorageValue(
    STORAGE_KEY_ACCOUNT_SIG,
  )
  const [, setBackendVersion] = useLocalStorageValue(BACKEND_VERSION)
  const [state, dispatch] = useReducer(web3Reducer, {
    ...initialWeb3State,
    account: accountInLocal,
  })
  const { account, provider, chainId } = state
  const isSupportCurrentNetwork = SUPPORT_NETWORKS.includes(chainId)

  const [autoLoginState, actions] = useAsync(async () => {
    if (!sigInLocal || !accountInLocal) return
    const cachedProvider = await createProvider(undefined, (id) =>
      dispatch({ type: "SET_CHAIN_ID", chainId: id }),
    )
    if (!cachedProvider) return
    dispatch({ type: "SET_WEB3_PROVIDER", provider: cachedProvider })
    const web3Provider = new providers.Web3Provider(cachedProvider)
    const signer = web3Provider.getSigner()
    const address = await signer.getAddress()
    const network = await web3Provider.getNetwork()
    if (address !== accountInLocal) {
      removeLocalAccount()
      removeLocalSig()
    } else {
      dispatch({
        type: "SET_WEB3_PROVIDER",
        provider: cachedProvider,
        web3Provider,
        account: address,
        chainId: network.chainId,
      })
    }
  })

  useMountEffect(actions.execute)
  useMountEffect(getBackendVersion)

  async function getBackendVersion() {
    try {
      const dweb_search_ver_api = "https://dweb-search-api.anwen.cc/version"
      const ret = await axios.get(dweb_search_ver_api)
      if (ret.status == 200 && "version" in ret.data) {
        setBackendVersion(ret.data["version"])
      }
    } catch (error) {
      setBackendVersion("error")
    }
  }

  const web3ContextValue = useMemo(() => {
    return { state, dispatch }
  }, [state, dispatch])

  const connectWallet = useCallback(async function () {
    const provider = await createProvider(undefined, (id) =>
      dispatch({ type: "SET_CHAIN_ID", chainId: id }),
    )
    if (provider.chainId !== "0x13881") {
      await switchNetwork(provider)
    }
    if (!provider) return
    dispatch({ type: "SET_WEB3_PROVIDER", provider })

    const web3Provider = new providers.Web3Provider(provider)
    const signer = web3Provider.getSigner()
    const address = await signer.getAddress()

    if (!sigInLocal) {
      const signature = await signer._signTypedData(
        DOMAIN,
        signInfo.types,
        signInfo.message,
      )
      const verifiedAddress = ethers.utils.verifyTypedData(
        DOMAIN,
        signInfo.types,
        signInfo.message,
        signature,
      )
      if (verifiedAddress !== address) return
      setLocalSig(signature)
    }

    const network = await web3Provider.getNetwork()
    setLocalAccount(address)

    dispatch({
      type: "SET_WEB3_PROVIDER",
      provider,
      web3Provider,
      account: address,
      chainId: network.chainId,
    })
  }, [])

  const disconnectWallet = async () => {
    dispatch({
      type: "SET_WEB3_PROVIDER",
      provider: undefined,
      web3Provider: undefined,
      account: undefined,
      chainId: undefined,
    })
    removeLocalAccount()
    removeLocalSig()
  }

  const renderActionButton = () => {
    if (!["success", "error"].includes(autoLoginState.status)) return null
    if (!sigInLocal || !accountInLocal) {
      return (
        <button
          suppressHydrationWarning
          onClick={connectWallet}
          className="font-bold bg-pink-500 rounded p-2 text-white">
          ConnectWallet
        </button>
      )
    }

    if (!isSupportCurrentNetwork) {
      return (
        <button
          suppressHydrationWarning
          onClick={() => switchNetwork(provider)}
          className="font-bold bg-pink-500 rounded p-2 text-white">
          Switch Network
        </button>
      )
    }
    return null
  }

  return (
    <div>
      <Head>
        <title>Creative Comomons NFT Playground</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <nav className="border-b p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl lg:text-4xl font-bold">
            Creative Commons NFT Playground
          </h1>
          <div>{renderActionButton()}</div>
        </div>
        {sigInLocal && account && isSupportCurrentNetwork && (
          <div className="absolute top-8 right-8 text-right fixed">
            <Menu as="div" className="relative inline-block text-left">
              <div>
                <Menu.Button className="inline-flex justify-center w-full px-2 py-2 font-medium text-white bg-black rounded-md bg-opacity-20 hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
                  <ChevronDownIcon
                    className="w-5 h-5 text-violet-200 hover:text-violet-100"
                    aria-hidden="true"/>
                </Menu.Button>
              </div>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95">
                <Menu.Items className="absolute right-0 w-56 mt-2 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="px-1 py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          className={`${
                            active
                              ? "bg-blue-500 text-gray-300"
                              : "text-gray-900"
                          } group flex rounded-md items-center w-full px-2 py-2 text-sm`}>
                          id: {getBrief(account)}
                        </button>
                      )}
                    </Menu.Item>

                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={disconnectWallet}
                          className={`${
                            active
                              ? "bg-blue-500 text-gray-300"
                              : "text-gray-900"
                          } group flex rounded-md items-center w-full px-2 py-2 text-sm`}>
                          Logout
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        )}
        <div className="flex justify-around">
          <Navigation />
        </div>
      </nav>
      <Web3Context.Provider value={web3ContextValue}>
        <Component {...pageProps} />
      </Web3Context.Provider>
      <ToastContainer />
    </div>
  )
}

export default App

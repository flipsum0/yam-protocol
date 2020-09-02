import React, { createContext, useEffect, useState } from 'react'

import { useWallet } from 'use-wallet'

import { Sake } from '../../sake'

export interface SakeContext {
  sake?: typeof Sake
}

export const Context = createContext<SakeContext>({
  sake: undefined,
})

declare global {
  interface Window {
    sakesauce: any
  }
}

const SakeProvider: React.FC = ({ children }) => {
  const { ethereum } = useWallet()
  const [sake, setSake] = useState<any>()

  useEffect(() => {
    if (ethereum) {
      const sakeLib = new Sake(
        ethereum,
        "1",
        false, {
          defaultAccount: "",
          defaultConfirmations: 1,
          autoGasMultiplier: 1.5,
          testing: false,
          defaultGas: "6000000",
          defaultGasPrice: "1000000000000",
          accounts: [],
          ethereumNodeTimeout: 10000
        }
      )
      setSake(sakeLib)
      window.sakesauce = sakeLib
    }
  }, [ethereum])

  return (
    <Context.Provider value={{ sake }}>
      {children}
    </Context.Provider>
  )
}

export default SakeProvider

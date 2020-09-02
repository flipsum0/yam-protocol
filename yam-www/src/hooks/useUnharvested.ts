import { useContext } from 'react'

import { useWallet } from 'use-wallet'

import { Context as FarmsContext } from '../contexts/Farms'
import { bnToDec } from '../utils'
import { getEarned } from '../sakeUtils'

import useFarms from './useFarms'
import useYam from './useSake'

const useUnharvested = () => {
  const { unharvested } = useContext(FarmsContext)
  return unharvested
}

export default useUnharvested
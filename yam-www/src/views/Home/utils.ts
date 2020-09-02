import { Sake } from '../../sake'

import { bnToDec } from '../../utils'

import {
  getCurrentPrice as gCP,
  getTargetPrice as gTP,
  getCirculatingSupply as gCS,
  getNextRebaseTimestamp as gNRT,
  getTotalSupply as gTS,
  getScalingFactor,
} from '../../sakeUtils'

const getCurrentPrice = async (sake: typeof Sake): Promise<number> => {
  // FORBROCK: get current YAM price
  return gCP(sake)
}

const getTargetPrice = async (sake: typeof Sake): Promise<number> => {
  // FORBROCK: get target YAM price
  return gTP(sake)
}

const getCirculatingSupply = async (sake: typeof Sake): Promise<string> => {
  // FORBROCK: get circulating supply
  return gCS(sake)
}

const getNextRebaseTimestamp = async (sake: typeof Sake): Promise<number> => {
  // FORBROCK: get next rebase timestamp
  const nextRebase = await gNRT(sake) as number
  return nextRebase * 1000
}

const getTotalSupply = async (sake: typeof Sake): Promise<string> => {
  // FORBROCK: get total supply
  return gTS(sake)
}

export const getStats = async (sake: typeof Sake) => {
  const curPrice = await getCurrentPrice(sake)
  const circSupply = '' // await getCirculatingSupply(sake)
  const nextRebase = await getNextRebaseTimestamp(sake)
  const rawScalingFactor = await getScalingFactor(sake)
  const scalingFactor = Number(bnToDec(rawScalingFactor).toFixed(2))
  const targetPrice = await getTargetPrice(sake)
  const totalSupply = await getTotalSupply(sake)
  return {
    circSupply,
    curPrice,
    nextRebase,
    scalingFactor,
    targetPrice,
    totalSupply
  }
}

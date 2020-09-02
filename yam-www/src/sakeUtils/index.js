import {ethers} from 'ethers'

import BigNumber from 'bignumber.js'

BigNumber.config({
  EXPONENTIAL_AT: 1000,
  DECIMAL_PLACES: 80,
});

const GAS_LIMIT = {
  STAKING: {
    DEFAULT: 200000,
    SNX: 850000,
  }
};

export const getPoolStartTime = async (poolContract) => {
  return await poolContract.methods.starttime().call()
}

export const stake = async (poolContract, amount, account, tokenName) => {
  let now = new Date().getTime() / 1000;
  const gas = GAS_LIMIT.STAKING[tokenName.toUpperCase()] || GAS_LIMIT.STAKING.DEFAULT;
  if (now >= 1597172400) {
    return poolContract.methods
      .stake((new BigNumber(amount).times(new BigNumber(10).pow(18))).toString())
      .send({ from: account, gas })
      .on('transactionHash', tx => {
        console.log(tx)
        return tx.transactionHash
      })
  } else {
    alert("pool not active");
  }
}

export const unstake = async (poolContract, amount, account) => {
  let now = new Date().getTime() / 1000;
  if (now >= 1597172400) {
    return poolContract.methods
      .withdraw((new BigNumber(amount).times(new BigNumber(10).pow(18))).toString())
      .send({ from: account, gas: 200000 })
      .on('transactionHash', tx => {
        console.log(tx)
        return tx.transactionHash
      })
  } else {
    alert("pool not active");
  }
}

export const harvest = async (poolContract, account) => {
  let now = new Date().getTime() / 1000;
  if (now >= 1597172400) {
    return poolContract.methods
      .getReward()
      .send({ from: account, gas: 200000 })
      .on('transactionHash', tx => {
        console.log(tx)
        return tx.transactionHash
      })
  } else {
    alert("pool not active");
  }
}

export const redeem = async (poolContract, account) => {
  let now = new Date().getTime() / 1000;
  if (now >= 1597172400) {
    return poolContract.methods
      .exit()
      .send({ from: account, gas: 400000 })
      .on('transactionHash', tx => {
        console.log(tx)
        return tx.transactionHash
      })
  } else {
    alert("pool not active");
  }
}

export const approve = async (tokenContract, poolContract, account) => {
  return tokenContract.methods
    .approve(poolContract.options.address, ethers.constants.MaxUint256)
    .send({ from: account, gas: 80000 })
}

export const getPoolContracts = async (sake) => {
  const pools = Object.keys(sake.contracts)
    .filter(c => c.indexOf('_pool') !== -1)
    .reduce((acc, cur) => {
      const newAcc = { ...acc }
      newAcc[cur] = sake.contracts[cur]
      return newAcc
    }, {})
  return pools
}

export const getEarned = async (sake, pool, account) => {
  const scalingFactor = new BigNumber(await sake.contracts.sake.methods.sakesScalingFactor().call())
  const earned = new BigNumber(await pool.methods.earned(account).call())
  return earned.multipliedBy(scalingFactor.dividedBy(new BigNumber(10).pow(18)))
}

export const getStaked = async (sake, pool, account) => {
  return sake.toBigN(await pool.methods.balanceOf(account).call())
}

export const getCurrentPrice = async (sake) => {
  // FORBROCK: get current sake price
  return sake.toBigN(await sake.contracts.rebaser.methods.getCurrentTWAP().call())
}

export const getTargetPrice = async (sake) => {
  return sake.toBigN(1).toFixed(2);
}

export const getCirculatingSupply = async (sake) => {
  let now = await sake.web3.eth.getBlock('latest');
  let scalingFactor = sake.toBigN(await sake.contracts.sake.methods.sakesScalingFactor().call());
  let starttime = sake.toBigN(await sake.contracts.eth_pool.methods.starttime().call()).toNumber();
  let timePassed = now["timestamp"] - starttime;
  if (timePassed < 0) {
    return 0;
  }
  let sakesDistributed = sake.toBigN(8 * timePassed * 250000 / 625000); //sakes from first 8 pools
  let starttimePool2 = sake.toBigN(await sake.contracts.ycrv_pool.methods.starttime().call()).toNumber();
  timePassed = now["timestamp"] - starttime;
  let pool2sakes = sake.toBigN(timePassed * 1500000 / 625000); // sakes from second pool. note: just accounts for first week
  let circulating = pool2sakes.plus(sakesDistributed).times(scalingFactor).div(10**36).toFixed(2)
  return circulating
}

export const getNextRebaseTimestamp = async (sake) => {
  try {
    let now = await sake.web3.eth.getBlock('latest').then(res => res.timestamp);
    let interval = 43200; // 12 hours
    let offset = 28800; // 8am/8pm utc
    let secondsToRebase = 0;
    if (await sake.contracts.rebaser.methods.rebasingActive().call()) {
      if (now % interval > offset) {
          secondsToRebase = (interval - (now % interval)) + offset;
       } else {
          secondsToRebase = offset - (now % interval);
      }
    } else {
      let twap_init = sake.toBigN(await sake.contracts.rebaser.methods.timeOfTWAPInit().call()).toNumber();
      if (twap_init > 0) {
        let delay = sake.toBigN(await sake.contracts.rebaser.methods.rebaseDelay().call()).toNumber();
        let endTime = twap_init + delay;
        if (endTime % interval > offset) {
            secondsToRebase = (interval - (endTime % interval)) + offset;
         } else {
            secondsToRebase = offset - (endTime % interval);
        }
        return endTime + secondsToRebase;
      } else {
        return now + 13*60*60; // just know that its greater than 12 hours away
      }
    }
    return secondsToRebase
  } catch (e) {
    console.log(e)
  }
}

export const getTotalSupply = async (sake) => {
  return await sake.contracts.sake.methods.totalSupply().call();
}

export const getStats = async (sake) => {
  const curPrice = await getCurrentPrice(sake)
  const circSupply = await getCirculatingSupply(sake)
  const nextRebase = await getNextRebaseTimestamp(sake)
  const targetPrice = await getTargetPrice(sake)
  const totalSupply = await getTotalSupply(sake)
  return {
    circSupply,
    curPrice,
    nextRebase,
    targetPrice,
    totalSupply
  }
}

export const vote = async (sake, account) => {
  return sake.contracts.gov.methods.castVote(0, true).send({ from: account })
}

export const delegate = async (sake, account) => {
  return sake.contracts.sake.methods.delegate("0x683A78bA1f6b25E29fbBC9Cd1BFA29A51520De84").send({from: account, gas: 320000 })
}

export const didDelegate = async (sake, account) => {
  return await sake.contracts.sake.methods.delegates(account).call() === '0x683A78bA1f6b25E29fbBC9Cd1BFA29A51520De84'
}

export const getVotes = async (sake) => {
  const votesRaw = new BigNumber(await sake.contracts.sake.methods.getCurrentVotes("0x683A78bA1f6b25E29fbBC9Cd1BFA29A51520De84").call()).div(10**24)
  return votesRaw
}

export const getScalingFactor = async (sake) => {
  return new BigNumber(await sake.contracts.sake.methods.sakesScalingFactor().call())
}

export const getDelegatedBalance = async (sake, account) => {
  return new BigNumber(await sake.contracts.sake.methods.balanceOfUnderlying(account).call()).div(10**24)
}

export const migrate = async (sake, account) => {
  return sake.contracts.sakeV2migration.methods.migrate().send({ from: account, gas: 320000 })
}

export const getMigrationEndTime = async (sake) => {
  return sake.toBigN(await sake.contracts.sakeV2migration.methods.startTime().call()).plus(sake.toBigN(86400*3)).toNumber()
}

export const getV2Supply = async (sake) => {
  return new BigNumber(await sake.contracts.sakeV2.methods.totalSupply().call())
}
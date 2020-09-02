import React, { useCallback, useEffect, useMemo, useState } from 'react'

import numeral from 'numeral'
import Countdown, { CountdownRenderProps} from 'react-countdown'
import styled from 'styled-components'
import { useWallet } from 'use-wallet'
import { provider } from 'web3-core'

import Button from '../../../components/Button'
import Card from '../../../components/Card'
import CardContent from '../../../components/CardContent'
import Label from '../../../components/Label'
import Separator from '../../../components/Separator'
import Spacer from '../../../components/Spacer'
import Value from '../../../components/Value'

import { sake as sakeAddress } from '../../../constants/tokenAddresses'

import useAllowance from '../../../hooks/useAllowance'
import useApprove from '../../../hooks/useApprove'
import useScalingFactor from '../../../hooks/useScalingFactor'
import useTokenBalance from '../../../hooks/useTokenBalance'
import useSake from '../../../hooks/useSake'

import { bnToDec } from '../../../utils'
import { getContract } from '../../../utils/erc20'
import { getMigrationEndTime, migrate } from '../../../sakeUtils'

const Migrate: React.FC = () => {

  const [migrationEndDate, setMigrationEndDate] = useState<Date>()
  const [migrateButtonDisabled, setMigrateButtonDisabled] = useState(false)
  const [approvalDisabled, setApprovalDisabled] = useState(false)

  const { account, ethereum } = useWallet()
  const scalingFactor = useScalingFactor()
  const sake = useSake()

  const sakeV1Balance = bnToDec(useTokenBalance(sakeAddress))
  const sakeV2ReceiveAmount = sakeV1Balance / scalingFactor

  const sakeV1Token = useMemo(() => {
    return getContract(ethereum as provider, sakeAddress)
  }, [ethereum])

  const migrationContract = sake ? (sake as any).contracts.sakeV2migration : undefined
  const allowance = useAllowance(sakeV1Token, migrationContract)
  const { onApprove } = useApprove(sakeV1Token, migrationContract)
  
  const countdownRenderer = useCallback((countdownProps: CountdownRenderProps) => {
    const { days, hours, minutes, seconds } = countdownProps
    const paddedDays = days < 10 ? `0${days}` : days
    const paddedSeconds = seconds < 10 ? `0${seconds}` : seconds
    const paddedMinutes = minutes < 10 ? `0${minutes}` : minutes
    const paddedHours = hours < 10 ? `0${hours}` : hours
    return (
      <StyledCountdown>{paddedDays}:{paddedHours}:{paddedMinutes}:{paddedSeconds}</StyledCountdown>
    )
  }, [])

  const handleMigrate = useCallback(async () => {
    try {
      setMigrateButtonDisabled(true)
      await migrate(sake, account)
      setMigrateButtonDisabled(false)
    } catch (e) {
      setMigrateButtonDisabled(false)
    }
  }, [account, sake, setMigrateButtonDisabled])

  useEffect(() => {
    async function fetchMigrationEndDate () {
      try {
        const endTimestamp: number = await getMigrationEndTime(sake)
        setMigrationEndDate(new Date(endTimestamp * 1000))
      } catch (e) { console.log(e) }
    }
    if (sake) {
      fetchMigrationEndDate()
    }
  }, [sake, setMigrationEndDate])

  useEffect(() => {
    if (!account || !sakeV1Balance) {
      setMigrateButtonDisabled(true)
    }
    if (account && sakeV1Balance) {
      setMigrateButtonDisabled(false)
    }
  }, [account, setMigrateButtonDisabled, sakeV1Balance])

  const handleApprove = useCallback(async () => {
    setApprovalDisabled(true)
    try {
      await onApprove()
      setApprovalDisabled(false)
    } catch (e) {
      setApprovalDisabled(false)
    }
  }, [setApprovalDisabled, onApprove])

  return (
    <StyledMigrateWrapper>
      <Card>
        <CardContent>
          <div style={{ margin: '0 auto' }}>
            <StyledCountdownWrapper>
              {migrationEndDate ? (
                <Countdown
                  date={migrationEndDate}
                  renderer={countdownRenderer}
                />
              ) : <Value value="--" />}
              <Label text="Migration Deadline" />
            </StyledCountdownWrapper>
          </div>
          <Spacer size="lg" />
          <StyledBalances>
            <StyledBalance>
              <Value value={sakeV1Balance ? numeral(sakeV1Balance).format('0.00a') : '--'} />
              <Label text="Burn sakeV1" />
            </StyledBalance>
            <div style={{ alignSelf: 'stretch' }}>
            <Separator orientation="vertical" />
            </div>
            <StyledBalance>
              <Value value={sakeV2ReceiveAmount ? numeral(sakeV2ReceiveAmount).format('0.00a') : '--'} />
              <Label text="Mint sakeV2" />
            </StyledBalance>
          </StyledBalances>
          <Spacer size="lg" />
          {account && !allowance.toNumber() ? (
            <Button
              disabled={approvalDisabled}
              onClick={handleApprove}
              text="Approve V2 Migration"
            />
          ) : (
            <Button
              disabled={migrateButtonDisabled}
              onClick={handleMigrate}
              text="Migrate to V2"
            />
          )}
          <Spacer />
          <StyledWarning>WARNING: Burning your sakeV1 tokens for sakeV2 tokens is a permanent action.</StyledWarning>
        </CardContent>
      </Card>
    </StyledMigrateWrapper>
  )
}

const StyledBalances = styled.div`
  display: flex;
`

const StyledBalance = styled.div`
  flex: 1;
  text-align: center;
`

const StyledCountdownWrapper = styled.div`
  text-align: center;
`
const StyledCountdown = styled.div`
  color: ${props => props.theme.color.primary.main};
  font-size: 36px;
  font-weight: 700;
`

const StyledMigrateWrapper = styled.div`
  align-items: center;
  display: flex;
`

const StyledWarning = styled.div`
  color: ${props => props.theme.color.primary.main};
  font-size: 12px;
  text-align: center;
`

export default Migrate
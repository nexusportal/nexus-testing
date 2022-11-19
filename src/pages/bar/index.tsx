import ExclamationIcon from '@heroicons/react/outline/ExclamationIcon'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { BAR_ADDRESS, ChainId, SUSHI, ZERO } from '@sushiswap/core-sdk'
import Button from 'app/components/Button'
import Container from 'app/components/Container'
import Dots from 'app/components/Dots'
import Input from 'app/components/Input'
// import xNEXUSFImage from '../../../public/xNEXUSF.png'
import QuestionHelper from 'app/components/QuestionHelper'
import { NEXUS, XNEXUS } from 'app/config/tokens'
import { Feature } from 'app/enums'
import { classNames } from 'app/functions'
import { aprToApy } from 'app/functions/convert/apyApr'
import { tryParseAmount } from 'app/functions/parse'
import { ApprovalState, useApproveCallback } from 'app/hooks/useApproveCallback'
import { useOracleBar } from 'app/hooks/useOracleBar'
import useOracleDistributor, {
  useOracleDistributorCovertAmount,
  useOracleDistributorEnableCheck,
} from 'app/hooks/useOracleDistributor'
import useSushiBar from 'app/hooks/useSushiBar'
import TransactionFailedModal from 'app/modals/TransactionFailedModal'
// import { useFactory, useOneDayBlock } from 'app/services/graph/hooks'
// import { useBar } from 'app/services/graph/hooks/bar'
import { useActiveWeb3React } from 'app/services/web3'
import { useDexWarningOpen, useWalletModalToggle } from 'app/state/application/hooks'
import { useTokenBalance } from 'app/state/wallet/hooks'
import Head from 'next/head'
// import Image from 'next/image'
import React, { useEffect, useState } from 'react'

import xNEXUSImage from '../../../public/NEXUS_SilverLogo.png'
import NEXUSImage from '../../../public/NEXUSGold.png'
import NetworkGuard from '../../guards/Network'

const INPUT_CHAR_LIMIT = 18

const sendTx = async (txFunc: () => Promise<any>): Promise<boolean> => {
  let success = true
  try {
    const ret = await txFunc()
    if (ret?.error) {
      success = false
    }
  } catch (e) {
    console.error(e)
    success = false
  }
  return success
}

const tabStyle = 'flex justify-center items-center h-full w-full rounded-lg cursor-pointer text-sm md:text-base'
const activeTabStyle = `${tabStyle} text-high-emphesis font-bold bg-dark-900`
const inactiveTabStyle = `${tabStyle} text-secondary`

const buttonStyle =
  'flex justify-center items-center w-full h-14 rounded font-bold md:font-medium md:text-lg mt-5 text-sm focus:outline-none focus:ring'
const buttonStyleEnabled = `${buttonStyle} text-high-emphesis bg-gradient-to-r from-pink-red to-light-brown hover:opacity-90`
const buttonStyleInsufficientFunds = `${buttonStyleEnabled} opacity-60`
const buttonStyleDisabled = `${buttonStyle} text-secondary bg-dark-700`
const buttonStyleConnectWallet = `${buttonStyle} text-high-emphesis bg-blue hover:bg-opacity-90`

function Stake() {
  const { i18n } = useLingui()
  const { account } = useActiveWeb3React()
  const sushiBalance = useTokenBalance(account ?? undefined, SUSHI[ChainId.XRPL])
  const xSushiBalance = useTokenBalance(account ?? undefined, XNEXUS)

  const { enter, leave } = useSushiBar()

  const { convert } = useOracleDistributor()

  const enabled = useOracleDistributorEnableCheck()

  console.log('lpConvertClick', enabled)

  const walletConnected = !!account
  const toggleWalletModal = useWalletModalToggle()

  const [activeTab, setActiveTab] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)

  const oracleBalance = useTokenBalance(account ?? undefined, NEXUS)

  const [input, setInput] = useState<string>('')
  const [usingBalance, setUsingBalance] = useState(false)

  const balance = activeTab === 0 ? sushiBalance : xSushiBalance

  const formattedBalance = balance?.toSignificant(4)

  const parsedAmount = usingBalance ? balance : tryParseAmount(input, balance?.currency)

  const [approvalState, approve] = useApproveCallback(parsedAmount, BAR_ADDRESS[ChainId.XRPL])

  const handleInput = (v: string) => {
    if (v.length <= INPUT_CHAR_LIMIT) {
      setUsingBalance(false)
      setInput(v)
    }
  }

  const handleClickMax = () => {
    // @ts-ignore TYPE NEEDS FIXING
    setInput(parsedAmount ? parsedAmount.toSignificant(balance.currency.decimals).substring(0, INPUT_CHAR_LIMIT) : '')
    setUsingBalance(true)
  }

  // @ts-ignore TYPE NEEDS FIXING
  const insufficientFunds = (balance && balance.equalTo(ZERO)) || parsedAmount?.greaterThan(balance)

  const inputError = insufficientFunds

  const [pendingTx, setPendingTx] = useState(false)

  const buttonDisabled = !input || pendingTx || (parsedAmount && parsedAmount.equalTo(ZERO))

  const lpConvertClick = async () => {
    if (!walletConnected) {
      toggleWalletModal()
    } else {
      setPendingTx(true)

      const success = await sendTx(() => convert())
      if (!success) {
        setPendingTx(false)
        return
      }

      setPendingTx(false)
    }
  }

  const handleClickButton = async () => {
    if (buttonDisabled) return

    if (!walletConnected) {
      toggleWalletModal()
    } else {
      setPendingTx(true)

      if (activeTab === 0) {
        if (approvalState === ApprovalState.NOT_APPROVED) {
          const success = await sendTx(() => approve())
          if (!success) {
            setPendingTx(false)
            // setModalOpen(true)
            return
          }
        }
        const success = await sendTx(() => enter(parsedAmount))
        if (!success) {
          setPendingTx(false)
          // setModalOpen(true)
          return
        }
      } else if (activeTab === 1) {
        const success = await sendTx(() => leave(parsedAmount))
        if (!success) {
          setPendingTx(false)
          // setModalOpen(true)
          return
        }
      }

      handleInput('')
      setPendingTx(false)
    }
  }

  // const block1d = useOneDayBlock({ chainId: ChainId.ETHEREUM })

  // const exchange = useFactory({ chainId: ChainId.ETHEREUM })

  // const exchange1d = useFactory({
  //   chainId: ChainId.ETHEREUM,
  //   variables: {
  //     block: block1d,
  //   },
  //   shouldFetch: !!block1d,
  // })

  // const ethPrice = useNativePrice({ chainId: ChainId.ETHEREUM })

  // const xSushi = useTokens({
  //   chainId: ChainId.ETHEREUM,
  //   variables: { where: { id: XSUSHI.address.toLowerCase() } },
  // })?.[0]

  const [ratio, totalSupply] = useOracleBar()

  // const bar = useBar()

  // const [xSushiPrice] = [xSushi?.derivedETH * ethPrice, xSushi?.derivedETH * ethPrice * bar?.totalSupply]

  const [APY1d, setAPY1d] = useState(0)
  useEffect(() => {
    if (ratio && totalSupply) {
      const oracleRatio = ratio as number

      const oraclePrice = 0.1
      const volumeUSD = 0.1

      const xoralcleTotalSupply = parseFloat(totalSupply.toFixed())

      const apr = (((volumeUSD * 0.05) / xoralcleTotalSupply) * 365) / (oracleRatio * oraclePrice)
      setAPY1d(aprToApy(apr))
    }
  }, [ratio, totalSupply])

  // const APY1d = aprToApy(
  //   (((exchange?.volumeUSD - exchange1d?.volumeUSD) * 0.0005 * 365.25) / (bar?.totalSupply * xSushiPrice)) * 100 ?? 0
  // )

  const showUseDexWarning = useDexWarningOpen()

  const [foundry, treasury, burned, prophet, total] = useOracleDistributorCovertAmount()

  return (
    <Container id="bar-page" className="py-4 md:py-8 lg:py-12" maxWidth="full">
      <Head>
        <title key="title">NEXUS | Stake</title>
        <meta
          key="description"
          name="description"
          content="Stake NEXUS in return for xNEXUS, an interest bearing and fungible ERC20 token designed to share revenue generated by all NEXUS products."
        />
        <meta key="twitter:url" name="twitter:url" content="https://app.sushi.com/stake" />
        <meta key="twitter:title" name="twitter:title" content="STAKE NEXUS" />
        <meta
          key="twitter:description"
          name="twitter:description"
          content="Stake NEXUS in return for xNEXUS, an interest bearing and fungible ERC20 token designed to share revenue generated by all NEXUS products."
        />
        {/* <meta key="twitter:image" name="twitter:image" content="https://app.sushi.com/images/xsushi-sign.png" /> */}
        <meta key="og:title" property="og:title" content="STAKE NEXUS" />
        <meta key="og:url" property="og:url" content="https://app.sushi.com/stake" />
        {/* <meta key="og:image" property="og:image" content="https://app.sushi.com/images/xsushi-sign.png" /> */}
        <meta
          key="og:description"
          property="og:description"
          content="Stake NEXUS in return for xNEXUS, an interest bearing and fungible ERC20 token designed to share revenue generated by all NEXUS products."
        />
      </Head>
      <div className="flex flex-col w-full min-h-full">
        <div
          className={classNames(
            'flex flex-col justify-center items-center md:flex-row  mb-6',
            showUseDexWarning && 'mt-5'
          )}
        >
          <div className="flex flex-col w-full max-w-xl mt-auto mb-2">
            <div className="flex max-w-lg">
              <div className="self-end mb-3 text-lg font-bold md:text-2xl text-high-emphesis md:mb-7">
                {i18n._(t`Maximize yield by staking NEXUS for xNEXUS`)}
              </div>
              {/* <div className="self-start pl-6 pr-3 mb-1 min-w-max md:hidden">
                                <img src={XSushiSignSmall} alt="xsushi sign" />
                            </div> */}
            </div>
            <div className="max-w-lg pr-3 mb-2 text-sm leading-5 text-gray-500 md:text-base md:mb-4 md:pr-0">
              {i18n._(
                t`For every swap on the exchange, 0.035% of the swap fees are distributed as NEXUS proportional to your share of the Nexus Reactor. When your NEXUS is staked into the Nexus Reactor, you receive xNEXUS. Your xNEXUS is continuously compounding, when you unstake you will receive all the originally deposited NEXUS and any additional from fees`
              )}
            </div>
            {/* <div className="flex">
                            <div className="mr-14 md:mr-9">
                                <StyledLink className="text-sm text-lg whitespace-nowrap md:text-lg md:leading-5">
                                    Enter the Kitchen
                                </StyledLink>
                            </div>
                            <div>
                                <StyledLink className="text-sm text-lg whitespace-nowrap md:text-lg md:leading-5">
                                    Tips for using xNEXUS
                                </StyledLink>
                            </div>
                        </div> */}
          </div>
          <div className="w-full h-full max-w-xl md:ml-6 md:block md:w-72">
            <div className="flex flex-col flex-grow w-full px-4 pt-4 pb-3 rounded bg-dark-900 md:px-5 md:pt-5 md:pb-7">
              <div className="flex flex-col flex-wrap">
                {/* <img src={xNEXUSFImage.src} alt="xNEXUS sign" width="100%" height="100%" /> */}
                <div className="flex flex-row mb-3">
                  <p className="text-lg font-bold md:text-2xl md:font-medium text-high-emphesis">
                    {i18n._(t`NEXUS Diffuser`)}
                  </p>

                  <QuestionHelper
                    className="!bg-dark-800 !shadow-xl p-2"
                    text={`BE AWARE OF GAS SPENDING WHEN CALLING THE DIST/BURN! The Nexus Diffuser receives DEX swap fees from the feeToo address of the NexusFactory Contract. The fees are in the form of OLP Tokens. NEXUS Token holders can publicly call the Distribute function to convert the OLP Tokens to NEXUS and distribute them. 70% of the NEXUS is sent to the Nexus Reactor/Stakers, 10% is sent to the treasury, 10% is sent to Prophet Sacrifice, and 10% is sent to the dead address.`}
                  />
                </div>

                <div className="flex flex-col flex-grow text-base md:mb-3">
                  <p>
                    <span>&#128512;</span> LPTs Available:{' '}
                    <span className={classNames(enabled ? 'text-green' : 'text-red')}>{enabled ? 'Yes' : 'No'}</span>
                  </p>
                  <p>
                    <span>&#9883;; </span> NXS To Reactor: <span>{foundry?.toSignificant(6)}</span>
                    {/* &#127835; */}
                  </p>
                  <p>
                    <span>&#128293;</span> NXS Burned: <span>{burned?.toSignificant(6)}</span>
                  </p>
                  {/* <p>
                    <span>&#128293;</span> NXS To Sacrifice: <span>{prophet?.toSignificant(6)}</span>
                  </p> */}
                  <p>
                    <span>&#127974;</span> NXS To Treasury: <span>{treasury?.toSignificant(6)}</span>
                  </p>

                  {oracleBalance?.equalTo(ZERO) && (
                    <div className="mt-2 text-base text-red">{`Your oracle balance is zero, so you cannot dist/burn olp`}</div>
                  )}

                  <div className="flex justify-center mt-4">
                    <Button
                      color={'gradient'}
                      size={'sm'}
                      variant={'filled'}
                      disabled={pendingTx || !account || !enabled || oracleBalance?.equalTo(ZERO)}
                      onClick={lpConvertClick}
                      className="inline-flex items-center px-8 font-bold text-white rounded-full cursor-pointer bg-gradient-to-r from-yellow to-red"
                    >
                      {`DIST/BURN`}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-center md:flex-row">
          <div className="flex flex-col w-full max-w-xl mx-auto mb-4 md:m-0">
            <div className="mb-4">
              <div className="flex items-center justify-between w-full h-24 max-w-xl p-4 rounded md:pl-5 md:pr-7 bg-blue-100 bg-opacity-40">
                <div className="flex flex-col">
                  <div className="flex items-center justify-center mb-4 flex-nowrap md:mb-2">
                    <p className="text-sm font-bold whitespace-nowrap md:text-lg md:leading-5 text-high-emphesis">
                      {i18n._(t`Staking APR`)}{' '}
                    </p>
                    {/* <img className="ml-3 cursor-pointer" src={MoreInfoSymbol} alt={'more info'} /> */}
                  </div>
                  {/* <div className="flex">
                    <a
                      href={`https://analytics.sushi.com/bar`}
                      target="_blank"
                      rel="noreferrer noopener"
                      className={`
                        py-1 px-4 md:py-1.5 md:px-7 rounded
                        text-xs md:text-sm font-medium md:font-bold text-dark-900
                        bg-yellow hover:bg-opacity-90`}
                    >
                      {i18n._(t`View Stats`)}
                    </a>
                  </div> */}
                </div>
                <div className="flex flex-col">
                  <p className="mb-1 text-lg font-bold text-right text-high-emphesis md:text-3xl">
                    {`${APY1d ? APY1d.toFixed(2) + '%' : i18n._(t`Loading...`)}`}
                  </p>
                  <p className="w-32 text-sm text-right text-primary md:w-64 md:text-base">
                    {i18n._(t`Yesterday's APR`)}
                  </p>
                </div>
              </div>
            </div>
            <div>
              <TransactionFailedModal isOpen={modalOpen} onDismiss={() => setModalOpen(false)} />
              <div className="w-full max-w-xl px-3 pt-2 pb-6 rounded bg-dark-900 md:pb-9 md:pt-4 md:px-8">
                <div className="flex w-full rounded h-14 bg-dark-800">
                  <div
                    className="h-full w-6/12 p-0.5"
                    onClick={() => {
                      setActiveTab(0)
                      handleInput('')
                    }}
                  >
                    <div className={activeTab === 0 ? activeTabStyle : inactiveTabStyle}>
                      <p>{i18n._(t`Stake NEXUS`)}</p>
                    </div>
                  </div>
                  <div
                    className="h-full w-6/12 p-0.5"
                    onClick={() => {
                      setActiveTab(1)
                      handleInput('')
                    }}
                  >
                    <div className={activeTab === 1 ? activeTabStyle : inactiveTabStyle}>
                      <p>{i18n._(t`Unstake`)}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between w-full mt-6">
                  <p className="font-bold text-large md:text-2xl text-high-emphesis">
                    {activeTab === 0 ? i18n._(t`Stake NEXUS`) : i18n._(t`Unstake`)}
                  </p>
                  <div className="border-gradient-r-pink-red-light-brown-dark-pink-red border-transparent border-solid border rounded-3xl px-4 md:px-3.5 py-1.5 md:py-0.5 text-high-emphesis text-xs font-medium md:text-base md:font-normal">
                    {`1 xNEXUS = ${Number(ratio)?.toFixed(4)} NEXUS`}
                  </div>
                </div>

                <Input.Numeric
                  value={input}
                  onUserInput={handleInput}
                  className={classNames(
                    'w-full h-14 px-3 md:px-5 mt-5 rounded bg-dark-800 text-sm md:text-lg font-bold text-dark-800 whitespace-nowrap caret-high-emphesis',
                    inputError ? ' pl-9 md:pl-12' : ''
                  )}
                  placeholder=" "
                />

                {/* input overlay: */}
                <div className="relative w-full h-0 pointer-events-none bottom-14">
                  <div
                    className={`flex justify-between items-center h-14 rounded px-3 md:px-5 ${
                      inputError ? ' border border-red' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      {inputError && <ExclamationIcon color="red" width={20} />}
                      <p
                        className={`text-sm md:text-lg font-bold whitespace-nowrap ${
                          input ? 'text-high-emphesis' : 'text-secondary'
                        }`}
                      >
                        {`${input ? input : '0'} ${activeTab === 0 ? '' : 'x'}NEXUS`}
                      </p>
                    </div>
                    <div className="flex items-center text-sm text-secondary md:text-base">
                      <div className={input ? 'hidden md:flex md:items-center' : 'flex items-center'}>
                        <p>{i18n._(t`Balance`)}:&nbsp;</p>
                        <p className="text-base font-bold">{formattedBalance}</p>
                      </div>
                      <button
                        className="px-2 py-1 ml-3 text-xs font-bold border pointer-events-auto focus:outline-none focus:ring hover:bg-opacity-40 md:bg-blue md:bg-opacity-30 border-secondary md:border-blue rounded-2xl md:py-1 md:px-3 md:ml-4 md:text-sm md:font-normal md:text-blue"
                        onClick={handleClickMax}
                      >
                        {i18n._(t`MAX`)}
                      </button>
                    </div>
                  </div>
                </div>
                {(approvalState === ApprovalState.NOT_APPROVED || approvalState === ApprovalState.PENDING) &&
                activeTab === 0 ? (
                  <Button
                    className={`${buttonStyle} text-high-emphesis bg-blue hover:bg-opacity-90`}
                    disabled={approvalState === ApprovalState.PENDING}
                    onClick={approve}
                  >
                    {approvalState === ApprovalState.PENDING ? (
                      <Dots>{i18n._(t`Approving`)} </Dots>
                    ) : (
                      i18n._(t`Approve`)
                    )}
                  </Button>
                ) : (
                  <button
                    className={
                      buttonDisabled
                        ? buttonStyleDisabled
                        : !walletConnected
                        ? buttonStyleConnectWallet
                        : insufficientFunds
                        ? buttonStyleInsufficientFunds
                        : buttonStyleEnabled
                    }
                    onClick={handleClickButton}
                    disabled={buttonDisabled || inputError}
                  >
                    {!walletConnected
                      ? i18n._(t`Connect Wallet`)
                      : !input
                      ? i18n._(t`Enter Amount`)
                      : insufficientFunds
                      ? i18n._(t`Insufficient Balance`)
                      : activeTab === 0
                      ? i18n._(t`Confirm Staking`)
                      : i18n._(t`Confirm Withdrawal`)}
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="w-full max-w-xl mx-auto md:mx-0 md:ml-6 md:block md:w-72">
            <div className="flex flex-col w-full px-4 pt-6 pb-5 rounded bg-dark-900 md:px-8 md:pt-7 md:pb-9">
              <div className="flex flex-wrap">
                <div className="flex flex-col flex-grow md:mb-14">
                  <p className="mb-3 text-lg font-bold md:text-2xl md:font-medium text-high-emphesis">
                    {i18n._(t`Balance`)}
                  </p>
                  <div className="flex items-center space-x-4">
                    <img
                      src={xNEXUSImage.src}
                      className="max-w-10 md:max-w-16 -ml-1 mr-1 md:mr-2 -mb-1.5 rounded"
                      alt="xNEXUS"
                      width={64}
                      height={64}
                    />
                    {/* <Image
                      className="max-w-10 md:max-w-16 -ml-1 mr-1 md:mr-2 -mb-1.5 rounded"
                      src="https://app.sushi.com/images/tokens/xsushi-square.jpg"
                      alt="xNEXUS"
                      width={64}
                      height={64}
                    /> */}
                    <div className="flex flex-col justify-center">
                      <p className="text-sm font-bold md:text-lg text-high-emphesis">
                        {xSushiBalance ? xSushiBalance.toSignificant(4) : '-'}
                      </p>
                      <p className="text-sm md:text-base text-primary">xNEXUS</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col flex-grow">
                  <div className="flex mb-3 ml-8 flex-nowrap md:ml-0">
                    <p className="text-lg font-bold md:text-2xl md:font-medium text-high-emphesis">
                      {i18n._(t`Unstaked`)}
                    </p>
                    {/* <img className="w-4 ml-2 cursor-pointer" src={MoreInfoSymbol} alt={'more info'} /> */}
                  </div>
                  <div className="flex items-center ml-8 space-x-4 md:ml-0">
                    <img
                      src={NEXUSImage.src}
                      className="max-w-10 md:max-w-16 -ml-1 mr-1 md:mr-2 -mb-1.5 rounded"
                      alt="NEXUS"
                      width={64}
                      height={64}
                    />
                    {/* <Image
                      className="max-w-10 md:max-w-16 -ml-1 mr-1 md:mr-2 -mb-1.5 rounded"
                      src="https://app.sushi.com/images/tokens/sushi-square.jpg"
                      alt="NEXUS"
                      width={64}
                      height={64}
                    /> */}
                    <div className="flex flex-col justify-center">
                      <p className="text-sm font-bold md:text-lg text-high-emphesis">
                        {sushiBalance ? sushiBalance.toSignificant(4) : '-'}
                      </p>
                      <p className="text-sm md:text-base text-primary">NEXUS</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col w-full mb-4 mt-7 md:mb-0">
                  {/* <div className="flex items-center justify-between">
                        <div className="flex items-center flex-1 flex-nowrap">
                            <p className="text-base font-bold md:text-lg text-high-emphesis">Weighted APR</p>
                            <img className="w-4 ml-2 cursor-pointer" src={MoreInfoSymbol} alt={'more info'} />
                        </div>
                        <div className="flex flex-1 md:flex-initial">
                            <p className="ml-5 text-base text-primary md:ml-0">{`${weightedApr}%`}</p>
                        </div>
                    </div> */}
                  {/* {account && (
                    <a
                      href={`https://analytics.sushi.com/users/${account}`}
                      target="_blank"
                      rel="noreferrer noopener"
                      className={`
                                flex flex-grow justify-center items-center
                                h-14 mt-6 rounded
                                bg-dark-700 text-high-emphesis
                                focus:outline-none focus:ring hover:bg-opacity-80
                                text-sm font-bold cursor-pointer
                            `}
                    >
                      {i18n._(t`Your OracleBar Stats`)}
                    </a>
                  )} */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  )
}
Stake.Guard = NetworkGuard(Feature.VESTING)
export default Stake

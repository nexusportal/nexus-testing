import { GlobeIcon, SwitchVerticalIcon, CollectionIcon,  CurrencyDollarIcon } from '@heroicons/react/outline'

import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { SUSHI_ADDRESS } from '@sushiswap/core-sdk'
import { PoolIcon } from 'app/components/Icon'
import { Feature } from 'app/enums'
import { featureEnabled } from 'app/functions'
import { useActiveWeb3React } from 'app/services/web3'
import { ReactNode, useMemo } from 'react'

export interface MenuItemLeaf {
  key: string
  title: string
  link: string
  icon?: ReactNode
  external?: boolean
}

export interface MenuItemNode {
  key: string
  title: string
  items: MenuItemLeaf[]
  icon?: ReactNode
}

export type MenuItem = MenuItemLeaf | MenuItemNode
export type Menu = MenuItem[]

type UseMenu = () => Menu
const useMenu: UseMenu = () => {
  const { i18n } = useLingui()
  const { chainId } = useActiveWeb3React()

  return useMemo(() => {
    if (!chainId) return []

    // By default show just a swap button
    let tradeMenu: MenuItem = {
      key: 'swap',
      title: i18n._(t`Swap`),
      link: '/swap',
      icon: <SwitchVerticalIcon width={20} />,
    }

    // If limit orders is enabled, replace swap button with a submenu under trade
    // if (featureEnabled(Feature.LIMIT_ORDERS, chainId)) {
    //   tradeMenu = {
    //     key: 'trade',
    //     title: i18n._(t`Trade`),
    //     icon: <SwitchVerticalIcon width={20} />,
    //     items: [
    //       {
    //         key: 'swap',
    //         title: i18n._(t`Swap`),
    //         link: '/swap',
    //       },
    //       {
    //         key: 'limit',
    //         title: i18n._(t`Limit order`),
    //         link: '/limit-order',
    //       },
    //     ],
    //   }
    // }

    const poolMenu = [
      {
        key: 'browse',
        title: i18n._(t`Browse`),
        link: '/pool',
      },
      {
        key: 'add-liquidity',
        title: i18n._(t`Add`),
        link: `/add/ETH/${SUSHI_ADDRESS[chainId]}`,
      },
      // {
      //   key: 'remove-liquidity',
      //   title: i18n._(t`Remove`),
      //   link: '/remove',
      // },
      {
        key: 'import',
        title: i18n._(t`Import`),
        link: '/find',
      },
    ]

    // if (featureEnabled(Feature.MIGRATE, chainId)) {
    //   poolMenu.push({
    //     key: 'migrate',
    //     title: i18n._(t`Migrate`),
    //     link: '/migrate',
    //   })
    // }

    const mainItems: Menu = [tradeMenu]

    let stakeMenu: MenuItem = {
      key: 'stake',
      title: i18n._(t`Stake`),
      link: '/stake',
      icon: <GlobeIcon width={20} />,
    }

    let earnMenu: MenuItem = {
      key: 'earn',
      title: i18n._(t`💲Earn`),
      link: 'https://earn.oracleswap.io/',
      external: true,
      icon: <CurrencyDollarIcon width={20} />,
    }

    let nftMenu: MenuItem = {
      key: 'nft',
      title: i18n._(t`NFT`),
      link: 'https://comingsoon.oracleswap.io/',
      external: true,
      icon: <CollectionIcon width={20} />,
    }


    const exploreMenu: MenuItemLeaf[] = []
    // if (featureEnabled(Feature.VESTING, chainId)) {
    //   mainItems.push(stakeMenu)
    //   // exploreMenu.push({
    //   //   key: 'stake',
    //   //   title: i18n._(t`xORACLE`),
    //   //   link: '/stake',
    //   // })
    // }

    // if (featureEnabled(Feature.MEOWSHI, chainId)) {
    //   exploreMenu.push({
    //     key: 'meowshi',
    //     title: i18n._(t`Meowshi`),
    //     link: '/tools/meowshi',
    //   })
    // }

    // if (featureEnabled(Feature.MEOWSHI, chainId)) {
    //   exploreMenu.push({
    //     key: 'yield',
    //     title: i18n._(t`Yield Strategies`),
    //     link: '/tools/inari',
    //   })
    // }

    if (poolMenu.length > 0)
      mainItems.push({
        key: 'pool',
        title: i18n._(t`Pool`),
        items: poolMenu,
        icon: <PoolIcon width={20} />,
      })

    if (featureEnabled(Feature.VESTING, chainId)) {
      mainItems.push(stakeMenu)
    }

    if (exploreMenu.length > 0)
      mainItems.push({
        key: 'explore',
        title: i18n._(t`Explore`),
        items: exploreMenu,
        icon: <GlobeIcon width={20} />,
      })

    if (featureEnabled(Feature.LIQUIDITY_MINING, chainId)) {
      const farmItems = {
        key: 'farm',
        title: i18n._(t`Farm`),
        icon: <SwitchVerticalIcon width={20} className="rotate-90 filter" />,
        items: [
          {
            key: 'your-farms',
            title: i18n._(t`Your Farms`),
            link: '/farm?filter=portfolio',
          },
          {
            key: 'all-farms',
            title: i18n._(t`All Farms`),
            link: '/farm',
          },
        ],
      }
      mainItems.push(farmItems)
    }

    mainItems.push(nftMenu)
    mainItems.push(earnMenu)
    // if (featureEnabled(Feature.KASHI, chainId)) {
    //   mainItems.push({
    //     key: 'lending',
    //     title: i18n._(t`Lending`),
    //     icon: <SwitchVerticalIcon width={20} className="rotate-90 filter" />,
    //     items: [
    //       {
    //         key: 'lend',
    //         title: i18n._(t`Lend`),
    //         link: '/lend',
    //       },
    //       {
    //         key: 'borrow',
    //         title: i18n._(t`Borrow`),
    //         link: '/borrow',
    //       },
    //     ],
    //   })
    // }

    // if (featureEnabled(Feature.MISO, chainId)) {
    //   mainItems.push({
    //     key: 'launchpad',
    //     title: i18n._(t`Launchpad`),
    //     icon: <RocketIcon width={20} />,
    //     items: [
    //       {
    //         key: 'marketplace',
    //         title: i18n._(t`Marketplace`),
    //         link: '/miso',
    //       },
    //       {
    //         key: 'launch',
    //         title: i18n._(t`Launch`),
    //         link: '/miso/auction',
    //       },
    //     ],
    //   })
    // }

    // let analyticsMenu: MenuItem = {
    //   key: 'analytics',
    //   title: i18n._(t`Analytics`),
    //   icon: <TrendingUpIcon width={20} />,
    //   items: [
    //     {
    //       key: 'dashboard',
    //       title: 'Dashboard',
    //       link: '/analytics/dashboard',
    //     },
    //     {
    //       key: 'xsushi',
    //       title: 'xSUSHI',
    //       link: '/analytics/xsushi',
    //     },
    //     {
    //       key: 'tokens',
    //       title: 'Tokens',
    //       link: '/analytics/tokens',
    //     },
    //     {
    //       key: 'pairs',
    //       title: 'Pairs',
    //       link: '/analytics/pairs',
    //     },
    //   ],
    // }

    // if (featureEnabled(Feature.BENTOBOX, chainId)) {
    //   analyticsMenu.items.push({
    //     key: 'bentobox',
    //     title: 'Bentobox',
    //     link: '/analytics/bentobox',
    //   })
    // }

    // if (featureEnabled(Feature.ANALYTICS, chainId)) {
    //   mainItems.push(analyticsMenu)
    // }

    // mainItems.push({
    //   key: 'balances',
    //   title: i18n._(t`Portfolio`),
    //   link: '/portfolio',
    //   icon: <WalletIcon width={20} />,
    // })

    return mainItems.filter((el) => Object.keys(el).length > 0)
  }, [chainId, i18n])
}

export default useMenu
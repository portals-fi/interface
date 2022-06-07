import { Currency, CurrencyAmount, TradeType } from '@uniswap/sdk-core'
import usePortalTrade from 'lib/hooks/portals/usePortalTrade'
import { useMemo } from 'react'
import { InterfaceTrade, TradeState } from 'state/routing/types'

// import { useClientSideV3Trade } from './useClientSideV3Trade'
import useDebounce from './useDebounce'
import useIsWindowVisible from './useIsWindowVisible'

/**
 * Returns the best v2+v3 trade for a desired swap.
 * @param tradeType whether the swap is an exact in/out
 * @param amountSpecified the exact amount to swap in/out
 * @param otherCurrency the desired output/payment currency
 */
export function useBestTrade(
  tradeType: TradeType,
  amountSpecified?: CurrencyAmount<Currency>,
  otherCurrency?: Currency
): {
  state: TradeState
  trade: InterfaceTrade<Currency, Currency, TradeType> | undefined
} {
  const autoRouterSupported = false //useAutoRouterSupported()
  const isWindowVisible = useIsWindowVisible()

  const [debouncedAmount, debouncedOtherCurrency] = useDebounce(
    useMemo(() => [amountSpecified, otherCurrency], [amountSpecified, otherCurrency]),
    200
  )

  const trade = usePortalTrade(tradeType, debouncedAmount, debouncedOtherCurrency)

  // only return gas estimate from api if routing api trade is used
  // return useMemo(
  //   () => ({
  //     ...(useFallback ? bestV3Trade : routingAPITrade),
  //     ...(isLoading ? { state: TradeState.LOADING } : {}),
  //   }),
  //   [bestV3Trade, isLoading, routingAPITrade, useFallback]
  // )
  return trade
}

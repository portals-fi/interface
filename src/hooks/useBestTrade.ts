import { Currency, CurrencyAmount, Percent, TradeType } from '@uniswap/sdk-core'
import usePortal from 'lib/hooks/portals/usePortal'
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
  slippagePercentage: Percent,
  amountSpecified?: CurrencyAmount<Currency>,
  otherCurrency?: Currency
): {
  state: TradeState
  trade: InterfaceTrade<Currency, Currency, TradeType> | undefined
} {
  const isWindowVisible = useIsWindowVisible()
  const [debouncedAmount, debouncedOtherCurrency] = useDebounce(
    useMemo(() => [amountSpecified, otherCurrency], [amountSpecified, otherCurrency]),
    200
  )
  const trade = usePortal(tradeType, debouncedAmount, debouncedOtherCurrency, slippagePercentage, isWindowVisible)
  return trade
}

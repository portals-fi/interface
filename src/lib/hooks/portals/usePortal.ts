import { skipToken } from '@reduxjs/toolkit/query/react'
import { Currency, CurrencyAmount, Percent, TradeType } from '@uniswap/sdk-core'
import { IMetric, MetricLoggerUnit, setGlobalMetric } from '@uniswap/smart-order-router'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { useStablecoinAmountFromFiatValue } from 'hooks/useUSDCPrice'
import usePortalArguments from 'lib/hooks/portals/usePortalArguments'
import ms from 'ms.macro'
import { useMemo } from 'react'
import ReactGA from 'react-ga4'
import { useGetPortalQuery } from 'state/portals/slice'
import { transformResponseToTrade } from 'state/portals/utils'
import { InterfaceTrade, TradeState } from 'state/routing/types'

import { usePortalApprovalState } from './usePortalApproval'

/**
 * Returns the best trade by invoking the routing api or the smart order router on the client
 * @param tradeType whether the swap is an exact in/out
 * @param amountSpecified the exact amount to swap in/out
 * @param otherCurrency the desired output/payment currency
 */
export default function usePortal<TTradeType extends TradeType>(
  tradeType: TTradeType,
  amountSpecified: CurrencyAmount<Currency> | undefined,
  otherCurrency: Currency | undefined,
  slippagePercentage: Percent,
  isWindowVisible: boolean
): {
  state: TradeState
  trade: InterfaceTrade<Currency, Currency, TTradeType> | undefined
} {
  const [currencyIn, currencyOut]: [Currency | undefined, Currency | undefined] = useMemo(
    () =>
      tradeType === TradeType.EXACT_INPUT
        ? [amountSpecified?.currency, otherCurrency]
        : [otherCurrency, amountSpecified?.currency],
    [amountSpecified, otherCurrency, tradeType]
  )
  const { isApproved, state } = usePortalApprovalState(currencyIn, currencyOut, amountSpecified)

  const { account } = useActiveWeb3React()
  const portalQueryArgs = usePortalArguments({
    tokenIn: currencyIn,
    tokenOut: currencyOut,
    amount: amountSpecified,
    validate: isApproved,
    userAddress: account,
    isWindowVisible,
    slippagePercentage,
  })

  const { isLoading, isError, data, currentData } = useGetPortalQuery(portalQueryArgs ?? skipToken, {
    pollingInterval: ms`15s`,
    refetchOnFocus: true,
  })

  // return { trade: undefined, state: TradeState.NO_ROUTE_FOUND }
  const quoteResult = data
  //   const quoteResult: GetQuoteResult | undefined = useIsValidBlock(Number(data?.blockNumber) || 0) ? data : undefined

  //   const route = useMemo(
  //     () => computeRoutes(currencyIn, currencyOut, tradeType, quoteResult),
  //     [currencyIn, currencyOut, quoteResult, tradeType]
  //   )

  //   // get USD gas cost of trade in active chains stablecoin amount
  const gasUseEstimateUSD = useStablecoinAmountFromFiatValue('0') ?? null

  const isSyncing = currentData !== data

  return useMemo(() => {
    if (!currencyIn || !currencyOut) {
      return {
        state: TradeState.INVALID,
        trade: undefined,
      }
    }

    if ((isLoading && !quoteResult) || state === TradeState.LOADING) {
      // only on first hook render
      console.log('Route loading')
      return {
        state: TradeState.LOADING,
        trade: undefined,
      }
    }

    let otherAmount = undefined
    if (quoteResult) {
      if (tradeType === TradeType.EXACT_INPUT && currencyOut) {
        otherAmount = CurrencyAmount.fromRawAmount(currencyOut, quoteResult.context.minBuyAmount)
      }

      // if (tradeType === TradeType.EXACT_OUTPUT && currencyIn) {
      //   otherAmount = CurrencyAmount.fromRawAmount(currencyIn, quoteResult.quote)
      // }
    }

    if (isError || !otherAmount || !portalQueryArgs) {
      console.warn('No route found')
      return {
        state: TradeState.NO_ROUTE_FOUND,
        trade: undefined,
      }
    }

    try {
      const trade = transformResponseToTrade(quoteResult, currencyIn, currencyOut, tradeType, gasUseEstimateUSD)
      return {
        // always return VALID regardless of isFetching status
        state: isSyncing ? TradeState.SYNCING : TradeState.VALID,
        trade,
      }
    } catch (e) {
      console.error(`Trade processing failed ${e}`)
      return { state: TradeState.INVALID, trade: undefined }
    }
  }, [
    quoteResult,
    isLoading,
    isError,
    // route,
    portalQueryArgs,
    // gasUseEstimateUSD,
    isSyncing,
    state,
    currencyIn,
    currencyOut,
    gasUseEstimateUSD,
    tradeType,
  ])
}

// only want to enable this when app hook called
class GAMetric extends IMetric {
  putDimensions() {
    return
  }

  putMetric(key: string, value: number, unit?: MetricLoggerUnit) {
    ReactGA._gaCommandSendTiming('Routing API', `${key} | ${unit}`, value, 'client')
  }
}

setGlobalMetric(new GAMetric())

import { skipToken } from '@reduxjs/toolkit/query/react'
import { Trade } from '@uniswap/router-sdk'
import { Currency, CurrencyAmount, Percent, Token, TradeType } from '@uniswap/sdk-core'
import { Trade as V2Trade } from '@uniswap/v2-sdk'
import { Trade as V3Trade } from '@uniswap/v3-sdk'
import { SWAP_ROUTER_ADDRESSES, V2_ROUTER_ADDRESS, V3_ROUTER_ADDRESS } from 'constants/addresses'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import ms from 'ms.macro'
import { useMemo } from 'react'
import { useGetApprovalQuery } from 'state/portals/slice'
import { TradeState } from 'state/routing/types'

import { useApproval } from '../useApproval'
import useApprovalArguments from './useApprovalArguments'
export { ApprovalState } from '../useApproval'

export function usePortalApprovalState(
  currencyIn?: Currency,
  currencyOut?: Currency,
  amountSpecified?: CurrencyAmount<Currency>
): { isApproved: boolean; state: TradeState; spender?: string } {
  const { account } = useActiveWeb3React()
  const approvalQueryArgs = useApprovalArguments({
    tokenIn: currencyIn,
    tokenOut: currencyOut,
    amount: amountSpecified,
    userAddress: account,
  })

  const { isLoading, isError, data, currentData } = useGetApprovalQuery(approvalQueryArgs ?? skipToken, {
    pollingInterval: ms`15s`,
    refetchOnFocus: true,
  })
  const isSyncing = currentData !== data
  return useMemo(() => {
    if ((isLoading && !data) || isSyncing) {
      return { isApproved: true, state: TradeState.LOADING }
    } else if (currencyIn?.isNative) {
      return { isApproved: true, state: TradeState.VALID }
    } else if (isError || !currentData) {
      return { isApproved: false, state: TradeState.INVALID }
    } else {
      return {
        isApproved: !currentData.context.shouldApprove,
        state: TradeState.VALID,
        spender: currentData.context.target,
      }
    }
  }, [isLoading, isError, data, currentData, isSyncing, currencyIn])
}

export function useSwapRouterAddress(
  trade:
    | V2Trade<Currency, Currency, TradeType>
    | V3Trade<Currency, Currency, TradeType>
    | Trade<Currency, Currency, TradeType>
    | undefined
) {
  const { chainId } = useActiveWeb3React()
  return useMemo(
    () =>
      chainId
        ? trade instanceof V2Trade
          ? V2_ROUTER_ADDRESS[chainId]
          : trade instanceof V3Trade
          ? V3_ROUTER_ADDRESS[chainId]
          : SWAP_ROUTER_ADDRESSES[chainId]
        : undefined,
    [chainId, trade]
  )
}

// wraps useApproveCallback in the context of a swap
export default function usePortalApproval(
  trade:
    | V2Trade<Currency, Currency, TradeType>
    | V3Trade<Currency, Currency, TradeType>
    | Trade<Currency, Currency, TradeType>
    | undefined,
  allowedSlippage: Percent,
  useIsPendingApproval: (token?: Token, spender?: string) => boolean
) {
  const amountToApprove = useMemo(() => trade && trade.maximumAmountIn(allowedSlippage), [trade, allowedSlippage])
  const [currencyIn, currencyOut, amount]: [
    Currency | undefined,
    Currency | undefined,
    CurrencyAmount<Currency> | undefined
  ] = useMemo(() => [trade?.inputAmount.currency, trade?.outputAmount.currency, trade?.inputAmount], [trade])
  const { spender } = usePortalApprovalState(currencyIn, currencyOut, amount)
  const approval = useApproval(amountToApprove, spender, useIsPendingApproval)
  return approval
}

export function usePortalApprovalOptimizedTrade(
  trade: Trade<Currency, Currency, TradeType> | undefined,
  allowedSlippage: Percent,
  useIsPendingApproval: (token?: Token, spender?: string) => boolean
):
  | V2Trade<Currency, Currency, TradeType>
  | V3Trade<Currency, Currency, TradeType>
  | Trade<Currency, Currency, TradeType>
  | undefined {
  return trade
}

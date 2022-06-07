import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { ADDRESS_ZERO } from '@uniswap/v3-sdk'
import { useMemo } from 'react'

/**
 * Returns query arguments for the Routing API query or undefined if the
 * query should be skipped. Input arguments do not need to be memoized, as they will
 * be destructured.
 */
export default function useApprovalArguments({
  tokenIn,
  tokenOut,
  amount,
  userAddress,
}: {
  tokenIn: Currency | undefined
  tokenOut: Currency | undefined
  amount: CurrencyAmount<Currency> | undefined
  userAddress: string | undefined | null
}) {
  return useMemo(
    () =>
      !tokenIn || !tokenOut || !amount || tokenIn.equals(tokenOut) || !userAddress || tokenIn.isNative
        ? undefined
        : {
            amount: amount.quotient.toString(),
            tokenInAddress: tokenIn.isNative ? ADDRESS_ZERO : tokenIn.wrapped.address,
            tokenInChainId: tokenIn.chainId,
            tokenOutAddress: tokenOut.isNative ? ADDRESS_ZERO : tokenOut.wrapped.address,
            tokenOutChainId: tokenOut.chainId,
            takerAddress: userAddress,
          },
    [amount, tokenIn, tokenOut, userAddress]
  )
}

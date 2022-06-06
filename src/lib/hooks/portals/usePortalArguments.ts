import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { ADDRESS_ZERO } from '@uniswap/v3-sdk'
import { useMemo } from 'react'

/**
 * Returns query arguments for the Routing API query or undefined if the
 * query should be skipped. Input arguments do not need to be memoized, as they will
 * be destructured.
 */
export default function ({
  tokenIn,
  tokenOut,
  amount,
}: {
  tokenIn: Currency | undefined
  tokenOut: Currency | undefined
  amount: CurrencyAmount<Currency> | undefined
}) {
  return useMemo(
    () =>
      !tokenIn || !tokenOut || !amount || tokenIn.equals(tokenOut)
        ? undefined
        : {
            amount: amount.quotient.toString(),
            tokenInAddress: tokenIn.isNative ? ADDRESS_ZERO : tokenIn.wrapped.address,
            tokenInChainId: tokenIn.chainId,
            tokenInDecimals: tokenIn.decimals,
            tokenInSymbol: tokenIn.symbol,
            tokenOutAddress: tokenOut.isNative ? ADDRESS_ZERO : tokenOut.wrapped.address,
            tokenOutChainId: tokenOut.chainId,
            tokenOutDecimals: tokenOut.decimals,
            tokenOutSymbol: tokenOut.symbol,
            takerAddress: ADDRESS_ZERO,
            slippagePercentage: '0.005',
            validate: false,
            partner: ADDRESS_ZERO,
          },
    [amount, tokenIn, tokenOut]
  )
}

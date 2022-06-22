import { ChainId } from '@uniswap/smart-order-router'
import { useMemo } from 'react'

/**
 * Returns query arguments for the Routing API query or undefined if the
 * query should be skipped. Input arguments do not need to be memoized, as they will
 * be destructured.
 */
export default function useAccountArguments({
  userAddress,
  chainId,
}: {
  userAddress: string | undefined | null
  chainId: ChainId | undefined | null
}) {
  return useMemo(
    () =>
      !userAddress || !chainId
        ? undefined
        : {
            ownerAddress: userAddress,
            chainId,
          },
    [chainId, userAddress]
  )
}

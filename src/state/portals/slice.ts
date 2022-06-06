import { createApi, fetchBaseQuery, FetchBaseQueryError } from '@reduxjs/toolkit/query/react'
import { ChainId } from '@uniswap/smart-order-router'
import ms from 'ms.macro'
import qs from 'qs'

import { CHAIN_LOOKUP, PortalResponse } from './types'

export const portalsApi = createApi({
  reducerPath: 'portalsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://api.portals.fi/v1/',
  }),
  endpoints: (build) => ({
    getPortal: build.query<
      PortalResponse,
      {
        tokenInAddress: string
        tokenInChainId: ChainId
        tokenInDecimals: number
        tokenInSymbol?: string
        tokenOutAddress: string
        tokenOutChainId: ChainId
        tokenOutDecimals: number
        tokenOutSymbol?: string
        amount: string
        takerAddress: string
        slippagePercentage: string
        validate: boolean
        partner: string
      }
    >({
      async queryFn(args, _api, _extraOptions, fetch) {
        const {
          tokenInAddress,
          tokenInChainId,
          tokenOutAddress,
          tokenOutChainId,
          amount,
          takerAddress,
          partner,
          validate,
          slippagePercentage,
        } = args

        let result
        try {
          const query = qs.stringify({
            sellToken: tokenInAddress,
            sellTokenNetwork: tokenInChainId,
            buyToken: tokenOutAddress,
            buyTokenNetwork: tokenOutChainId,
            sellAmount: amount,
            takerAddress,
            partner,
            validate,
            slippagePercentage,
          })
          console.log(query)
          result = await fetch({
            url: `portal/${CHAIN_LOOKUP[tokenInChainId]}?${query}`,
            method: 'GET',
            headers: {
              'Content-Type': 'application/json', // Your headers
            },
          })
          return { data: result.data as PortalResponse }
        } catch (e) {
          // TODO: fall back to client-side quoter when auto router fails.
          // deprecate 'legacy' v2/v3 routers first.
          return { error: e as FetchBaseQueryError }
        }
      },
      keepUnusedDataFor: ms`10s`,
      extraOptions: {
        maxRetries: 0,
      },
    }),
  }),
})

export const { useGetPortalQuery } = portalsApi

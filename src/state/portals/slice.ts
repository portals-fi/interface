import { createApi, fetchBaseQuery, FetchBaseQueryError } from '@reduxjs/toolkit/query/react'
import { ChainId } from '@uniswap/smart-order-router'
import { getAddress } from 'ethers/lib/utils'
import ms from 'ms.macro'
import qs from 'qs'

import {
  AccountQueryResponse,
  AccountResponse,
  ApprovalResponse,
  CHAIN_LOOKUP,
  PortalResponse,
  PriceResponse,
} from './types'

type PortalArgs = {
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

type ApprovalArgs = {
  tokenInAddress: string
  tokenInChainId: ChainId
  tokenOutAddress: string
  tokenOutChainId: ChainId
  amount: string
  takerAddress: string
}

type PriceArgs = {
  tokenAddress: string
  tokenChainId: ChainId
}

type AccountArgs = {
  ownerAddress: string
  chainId: ChainId
}

export const portalsApi = createApi({
  reducerPath: 'portalsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://api.portals.fi/v1/',
  }),
  endpoints: (build) => ({
    getPortal: build.query<PortalResponse, PortalArgs>({
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
          console.log('Fetching portal data from Portals API')
          result = await fetch({
            url: `portal/${CHAIN_LOOKUP[tokenInChainId]}?${query}`,
            method: 'GET',
            headers: {
              'Content-Type': 'application/json', // Your headers
            },
          })
          return { data: result.data as PortalResponse }
        } catch (e) {
          return { error: e as FetchBaseQueryError }
        }
      },
      keepUnusedDataFor: ms`10s`,
      extraOptions: {
        maxRetries: 0,
      },
    }),
    getApproval: build.query<ApprovalResponse, ApprovalArgs>({
      async queryFn(args, _api, _extraOptions, fetch) {
        const { tokenInAddress, tokenInChainId, tokenOutAddress, tokenOutChainId, amount, takerAddress } = args

        let result
        try {
          const query = qs.stringify({
            sellToken: tokenInAddress,
            sellTokenNetwork: tokenInChainId,
            buyToken: tokenOutAddress,
            buyTokenNetwork: tokenOutChainId,
            sellAmount: amount,
            takerAddress,
          })
          console.log('Fetching approval data from Portals API')
          result = await fetch({
            url: `approval/${CHAIN_LOOKUP[tokenInChainId]}?${query}`,
            method: 'GET',
            headers: {
              'Content-Type': 'application/json', // Your headers
            },
          })
          return { data: result.data as ApprovalResponse }
        } catch (e) {
          return { error: e as FetchBaseQueryError }
        }
      },
      keepUnusedDataFor: ms`1 minute`,
      extraOptions: {
        maxRetries: 0,
      },
    }),
    getPrice: build.query<number, PriceArgs>({
      async queryFn(args, _api, _extraOptions, fetch) {
        const { tokenAddress, tokenChainId } = args

        let result
        try {
          const query = qs.stringify({
            addresses: tokenAddress,
          })
          console.log('Fetching approval data from Portals API')
          result = await fetch({
            url: `tokens/${CHAIN_LOOKUP[tokenChainId]}?${query}`,
            method: 'GET',
            headers: {
              'Content-Type': 'application/json', // Your headers
            },
          })
          const response = result.data as PriceResponse
          return { data: response.tokens[0].price }
        } catch (e) {
          return { error: e as FetchBaseQueryError }
        }
      },
      keepUnusedDataFor: ms`1 minute`,
      extraOptions: {
        maxRetries: 0,
      },
    }),
    getBalances: build.query<AccountQueryResponse, AccountArgs>({
      async queryFn(args, _api, _extraOptions, fetch) {
        const { ownerAddress, chainId } = args

        let result
        try {
          const query = qs.stringify({
            ownerAddress,
          })
          console.log('Fetching account data from Portals API')
          result = await fetch({
            url: `account/${CHAIN_LOOKUP[chainId]}?${query}`,
            method: 'GET',
            headers: {
              'Content-Type': 'application/json', // Your headers
            },
          })
          const response = result.data as AccountResponse
          return {
            data: Object.fromEntries(
              response.balances.map((t) => [getAddress(t.addresses[CHAIN_LOOKUP[chainId]]), t.rawBalance])
            ),
          }
        } catch (e) {
          return { error: e as FetchBaseQueryError }
        }
      },
      keepUnusedDataFor: ms`1 minute`,
      extraOptions: {
        maxRetries: 0,
      },
    }),
  }),
})

export const { useGetPortalQuery, useGetApprovalQuery, useGetPriceQuery, useGetBalancesQuery } = portalsApi

// hooks/useMarkets.js
import { useEffect } from "react"
import { marketStore } from "../store/market.store"
import { fetchMarkets } from "../contracts/predictionMarkets"

export function useMarkets() {
  useEffect(() => {
    marketStore.loading = true
    fetchMarkets().then((markets) => {
      marketStore.markets = markets
      marketStore.loading = false
    })
  }, [])
}
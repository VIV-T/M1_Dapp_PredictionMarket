import { proxy } from "valtio"

export const marketStore = proxy({
  markets: [],
  loading: false,
})
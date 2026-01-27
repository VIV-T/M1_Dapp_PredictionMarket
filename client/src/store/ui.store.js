// store/ui.store.js
import { proxy } from "valtio"

export const uiStore = proxy({
  activeMarketTab: "ACTIVE",
})
import { useSnapshot } from "valtio"
import { marketStore } from "../../store/market.store"
import { uiStore } from "../../store/ui.store"
import MarketCard from "./MarketCard"

export default function MarketGrid() {
  const { markets } = useSnapshot(marketStore)
  const { activeMarketTab } = useSnapshot(uiStore)

  const filtered = markets.filter(
    (m) => m.status === activeMarketTab
  )

  if (!filtered.length) {
    return <div className="text-gray-400">No markets</div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {filtered.map((market) => (
        <MarketCard key={market.id} market={market} />
      ))}
    </div>
  )
}
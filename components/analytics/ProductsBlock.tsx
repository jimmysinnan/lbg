interface ProductEntry {
  name: string
  qty: number
}

export function ProductsBlock({ topProduits }: { topProduits: ProductEntry[] }) {
  const max = Math.max(...topProduits.map(p => p.qty), 1)

  if (topProduits.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Top produits</h3>
        <div className="text-xs text-gray-400 text-center py-4">Pas encore de données</div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Top produits</h3>
      <div className="space-y-2">
        {topProduits.map(p => (
          <div key={p.name} className="flex items-center gap-3">
            <div className="w-36 text-xs text-gray-700 truncate">{p.name}</div>
            <div className="flex-1 bg-gray-100 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${Math.round((p.qty / max) * 100)}%` }}
              />
            </div>
            <div className="text-xs font-semibold text-gray-600 w-8 text-right">{p.qty}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

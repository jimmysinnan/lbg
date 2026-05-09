import { supabase } from '@/lib/supabase'
import { currentMonth } from '@/lib/utils'
import { CatalogueClient } from './CatalogueClient'
import type { Product } from '@/types'

export const dynamic = 'force-dynamic'

async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('month_active', currentMonth())
    .order('name')

  if (error) return []
  return (data ?? []) as Product[]
}

export default async function CataloguePage() {
  const products = await getProducts()

  return (
    <div className="max-w-4xl space-y-4">
      <div>
        <h1 className="text-lg font-bold text-gray-900">Catalogue</h1>
        <p className="text-xs text-gray-400 mt-0.5">Mois actif : {currentMonth()}</p>
      </div>
      <CatalogueClient initialProducts={products} />
    </div>
  )
}

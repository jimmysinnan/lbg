export type ProductCategory = 'yolice' | 'aperitif_glace' | 'coffret_personnalise'
export type ProductFormat = 'unite' | 'coffret_8' | 'coffret_20'
export type OrderStatus = 'a_traiter' | 'validee' | 'en_preparation' | 'prete' | 'livree' | 'annulee' | 'escalade'
export type Confidence = 'high' | 'medium' | 'low'
export type Direction = 'inbound' | 'outbound'
export type LocationType = 'retrait' | 'livraison' | 'evenement'

export interface Product {
  id: string
  name: string
  flavor: string | null
  category: ProductCategory
  format: ProductFormat
  price_unit: number | null
  price_box8: number | null
  price_box20: number | null
  available: boolean
  stock_estimated: number | null
  month_active: string | null
  image_url: string | null
  created_at: string
}

export interface Location {
  id: string
  name: string
  type: LocationType
  address: string | null
  hours: string | null
  active: boolean
  created_at: string
}

export interface Event {
  id: string
  name: string
  location_id: string | null
  date: string | null
  active: boolean
  created_at: string
}

export interface Order {
  id: string
  reference: string
  customer_name: string | null
  customer_phone: string | null
  raw_message: string | null
  parsed_data: ParsedOrder | null
  status: OrderStatus
  notes: string | null
  location_id: string | null
  event_id: string | null
  pickup_date: string | null
  pickup_time: string | null
  total_amount: number | null
  wa_message_id: string | null
  escalate: boolean
  escalate_reason: string | null
  confidence: Confidence | null
  missing_fields: string[]
  created_at: string
  updated_at: string
  // relations optionnelles (joins)
  location?: Location
  order_items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  quantity: number
  unit_price: number | null
  notes: string | null
  product?: Product
}

export interface ParsedOrder {
  customer_name: string | null
  customer_phone: string | null
  items: ParsedItem[]
  location: string | null
  pickup_date: string | null
  pickup_time: string | null
  special_notes: string | null
  confidence: Confidence
  missing_fields: string[]
  question_a_poser: string | null
  escalate: boolean
  escalate_reason: string | null
  notes_agent: string | null
}

export interface ParsedItem {
  product_name: string
  flavor: string | null
  quantity: number
  format: ProductFormat
  available: boolean
}

export interface WaTemplate {
  id: string
  slug: string
  body_template: string
  trigger_status: string | null
}

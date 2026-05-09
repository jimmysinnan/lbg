import ExcelJS from 'exceljs'
import type { Order } from '@/types'

export async function generateDailyExport(orders: Order[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('Commandes du jour')

  sheet.columns = [
    { header: 'Référence', key: 'reference', width: 22 },
    { header: 'Client', key: 'client', width: 20 },
    { header: 'Téléphone', key: 'telephone', width: 16 },
    { header: 'Produits', key: 'produits', width: 35 },
    { header: 'Quantités', key: 'quantites', width: 12 },
    { header: 'Montant (€)', key: 'montant', width: 14 },
    { header: 'Lieu', key: 'lieu', width: 28 },
    { header: 'Horaire', key: 'horaire', width: 12 },
    { header: 'Statut', key: 'statut', width: 16 },
    { header: 'Note', key: 'note', width: 30 },
  ]

  // Style header
  const headerRow = sheet.getRow(1)
  headerRow.eachCell(cell => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A73E8' } }
    cell.alignment = { vertical: 'middle', horizontal: 'center' }
  })
  headerRow.height = 20

  for (const order of orders) {
    const items = order.order_items ?? []
    const produits = items.map(i => i.product?.name ?? '?').join(', ')
    const quantites = items.map(i => String(i.quantity)).join(', ')

    sheet.addRow({
      reference: order.reference,
      client: order.customer_name ?? '—',
      telephone: order.customer_phone ?? '—',
      produits,
      quantites,
      montant: order.total_amount ?? '—',
      lieu: (order.location as { name: string } | undefined)?.name ?? '—',
      horaire: order.pickup_time ?? '—',
      statut: order.status,
      note: order.notes ?? '',
    })
  }

  // Bordures sur toutes les cellules remplies
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      row.eachCell(cell => {
        cell.border = {
          top: { style: 'thin' }, left: { style: 'thin' },
          bottom: { style: 'thin' }, right: { style: 'thin' },
        }
      })
    }
  })

  const buffer = await workbook.xlsx.writeBuffer()
  return Buffer.from(buffer)
}

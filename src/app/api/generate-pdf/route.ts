import { NextRequest, NextResponse } from 'next/server'
import { jsPDF } from 'jspdf'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { month, year, userName, attendances, dailyLogs, leaves } = body

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()

    // Header
    doc.setFontSize(16)
    doc.text('LAPORAN KEHADIRAN MENTOR & PENDAMPING', pageWidth / 2, 20, { align: 'center' })
    doc.setFontSize(10)
    doc.text('Program Penumbuhan Wirausaha Muda Kota Salatiga 2026', pageWidth / 2, 27, { align: 'center' })
    doc.text('Bidang Kepemudaan, Dinas Pemuda dan Olahraga Kota Salatiga', pageWidth / 2, 33, { align: 'center' })

    // Periode
    doc.setFontSize(11)
    doc.text(`Periode: ${month} ${year}`, 14, 45)
    doc.text(`Pengguna: ${userName}`, 14, 52)
    doc.text(`Dicetak: ${new Date().toLocaleDateString('id-ID')}`, 14, 59)

    // Divider
    doc.line(14, 63, pageWidth - 14, 63)

    let y = 72

    // Stats
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Rekapitulasi', 14, y)
    y += 8
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.text(`Total Kehadiran: ${attendances?.length || 0}`, 14, y)
    y += 6
    doc.text(`Total Log Harian: ${dailyLogs?.length || 0}`, 14, y)
    y += 6
    doc.text(`Total Izin: ${leaves?.length || 0}`, 14, y)
    y += 12

    // Attendance detail
    if (attendances?.length > 0) {
      if (y > 250) { doc.addPage(); y = 20 }
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.text('A. Detail Absensi', 14, y)
      y += 8
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)

      // Table header
      const headers = ['No', 'Tanggal', 'Nama', 'Jenis', 'Waktu']
      const colWidths = [10, 35, 50, 40, 30]
      let x = 14
      headers.forEach((h, i) => {
        doc.setFont('helvetica', 'bold')
        doc.text(h, x, y)
        x += colWidths[i]
      })
      y += 5
      doc.line(14, y, 14 + colWidths.reduce((a, b) => a + b, 0), y)
      y += 3

      attendances.forEach((att: any, i: number) => {
        if (y > 270) { doc.addPage(); y = 20 }
        x = 14
        doc.setFont('helvetica', 'normal')
        doc.text(`${i + 1}`, x, y); x += colWidths[0]
        doc.text(att.date || '-', x, y); x += colWidths[1]
        doc.text(att.userName || '-', x, y); x += colWidths[2]
        const typeLabel = att.type === 'mentor' ? 'Mentor' : att.type === 'pendamping-checkin' ? 'Check-in' : 'Check-out'
        doc.text(typeLabel, x, y); x += colWidths[3]
        doc.text(att.timestamp?.slice(11, 16) || '-', x, y)
        y += 5
      })
      y += 8
    }

    // Daily logs detail
    if (dailyLogs?.length > 0) {
      if (y > 250) { doc.addPage(); y = 20 }
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.text('B. Detail Log Aktivitas Harian', 14, y)
      y += 8
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)

      const h2 = ['No', 'Tanggal', 'Nama', 'Check-in', 'Check-out', 'Entri']
      const cw2 = [10, 35, 50, 30, 30, 20]
      let x = 14
      h2.forEach((h, i) => {
        doc.setFont('helvetica', 'bold')
        doc.text(h, x, y)
        x += cw2[i]
      })
      y += 5
      doc.line(14, y, 14 + cw2.reduce((a, b) => a + b, 0), y)
      y += 3

      dailyLogs.forEach((dl: any, i: number) => {
        if (y > 270) { doc.addPage(); y = 20 }
        x = 14
        doc.setFont('helvetica', 'normal')
        doc.text(`${i + 1}`, x, y); x += cw2[0]
        doc.text(dl.date || '-', x, y); x += cw2[1]
        doc.text(dl.userName || '-', x, y); x += cw2[2]
        doc.text(dl.checkInTime || '-', x, y); x += cw2[3]
        doc.text(dl.checkOutTime || '-', x, y); x += cw2[4]
        doc.text(`${dl.entries?.length || 0}`, x, y)
        y += 5
      })
      y += 8
    }

    // Leave detail
    if (leaves?.length > 0) {
      if (y > 250) { doc.addPage(); y = 20 }
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.text('C. Detail Izin', 14, y)
      y += 8
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)

      const h3 = ['No', 'Tanggal', 'Nama', 'Jenis', 'Status']
      const cw3 = [10, 35, 50, 40, 30]
      let x = 14
      h3.forEach((h, i) => {
        doc.setFont('helvetica', 'bold')
        doc.text(h, x, y)
        x += cw3[i]
      })
      y += 5
      doc.line(14, y, 14 + cw3.reduce((a, b) => a + b, 0), y)
      y += 3

      leaves.forEach((lv: any, i: number) => {
        if (y > 270) { doc.addPage(); y = 20 }
        x = 14
        doc.setFont('helvetica', 'normal')
        doc.text(`${i + 1}`, x, y); x += cw3[0]
        doc.text(lv.date || '-', x, y); x += cw3[1]
        doc.text(lv.userName || '-', x, y); x += cw3[2]
        doc.text((lv.type || '-').replace('_', ' '), x, y); x += cw3[3]
        const statusLabel = lv.status === 'approved' ? 'Disetujui' : lv.status === 'rejected' ? 'Ditolak' : 'Menunggu'
        doc.text(statusLabel, x, y)
        y += 5
      })
    }

    // Footer
    doc.setFontSize(8)
    doc.text('Dokumen ini digenerate secara otomatis dari sistem HADIR', pageWidth / 2, 280, { align: 'center' })
    doc.text('Program Penumbuhan Wirausaha Muda Kota Salatiga 2026', pageWidth / 2, 285, { align: 'center' })

    const buffer = Buffer.from(doc.output('arraybuffer'))
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="laporan-kehadiran-${month}-${year}.pdf"`,
      },
    })
  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}

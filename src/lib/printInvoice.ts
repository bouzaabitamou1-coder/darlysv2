export const printInvoice = (booking: any) => {
  const roomName = booking.rooms?.name || "Room";
  const nights = Math.max(1, Math.ceil(
    (new Date(booking.check_out).getTime() - new Date(booking.check_in).getTime()) / 86400000
  ));

  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Invoice - Dar Lys</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Georgia', serif; color: #1a1a2e; padding: 40px; max-width: 800px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #1a1a2e; padding-bottom: 20px; margin-bottom: 30px; }
    .logo { font-size: 28px; font-weight: bold; color: #1a1a2e; }
    .logo span { display: block; font-size: 12px; font-weight: normal; letter-spacing: 3px; text-transform: uppercase; color: #666; }
    .invoice-info { text-align: right; font-size: 13px; color: #666; }
    .invoice-info strong { color: #1a1a2e; font-size: 16px; display: block; margin-bottom: 4px; }
    .section { margin-bottom: 25px; }
    .section-title { font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #999; margin-bottom: 8px; }
    .guest-info p { font-size: 14px; line-height: 1.6; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th { background: #f5f5f8; text-align: left; padding: 10px 12px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #666; border-bottom: 1px solid #ddd; }
    td { padding: 10px 12px; font-size: 14px; border-bottom: 1px solid #eee; }
    .total-row td { font-weight: bold; font-size: 16px; border-top: 2px solid #1a1a2e; border-bottom: none; }
    .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">Dar Lys<span>Riad & Spa · Fès</span></div>
    <div class="invoice-info">
      <strong>INVOICE</strong>
      #${booking.id.slice(0, 8).toUpperCase()}<br>
      ${new Date(booking.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
    </div>
  </div>

  <div class="section guest-info">
    <div class="section-title">Guest Information</div>
    <p><strong>${booking.guest_name}</strong></p>
    <p>${booking.guest_email}</p>
    ${booking.guest_phone ? `<p>${booking.guest_phone}</p>` : ''}
  </div>

  <div class="section">
    <div class="section-title">Reservation Details</div>
    <table>
      <thead><tr><th>Description</th><th>Dates</th><th>Qty</th><th style="text-align:right">Amount</th></tr></thead>
      <tbody>
        <tr>
          <td>${roomName}</td>
          <td>${booking.check_in} → ${booking.check_out}</td>
          <td>${nights} night${nights > 1 ? 's' : ''}</td>
          <td style="text-align:right">€${Number(booking.total_price).toFixed(2)}</td>
        </tr>
        ${(booking.add_ons || []).map((a: string) => `
        <tr><td colspan="3" style="color:#666">Add-on: ${a}</td><td style="text-align:right">Included</td></tr>
        `).join('')}
        <tr class="total-row">
          <td colspan="3">Total</td>
          <td style="text-align:right">€${Number(booking.total_price).toFixed(2)}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-title">Payment Status</div>
    <p style="font-size:14px">Status: <strong style="text-transform:capitalize">${booking.payment_status}</strong> · Booking: <strong style="text-transform:capitalize">${booking.status}</strong></p>
  </div>

  <div class="footer">
    <p>Dar Lys · Riad & Spa · Fès, Morocco</p>
    <p>Thank you for choosing Dar Lys. We look forward to welcoming you.</p>
  </div>
</body>
</html>`;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => printWindow.print();
  }
};

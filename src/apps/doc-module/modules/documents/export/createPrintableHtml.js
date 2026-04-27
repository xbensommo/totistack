/* export/createPrintableHtml.js*/
const PRINT_STYLES = `
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: Inter, Arial, sans-serif;
    background: #e2e8f0;
    color: #0f172a;
  }
  .print-stage {
    padding: 24px;
  }
  .print-page {
    position: relative;
    margin: 0 auto 24px;
    background: #ffffff;
    box-shadow: 0 0 0 1px rgba(15, 23, 42, 0.12);
    page-break-after: always;
    overflow: hidden;
  }
  .print-page:last-child {
    page-break-after: auto;
  }
  .page-watermark {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    font-weight: 800;
    letter-spacing: 0.38em;
    text-transform: uppercase;
    color: rgba(15, 23, 42, 0.08);
  }
  .print-header,
  .print-footer {
    position: absolute;
    color: #475569;
  }
  .print-header {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 16px;
    align-items: start;
    border-bottom: 2px solid #0f172a;
    padding-bottom: 14px;
  }
  .print-footer {
    display: grid;
    grid-template-columns: minmax(0,1fr) auto minmax(0,1fr);
    gap: 16px;
    align-items: center;
    border-top: 1px solid #cbd5e1;
    padding-top: 10px;
    font-size: 12px;
  }
  .print-body {
    position: absolute;
    overflow: hidden;
  }
  .header-brand {
    display: flex;
    align-items: flex-start;
    gap: 16px;
  }
  .logo-box {
    display: flex;
    width: 56px;
    height: 56px;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border: 1px solid #cbd5e1;
    background: #f8fafc;
  }
  .logo-box img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
  .logo-fallback {
    font-size: 18px;
    font-weight: 700;
  }
  .doc-section {
    margin-bottom: 18px;
    break-inside: avoid;
  }
  .doc-section h3 {
    margin: 0 0 10px;
    font-size: 13px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #0f766e;
  }
  .meta-grid,
  .parties-grid,
  .signature-grid {
    display: grid;
    gap: 16px;
  }
  .meta-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  .parties-grid,
  .signature-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .panel {
    border: 1px solid #cbd5e1;
    padding: 14px;
    word-break: break-word;
    overflow-wrap: anywhere;
  }
  .muted {
    color: #64748b;
  }
  .rich-text,
  .notes-text {
    border: 1px solid #cbd5e1;
    padding: 16px;
  }
  .rich-text p,
  .rich-text h1,
  .rich-text h2,
  .rich-text h3,
  .rich-text li,
  .rich-text blockquote,
  .notes-text p,
  .notes-text li {
    margin: 0 0 12px;
    line-height: 1.7;
    word-break: break-word;
    overflow-wrap: anywhere;
  }
  .rich-text ul,
  .rich-text ol,
  .notes-text ul,
  .notes-text ol {
    margin: 0 0 12px;
    padding-left: 20px;
  }
  .list-table,
  .line-table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
  }
  .list-table th,
  .list-table td,
  .line-table th,
  .line-table td {
    border: 1px solid #cbd5e1;
    padding: 10px 12px;
    vertical-align: top;
    word-break: break-word;
    overflow-wrap: anywhere;
    white-space: pre-wrap;
  }
  .line-table thead th {
    background: #0f172a;
    color: white;
    white-space: normal;
  }
  .align-right {
    text-align: right;
  }
  .totals-box {
    margin-left: auto;
    width: 320px;
    max-width: 100%;
    border: 1px solid #cbd5e1;
  }
  .totals-row {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 12px;
    padding: 10px 14px;
    border-bottom: 1px solid #cbd5e1;
  }
  .totals-row:last-child {
    border-bottom: 0;
    background: #0f766e;
    color: white;
    font-weight: 700;
  }
  .signature-image {
    max-width: 180px;
    max-height: 64px;
    margin-top: 12px;
    object-fit: contain;
  }
  @media print {
    body { background: white; }
    .print-stage { padding: 0; }
    .print-page { margin: 0; box-shadow: none; }
  }
`;

function escapeText(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function getInitials(companyName) {
  return String(companyName || 'BD')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function renderSection(section, document, formatMoney) {
  switch (section.kind) {
    case 'meta':
      return `
        <section class="doc-section">
          <h3>${escapeText(section.title)}</h3>
          <div class="meta-grid">
            <div class="panel"><div class="muted">Number</div><strong>${escapeText(section.meta.number || 'Draft')}</strong></div>
            <div class="panel"><div class="muted">Status</div><strong>${escapeText(section.meta.status || 'draft')}</strong></div>
            <div class="panel"><div class="muted">Issued On</div><strong>${escapeText(section.meta.issuedOn || '')}</strong></div>
          </div>
        </section>
      `;
    case 'parties':
      return `
        <section class="doc-section">
          <h3>${escapeText(section.title)}</h3>
          <div class="parties-grid">
            <div class="panel">
              <div class="muted">Issuer</div>
              <strong>${escapeText(section.parties.issuer.companyName)}</strong>
              <div>${escapeText(section.parties.issuer.contactName)}</div>
              <div>${escapeText(section.parties.issuer.email)}</div>
              <div>${escapeText(section.parties.issuer.phone)}</div>
              <div>${escapeText(section.parties.issuer.address)}</div>
            </div>
            <div class="panel">
              <div class="muted">Client</div>
              <strong>${escapeText(section.parties.client.companyName)}</strong>
              <div>${escapeText(section.parties.client.contactName)}</div>
              <div>${escapeText(section.parties.client.email)}</div>
              <div>${escapeText(section.parties.client.phone)}</div>
              <div>${escapeText(section.parties.client.address)}</div>
            </div>
          </div>
        </section>
      `;
    case 'summary':
    case 'rich-text':
    case 'notes':
      return `
        <section class="doc-section">
          <h3>${escapeText(section.title)}</h3>
          <div class="${section.kind === 'notes' ? 'notes-text' : 'rich-text'}">${section.html || '<p>—</p>'}</div>
        </section>
      `;
    case 'list':
      return `
        <section class="doc-section">
          <h3>${escapeText(section.title)}</h3>
          <table class="list-table">
            <thead><tr><th style="width: 28%;">Item</th><th>Details</th></tr></thead>
            <tbody>
              ${(section.items || []).map((item) => `
                <tr>
                  <td><strong>${escapeText(item.label)}</strong></td>
                  <td>${escapeText(item.value)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </section>
      `;
    case 'table':
      return `
        <section class="doc-section">
          <h3>${escapeText(section.title)}</h3>
          <table class="line-table">
            <thead>
              <tr>
                ${(section.columns || []).map((column) => `<th style="width:${column.width};" class="${column.align === 'right' ? 'align-right' : ''}">${escapeText(column.label)}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${(section.items || []).map((item) => `
                <tr>
                  <td>${escapeText(item.description)}</td>
                  <td class="align-right">${escapeText(item.quantity)}</td>
                  <td class="align-right">${escapeText(formatMoney(item.unitPrice, document.meta.currency))}</td>
                  <td class="align-right">${escapeText(formatMoney(item.total, document.meta.currency))}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </section>
      `;
    case 'totals':
      return `
        <section class="doc-section">
          <h3>${escapeText(section.title)}</h3>
          <div class="totals-box">
            <div class="totals-row"><span>Subtotal</span><span>${escapeText(formatMoney(section.finance.subtotal, document.meta.currency))}</span></div>
            <div class="totals-row"><span>Tax (${escapeText(section.finance.taxRate)}%)</span><span>${escapeText(formatMoney(section.finance.taxAmount, document.meta.currency))}</span></div>
            <div class="totals-row"><span>Total</span><span>${escapeText(formatMoney(section.finance.total, document.meta.currency))}</span></div>
          </div>
        </section>
      `;
    case 'signatures':
      return `
        <section class="doc-section">
          <h3>${escapeText(section.title)}</h3>
          <div class="signature-grid">
            <div class="panel">
              <div class="muted">Issuer</div>
              <strong>${escapeText(section.signatures.issuer.name)}</strong>
              <div>${escapeText(section.signatures.issuer.title)}</div>
              <div>${escapeText(section.signatures.issuer.signedOn)}</div>
              ${section.signatures.issuer.imageUrl || section.signatures.issuer.drawnDataUrl ? `<img src="${section.signatures.issuer.imageUrl || section.signatures.issuer.drawnDataUrl}" class="signature-image" />` : section.signatures.issuer.initials ? `<div style="margin-top:12px;font-weight:700;">${escapeText(section.signatures.issuer.initials)}</div>` : ''}
            </div>
            <div class="panel">
              <div class="muted">Client</div>
              <strong>${escapeText(section.signatures.client.name)}</strong>
              <div>${escapeText(section.signatures.client.title)}</div>
              <div>${escapeText(section.signatures.client.signedOn)}</div>
              ${section.signatures.client.imageUrl || section.signatures.client.drawnDataUrl ? `<img src="${section.signatures.client.imageUrl || section.signatures.client.drawnDataUrl}" class="signature-image" />` : section.signatures.client.initials ? `<div style="margin-top:12px;font-weight:700;">${escapeText(section.signatures.client.initials)}</div>` : ''}
            </div>
          </div>
        </section>
      `;
    default:
      return '';
  }
}

export function createPrintableHtml({ document, pagePlan, title, formatMoney }) {
  const pageWidth = pagePlan.pageSize?.width || 794;
  const pageHeight = pagePlan.pageSize?.height || 1123;
  const margins = pagePlan.margins || document.layout?.margins || { top: 40, right: 52, bottom: 40, left: 52 };
  const headerHeight = pagePlan.headerHeight ?? (document.layout?.header?.enabled ? document.layout.header.height : 0);
  const footerHeight = pagePlan.footerHeight ?? (document.layout?.footer?.enabled ? document.layout.footer.height : 0);
  const resolvedLogoUrl = document.brand.logoFileUrl || document.brand.logoUrl || '';
  const watermarkText = document.layout.watermark?.text || '';

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${escapeText(title)}</title>
        <style>${PRINT_STYLES}</style>
      </head>
      <body>
        <main class="print-stage">
          ${pagePlan.pages.map((page) => `
            <article class="print-page" style="width:${pageWidth}px;min-height:${pageHeight}px;height:${pageHeight}px;">
              ${watermarkText ? `<div class="page-watermark" style="opacity:${document.layout.watermark.opacity};transform:rotate(${document.layout.watermark.rotation}deg);font-size:${Math.max(48, Math.round(pageWidth * 0.08))}px;">${escapeText(watermarkText)}</div>` : ''}
              ${document.layout.header?.enabled ? `
                <header class="print-header" style="left:${margins.left}px;right:${margins.right}px;top:${margins.top}px;border-color:${document.brand.primaryColor};min-height:${headerHeight}px;">
                  <div class="header-brand">
                    <div class="logo-box">
                      ${resolvedLogoUrl ? `<img src="${resolvedLogoUrl}" alt="Logo" />` : `<span class="logo-fallback" style="color:${document.brand.accentColor};">${escapeText(getInitials(document.brand.companyName))}</span>`}
                    </div>
                    <div>
                      <strong style="display:block;font-size:18px;color:${document.brand.primaryColor};">${escapeText(document.brand.companyName)}</strong>
                      <div style="margin-top:6px;white-space:pre-wrap;line-height:1.6;">${escapeText(document.layout.header.leftText || document.brand.legalLine)}</div>
                    </div>
                  </div>
                  <div style="text-align:right;">
                    <div style="font-size:12px;text-transform:uppercase;letter-spacing:0.16em;color:${document.brand.accentColor};">${escapeText(document.meta.title)}</div>
                    <div style="margin-top:8px;font-size:18px;font-weight:700;">${escapeText(document.meta.number || 'Draft')}</div>
                    <div style="margin-top:6px;white-space:pre-wrap;line-height:1.6;">${escapeText(document.layout.header.rightText || document.brand.contactLine)}</div>
                  </div>
                </header>
              ` : ''}
              <div class="print-body" style="top:${margins.top + headerHeight}px;left:${margins.left}px;right:${margins.right}px;bottom:${margins.bottom + footerHeight}px;">
                ${page.sections.map((section) => renderSection(section, document, formatMoney)).join('')}
              </div>
              ${document.layout.footer?.enabled ? `
                <footer class="print-footer" style="left:${margins.left}px;right:${margins.right}px;bottom:${margins.bottom}px;min-height:${footerHeight}px;">
                  <div>${escapeText(document.layout.footer.leftText)}</div>
                  <div>${escapeText(document.layout.footer.centerText)}</div>
                  <div style="text-align:right;">
                    ${escapeText(document.layout.footer.rightText)}
                    ${document.layout.footer.showPageNumbers ? ` · Page ${page.pageNumber} of ${page.pageCount}` : ''}
                  </div>
                </footer>
              ` : ''}
            </article>
          `).join('')}
        </main>
      </body>
    </html>
  `;
}

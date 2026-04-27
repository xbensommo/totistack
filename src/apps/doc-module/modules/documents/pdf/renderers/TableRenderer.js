/** @file src/modules/documents/pdf/renderers/TableRenderer.js */

import { toRgb, drawWrappedText, measureWrappedTextHeight, normalizePdfText } from '../../utils/pdfText.js';

function parseColumnWidth(width, totalWidth) {
  const value = String(width || '').trim();

  if (value.endsWith('%')) {
    return (parseFloat(value) / 100) * totalWidth;
  }

  const numeric = Number(value);
  if (Number.isFinite(numeric) && numeric > 0) {
    return numeric;
  }

  return totalWidth;
}

export class TableRenderer {
  render({ page, section, pageBox, fonts, theme, cursorY }) {
    const x = pageBox.bodyX;
    const width = pageBox.bodyWidth;

    const borderColor = toRgb('#cbd5e1');
    const headerBg = toRgb('#0f172a');
    const headerText = toRgb('#ffffff');
    const rowAltBg = toRgb('#f8fafc');
    const textColor = toRgb('#0f172a');
    const accent = toRgb(theme.brand.accentColor, '#0f766e');

    const titleY = cursorY;
    page.drawText(String(section.title || '').toUpperCase(), {
      x,
      y: titleY - 10,
      size: 9,
      font: fonts.bold,
      color: accent,
    });

    const tableY = titleY - 26;
    const columns = Array.isArray(section.columns) && section.columns.length
      ? section.columns
      : [
          { label: 'Description', key: 'description', width: '55%' },
          { label: 'Qty', key: 'quantity', width: '15%', align: 'right' },
          { label: 'Unit Price', key: 'unitPrice', width: '15%', align: 'right' },
          { label: 'Total', key: 'total', width: '15%', align: 'right' },
        ];

    const resolvedWidths = [];
    let used = 0;

    columns.forEach((column, index) => {
      if (index === columns.length - 1) {
        resolvedWidths.push(width - used);
        return;
      }

      const colWidth = parseColumnWidth(column.width, width);
      resolvedWidths.push(colWidth);
      used += colWidth;
    });

    const headerHeight = 28;
    let columnX = x;

    columns.forEach((column, index) => {
      page.drawRectangle({
        x: columnX,
        y: tableY - headerHeight,
        width: resolvedWidths[index],
        height: headerHeight,
        color: headerBg,
        borderWidth: 1,
        borderColor,
      });

      const label = normalizePdfText(column.label || '');
      const labelWidth = fonts.bold.widthOfTextAtSize(label, 9);
      const textX = column.align === 'right'
        ? columnX + resolvedWidths[index] - 10 - labelWidth
        : columnX + 8;

      page.drawText(label, {
        x: textX,
        y: tableY - 18,
        size: 9,
        font: fonts.bold,
        color: headerText,
      });

      columnX += resolvedWidths[index];
    });

    let currentY = tableY - headerHeight;

    (section.items || []).forEach((item, rowIndex) => {
      const rowValues = columns.map((column) => normalizePdfText(item[column.key] ?? ''));

      const rowHeight = Math.max(
        28,
        ...rowValues.map((value, index) =>
          measureWrappedTextHeight(
            fonts.regular,
            value,
            9,
            12,
            resolvedWidths[index] - 16
          ) + 12
        )
      );

      if (rowIndex % 2 === 1) {
        page.drawRectangle({
          x,
          y: currentY - rowHeight,
          width,
          height: rowHeight,
          color: rowAltBg,
        });
      }

      let cellX = x;

      columns.forEach((column, index) => {
        page.drawRectangle({
          x: cellX,
          y: currentY - rowHeight,
          width: resolvedWidths[index],
          height: rowHeight,
          borderWidth: 1,
          borderColor,
        });

        const value = rowValues[index];
        const isRight = column.align === 'right';

        const linesHeight = measureWrappedTextHeight(
          fonts.regular,
          value,
          9,
          12,
          resolvedWidths[index] - 16
        );

        const startY = currentY - 8;
        const lineWidth = fonts.regular.widthOfTextAtSize(value, 9);

        if (isRight && !value.includes('\n') && lineWidth <= (resolvedWidths[index] - 16)) {
          page.drawText(value, {
            x: cellX + resolvedWidths[index] - 8 - lineWidth,
            y: startY - 9,
            size: 9,
            font: fonts.regular,
            color: textColor,
          });
        } else {
          drawWrappedText({
            page,
            font: fonts.regular,
            text: value,
            x: cellX + 8,
            y: startY,
            maxWidth: resolvedWidths[index] - 16,
            fontSize: 9,
            lineHeight: 12,
            color: textColor,
          });
        }

        cellX += resolvedWidths[index];
      });

      currentY -= rowHeight;
    });

    return currentY;
  }
}
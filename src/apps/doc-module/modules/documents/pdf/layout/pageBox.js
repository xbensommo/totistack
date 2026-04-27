/** @file src/modules/documents/pdf/layout/pageBox.js */
export function createPageBox({ pageWidth, pageHeight, margins, headerHeight = 0, footerHeight = 0 }) {
  const resolvedMargins = {
    top: Number(margins?.top ?? 40),
    right: Number(margins?.right ?? 52),
    bottom: Number(margins?.bottom ?? 40),
    left: Number(margins?.left ?? 52),
  };

  const bodyX = resolvedMargins.left;
  const bodyY = resolvedMargins.bottom + footerHeight;
  const bodyWidth = pageWidth - resolvedMargins.left - resolvedMargins.right;
  const bodyHeight = pageHeight - resolvedMargins.top - resolvedMargins.bottom - headerHeight - footerHeight;

  return {
    pageWidth,
    pageHeight,
    margins: resolvedMargins,
    headerHeight,
    footerHeight,
    bodyX,
    bodyY,
    bodyWidth,
    bodyHeight,
    bodyTop: pageHeight - resolvedMargins.top - headerHeight,
    footerTop: resolvedMargins.bottom + footerHeight,
  };
}
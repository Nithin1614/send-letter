// Printable Origami Keepsake Generator (Foldable A4 PDF)

export interface PrintableLetterData {
  id?: string;
  title?: string;
  message?: string;
  signature?: string;
  envelope?: string;
}

export async function generateOrigamiPDF(letter: PrintableLetterData) {
  // Dynamically import jsPDF to ensure client-side rendering
  const { jsPDF } = await import("jspdf");

  // Standard A4 portrait: 210mm x 297mm
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const centerX = pageWidth / 2;
  const centerY = pageHeight / 2;

  // 1. Light background workspace
  doc.setFillColor(252, 250, 246);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // Title header instructions at top of A4 sheet
  doc.setFont("times", "bold");
  doc.setFontSize(14);
  doc.setTextColor(38, 31, 24);
  doc.text("SEND LETTER · PRINTABLE ORIGAMI ENVELOPE", centerX, 15, { align: "center" });

  doc.setFont("times", "italic");
  doc.setFontSize(9);
  doc.setTextColor(120, 110, 100);
  doc.text("Instructions: Cut along the outer dashed lines, then fold tabs [1] → [2] → [3] → [4] inward.", centerX, 21, { align: "center" });

  // 2. Origami Central Letter Rectangle Dimensions
  const letterW = 120;
  const letterH = 80;
  const letterX = centerX - letterW / 2; // 45mm
  const letterY = centerY - letterH / 2; // 108.5mm

  // 3. Draw Fold Flaps (Triangles) around Center
  const flapDepth = 38;

  // Outer Cut Outline (Dashed Line)
  doc.setLineDashPattern([2, 2], 0);
  doc.setDrawColor(160, 150, 140);
  doc.setLineWidth(0.3);

  // Outer cut path: 8-point polygon matching envelope unfolding net
  const cutPath = [
    [letterX, letterY], // Top-left
    [centerX, letterY - flapDepth], // Top flap peak
    [letterX + letterW, letterY], // Top-right
    [letterX + letterW + flapDepth, centerY], // Right flap peak
    [letterX + letterW, letterY + letterH], // Bottom-right
    [centerX, letterY + letterH + flapDepth], // Bottom flap peak
    [letterX, letterY + letterH], // Bottom-left
    [letterX - flapDepth, centerY], // Left flap peak
  ];

  // Draw outer dashed cut lines
  for (let i = 0; i < cutPath.length; i++) {
    const nextIdx = (i + 1) % cutPath.length;
    doc.line(cutPath[i][0], cutPath[i][1], cutPath[nextIdx][0], cutPath[nextIdx][1]);
  }

  // Draw small scissors icon / text on outer edge
  doc.setFontSize(7.5);
  doc.setTextColor(140, 130, 120);
  doc.text("✂ - - - - - - - - - - - - - - - - - Cut Along Outer Edge - - - - - - - - - - - - - - - - - ✂", centerX, 26, { align: "center" });

  // 4. Draw Flap Fold Lines & Instruction Labels
  doc.setLineDashPattern([1, 1.5], 0);
  doc.setDrawColor(180, 165, 150);
  doc.setLineWidth(0.4);

  // Left fold line
  doc.line(letterX, letterY, letterX, letterY + letterH);
  // Right fold line
  doc.line(letterX + letterW, letterY, letterX + letterW, letterY + letterH);
  // Top fold line
  doc.line(letterX, letterY, letterX + letterW, letterY);
  // Bottom fold line
  doc.line(letterX, letterY + letterH, letterX + letterW, letterY + letterH);

  // Flap Labels
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(150, 135, 120);

  // Left Flap [1]
  doc.text("[1] Fold Inward", letterX - flapDepth / 2 - 2, centerY, { align: "center", angle: 90 });
  // Right Flap [2]
  doc.text("[2] Fold Inward", letterX + letterW + flapDepth / 2 + 2, centerY, { align: "center", angle: 270 });
  // Bottom Flap [3]
  doc.text("[3] Fold Upward to create pocket", centerX, letterY + letterH + flapDepth / 2 + 2, { align: "center" });
  // Top Flap [4]
  doc.text("[4] Fold Down to Seal", centerX, letterY - flapDepth / 2 - 4, { align: "center" });

  // 5. Wax Seal graphic on Top Exterior Flap
  const sealPeakY = letterY - flapDepth + 14;
  doc.setFillColor(186, 46, 56); // Crimson wax
  doc.circle(centerX, sealPeakY, 7, "F");
  doc.setDrawColor(107, 16, 22);
  doc.setLineWidth(0.5);
  doc.circle(centerX, sealPeakY, 7, "S");
  doc.setFont("times", "normal");
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text("✉", centerX, sealPeakY + 3, { align: "center" });

  // 6. Draw Center Real Kraft Letter Sheet
  doc.setLineDashPattern([], 0); // Solid
  doc.setFillColor(223, 210, 190); // Real Kraft paper tone
  doc.roundedRect(letterX, letterY, letterW, letterH, 1, 1, "F");

  // Dual Archival Frame on letter
  doc.setDrawColor(166, 149, 124);
  doc.setLineWidth(0.4);
  doc.rect(letterX + 3, letterY + 3, letterW - 6, letterH - 6, "S");

  doc.setDrawColor(166, 149, 124);
  doc.setLineWidth(0.2);
  doc.rect(letterX + 4.2, letterY + 4.2, letterW - 8.4, letterH - 8.4, "S");

  // Mini Seal Stamp inside Letter
  doc.setFillColor(139, 24, 32);
  doc.circle(centerX, letterY + 9, 3.5, "F");
  doc.setFontSize(5);
  doc.setTextColor(255, 255, 255);
  doc.text("✉", centerX, letterY + 10.5, { align: "center" });

  // Letter Title
  doc.setFont("times", "bold");
  doc.setFontSize(11);
  doc.setTextColor(38, 31, 24);
  doc.text(letter.title || "A Secret Letter For You", centerX, letterY + 17, { align: "center" });

  // Divider
  doc.setDrawColor(166, 149, 124);
  doc.setLineWidth(0.2);
  doc.line(centerX - 18, letterY + 19.5, centerX - 3, letterY + 19.5);
  doc.line(centerX + 3, letterY + 19.5, centerX + 18, letterY + 19.5);
  doc.setFontSize(6);
  doc.setTextColor(166, 149, 124);
  doc.text("✦", centerX, letterY + 20.3, { align: "center" });

  // Letter Message Text
  doc.setFont("times", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(38, 31, 24);

  const rawMessage = letter.message || "";
  const maxTextW = letterW - 14;
  const wrappedLines = doc.splitTextToSize(rawMessage, maxTextW);

  // Print up to 10 lines
  const linesToPrint = wrappedLines.slice(0, 10);
  let curY = letterY + 26;
  for (let l = 0; l < linesToPrint.length; l++) {
    doc.text(linesToPrint[l], letterX + 7, curY);
    curY += 4.5;
  }

  // Signature
  if (letter.signature) {
    doc.setFont("times", "italic");
    doc.setFontSize(8);
    doc.setTextColor(58, 45, 32);
    doc.text(`— ${letter.signature}`, letterX + letterW - 8, letterY + letterH - 6.5, { align: "right" });
  }

  // Footer on page
  doc.setFont("times", "italic");
  doc.setFontSize(8);
  doc.setTextColor(160, 150, 140);
  doc.text("Send Letter · Crafted with love · https://sendletter.app", centerX, pageHeight - 12, { align: "center" });

  // Save PDF
  doc.save(`send-letter-origami-${letter.id || "keepsake"}.pdf`);
}

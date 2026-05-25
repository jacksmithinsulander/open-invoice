import { PDF } from "@libpdf/core";

async function main() {
  // Create a new PDF document
  const pdf = PDF.create();

  // Standard sizes: "letter", "a4", "legal"
  pdf.addPage({ size: "a4" });

  const firstPage = pdf.getPage(0);

  if (!firstPage) {
    throw new Error("Failed to create PDF page");
  }

  firstPage.drawText("Hello world", {
    x: 50,
    y: 700,
    size: 24,
  });

  const bytes = await pdf.save();

  await Bun.write("test-doc.pdf", bytes);
}

main().catch(console.error);

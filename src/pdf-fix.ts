import { PDF } from "@libpdf/core";

async function main() {
  // Create a new PDF document
  const pdf = PDF.create();

  // Standard sizes: "letter", "a4", "legal"
  pdf.addPage({ size: "a4" });

  pdf.getPage(0).drawText("Hello world", {
    x: 50,
    y: 700,
    size: 24,
  });

  const bytes = await pdf.save();

  await Bun.write("test-doc.pdf", bytes);
}

main().catch(console.error);

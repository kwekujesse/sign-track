"use client";

// Lightweight wrapper around html2pdf.js with safe dynamic import for Next.js client components.

export async function generatePdfFromElement(
  element: HTMLElement,
  filename: string
): Promise<void> {
  // Dynamically import to avoid SSR issues and reduce initial bundle size.
  const html2pdf = (await import("html2pdf.js")) as any;

  const opt = {
    margin: [10, 10, 10, 10],
    filename,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      logging: false,
      // ensure background colors render
      backgroundColor: "#ffffff",
    },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    pagebreak: { mode: ["css", "legacy"] },
  };

  // html2pdf API returns a Promise when calling .save()
  await (html2pdf.default || html2pdf)()
    .set(opt)
    .from(element)
    .save();
}


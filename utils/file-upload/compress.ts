import imageCompression from "browser-image-compression";
import { PDFDocument } from "pdf-lib";

// image compression
const compressImage = async (file: File) => {
  const options = {
    maxSizeMB: 1, // Target size in MB
    maxWidthOrHeight: 1080, // Max width/height
    useWebWorker: true, // Use Web Worker for performance
  };

  try {
    const compressedBlob = await imageCompression(file, options);

    // Convert Blob back to File to preserve the original file name and type
    const compressedFile = new File([compressedBlob], file.name, {
      type: file.type,
      lastModified: Date.now(),
    });

    return compressedFile;
  } catch (error) {
    console.error("Error compressing image:", error);
    return file; // Return original file if compression fails
  }
};

const compressPDF = async (file: File) => {
  try {
    const fileBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(fileBuffer);

    // Optionally remove unnecessary information or reduce image quality
    const compressedPdfBytes = await pdfDoc.save({ useObjectStreams: false });

    return new File([compressedPdfBytes], file.name, {
      type: "application/pdf",
    });
  } catch {
    return file; // Return original if compression fails
  }
};

export { compressImage, compressPDF };

export interface PdfConversionResult {
    file: File | null;
    error?: string;
}

let pdfjsLib: any = null;
let loadPromise: Promise<any> | null = null;

async function loadPdfJs(): Promise<any> {
    if (pdfjsLib) return pdfjsLib;
    if (loadPromise) return loadPromise;

    loadPromise = import("pdfjs-dist/legacy/build/pdf.mjs").then((lib) => {
        pdfjsLib = lib;
        return lib;
    });

    return loadPromise;
}

function createFallbackPreview(fileName: string): File {
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 1600;
    const ctx = canvas.getContext("2d");

    if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#e5e7eb";
        ctx.fillRect(40, 40, canvas.width - 80, canvas.height - 80);
        ctx.fillStyle = "#111827";
        ctx.font = "bold 52px sans-serif";
        ctx.fillText("Resume Uploaded", 90, 180);
        ctx.fillStyle = "#374151";
        ctx.font = "36px sans-serif";
        ctx.fillText("Preview could not be generated.", 90, 250);
        ctx.fillText("Analysis still continues.", 90, 305);
        ctx.fillStyle = "#6b7280";
        ctx.font = "28px sans-serif";
        ctx.fillText(fileName, 90, 390);
    }

    const dataUrl = canvas.toDataURL("image/png", 1.0);
    const byteString = atob(dataUrl.split(",")[1]);
    const mimeString = dataUrl.split(",")[0].split(":")[1].split(";")[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i += 1) {
        ia[i] = byteString.charCodeAt(i);
    }

    return new File([ab], `${fileName.replace(/\.pdf$/i, "")}-preview.png`, {
        type: mimeString,
    });
}

export async function convertPdfToImage(file: File): Promise<PdfConversionResult> {
    try {
        const lib = await loadPdfJs();
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await lib.getDocument({
            data: arrayBuffer,
            disableWorker: true,
            useSystemFonts: true,
        }).promise;

        const page = await pdf.getPage(1);
        let viewport = page.getViewport({ scale: 2 });
        const maxDimension = 2200;
        const largestSide = Math.max(viewport.width, viewport.height);
        if (largestSide > maxDimension) {
            const factor = maxDimension / largestSide;
            viewport = page.getViewport({ scale: 2 * factor });
        }
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (!context) {
            const fallback = createFallbackPreview(file.name);
            return {
                file: fallback,
                error: "Canvas context unavailable, using fallback preview.",
            };
        }

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = "high";

        await page.render({ canvasContext: context, viewport }).promise;
        if (typeof pdf.destroy === "function") {
            await pdf.destroy().catch(() => undefined);
        }

        return new Promise((resolve) => {
            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        const fallback = createFallbackPreview(file.name);
                        resolve({
                            file: fallback,
                            error: "Failed to create image blob, using fallback preview.",
                        });
                        return;
                    }

                    const originalName = file.name.replace(/\.pdf$/i, "");
                    const imageFile = new File([blob], `${originalName}.png`, {
                        type: "image/png",
                    });

                    resolve({
                        file: imageFile,
                    });
                },
                "image/png",
                1.0
            );
        });
    } catch (err) {
        console.error("[SkillSight:pdf2img] conversion failed", err);
        const fallback = createFallbackPreview(file.name);
        return {
            file: fallback,
            error: `Failed to convert PDF: ${err}`,
        };
    }
}

export async function convertPdfBlobToImage(
    blob: Blob,
    fileName = "resume.pdf"
): Promise<PdfConversionResult> {
    const file = new File([blob], fileName, { type: "application/pdf" });
    return convertPdfToImage(file);
}

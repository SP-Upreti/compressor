"use client";
import { ImageUploader } from "@/components/ui/image-uploader";
import { BadgeInfo, Mail, ShieldCheck, Sparkles, Workflow } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressedFiles, setCompressedFiles] = useState<File[]>([]);
  const [quality, setQuality] = useState(0.3); // Default quality for compression
  const [error, setError] = useState<string>("");
  const [isDownloading, setIsDownloading] = useState(false);

  const handleCompress = async () => {
    try {
      setIsCompressing(true);

      for (const file of files) {
        const image = new Image();
        image.src = URL.createObjectURL(file);

        image.onload = async () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            console.error("Failed to get canvas context");
            return;
          }

          // Set canvas dimensions to the original image dimensions
          canvas.width = image.naturalWidth;
          canvas.height = image.naturalHeight;

          ctx.drawImage(image, 0, 0);

          // Convert canvas to blob with the specified quality
          const blob = await new Promise<Blob | null>((resolve) => {
            canvas.toBlob(resolve, "image/webp", quality);
          });

          if (blob) {
            const compressedFile = new File([blob], file.name.replace(/\.\w+$/, ".webp"), {
              type: "image/webp",
            });
            setCompressedFiles((prev) => [...prev, compressedFile]);
          }


        }
      }
      setFiles([]); // Clear original files after compression

    } catch (error) {
      console.error("Error during compression:", error);
      setError("An error occurred during compression. Please try again.");
    }
    finally {
      setIsCompressing(false);
    }
  }

  const handleDownloadAll = () => {
    try {
      setIsDownloading(true);
      compressedFiles.forEach((file) => {
        const url = URL.createObjectURL(file);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
    } catch (error) {
      console.error("Error during download:", error);
      setError("An error occurred during download. Please try again.");
    }
    finally {
      setIsDownloading(false);
    }

  }

  const downloadTarget = (file: File) => {
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <main className="max-w-7xl mx-auto min-h-screen py-16 pt-30 px-4 space-y-20">
      <section id="home" className="scroll-mt-28">
        <ImageUploader
          files={files}
          onChange={setFiles}
          maxFiles={5}
          maxSize={4}
          accept="image/jpeg, image/png, image/webp"
          isCompressing={isCompressing}
          onCompress={handleCompress}
          onDownloadAll={handleDownloadAll}
          error={error}
          previewFiles={compressedFiles}
          quality={quality}
          onQualityChange={setQuality}
          isDownloading={isDownloading}
          downloadTarget={downloadTarget}
        />
      </section>

      <section id="instructions" className="scroll-mt-28 rounded-2xl border bg-card p-6 md:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-sm bg-blue-100 p-2 text-blue-700">
            <Workflow className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold">Instructions</h2>
            <p className="text-sm text-muted-foreground">Three quick steps to compress your images efficiently.</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <article className="rounded-xl border bg-background p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Step 1</p>
            <h3 className="mt-1 font-semibold">Upload your images</h3>
            <p className="mt-2 text-sm text-muted-foreground">Add JPG, PNG, or WEBP files by browsing or dragging them into the drop area.</p>
          </article>

          <article className="rounded-xl border bg-background p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Step 2</p>
            <h3 className="mt-1 font-semibold">Choose compression depth</h3>
            <p className="mt-2 text-sm text-muted-foreground">Set your preferred quality level between 0.1 and 1.0 to control output size and clarity.</p>
          </article>

          <article className="rounded-xl border bg-background p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Step 3</p>
            <h3 className="mt-1 font-semibold">Compress and download</h3>
            <p className="mt-2 text-sm text-muted-foreground">Run compression, review results, and download one file or all optimized files.</p>
          </article>
        </div>
      </section>

      <section id="about" className="scroll-mt-28 rounded-2xl border bg-card p-6 md:p-8">
        <div className="mb-6 flex  items-center gap-3">
          <div className="rounded-sm hidden sm:block bg-emerald-100 p-2 hidden sm:block text-emerald-700">
            <BadgeInfo className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold">About</h2>
            <p className="text-sm text-muted-foreground">A lightweight image optimizer focused on speed, quality, and privacy.</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <article className="rounded-xl border bg-background p-5">
            <div className="mb-2 flex items-center gap-2 font-semibold">
              Professional output
            </div>
            <p className="text-sm text-muted-foreground">Get smaller files while preserving visual quality, ideal for web publishing and performance tuning.</p>
          </article>

          <article className="rounded-xl border bg-background p-5">
            <div className="mb-2 flex items-center gap-2 font-semibold">
              Privacy-first workflow
            </div>
            <p className="text-sm text-muted-foreground">Processing happens in the browser so your source files stay on your device during compression.</p>
          </article>
        </div>
      </section>

      <section id="contact" className="scroll-mt-28 rounded-2xl border bg-card p-6 md:p-8">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-sm hidden sm:block bg-amber-100 p-2 text-amber-700">
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold">Contact</h2>
            <p className="text-sm text-muted-foreground">Questions, feature ideas, or partnership inquiries.</p>
          </div>
        </div>

        <div className="rounded-xl border bg-background p-5">
          <p className="text-sm text-muted-foreground">Reach out at</p>
          <a
            href="mailto:hello@imgcompressor.app"
            className="mt-1 inline-block text-base font-semibold text-blue-700 hover:underline"
          >
            hello@imgcompressor.app
          </a>
        </div>
      </section>
    </main>
  );
}

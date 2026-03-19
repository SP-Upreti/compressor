import * as React from "react";
import { ArrowRight, Check, CloudUpload, Download, Info, Loader, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./dialog";

function formatFileSize(bytes: number) {
    const kb = bytes / 1024;
    if (kb >= 1024) {
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
    return `${kb.toFixed(1)} KB`;
}

function useObjectUrls(files: File[]) {
    const urls = React.useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);

    React.useEffect(() => {
        return () => {
            urls.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [urls]);

    return urls;
}

type ClearTarget = "uploaded" | "compressed" | "all";

interface ClearFilesDialogProps {
    target: ClearTarget;
    onConfirm: () => void;
}

function ClearFilesDialog({ target, onConfirm }: ClearFilesDialogProps) {
    const label = target === "uploaded" ? "uploaded" : target === "compressed" ? "compressed" : "all";

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    Clear {target === "all" ? "All" : label}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Clear {target === "all" ? "All Files" : `${label} Files`}</DialogTitle>
                    <DialogDescription>This will remove {label} files from the current session.</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <DialogClose asChild>
                        <Button onClick={onConfirm} variant="destructive">
                            Clear
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

interface UploadDropzoneProps {
    accept: string;
    maxSize: number;
    isDragging: boolean;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    onFileChange: (newFiles: FileList | null) => void;
    onDragEnter: (e: React.DragEvent<HTMLDivElement>) => void;
    onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
    onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
    onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
}

function UploadDropzone({
    accept,
    maxSize,
    isDragging,
    fileInputRef,
    onFileChange,
    onDragEnter,
    onDragLeave,
    onDragOver,
    onDrop,
}: UploadDropzoneProps) {
    return (
        <div
            className={cn(
                "border-2 border-dashed cursor-pointer hover:border-blue-500 rounded-lg p-8 text-center transition-colors duration-300",
                isDragging ? "border-primary bg-primary/10" : "border-muted-foreground/30 bg-transparent"
            )}
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            aria-label="Image uploader dropzone"
            tabIndex={0}
        >
            <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={accept}
                className="hidden"
                onChange={(e) => onFileChange(e.target.files)}
            />
            <div className="flex flex-col items-center gap-4">
                <Button type="button" variant="ghost" size="icon" className="h-14 w-14 rounded-full">
                    <CloudUpload className="h-6 w-6 lg:size-10" />
                </Button>
                <div>
                    <p className="font-medium hover:underline">Choose images or drag & drop it here</p>
                    <p className="text-sm text-muted-foreground">JPG, JPEG, PNG and WEBP. Max {maxSize}MB.</p>
                </div>
            </div>
        </div>
    );
}

function FeatureList({ maxSize, maxFiles }: { maxSize: number; maxFiles: number }) {
    return (
        <div className="space-y-4 lg:pl-12">
            <h2 className="font-semibold text-2xl">Image Compressor</h2>
            <ul className="space-y-3">
                <li className="flex gap-2 items-center"><Check className="text-green-500 size-5" /> Compress images without losing quality</li>
                <li className="flex gap-2 items-center"><Check className="text-green-500 size-5" /> Support for multiple image formats</li>
                <li className="flex gap-2 items-center"><Check className="text-green-500 size-5" /> Easy to use and integrate</li>
                <li className="flex gap-2 items-center"><Check className="text-green-500 size-5" /> Max {maxSize}MB file size</li>
                <li className="flex gap-2 items-center"><Check className="text-green-500 size-5" /> Up to {maxFiles} files at a time</li>
            </ul>
        </div>
    );
}

interface UploadedFilesGridProps {
    files: File[];
    previewUrls: string[];
    onRemoveFile: (index: number) => void;
    onClearUploaded?: () => void;
}

function UploadedFilesGrid({ files, previewUrls, onRemoveFile, onClearUploaded }: UploadedFilesGridProps) {
    if (!previewUrls.length) {
        return null;
    }

    return (
        <div className="sm:grid sm:grid-cols-3 border-b mt-8 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <div className="col-span-5 flex items-center justify-between">
                <h2 className="font-semibold text-xl">Uploaded files - {previewUrls.length}</h2>
            </div>

            <AnimatePresence>
                {previewUrls.map((url, index) => (
                    <motion.div
                        key={files[index].name}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                        className="relative border rounded-md group w-full aspect-square"
                    >
                        <img
                            src={url}
                            alt={`Preview of ${files[index].name}`}
                            className="object-cover h-full w-full rounded-md"
                        />
                        {files[index].size > 0 ? (
                            <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-1 rounded pointer-events-none">
                                {formatFileSize(files[index].size)}
                            </div>
                        ) : null}
                        <div className="absolute inset-0 hidden group-hover:flex justify-center items-center bg-black/40 rounded-md">
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="size-8! bg-red-500 text-white right-2 h-6 w-6 rounded-full opacity-100 group-hover:scale-110 hover:bg-red-500 cursor-pointer"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRemoveFile(index);
                                }}
                                aria-label={`Remove ${files[index].name}`}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}

interface CompressedFilesGridProps {
    previewFiles: File[];
    previewUrls: string[];
    isDownloading?: boolean;
    downloadTarget?: (file: File) => void;
    downloadAllTarget?: () => void;
    onClearCompressed?: () => void;
    onClearAll?: () => void;
}

function CompressedFilesGrid({
    previewFiles,
    previewUrls,
    isDownloading,
    downloadTarget,
    downloadAllTarget,
    onClearCompressed,
    onClearAll,
}: CompressedFilesGridProps) {
    if (!previewFiles.length) {
        return null;
    }

    return (
        <div className="mt-8">
            <h2 className="font-semibold text-xl mb-4">Compressed files - {previewFiles.length}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {previewFiles.map((file, index) => (
                    <div className="relative" key={file.name}>
                        <div className="relative aspect-square rounded-md border">
                            <img
                                src={previewUrls[index]}
                                alt={`Compressed preview of ${file.name}`}
                                className="object-cover h-full w-full rounded-md"
                            />
                            {file.size > 0 ? (
                                <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-1 rounded">
                                    {formatFileSize(file.size)}
                                </div>
                            ) : null}
                        </div>
                        <Button
                            onClick={() => (downloadTarget ? downloadTarget(file) : null)}
                            variant="destructive"
                            size="sm"
                            className="mt-2 absolute top-0 right-2 bg-primary text-white rounded-sm hover:bg-primary hover:text-white hover:scale-105 transition-all"
                            aria-label={`Download ${file.name}`}
                        >
                            <Download />
                        </Button>
                    </div>
                ))}
            </div>



            <div className="mt-10 flex flex-wrap gap-3">
                <Button
                    onClick={downloadAllTarget}
                    disabled={previewFiles.length === 0 || isDownloading}
                    className="w-fit"
                    variant={"destructive"}
                >
                    {isDownloading ? (
                        <>
                            <Loader className="animate-spin mr-2" />
                            Downloading...
                        </>
                    ) : (
                        <>Download Zip</>
                    )}
                </Button>

                {onClearAll ? <ClearFilesDialog target="all" onConfirm={onClearAll} /> : null}
            </div>
        </div>
    );
}

interface ImageUploaderProps {
    files: File[];
    onChange: (files: File[]) => void;
    maxFiles?: number;
    maxSize?: number;
    accept?: string;
    className?: string;
    isCompressing?: boolean;
    onCompress: () => void | Promise<void>;
    error?: string;
    previewFiles?: File[];
    quality?: number;
    onQualityChange: (quality: number) => void;
    isDownloading?: boolean;
    downloadTarget?: (file: File) => void;
    downloadAllTarget?: () => void;
    onClearUploaded?: () => void;
    onClearCompressed?: () => void;
    onClearAll?: () => void;
    clearAllFiles?: () => void;
}

export const ImageUploader = React.forwardRef<HTMLDivElement, ImageUploaderProps>(
    (
        {
            files,
            onChange,
            maxFiles = 5,
            maxSize = 4,
            accept = "image/*",
            className,
            isCompressing = false,
            onCompress,
            error,
            previewFiles,
            quality,
            onQualityChange,
            isDownloading,
            downloadTarget,
            downloadAllTarget,
            onClearUploaded,
            onClearCompressed,
            onClearAll,
            clearAllFiles,
            ...props
        },
        ref
    ) => {
        const [isDragging, setIsDragging] = React.useState(false);
        const fileInputRef = React.useRef<HTMLInputElement>(null);

        const uploadedPreviewUrls = useObjectUrls(files);
        const compressedPreviewUrls = useObjectUrls(previewFiles ?? []);

        const handleFileChange = (newFiles: FileList | null) => {
            if (!newFiles) return;

            const filesArray = Array.from(newFiles);
            const uniqueNewFiles = filesArray.filter(
                (newFile) => !files.some((existingFile) => existingFile.name === newFile.name)
            );

            const updatedFiles = [...files, ...uniqueNewFiles].slice(0, maxFiles);
            onChange(updatedFiles);
        };

        const handleRemoveFile = (index: number) => {
            const updatedFiles = files.filter((_, i) => i !== index);
            onChange(updatedFiles);
        };

        const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(true);
        };

        const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);
        };

        const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            e.stopPropagation();
        };

        const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);
            handleFileChange(e.dataTransfer.files);
        };

        void quality;
        void onQualityChange;
        void error;

        return (
            <div ref={ref} className={cn("space-y-4", className)} {...props}>
                <div className="grid lg:grid-cols-2 gap-4">
                    <UploadDropzone
                        accept={accept}
                        maxSize={maxSize}
                        isDragging={isDragging}
                        fileInputRef={fileInputRef}
                        onFileChange={handleFileChange}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                    />
                    <FeatureList maxFiles={maxFiles} maxSize={maxSize} />
                </div>
                <p className="flex gap-2 items-center text-red-500"><Info className="size-5" /> Works Best for above 50kb files</p>

                <UploadedFilesGrid
                    files={files}
                    previewUrls={uploadedPreviewUrls}
                    onRemoveFile={handleRemoveFile}
                    onClearUploaded={onClearUploaded}
                />

                {files.length > 0 ? (
                    <div className="max-w-xs   flex gap-6 items-center flex-wrap mt-10 mb-20">
                        <Button onClick={onCompress} disabled={isCompressing} className="mt-1 w-fit">
                            {isCompressing ? (
                                <>
                                    <Loader className="animate-spin mr-2" />
                                    Compressing...
                                </>
                            ) : (
                                <>
                                    Compress All
                                    <ArrowRight />
                                </>
                            )}
                        </Button>
                        <Dialog>
                            <DialogTrigger>
                                <Button variant={"destructive"}>
                                    Clear All
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Clear All Files</DialogTitle>
                                    <DialogDescription>
                                        Are you sure you want to clear all uploaded and compressed files?
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                    <DialogClose>
                                        <Button variant={"outline"} >
                                            Cancel
                                        </Button>
                                    </DialogClose>
                                    <Button
                                        variant={"destructive"}
                                        onClick={() => {
                                            clearAllFiles?.();
                                        }}
                                    >
                                        Clear All
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                ) : null}


                {previewFiles ? (
                    <CompressedFilesGrid
                        previewFiles={previewFiles}
                        previewUrls={compressedPreviewUrls}
                        isDownloading={isDownloading}
                        downloadTarget={downloadTarget}
                        downloadAllTarget={downloadAllTarget}
                        onClearCompressed={onClearCompressed}
                        onClearAll={onClearAll}
                    />
                ) : null}
            </div>
        );
    }
);

ImageUploader.displayName = "ImageUploader";

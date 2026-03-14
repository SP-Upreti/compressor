import * as React from "react";
import { ArrowRight, Check, CloudUpload, Download, FileDown, Loader, Trash2, Upload, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "./input";
import { Label } from "./label";
import { pre } from "framer-motion/client";

// Define the props for the ImageUploader component
interface ImageUploaderProps {
    /** The current list of files. */
    files: File[];
    /** Callback function to update the file list. */
    onChange: (files: File[]) => void;
    /** Maximum number of files allowed. Defaults to 5. */
    maxFiles?: number;
    /** Maximum file size in MB. Defaults to 4. */
    maxSize?: number;
    /** Accepted file types. Defaults to "image/*". */
    accept?: string;
    /** ClassName for the root element. */
    className?: string;
    /** Indicates if compression is in progress. */
    isCompressing?: boolean;
    /** Callback function to handle file compression. */
    onCompress: () => void | Promise<void>;
    /** Callback function to handle downloading all compressed files. */
    onDownloadAll?: () => void;

    //  error={error}
    //     previewFiles={compressedFiles}
    //     quality={quality}
    //     onQualityChange={setQuality}

    error?: string;
    previewFiles?: File[];
    quality?: number;
    onQualityChange: (quality: number) => void;
    isDownloading?: boolean;
    downloadTarget?: (file: File) => void;

}

/**
 * A reusable image uploader component with drag-and-drop, previews, and animations.
 */
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
            onDownloadAll,
            error,
            previewFiles,
            quality,
            onQualityChange,
            isDownloading,
            downloadTarget,
            ...props
        },
        ref
    ) => {
        // State to manage drag-over visual feedback
        const [isDragging, setIsDragging] = React.useState(false);
        // Ref for the hidden file input
        const fileInputRef = React.useRef<HTMLInputElement>(null);

        // Memoize preview URLs to prevent re-rendering and memory leaks
        const previewUrls = React.useMemo(() =>
            files.map(file => URL.createObjectURL(file)),
            [files]
        );

        // Effect to clean up object URLs on unmount
        React.useEffect(() => {
            return () => {
                previewUrls.forEach(url => URL.revokeObjectURL(url));
            };
        }, [previewUrls]);

        const handleFileChange = (newFiles: FileList | null) => {
            if (!newFiles) return;

            const filesArray = Array.from(newFiles);
            const uniqueNewFiles = filesArray.filter(
                (newFile) => !files.some((existingFile) => existingFile.name === newFile.name)
            );

            // Validate files and update the list
            const updatedFiles = [...files, ...uniqueNewFiles].slice(0, maxFiles);
            onChange(updatedFiles);
        };

        const handleRemoveFile = (index: number) => {
            const updatedFiles = files.filter((_, i) => i !== index);
            onChange(updatedFiles);
        };

        // Drag and drop event handlers
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

        return (
            <div ref={ref} className={cn("space-y-4", className)} {...props}>
                <div className="grid lg:grid-cols-2 gap-4">
                    <div
                        className={cn(
                            "border-2 border-dashed cursor-pointer hover:border-blue-500 rounded-lg p-8 text-center  transition-colors duration-300",
                            isDragging ? "border-primary bg-primary/10" : "border-muted-foreground/30 bg-transparent"
                        )}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
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
                            onChange={(e) => handleFileChange(e.target.files)}
                        />
                        <div className="flex flex-col items-center gap-4">
                            <Button type="button" variant="ghost" size="icon" className="h-14 w-14 rounded-full">
                                <CloudUpload className="h-6 w-6 lg:size-10" />
                            </Button>
                            <div>
                                <p className="font-medium hover:underline">
                                    Choose images or drag & drop it here
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    JPG, JPEG, PNG and WEBP. Max {maxSize}MB.
                                </p>
                            </div>
                        </div>
                    </div>

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
                </div>

                {previewUrls.length > 0 && (
                    <div className="sm:grid  sm:grid-cols-3 mt-8 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        <h2 className="font-semibold text-xl col-span-5">Uploaded files - {previewUrls.length}</h2>
                        <AnimatePresence>
                            {previewUrls.map((url, index) => (
                                <motion.div
                                    key={files[index].name}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    transition={{ duration: 0.2 }}
                                    className="relative border rounded-md  group w-full aspect-square "
                                >
                                    <img
                                        src={url}
                                        alt={`Preview of ${files[index].name}`}
                                        className="object-cover h-full w-full  rounded-md"
                                    />
                                    {files[index].size > 0 && (
                                        <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-1 rounded pointer-events-none">
                                            {(files[index].size / 1024).toFixed(1)} KB
                                        </div>
                                    )}
                                    <div className="absolute inset-0 hidden group-hover:flex justify-center items-center bg-black/40 rounded-md">
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            className=" size-8! bg-red-500 text-white right-2 h-6 w-6 rounded-full opacity-100 group-hover:scale-110 hover:bg-red-500 cursor-pointer"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemoveFile(index);
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
                )}

                {files.length > 0 && (

                    <div className="max-w-xs">
                        

                        <Button
                        onClick={onCompress}
                        disabled={isCompressing}
                        className="mt-1 w-fit"
                        >Compress {files.length} Images
                        <ArrowRight/>
                        </Button>

                    </div>)}


                {previewFiles && previewFiles.length > 0 && (
                    <div className="mt-8">
                        <h2 className="font-semibold text-xl mb-4">Compressed files - {previewFiles.length}</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {previewFiles.map((file, index) => (
                               <div className="" key={file.name}>
                                 <div  className="relative aspect-square rounded-md border ">
                                    <img
                                        src={URL.createObjectURL(file)}
                                        alt={`Compressed preview of ${file.name}`}
                                        className="object-cover h-full w-full rounded-md"
                                    />
                                        {file.size > 0 && (
                                        <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-1 rounded">
                                            {(file.size / 1024).toFixed(1)} KB
                                        </div>
                                    )}
                                    
                                    
                                </div>
                                    <Button
                                        onClick={() => downloadTarget ? downloadTarget(file) : null}
                                        variant="outline"
                                        size="sm"
                                        className="mt-2 w-full shadow-none"
                                    >
                                        <Download className="mr-2" />
                                        Download
                                    </Button>
                               </div>
                            ))}
                        </div>

                        {/* <Button
                            onClick={onDownloadAll}
                            disabled={previewFiles.length === 0}
                            className="mt-4 w-fit"
                        >
                            {isDownloading ? (
                                <>
                                    <Loader className="animate-spin mr-2" />
                                    Downloading...
                                </>
                            ) : (
                                <>
                                Dowload {previewFiles.length} Images</>
                            )}
                        </Button> */}
                    </div>
                )}
            </div>
        );
    }
);

ImageUploader.displayName = "ImageUploader";
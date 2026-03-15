"use client";

import { Button } from "@client-pulse/ui/components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@client-pulse/ui/components/dialog";
import { Input } from "@client-pulse/ui/components/input";
import { Label } from "@client-pulse/ui/components/label";
import { Progress } from "@client-pulse/ui/components/progress";
import { Textarea } from "@client-pulse/ui/components/textarea";
import { useQueryClient } from "@tanstack/react-query";
import { FileUp, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/utils/trpc";
import { useTranslations } from "next-intl";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "application/pdf",
  "video/mp4",
  "application/zip",
  "application/x-figma",
];

const ALLOWED_EXTENSIONS_LABEL = "Images, PDF, MP4, ZIP, Figma";

interface DeliverableUploadProps {
  projectId: string;
}

type UploadStep =
  | "idle"
  | "creating"
  | "presigning"
  | "uploading"
  | "confirming"
  | "done";

export function DeliverableUpload({ projectId }: DeliverableUploadProps) {
  const queryClient = useQueryClient();
  const t = useTranslations("deliverables");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [step, setStep] = useState<UploadStep>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const createDeliverable = trpc.deliverables.create.useMutation();
  const presignUpload = trpc.deliverables.presignUpload.useMutation();
  const confirmUpload = trpc.deliverables.confirmUpload.useMutation();

  const resetForm = () => {
    setName("");
    setDescription("");
    setFile(null);
    setUploadProgress(0);
    setStep("idle");
    setErrorMsg("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) resetForm();
    setOpen(next);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0] ?? null;
    if (!picked) return;

    if (!ALLOWED_MIME_TYPES.includes(picked.type)) {
      setErrorMsg(
        `File type "${picked.type}" is not allowed. Accepted: ${ALLOWED_EXTENSIONS_LABEL}.`,
      );
      return;
    }
    setErrorMsg("");
    setFile(picked);
    if (!name) setName(picked.name.replace(/\.[^/.]+$/, ""));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !name.trim()) return;
    setErrorMsg("");

    try {
      // Step 1: create deliverable slot
      setStep("creating");
      const deliverable = await createDeliverable.mutateAsync({
        projectId,
        name: name.trim(),
        description: description.trim() || undefined,
      });

      // Step 2: get presigned URL
      setStep("presigning");
      const { presignedUrl, fileKey, fileUrl } =
        await presignUpload.mutateAsync({
          deliverableId: deliverable.id,
          fileName: file.name,
          mimeType: file.type,
          fileSize: file.size,
        });

      // Step 3: upload directly to R2
      setStep("uploading");
      await uploadWithProgress(presignedUrl, file, (pct) =>
        setUploadProgress(pct),
      );

      // Step 4: confirm upload
      setStep("confirming");
      await confirmUpload.mutateAsync({
        deliverableId: deliverable.id,
        fileKey,
        fileUrl,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
      });

      setStep("done");
      queryClient.invalidateQueries({
        queryKey: trpc.projects.get.queryKey({ id: projectId }),
      });
      toast.success(`"${name}" uploaded successfully`);
      handleOpenChange(false);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Upload failed. Please try again.";
      setErrorMsg(msg);
      setStep("idle");
    }
  };

  const isUploading = step !== "idle" && step !== "done";
  const stepLabel: Record<UploadStep, string> = {
    idle: "",
    creating: t("stepCreating"),
    presigning: t("stepPresigning"),
    uploading: `${t("stepUploading")} ${uploadProgress}%`,
    confirming: t("stepConfirming"),
    done: t("stepDone"),
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button size="sm">
            <Upload className="mr-2 h-4 w-4" />
            {t("addDeliverable")}
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("addDeliverable")}</DialogTitle>
          <DialogDescription>
            {t("uploadDescription", { formats: ALLOWED_EXTENSIONS_LABEL })}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="d-name">{t("nameLabel")}</Label>
            <Input
              id="d-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("namePlaceholder")}
              required
              disabled={isUploading}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="d-desc">{t("descriptionLabel")}</Label>
            <Textarea
              id="d-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("descriptionPlaceholder")}
              rows={2}
              disabled={isUploading}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="d-file">{t("fileLabel")}</Label>
            {file ? (
              <div className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
                <FileUp className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="flex-1 truncate">{file.name}</span>
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  disabled={isUploading}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label
                htmlFor="d-file"
                className="flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed px-4 py-6 transition-colors hover:border-primary/60"
              >
                <FileUp className="mb-1 h-6 w-6 text-muted-foreground" />
                <span className="text-muted-foreground text-sm">
                  {t("clickToSelect")}
                </span>
              </label>
            )}
            <input
              id="d-file"
              ref={fileInputRef}
              type="file"
              accept={ALLOWED_MIME_TYPES.join(",")}
              onChange={handleFileChange}
              className="sr-only"
              disabled={isUploading}
            />
          </div>

          {isUploading && (
            <div className="space-y-1.5">
              <p className="text-muted-foreground text-sm">{stepLabel[step]}</p>
              {step === "uploading" && (
                <Progress value={uploadProgress} className="h-2" />
              )}
            </div>
          )}

          {errorMsg && <p className="text-destructive text-sm">{errorMsg}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <DialogClose
              render={<Button variant="outline" disabled={isUploading} />}
            >
              {t("cancel")}
            </DialogClose>
            <Button
              type="submit"
              disabled={!file || !name.trim() || isUploading}
            >
              {isUploading ? stepLabel[step] : t("uploadButton")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

async function uploadWithProgress(
  presignedUrl: string,
  file: File,
  onProgress: (pct: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });
    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(100);
        resolve();
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    });
    xhr.addEventListener("error", () =>
      reject(new Error("Network error during upload")),
    );
    xhr.open("PUT", presignedUrl);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.send(file);
  });
}

"use client";

import { useActionState, useRef, useState } from "react";
import Link from "next/link";
import { createExcursion } from "@/lib/actions/excursions";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, ArrowLeft, ImagePlus, Loader2, X } from "lucide-react";
import { CATEGORIES } from "@/lib/constants/categories";
import { PREFECTURES } from "@/lib/constants/areas";

const MAX_PHOTOS = 10;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const selectCls =
  "flex h-10 w-full rounded-md border border-border bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy";

export default function NewExcursionPage() {
  const [state, action, pending] = useActionState(createExcursion, { error: null });

  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;

    const remaining = MAX_PHOTOS - photoUrls.length;
    if (remaining <= 0) return;

    const toUpload = Array.from(files).slice(0, remaining);

    // Client-side validation
    for (const file of toUpload) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setUploadError("Επιτρέπονται μόνο αρχεία JPEG, PNG, WEBP.");
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setUploadError(`Κάθε φωτογραφία πρέπει να είναι έως 5 MB (${file.name}).`);
        return;
      }
    }

    setUploadError(null);
    setUploading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setUploadError("Δεν είστε συνδεδεμένοι.");
      setUploading(false);
      return;
    }

    const newUrls: string[] = [];
    for (const file of toUpload) {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("excursion-photos").upload(path, file);
      if (error) {
        setUploadError(`Σφάλμα ανάρτησης: ${error.message}`);
        setUploading(false);
        return;
      }
      const { data: { publicUrl } } = supabase.storage.from("excursion-photos").getPublicUrl(path);
      newUrls.push(publicUrl);
    }

    setPhotoUrls((prev) => [...prev, ...newUrls]);
    setUploading(false);
    // Reset file input so the same files can be re-selected if needed
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removePhoto(index: number) {
    setPhotoUrls((prev) => prev.filter((_, i) => i !== index));
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/partner/excursions">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold text-navy">Νέα Εκδρομή</h1>
          <p className="text-muted text-sm mt-0.5">Συμπλήρωσε τα στοιχεία της εκδρομής</p>
        </div>
      </div>

      {state?.error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-6 text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />{state.error}
        </div>
      )}

      <form action={action} className="bg-card border border-border rounded-xl shadow-sm p-6 space-y-5">
        {/* Hidden inputs carry uploaded photo URLs to the server action */}
        {photoUrls.map((url, i) => (
          <input key={i} type="hidden" name="photo_urls" value={url} />
        ))}

        <div className="space-y-1.5">
          <Label htmlFor="name">Όνομα εκδρομής <span className="text-danger">*</span></Label>
          <Input id="name" name="name" placeholder="π.χ. Θαλάσσια περιήγηση Χανίων" required />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">Περιγραφή</Label>
          <Textarea id="description" name="description" rows={4} placeholder="Περιγράψτε την εκδρομή…" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="category">Κατηγορία</Label>
            <select id="category" name="category" className={selectCls}>
              <option value="">Επιλογή κατηγορίας…</option>
              {CATEGORIES.map((cat) => (
                <optgroup key={cat.value} label={cat.label}>
                  {cat.subcategories.map((sub) => (
                    <option key={sub.value} value={`${cat.value}:${sub.value}`}>
                      {sub.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <p className="text-xs text-muted">Επιλέξτε κατηγορία → υποκατηγορία</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="area">Περιοχή</Label>
            <select id="area" name="area" className={selectCls}>
              <option value="">Επιλογή περιοχής…</option>
              {PREFECTURES.map((pref) => (
                <optgroup key={pref.value} label={pref.label}>
                  {pref.towns.map((town) => (
                    <option key={town.value} value={town.value}>
                      {town.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="price_per_person">Τιμή/άτομο (€)</Label>
            <Input id="price_per_person" name="price_per_person" type="number" min="0" step="0.01" placeholder="25.00" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="max_capacity">Μέγ. χωρητικότητα</Label>
            <Input id="max_capacity" name="max_capacity" type="number" min="1" placeholder="20" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="duration_hours">Διάρκεια (ώρες)</Label>
            <Input id="duration_hours" name="duration_hours" type="number" min="0.5" step="0.5" placeholder="4" />
          </div>
        </div>

        {/* Photo upload */}
        <div className="space-y-2">
          <Label>
            Φωτογραφίες
            <span className="ml-1.5 text-muted font-normal">({photoUrls.length}/{MAX_PHOTOS})</span>
          </Label>

          {/* Thumbnail grid */}
          {photoUrls.length > 0 && (
            <div className="grid grid-cols-5 gap-2">
              {photoUrls.map((url, i) => (
                <div key={url} className="relative aspect-square rounded-lg overflow-hidden border border-border group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`Φωτογραφία ${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Αφαίρεση"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Drop zone — hidden when at max */}
          {photoUrls.length < MAX_PHOTOS && (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-background hover:border-navy/40 hover:bg-navy/5 transition-colors cursor-pointer p-6"
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading ? (
                <>
                  <Loader2 className="h-7 w-7 text-navy animate-spin" />
                  <p className="text-sm text-muted">Ανάρτηση…</p>
                </>
              ) : (
                <>
                  <ImagePlus className="h-7 w-7 text-muted" />
                  <p className="text-sm text-navy font-medium">Κάντε κλικ ή σύρτε φωτογραφίες εδώ</p>
                  <p className="text-xs text-muted">JPEG, PNG, WEBP · έως 5 MB το αρχείο · έως {MAX_PHOTOS} φωτογραφίες</p>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="sr-only"
                onChange={(e) => handleFiles(e.target.files)}
                disabled={uploading}
              />
            </div>
          )}

          {uploadError && (
            <p className="flex items-center gap-1.5 text-xs text-danger">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />{uploadError}
            </p>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={pending || uploading} className="flex-1">
            {pending ? "Αποθήκευση…" : "Δημιουργία Εκδρομής"}
          </Button>
          <Link href="/partner/excursions">
            <Button type="button" variant="outline">Ακύρωση</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}

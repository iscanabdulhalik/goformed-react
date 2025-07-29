import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function RequestDetailsPage() {
  const { id: requestId } = useParams(); // URL'den talep ID'sini al
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Lütfen önce bir dosya seçin.");
      return;
    }

    setUploading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Kullanıcı bulunamadı.");

      // Dosya yolunu benzersiz hale getirelim
      const filePath = `${user.id}/${requestId}/${file.name}`;

      // 1. Supabase Storage'a yükle
      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Yükleme başarılıysa, bilgisini 'documents' tablosuna kaydet
      const { error: insertError } = await supabase.from("documents").insert({
        request_id: requestId,
        file_name: file.name,
        storage_path: filePath,
        document_type: "identity_proof", // Bu alanı dinamik yapabilirsiniz
      });

      if (insertError) throw insertError;

      alert("Dosya başarıyla yüklendi!");
      setFile(null); // Formu temizle
    } catch (error) {
      console.error("Upload Error:", error);
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Gerekli Bilgiler</CardTitle>
          <CardDescription>
            Şirket kurulumunuzu tamamlamak için lütfen aşağıdaki bilgileri ve
            belgeleri sağlayın.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Buraya adres, yönetici bilgileri gibi ek form alanları gelecek */}
          <div className="space-y-2">
            <Label htmlFor="address">Yasal Adresiniz</Label>
            <Input id="address" placeholder="Tam adresinizi girin..." />
          </div>

          <div className="space-y-2 border-t pt-6">
            <Label htmlFor="document">
              Kimlik Kanıtı Yükleyin (Pasaport, vb.)
            </Label>
            <Input id="document" type="file" onChange={handleFileChange} />
            <Button onClick={handleUpload} disabled={uploading || !file}>
              {uploading ? "Yükleniyor..." : "Yükle"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

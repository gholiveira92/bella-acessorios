"use client";

import { useState, useRef } from "react";
import { FiUpload, FiX, FiImage, FiCheck } from "react-icons/fi";

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

export default function ImageUpload({ images, onChange, maxImages = 5 }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList) => {
    if (images.length >= maxImages) {
      alert(`Máximo de ${maxImages} imagens permitidas`);
      return;
    }

    setUploading(true);

    for (const file of Array.from(files)) {
      if (images.length >= maxImages) break;

      if (!file.type.startsWith("image/")) {
        alert("Apenas imagens são permitidas");
        continue;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert("Imagem deve ter menos de 5MB");
        continue;
      }

      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        
        try {
          const res = await fetch("/api/admin/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: base64 }),
          });

          const data = await res.json();

          if (res.ok && data.url) {
            onChange([...images, data.url]);
          } else {
            alert("Erro ao fazer upload. Tente novamente.");
          }
        } catch (error) {
          console.error("Upload error:", error);
          alert("Erro ao fazer upload");
        } finally {
          setUploading(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    if (e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    onChange(newImages);
  };

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          dragOver
            ? "border-brand-gold bg-brand-gold/5"
            : "border-brand-bg-dark hover:border-brand-gold/50"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
        />
        
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-4 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-text-muted">Enviando...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <FiUpload className="text-3xl text-text-muted" />
            <p className="text-sm text-text-secondary">
              Arraste imagens ou clique para selecionar
            </p>
            <p className="text-xs text-text-muted">
              PNG, JPG ou WEBP (máx 5MB, até {maxImages} imagens)
            </p>
          </div>
        )}
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {images.map((url, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={url}
                  alt={`Imagem ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <FiX size={14} />
              </button>
              {index === 0 && (
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-brand-gold text-white text-xs px-2 py-0.5 rounded-full">
                  Principal
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
import React, { useState, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import Image from 'next/image';

interface ImageUploadProps {
  onImageUpload: (imageUrl: string) => void;
  initialImageUrl?: string;
}

export function ImageUpload({ onImageUpload, initialImageUrl }: ImageUploadProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(initialImageUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supabase = createClient();

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('La taille du fichier ne doit pas dépasser 5 Mo');
      }

      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        throw new Error('Type de fichier non supporté. Utilisez JPEG, PNG, GIF ou WebP');
      }

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('Authentication error:', userError);
        throw new Error('Vous devez être connecté pour télécharger une image');
      }

      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Detailed logging before upload
      console.log('Uploading file:', {
        fileName,
        filePath,
        fileType: file.type,
        fileSize: file.size,
        userId: user.id
      });

      // Upload file
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('tools_images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error details:', {
          message: uploadError.message,
          details: uploadError
        });
        
        // More specific error handling
        if (uploadError.message.includes('violates row-level security policy')) {
          throw new Error('Vous n\'avez pas la permission de télécharger des images');
        }
        
        throw new Error(`Échec du téléchargement: ${uploadError.message}`);
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('tools_images')
        .getPublicUrl(filePath);

      if (!publicUrl) {
        throw new Error('Impossible de générer une URL publique pour l\'image');
      }

      // Verify the uploaded file exists
      const { data: listData, error: listError } = await supabase.storage
        .from('tools_images')
        .list(`${user.id}/`, {
          limit: 100,
          offset: 0,
        });

      if (listError) {
        console.error('Error listing files:', listError);
        throw new Error('Impossible de vérifier le téléchargement');
      }

      // Log all files in the directory for debugging
      console.log('Files in user directory:', listData.map(file => file.name));

      // Verify the specific file exists
      const uploadedFile = listData.find(file => file.name === fileName);
      
      if (!uploadedFile) {
        console.error('File not found:', {
          expectedFileName: fileName,
          existingFiles: listData.map(file => file.name)
        });
        throw new Error('Le fichier téléchargé est introuvable');
      }

      setImageUrl(publicUrl);
      onImageUpload(publicUrl);
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Une erreur inconnue est survenue lors du téléchargement';
      
      console.error('Détails complets de l\'erreur:', error);
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handlePasteImage = async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      for (const clipboardItem of clipboardItems) {
        for (const type of clipboardItem.types) {
          if (type.startsWith('image/')) {
            const blob = await clipboardItem.getType(type);
            const file = new File([blob], 'clipboard-image.png', { type: blob.type });
            handleFileUpload(file);
            return;
          }
        }
      }
      alert('Aucune image trouvée dans le presse-papiers');
    } catch (error) {
      console.error('Erreur lors du collage de l\'image:', error);
      alert('Impossible de coller l\'image');
    }
  };

  const handleRemoveImage = async () => {
    if (imageUrl) {
      try {
        const fileName = imageUrl.split('/').pop();
        await supabase.storage
          .from('tools_images')
          .remove([fileName!]);
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'image:', error);
      }
      
      setImageUrl(null);
      onImageUpload('');
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {imageUrl ? (
        <div className="relative">
          <Image 
            src={imageUrl} 
            alt="Uploaded tool" 
            width={300} 
            height={300} 
            className="rounded-lg object-cover"
          />
          <button 
            type="button"
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"
          >
            🗑️
          </button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center w-full">
          📷
          <p className="text-gray-600 mb-4">Aucune image téléchargée</p>
        </div>
      )}

      {error && (
        <div className="text-red-600 text-sm text-center w-full">
          {error}
        </div>
      )}

      <div className="flex space-x-4">
        <input 
          type="file" 
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileUpload(file);
          }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition disabled:opacity-50"
        >
          ⬆️
          <span>Télécharger</span>
        </button>
        <button
          type="button"
          onClick={handlePasteImage}
          disabled={isUploading}
          className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition disabled:opacity-50"
        >
          📋
          <span>Coller</span>
        </button>
      </div>
    </div>
  );
}

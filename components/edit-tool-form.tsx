"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/ui/image-upload";

interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  usage: string;
  image_url?: string;
}

export default function EditToolForm({ tool }: { tool: Tool }) {
  const [name, setName] = useState(tool.name);
  const [description, setDescription] = useState(tool.description || "");
  const [category, setCategory] = useState(tool.category || "");
  const [usage, setUsage] = useState(tool.usage || "");
  const [imageUrl, setImageUrl] = useState(tool.image_url || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert("Vous devez être connecté pour modifier un outil");
      setIsSubmitting(false);
      return;
    }

    const { data, error } = await supabase
      .from("tools")
      .update({
        name,
        description,
        category,
        usage,
        image_url: imageUrl,
      })
      .eq('id', tool.id)
      .select();

    if (error) {
      console.error("Erreur lors de la modification de l'outil:", error);
      alert("Impossible de modifier l'outil");
    } else {
      router.push("/dashboard");
    }

    setIsSubmitting(false);
  };

  const handleRemoveTool = async () => {
    const confirmDelete = confirm("Êtes-vous sûr de vouloir supprimer cet outil ?");
    
    if (confirmDelete) {
      setIsSubmitting(true);
      
      const { error } = await supabase
        .from("tools")
        .delete()
        .eq('id', tool.id);

      if (error) {
        console.error("Erreur lors de la suppression de l'outil:", error);
        alert("Impossible de supprimer l'outil");
      } else {
        router.push("/dashboard");
      }

      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Modifier l'outil</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="image">Image de l'outil</Label>
          <ImageUpload 
            onImageUpload={(url) => setImageUrl(url)}
            initialImageUrl={tool.image_url}
          />
        </div>

        <div>
          <Label htmlFor="name">Nom de l'outil</Label>
          <Input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Ex: Perceuse sans fil"
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Input
            type="text"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description détaillée de l'outil"
          />
        </div>

        <div>
          <Label htmlFor="category">Catégorie</Label>
          <Input
            type="text"
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Ex: Outils électriques"
          />
        </div>

        <div>
          <Label htmlFor="usage">Utilisation</Label>
          <Input
            type="text"
            id="usage"
            value={usage}
            onChange={(e) => setUsage(e.target.value)}
            placeholder="Ex: Bricolage, jardinage"
          />
        </div>

        <div className="flex space-x-4">
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? "Modification en cours..." : "Modifier l'outil"}
          </Button>
          
          <Button 
            type="button"
            variant="destructive"
            onClick={handleRemoveTool}
            disabled={isSubmitting}
            className="flex-1"
          >
            Supprimer l'outil
          </Button>
        </div>
      </form>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/ui/image-upload";

export default function AddToolForm() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [usage, setUsage] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert("Vous devez être connecté pour ajouter un outil");
      setIsSubmitting(false);
      return;
    }

    const { data, error } = await supabase
      .from("tools")
      .insert({
        name,
        description,
        category,
        usage,
        image_url: imageUrl,
        user_ref: user.id,
      })
      .select();

    if (error) {
      console.error("Erreur lors de l'ajout de l'outil:", error);
      alert("Impossible d'ajouter l'outil");
    } else {
      router.push("/dashboard");
    }

    setIsSubmitting(false);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Ajouter un nouvel outil</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="image">Image de l'outil</Label>
          <ImageUpload 
            onImageUpload={(url) => setImageUrl(url)}
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

        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? "Ajout en cours..." : "Ajouter l'outil"}
        </Button>
      </form>
    </div>
  );
}

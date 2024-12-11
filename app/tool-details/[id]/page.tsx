import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeftIcon, UserIcon } from "lucide-react";
import CurrentReservations from "@/components/current-reservations";

export default async function ToolDetailsPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const supabase = await createClient();

  // Resolve params promise
  const resolvedParams = await params;

  // Fetch the specific tool details
  const { data: tool, error } = await supabase
    .from('tools')
    .select('*, user_ref')
    .eq('id', resolvedParams.id)
    .single();

  if (error || !tool) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          Outil non trouvé : {error?.message || 'Aucun détail disponible'}
        </div>
      </div>
    );
  }

  // Fetch owner details from auth.users
  const { data: ownerData, error: ownerError } = await supabase.auth.admin.getUserById(tool.user_ref);

  // Format owner's username from email
  const ownerUsername = ownerData?.user?.email?.split('@')[0] || 'Utilisateur inconnu';

  return (
    <div className="container mx-auto px-4 py-8">
      <Link 
        href="/dashboard" 
        className="flex items-center text-gray-600 hover:text-gray-800 mb-6"
      >
        <ArrowLeftIcon className="mr-2" /> Retour au tableau de bord
      </Link>

      <div className="grid md:grid-cols-2 gap-8">
        {tool.image_url && (
          <div className="mb-6 md:mb-0">
            <Image 
              src={tool.image_url} 
              alt={tool.name} 
              width={500} 
              height={500} 
              className="w-full h-auto object-cover rounded-lg shadow-md"
            />
          </div>
        )}

        <div>
          <h1 className="text-3xl font-bold mb-4">{tool.name}</h1>
          
          <div className="space-y-4">
            <div>
              <h2 className="font-semibold text-lg">Description</h2>
              <p className="text-gray-600">{tool.description || 'Aucune description disponible'}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold">Catégorie</h3>
                <p className="text-gray-600">{tool.category || 'Non spécifiée'}</p>
              </div>

              <div>
                <h3 className="font-semibold">Disponibilité</h3>
                <span 
                  className={`font-medium ${
                    tool.availability ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {tool.availability ? 'Disponible' : 'Indisponible'}
                </span>
              </div>
            </div>

            <div>
              <h3 className="font-semibold">Utilisation</h3>
              <p className="text-gray-600">{tool.usage || 'Non spécifiée'}</p>
            </div>

            <div className="flex items-center space-x-2 text-gray-600">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold">Ajouté par</h3>
                <p>{ownerUsername}</p>
              </div>
            </div>

            <CurrentReservations toolId={resolvedParams.id} />

            <div className="mt-6">
              <Link 
                href={`/add-reservation?toolId=${tool.id}`} 
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Réserver cet outil
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

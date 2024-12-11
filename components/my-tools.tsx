import { createClient } from "@/utils/supabase/server";
import Image from "next/image";
import Link from "next/link";
import { PlusIcon, EditIcon } from "lucide-react";

export default async function MyTools() {
  const supabase = await createClient();

  // Récupérer les informations de l'utilisateur connecté
  const { data: { user } } = await supabase.auth.getUser();

  // Récupérer les outils de l'utilisateur depuis Supabase
  const { data: tools, error } = await supabase
    .from('tools')
    .select('*')
    //.eq('user_ref', user?.id);

  return (
    <div className="flex flex-col gap-2 items-start">



      <div className="w-full flex justify-between items-center">
        <h2 className="font-bold text-2xl mb-4">Mes Outils</h2>
        <Link 
          href="/add-tool" 
          className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          <PlusIcon className="mr-2" />
          Ajouter un Outil
        </Link>
      </div>
      
      {error && (
        <div className="text-red-500">
          Erreur lors de la récupération des outils : {error.message}
        </div>
      )}
      {tools && tools.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
          {tools.map((tool) => (
            <Link
              href={`/edit-tool/${tool.id}`}
              key={tool.id}
              className="group"
            >
              <div 
                className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer relative"
              >
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <EditIcon className="text-gray-500 hover:text-indigo-600" />
                </div>
                {tool.image_url && (
                  <Image 
                    src={tool.image_url} 
                    alt={tool.name} 
                    width={200} 
                    height={200} 
                    className="w-full h-48 object-cover rounded-t-lg mb-4"
                  />
                )}
                <h3 className="font-semibold text-lg">{tool.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{tool.description}</p>
                {/* <p className="text-sm text-gray-500">User Reference: {tool.user_ref}</p> */}
                <div className="flex flex-col justify-between items-start mt-2">
                  <span className="text-sm text-gray-500">
                    Catégorie : {tool.category}
                  </span>
                  <span 
                    className={`text-sm font-medium mt-1 ${
                      tool.availability ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {tool.availability ? 'Disponible' : 'Indisponible'}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">Aucun outil trouvé.</p>
      )}
    </div>
  );
}

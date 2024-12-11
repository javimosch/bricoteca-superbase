import { createClient } from "@/utils/supabase/server";
import Image from "next/image";
import Link from "next/link";

export default async function ExploreTools() {
  const supabase = await createClient();

  // Fetch all tools from Supabase
  const { data: tools, error } = await supabase
    .from('tools')
    .select('*');

  return (
    <div className="flex flex-col gap-2 items-start">
      <h2 className="font-bold text-2xl mb-4">Explore Tools</h2>
      {error && (
        <div className="text-red-500">
          Error fetching tools: {error.message}
        </div>
      )}
      {tools && tools.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
          {tools.map((tool) => (
            <Link
              href={`/tool-details/${tool.id}`}
              key={tool.id}
              className="group"
            >
              <div 
                className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer relative"
              >
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
                <div className="flex flex-col justify-between items-start mt-2">
                  <span className="text-sm text-gray-500">
                    Category: {tool.category}
                  </span>
                  <span 
                    className={`text-sm font-medium mt-1 ${
                      tool.availability ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {tool.availability ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No tools found.</p>
      )}
    </div>
  );
}

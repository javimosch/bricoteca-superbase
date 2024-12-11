import EditToolForm from "@/components/edit-tool-form";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function EditToolPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Resolve params promise
  const resolvedParams = await params;

  // Fetch the specific tool
  const { data: tool, error } = await supabase
    .from('tools')
    .select('*')
    .eq('id', resolvedParams.id)
    .single();

  if (error || !tool) {
    return redirect("/dashboard");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <EditToolForm tool={tool} />
    </div>
  );
}

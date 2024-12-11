import AddToolForm from "@/components/add-tool-form";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function AddToolPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <AddToolForm />
    </div>
  );
}

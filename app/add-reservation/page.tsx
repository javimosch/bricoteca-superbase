import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import AddReservationForm from "@/components/add-reservation-form";

export default async function AddReservationPage({
  searchParams,
}: {
  searchParams: Promise<{ 
    toolId?: string | string[] | undefined 
  }>;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Get the pre-selected tool ID from query parameters
  const params = await searchParams;
  const preSelectedToolId = params.toolId 
    ? String(params.toolId) 
    : undefined;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Nouvelle Réservation</h1>
      <AddReservationForm preSelectedToolId={preSelectedToolId} />
    </div>
  );
}

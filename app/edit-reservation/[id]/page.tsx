import EditReservationForm from "@/components/edit-reservation-form";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function EditReservationPage({ 
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

  // Fetch the specific reservation with tool details
  const { data: reservation, error } = await supabase
    .from('reservations')
    .select(`
      *,
      tools:tools (
        name,
        category
      )
    `)
    .eq('id', resolvedParams.id)
    .single();

  if (error || !reservation) {
    return redirect("/dashboard");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <EditReservationForm reservation={reservation} />
    </div>
  );
}

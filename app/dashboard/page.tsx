
import { createClient } from "@/utils/supabase/server";
import { InfoIcon } from "lucide-react";
import { redirect } from "next/navigation";
import Image from "next/image";
import MyTools from "@/components/my-tools";
import MyReservations from "@/components/my-reservations";
import ExploreTools from "@/components/explore-tools";
import CommunityMembers from "@/components/community-members";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <MyTools />
      <MyReservations />
      <ExploreTools />
      <CommunityMembers />
    </div>
  );
}

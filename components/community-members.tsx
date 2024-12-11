import { createClient } from "@/utils/supabase/server";
import { UserIcon } from "lucide-react";

export default async function CommunityMembers() {
  const supabase = await createClient();

  // Fetch current user to ensure authentication
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  if (!currentUser) {
    return null;
  }

  // Fetch users using auth method
  const { data: { users }, error } = await supabase.auth.admin.listUsers();

  // Sort users by created_at in descending order
  const sortedUsers = (users || [])
    .sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 100); // Limit to 100 users

  // Fetch tools count for each user
  const usersWithDetails = await Promise.all(
    sortedUsers.map(async (user) => {
      // Get tools count
      const { data: tools } = await supabase
        .from('tools')
        .select('id')
        .eq('user_ref', user.id);

      // Get active reservations count
      const { data: reservations } = await supabase
        .from('reservations')
        .select('id')
        .eq('user_id', user.id)
        .in('status', ['pending', 'confirmed']);

      return {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        toolsCount: tools?.length || 0,
        activeReservationsCount: reservations?.length || 0
      };
    })
  );

  if (error) {
    console.error('Error fetching community members:', error);
    return null;
  }

  const formatUsername = (email?: string) => {
    return email ? email.split('@')[0] : 'Utilisateur';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <div className="flex items-center mb-6">
        <UserIcon className="mr-3 text-indigo-600" />
        <h2 className="text-2xl font-bold text-gray-800">Membres de la Communauté</h2>
      </div>

      {usersWithDetails && usersWithDetails.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {usersWithDetails.map((user) => (
            <div 
              key={user.id} 
              className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
                  <UserIcon className="text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-800">
                    {formatUsername(user.email)}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Inscrit le {formatDate(user.created_at)}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-3 shadow-sm flex flex-col justify-between h-full">
                  <div className="text-sm font-medium text-gray-600 text-center">
                    Outils listés
                  </div>
                  <div className="text-xl font-bold text-indigo-600 text-center mt-1">
                    {user.toolsCount}
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm flex flex-col justify-between h-full">
                  <div className="text-sm font-medium text-gray-600 text-center">
                    Réservations actives
                  </div>
                  <div className="text-xl font-bold text-indigo-600 text-center mt-1">
                    {user.activeReservationsCount}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">Aucun membre trouvé</p>
      )}
    </div>
  );
}

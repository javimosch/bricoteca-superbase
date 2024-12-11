import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { PlusIcon } from "lucide-react";
import Image from "next/image";

export default async function MyReservations() {
  const supabase = await createClient();

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="text-red-500">
        Vous devez être connecté pour voir vos réservations.
      </div>
    );
  }

  // Custom sorting function to push canceled items to the end
  const statusOrder: Record<string, number> = {
    'pending': 1,
    'confirmed': 2,
    'cancelled': 3
  };

  // Custom sorting function to push canceled items to the end
  const sortReservations = (a: { status: string, reservation_start: string }, b: { status: string, reservation_start: string }) => {
    // Compare status first
    const statusComparison = (statusOrder[a.status] || 3) - (statusOrder[b.status] || 3);
    if (statusComparison !== 0) return statusComparison;

    // If statuses are the same, sort by reservation start date
    return new Date(a.reservation_start).getTime() - new Date(b.reservation_start).getTime();
  };

  // Récupérer les réservations de l'utilisateur depuis Supabase avec les détails des outils
  const { data: reservations, error } = await supabase
    .from('reservations')
    .select(`
      *,
      tools:tools (
        id,
        name,
        image_url,
        category
      )
    `)
    .eq('user_id', user.id)
    .order('reservation_start', { ascending: false });

  // Sort reservations after fetching
  const sortedReservations = reservations?.sort(sortReservations) || [];

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600';
      case 'confirmed':
        return 'text-green-600';
      case 'cancelled':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'confirmed':
        return 'Confirmé';
      case 'cancelled':
        return 'Annulé';
      default:
        return status;
    }
  };

  return (
    <div className="flex flex-col gap-2 items-start">
      <div className="w-full flex justify-between items-center">
        <h2 className="font-bold text-2xl mb-4">Mes Réservations</h2>
        <Link 
          href="/add-reservation" 
          className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          <PlusIcon className="mr-2" />
          Nouvelle Réservation
        </Link>
      </div>
      
      {error && (
        <div className="text-red-500">
          Erreur lors de la récupération des réservations : {error.message}
        </div>
      )}

      {sortedReservations && sortedReservations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
          {sortedReservations.map((reservation) => (
            <Link
              href={`/edit-reservation/${reservation.id}`}
              key={reservation.id}
              className="group"
            >
              <div className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                {reservation.tools.image_url && (
                  <Image 
                    src={reservation.tools.image_url} 
                    alt={reservation.tools.name} 
                    width={200} 
                    height={200} 
                    className="w-full h-48 object-cover rounded-t-lg mb-4"
                  />
                )}
                <h3 className="font-semibold text-lg">{reservation.tools.name}</h3>
                <div className="flex flex-col gap-1 mt-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Début:</span> {formatDate(reservation.reservation_start)}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Fin:</span> {formatDate(reservation.reservation_end)}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Catégorie:</span> {reservation.tools.category}
                  </p>
                  <span 
                    className={`text-sm font-medium mt-2 ${getStatusColor(reservation.status)}`}
                  >
                    {getStatusText(reservation.status)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">Aucune réservation trouvée.</p>
      )}
    </div>
  );
}

import { createClient } from "@/utils/supabase/server";

interface CurrentReservationsProps {
  toolId: string | null;
}

export default async function CurrentReservations({ toolId }: CurrentReservationsProps) {
  if (!toolId) return null;

  const supabase = await createClient();

  const { data: reservations } = await supabase
    .from('reservations')
    .select('*')
    .eq('tool_id', toolId)
    .in('status', ['pending', 'confirmed'])
    .order('reservation_start', { ascending: false });

  const formatReservationDate = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return `${start.toLocaleDateString('fr-FR')} - ${end.toLocaleDateString('fr-FR')}`;
  };

  if (!reservations?.length) {
    return (
      <div className="mt-4 bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-lg mb-2 text-gray-800">Réservations actuelles</h3>
        <p className="text-gray-500 italic">Aucune réservation actuelle</p>
      </div>
    );
  }

  return (
    <div className="mt-4 bg-gray-50 p-4 rounded-lg">
      <h3 className="font-semibold text-lg mb-2 text-gray-800">Réservations actuelles</h3>
      <ul className="space-y-2">
        {reservations.map((reservation) => (
          <li 
            key={reservation.id} 
            className="bg-white border rounded-md p-2 text-sm text-gray-700 shadow-sm"
          >
            {formatReservationDate(reservation.reservation_start, reservation.reservation_end)}
          </li>
        ))}
      </ul>
    </div>
  );
}

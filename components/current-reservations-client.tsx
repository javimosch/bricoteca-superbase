import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

interface CurrentReservationsClientProps {
  toolId: string | null;
}

interface Reservation {
  id: string;
  reservation_start: string;
  reservation_end: string;
}

export default function CurrentReservationsClient({ toolId }: CurrentReservationsClientProps) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function fetchReservations() {
      if (!toolId) {
        setReservations([]);
        return;
      }

      setLoading(true);
      const { data } = await supabase
        .from('reservations')
        .select('*')
        .eq('tool_id', toolId)
        .in('status', ['pending', 'confirmed'])
        .order('reservation_start', { ascending: false });

      setReservations(data || []);
      setLoading(false);
    }

    fetchReservations();
  }, [toolId]);

  const formatReservationDate = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return `${start.toLocaleDateString('fr-FR')} - ${end.toLocaleDateString('fr-FR')}`;
  };

  if (!toolId) return null;
  
  if (loading) {
    return (
      <div className="mt-4 bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-lg mb-2 text-gray-800">Réservations actuelles</h3>
        <p className="text-gray-500">Chargement...</p>
      </div>
    );
  }

  if (!reservations.length) {
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

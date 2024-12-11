"use client";

import { createClient } from "@/utils/supabase/client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Reservation {
  id: number;
  tool_id: number;
  reservation_start: string;
  reservation_end: string;
  status: string;
  tools: {
    name: string;
    category: string;
  };
}

export default function EditReservationForm({ reservation }: { reservation: Reservation }) {
  const [startDate, setStartDate] = useState(new Date(reservation.reservation_start).toISOString().slice(0, 16));
  const [endDate, setEndDate] = useState(new Date(reservation.reservation_end).toISOString().slice(0, 16));
  const [status, setStatus] = useState(reservation.status);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
      setError("La date de fin doit être postérieure à la date de début.");
      return;
    }

    try {
      // Vérifier les réservations existantes
      const { data: existingReservations } = await supabase
        .from('reservations')
        .select('*')
        .eq('tool_id', reservation.tool_id)
        .neq('id', reservation.id)
        .or(`reservation_start.lte.${end.toISOString()},reservation_end.gte.${start.toISOString()}`);

      if (existingReservations && existingReservations.length > 0) {
        setError("L'outil n'est pas disponible pour les dates sélectionnées.");
        return;
      }

      const { error: updateError } = await supabase
        .from('reservations')
        .update({
          reservation_start: start.toISOString(),
          reservation_end: end.toISOString(),
          status
        })
        .eq('id', reservation.id);

      if (updateError) throw updateError;

      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleCancel = async () => {
    if (!confirm("Êtes-vous sûr de vouloir annuler cette réservation ?")) return;

    try {
      const { error: updateError } = await supabase
        .from('reservations')
        .update({
          status: 'cancelled'
        })
        .eq('id', reservation.id);

      if (updateError) throw updateError;

      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Modifier la Réservation</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          {error}
        </div>
      )}

      <div className="mb-6">
        <h3 className="font-semibold text-lg">{reservation.tools.name}</h3>
        <p className="text-sm text-gray-600">Catégorie: {reservation.tools.category}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
            Date de début
          </label>
          <input
            type="datetime-local"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            min={new Date().toISOString().slice(0, 16)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>

        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
            Date de fin
          </label>
          <input
            type="datetime-local"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Statut
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          >
            <option value="pending">En attente</option>
            <option value="confirmed">Confirmé</option>
            <option value="cancelled">Annulé</option>
          </select>
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Mettre à jour
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Annuler la réservation
          </button>
        </div>
      </form>
    </div>
  );
}

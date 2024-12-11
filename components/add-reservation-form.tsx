"use client";

import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import CurrentReservationsClient from "./current-reservations-client";

interface Tool {
  id: number;
  name: string;
  category: string;
  availability: boolean;
}

interface AddReservationFormProps {
  preSelectedToolId?: string;
}

export default function AddReservationForm({ 
  preSelectedToolId 
}: AddReservationFormProps) {
  const [tools, setTools] = useState<Tool[]>([]);
  const [selectedTool, setSelectedTool] = useState(preSelectedToolId || "");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string } | null>(null);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      // Fetch tools
      const { data: toolsData, error: toolsError } = await supabase
        .from('tools')
        .select('*')
        .eq('availability', true);

      if (toolsError) {
        setError(toolsError.message);
      } else {
        setTools(toolsData || []);

        // If a pre-selected tool is provided, verify it exists in the list
        if (preSelectedToolId) {
          const toolExists = toolsData?.some(tool => tool.id.toString() === preSelectedToolId);
          if (!toolExists) {
            setError("L'outil sélectionné n'est pas disponible.");
            setSelectedTool("");
          }
        }
      }

      // Fetch current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setUser({ id: user.id });
      } else {
        // Redirect to sign-in if no user
        router.push('/sign-in');
      }

      setLoading(false);
    }

    fetchData();
  }, [router, preSelectedToolId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      setError("Vous devez être connecté pour réserver un outil.");
      return;
    }

    if (!selectedTool || !startDate || !endDate) {
      setError("Veuillez remplir tous les champs requis.");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
      setError("La date de fin doit être postérieure à la date de début.");
      return;
    }

    try {
      // Extract numeric ID from the selected tool
      const toolId = tools.find(tool => 
        tool.id === Number(selectedTool) || 
        tool.id.toString() === selectedTool
      )?.id;

      if (!toolId) {
        setError("Outil non valide. Veuillez sélectionner un outil.");
        return;
      }

      const checkAvailability = async (toolId: string, start: string, end: string) => {
        const startDate = new Date(start);
        const endDate = new Date(end);

        // Add 1 day margin
        const startWithMargin = new Date(startDate);
        startWithMargin.setDate(startWithMargin.getDate() - 1);
        const endWithMargin = new Date(endDate);
        endWithMargin.setDate(endWithMargin.getDate() + 1);

        const { data: existingReservations } = await supabase
          .from('reservations')
          .select('*')
          .eq('tool_id', toolId)
          .in('status', ['pending', 'confirmed'])
          .or(`reservation_start.lte.${endWithMargin.toISOString()},reservation_end.gte.${startWithMargin.toISOString()}`);

        // Check if there are any overlapping reservations
        const hasOverlap = existingReservations?.some(reservation => {
          const reservationStart = new Date(reservation.reservation_start);
          const reservationEnd = new Date(reservation.reservation_end);

          // Check if the reservations overlap with 1-day margin
          return !(
            endWithMargin < reservationStart ||  // New reservation ends before existing one starts
            startWithMargin > reservationEnd     // New reservation starts after existing one ends
          );
        });

        return !hasOverlap;
      };

      const isAvailable = await checkAvailability(String(toolId), startDate, endDate);
      if (!isAvailable) {
        setError("L'outil n'est pas disponible pour les dates sélectionnées.");
        return;
      }

      // Créer la réservation
      const { error: insertError } = await supabase
        .from('reservations')
        .insert({
          tool_id: toolId,
          user_id: user.id,
          reservation_start: start.toISOString(),
          reservation_end: end.toISOString(),
          status: 'pending'
        });

      if (insertError) {
        setError(`Erreur lors de la création de la réservation : ${insertError.message}`);
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      // Ensure we're converting the error to a meaningful string
      const errorMessage = err instanceof Error 
        ? err.message 
        : typeof err === 'object' && err !== null 
          ? JSON.stringify(err) 
          : String(err);
      
      setError(`Une erreur est survenue : ${errorMessage}`);
    }
  };

  // Utility function to format date for datetime-local input
  const formatDateForInput = (date: Date): string => {
    return date.toISOString().slice(0, 16);
  };

  // Utility function to round to nearest hour
  const roundToNearestHour = (date: Date): Date => {
    const roundedDate = new Date(date);
    roundedDate.setMinutes(0, 0, 0);
    return roundedDate;
  };

  // Function to set predefined date ranges
  const setPredefinedDateRange = (type: 'tomorrow' | 'remainingWeek' | 'nextWeekend' | 'nextWeek' | 'nextTwoWeeks') => {
    const now = new Date(2024, 11, 11, 0, 2, 12); // Using the provided current time
    
    let startDate: Date;
    let endDate: Date;

    switch (type) {
      case 'tomorrow':
        startDate = new Date(now);
        startDate.setDate(now.getDate() + 1);
        startDate.setHours(now.getHours() + 1, 0, 0, 0);
        
        endDate = new Date(startDate);
        endDate.setHours(23, 0, 0, 0);
        break;
      
      case 'remainingWeek':
        startDate = new Date(now);
        startDate.setHours(now.getHours() + 1, 0, 0, 0);
        
        endDate = new Date(now);
        endDate.setDate(now.getDate() + (7 - now.getDay()));
        endDate.setHours(23, 0, 0, 0);
        break;
      
      case 'nextWeekend':
        startDate = new Date(now);
        // Move to next Saturday
        startDate.setDate(now.getDate() + (6 - now.getDay() + 7) % 7);
        startDate.setHours(now.getHours() + 1, 0, 0, 0);
        
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 1);
        endDate.setHours(23, 0, 0, 0);
        break;
      
      case 'nextWeek':
        startDate = new Date(now);
        startDate.setDate(now.getDate() + (7 - now.getDay()));
        startDate.setHours(now.getHours() + 1, 0, 0, 0);
        
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 0, 0, 0);
        break;
      
      case 'nextTwoWeeks':
        startDate = new Date(now);
        startDate.setDate(now.getDate() + (7 - now.getDay()));
        startDate.setHours(now.getHours() + 1, 0, 0, 0);
        
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 13);
        endDate.setHours(23, 0, 0, 0);
        break;
    }

    // Ensure start and end dates are rounded to the nearest hour
    startDate = roundToNearestHour(startDate);
    endDate = roundToNearestHour(endDate);

    setStartDate(formatDateForInput(startDate));
    setEndDate(formatDateForInput(endDate));
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Nouvelle Réservation</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="mb-4">
          <label htmlFor="tool" className="block text-sm font-medium text-gray-700">
            Outil
          </label>
          <select
            id="tool"
            value={selectedTool}
            onChange={(e) => setSelectedTool(e.target.value)}
            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          >
            <option value="">Sélectionnez un outil</option>
            {tools.map((tool) => (
              <option key={tool.id} value={tool.id}>
                {tool.name}
              </option>
            ))}
          </select>
        </div>

        {selectedTool && <CurrentReservationsClient toolId={selectedTool} />}

        <div className="mb-4">
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
            min={startDate || new Date().toISOString().slice(0, 16)}
            required
            step={3600} // 1 hour
            pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>

        <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mb-4">
          <button
            type="button"
            onClick={() => setPredefinedDateRange('tomorrow')}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Demain
          </button>
          <button
            type="button"
            onClick={() => setPredefinedDateRange('remainingWeek')}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Fin de semaine
          </button>
          <button
            type="button"
            onClick={() => setPredefinedDateRange('nextWeekend')}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Prochain week-end
          </button>
          <button
            type="button"
            onClick={() => setPredefinedDateRange('nextWeek')}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Prochaine semaine
          </button>
          <button
            type="button"
            onClick={() => setPredefinedDateRange('nextTwoWeeks')}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Dans deux semaines
          </button>
        </div>

        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Réserver
        </button>
      </form>
    </div>
  );
}

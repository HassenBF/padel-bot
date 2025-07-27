import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Search, CheckCircle, XCircle, Loader, ExternalLink } from 'lucide-react';
import { apiService, ClubsResponse } from '../services/api';
import { FilterRequest, FilteredDayResult, ClubResults, ClubConfig } from '@padel-bot/shared';

const PadelAvailabilityChecker = () => {
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [timeRange, setTimeRange] = useState({ start: '18:00', end: '20:30' });
  const [weeksAhead, setWeeksAhead] = useState(2);
  const [includePriorWeeks, setIncludePriorWeeks] = useState(true);
  const [loading, setLoading] = useState(false);
  const [resultsByClub, setResultsByClub] = useState<Record<string, ClubResults>>({});
  const [totalSlots, setTotalSlots] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [clubs, setClubs] = useState<Record<string, ClubConfig & { key: string }>>({});
  const [clubsLoading, setClubsLoading] = useState(true);

  // Fetch clubs from API on component mount
  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const response = await apiService.getClubs();
        const clubsMap: Record<string, ClubConfig & { key: string }> = {};
        response.clubs.forEach(club => {
          clubsMap[club.key] = club;
        });
        setClubs(clubsMap);
      } catch (error) {
        console.error('Failed to fetch clubs:', error);
        setError('Failed to load clubs configuration');
      } finally {
        setClubsLoading(false);
      }
    };
    fetchClubs();
  }, []);

  // Generate booking URL based on club configuration
  const generateBookingUrl = (date: string, clubId: string) => {
    const club = clubs[clubId];
    if (!club) return '#';
    
    // Create booking params based on club data
    const params = new URLSearchParams({
      guid: `"${club.clubId}"`,
      from: 'sport',
      activitySelectedId: `"${club.activityId}"`,
      categoryId: '"3532fc97-018c-4f09-85c6-b10cd488f404"', // This is still hardcoded as it's not in backend
      selectedDate: date
    });
    return `${club.bookingUrl}?${params.toString()}`;
  };

  // Old hardcoded clubs for reference (will be removed)
  const oldClubs = {
    // Removed - now fetched from API
  };

  const daysOfWeek = [
    { value: 1, label: 'Lundi' },
    { value: 2, label: 'Mardi' },
    { value: 3, label: 'Mercredi' },
    { value: 4, label: 'Jeudi' },
    { value: 5, label: 'Vendredi' },
    { value: 6, label: 'Samedi' },
    { value: 0, label: 'Dimanche' }
  ];

  const toggleDay = (dayValue: number) => {
    setSelectedDays(prev => 
      prev.includes(dayValue) 
        ? prev.filter(d => d !== dayValue)
        : [...prev, dayValue]
    );
  };


  const searchAvailability = async () => {
    if (selectedDays.length === 0) {
      setError('Veuillez sélectionner au moins un jour');
      return;
    }

    setLoading(true);
    setError(null);
    setResultsByClub({});
    setTotalSlots(0);
    setHasSearched(true);

    try {
      const filterRequest: FilterRequest = {
        daysOfWeek: selectedDays,
        weeksAhead: weeksAhead,
        timeStart: timeRange.start,
        timeEnd: timeRange.end,
        includePriorWeeks: includePriorWeeks
      };

      const data = await apiService.checkFilteredAvailability(filterRequest);
      setResultsByClub(data.resultsByClub);
      setTotalSlots(data.totalSlots);
    } catch (err) {
      setError('Erreur lors de la vérification des disponibilités. Assurez-vous que le serveur backend est lancé.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (clubsLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-center gap-2">
            <Loader className="w-5 h-5 animate-spin" />
            <span>Loading clubs configuration...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-3">
          🎾 Vérificateur de Disponibilité Padel
        </h1>

        {/* Day Selection */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Sélectionner les jours
          </h2>
          <div className="grid grid-cols-4 gap-3">
            {daysOfWeek.map(day => (
              <button
                key={day.value}
                onClick={() => toggleDay(day.value)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  selectedDays.includes(day.value)
                    ? 'border-green-500 bg-green-50 text-green-700 font-semibold'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {day.label}
              </button>
            ))}
          </div>
        </div>

        {/* Time Range Selection */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Plage horaire
          </h2>
          <div className="flex gap-4 items-center">
            <div>
              <label className="block text-sm text-gray-600 mb-1">De</label>
              <input
                type="time"
                value={timeRange.start}
                onChange={(e) => setTimeRange(prev => ({ ...prev, start: e.target.value }))}
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">À</label>
              <input
                type="time"
                value={timeRange.end}
                onChange={(e) => setTimeRange(prev => ({ ...prev, end: e.target.value }))}
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Weeks Ahead Selection */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Nombre de semaines à vérifier</h2>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="1"
              max="4"
              value={weeksAhead}
              onChange={(e) => setWeeksAhead(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-lg font-medium w-20 text-center">
              {weeksAhead} {weeksAhead === 1 ? 'semaine' : 'semaines'}
            </span>
          </div>
          
          {/* Include Prior Weeks Checkbox */}
          <div className="mt-3">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={includePriorWeeks}
                onChange={(e) => setIncludePriorWeeks(e.target.checked)}
                className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
              />
              <span>
                Inclure toutes les semaines précédentes
                {weeksAhead > 1 && (
                  <span className="text-gray-500 ml-1">
                    ({includePriorWeeks 
                      ? `semaines 1 à ${weeksAhead}` 
                      : `semaine ${weeksAhead} uniquement`
                    })
                  </span>
                )}
              </span>
            </label>
          </div>
        </div>

        {/* Search Button */}
        <button
          onClick={searchAvailability}
          disabled={loading || selectedDays.length === 0}
          className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Recherche en cours...
            </>
          ) : (
            <>
              <Search className="w-5 h-5" />
              Rechercher les disponibilités
            </>
          )}
        </button>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
            <XCircle className="w-5 h-5" />
            {error}
          </div>
        )}
      </div>

      {/* Results */}
      {totalSlots > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-600" />
            Créneaux disponibles ({totalSlots} au total)
          </h2>
          
          {/* Search Summary */}
          <div className="mb-6 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
            <p>
              Recherche effectuée pour: {selectedDays.map(d => daysOfWeek.find(day => day.value === d)?.label).join(', ')} | 
              Horaires: {timeRange.start} - {timeRange.end} | 
              Période: {includePriorWeeks 
                ? `semaines 1 à ${weeksAhead}` 
                : `semaine ${weeksAhead} uniquement`
              }
            </p>
          </div>
          
          {/* Results by Club */}
          <div className="space-y-8">
            {Object.entries(resultsByClub).map(([clubId, clubResults]) => {
              const club = clubs[clubId];
              if (!club || clubResults.results.length === 0) return null;
              
              return (
                <div key={clubId} className="border-2 border-gray-200 rounded-lg p-4">
                  <h3 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">
                    🏟️ {club.name} ({clubResults.totalSlots} créneaux)
                  </h3>
                  
                  <div className="space-y-4">
                    {clubResults.results.map((result, index) => (
                      <div key={index} className="border-l-4 border-green-500 pl-4 py-2">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-lg capitalize">
                            {result.dayName} - {new Date(result.date).toLocaleDateString('fr-FR')}
                          </h4>
                          <a
                            href={generateBookingUrl(result.date, clubId)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Réserver
                          </a>
                        </div>
                        <ul className="mt-2 space-y-1">
                          {result.slots.map((slot, slotIndex) => (
                            <li key={slotIndex} className="text-gray-700 ml-4">
                              • {slot.fullInfo}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Days with No Slots */}
      {Object.values(resultsByClub).some(club => club.daysWithNoSlots.length > 0) && (
        <div className="bg-orange-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-orange-800">
            Jours vérifiés sans créneaux disponibles
          </h3>
          <div className="space-y-4">
            {Object.entries(resultsByClub).map(([clubId, clubResults]) => {
              const club = clubs[clubId];
              if (!club || clubResults.daysWithNoSlots.length === 0) return null;
              
              return (
                <div key={clubId}>
                  <h4 className="font-medium text-orange-800 mb-2">{club.name}:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 ml-4">
                    {clubResults.daysWithNoSlots.map((day, index) => (
                      <div key={index} className="text-sm text-orange-700 bg-orange-100 rounded p-2">
                        {day.dayName} - {new Date(day.date).toLocaleDateString('fr-FR')}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* No Results */}
      {totalSlots === 0 && !loading && !error && hasSearched && (
        <div className="bg-yellow-50 rounded-lg p-6 text-center">
          <XCircle className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
          <p className="text-yellow-800 font-semibold">Aucun créneau disponible</p>
          <p className="text-yellow-700 text-sm mt-2">
            Aucun créneau ne correspond à vos critères de recherche dans aucun des clubs. 
            Essayez d'élargir votre plage horaire ou de sélectionner plus de jours.
          </p>
        </div>
      )}

      {/* Initial State */}
      {!hasSearched && !loading && !error && (
        <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-600">
          <p>Utilisez les filtres ci-dessus pour rechercher des créneaux disponibles</p>
        </div>
      )}
    </div>
  );
};

export default PadelAvailabilityChecker;
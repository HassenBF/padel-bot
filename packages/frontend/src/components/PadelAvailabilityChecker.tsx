import React, { useState } from 'react';
import { Calendar, Clock, Search, CheckCircle, XCircle, Loader, ExternalLink } from 'lucide-react';
import { apiService } from '../services/api';
import { FilterRequest, FilteredDayResult, ClubResults, ClubConfig } from '@padel-bot/shared';

interface PadelAvailabilityCheckerProps {
  clubs: Record<string, ClubConfig & { key: string }>;
  clubsLoading: boolean;
  clubsError: string | null;
}

const PadelAvailabilityChecker: React.FC<PadelAvailabilityCheckerProps> = ({ clubs, clubsLoading, clubsError }) => {
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [timeRange, setTimeRange] = useState({ start: '18:00', end: '20:30' });
  const [weeksAhead, setWeeksAhead] = useState(2);
  const [includePriorWeeks, setIncludePriorWeeks] = useState(true);
  const [loading, setLoading] = useState(false);
  const [resultsByClub, setResultsByClub] = useState<Record<string, ClubResults>>({});
  const [totalSlots, setTotalSlots] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="card card-hover p-6 sm:p-8 animate-fade-in">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center animate-pulse">
                <Loader className="w-6 h-6 sm:w-8 sm:h-8 text-white animate-spin" />
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-lg sm:text-xl font-semibold text-court-800 mb-2">Chargement en cours</h3>
              <p className="text-sm sm:text-base text-court-600">Configuration des clubs...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (clubsError) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="card p-6 sm:p-8 animate-fade-in">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 bg-error-100 rounded-2xl flex items-center justify-center">
              <span className="text-2xl text-error-600">⚠️</span>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-error-800 mb-2">Erreur de configuration</h3>
              <p className="text-sm text-error-600">{clubsError}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-6 sm:space-y-8">
      {/* Search Form Card */}
      <div className="card card-hover p-6 sm:p-8 animate-fade-in">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold gradient-text mb-2 sm:mb-3">
            Configurez votre recherche
          </h2>
          <p className="text-sm sm:text-base text-court-600 max-w-2xl mx-auto px-2">
            Sélectionnez vos préférences pour trouver les créneaux de padel disponibles
          </p>
        </div>

        {/* Day Selection */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-court-800">Jours de la semaine</h3>
              <p className="text-xs sm:text-sm text-court-600">Sélectionnez les jours qui vous intéressent</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-3">
            {daysOfWeek.map(day => (
              <button
                key={day.value}
                onClick={() => toggleDay(day.value)}
                className={`day-pill min-h-[44px] touch-manipulation active:scale-95 ${
                  selectedDays.includes(day.value)
                    ? 'day-pill-active'
                    : 'day-pill-inactive'
                }`}
              >
                <span className="block text-xs sm:text-sm uppercase font-medium tracking-wide">
                  {day.label.slice(0, 3)}
                </span>
                <span className="block text-xs mt-0.5 opacity-75 hidden sm:block">
                  {day.label.slice(3)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Time Range Selection */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-secondary-500 to-secondary-600 rounded-xl flex items-center justify-center">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-court-800">Plage horaire</h3>
              <p className="text-xs sm:text-sm text-court-600">Définissez vos heures préférées</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-court-700">Heure de début</label>
              <input
                type="time"
                value={timeRange.start}
                onChange={(e) => setTimeRange(prev => ({ ...prev, start: e.target.value }))}
                className="input-field w-full min-h-[44px] text-base"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-court-700">Heure de fin</label>
              <input
                type="time"
                value={timeRange.end}
                onChange={(e) => setTimeRange(prev => ({ ...prev, end: e.target.value }))}
                className="input-field w-full min-h-[44px] text-base"
              />
            </div>
          </div>
        </div>

        {/* Weeks Ahead Selection */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-primary-400 to-primary-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xs sm:text-sm">📅</span>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-court-800">Période de recherche</h3>
              <p className="text-xs sm:text-sm text-court-600">Combien de semaines à l'avance?</p>
            </div>
          </div>
          
          <div className="bg-court-50 rounded-xl p-4 sm:p-6">
            <div className="flex items-center gap-4 sm:gap-6 mb-4">
              <div className="flex-1">
                <input
                  type="range"
                  min="1"
                  max="4"
                  value={weeksAhead}
                  onChange={(e) => setWeeksAhead(Number(e.target.value))}
                  className="w-full h-3 bg-court-200 rounded-lg appearance-none cursor-pointer slider touch-manipulation"
                />
                <div className="flex justify-between text-xs text-court-500 mt-1">
                  <span>1 sem</span>
                  <span>2 sem</span>
                  <span>3 sem</span>
                  <span>4 sem</span>
                </div>
              </div>
              <div className="bg-white rounded-xl px-3 sm:px-4 py-2 sm:py-3 border-2 border-primary-200">
                <span className="text-xl sm:text-2xl font-bold text-primary-600">
                  {weeksAhead}
                </span>
                <span className="text-xs sm:text-sm text-court-600 ml-1">
                  {weeksAhead === 1 ? 'sem.' : 'sem.'}
                </span>
              </div>
            </div>
            
            {/* Include Prior Weeks Checkbox */}
            <label className="flex items-start gap-3 cursor-pointer touch-manipulation">
              <div className="relative mt-0.5">
                <input
                  type="checkbox"
                  checked={includePriorWeeks}
                  onChange={(e) => setIncludePriorWeeks(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded border-2 transition-all ${
                  includePriorWeeks 
                    ? 'bg-primary-500 border-primary-500' 
                    : 'border-court-300 bg-white'
                }`}>
                  {includePriorWeeks && (
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white absolute top-0.5 left-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
              <div className="flex-1">
                <span className="text-sm font-medium text-court-800">
                  Inclure toutes les semaines précédentes
                </span>
                {weeksAhead > 1 && (
                  <p className="text-xs text-court-600 mt-1">
                    {includePriorWeeks 
                      ? `Rechercher dans les semaines 1 à ${weeksAhead}` 
                      : `Rechercher uniquement dans la semaine ${weeksAhead}`
                    }
                  </p>
                )}
              </div>
            </label>
          </div>
        </div>

        {/* Search Button */}
        <div className="text-center">
          <button
            onClick={searchAvailability}
            disabled={loading || selectedDays.length === 0}
            className={`btn-primary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto sm:min-w-[280px] min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none touch-manipulation ${
              loading ? 'animate-pulse' : ''
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2 sm:gap-3">
                <Loader className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
                <span>Recherche en cours...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 sm:gap-3">
                <Search className="w-5 h-5 sm:w-6 sm:h-6" />
                <span>Rechercher les disponibilités</span>
              </div>
            )}
          </button>
          
          {selectedDays.length === 0 && !loading && (
            <p className="text-xs sm:text-sm text-court-500 mt-3 animate-fade-in px-2">
              ⚠️ Veuillez sélectionner au moins un jour
            </p>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 bg-error-50 border-l-4 border-error-500 rounded-xl animate-slide-up">
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-error-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-error-800 mb-1">Erreur</h4>
                <p className="text-sm text-error-700">{error}</p>
              </div>
            </div>
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
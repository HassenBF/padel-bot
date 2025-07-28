import React, { useState, useEffect } from 'react';
import { X, ExternalLink, MapPin, Globe } from 'lucide-react';
import PadelAvailabilityChecker from './components/PadelAvailabilityChecker';
import { apiService, ClubsResponse } from './services/api';
import { ClubConfig } from '@padel-bot/shared';
import './App.css';

function App() {
  const [showClubsModal, setShowClubsModal] = useState(false);
  const [clubs, setClubs] = useState<Record<string, ClubConfig & { key: string }>>({});
  const [clubsLoading, setClubsLoading] = useState(true);
  const [clubsError, setClubsError] = useState<string | null>(null);

  // Fetch clubs from API on component mount
  useEffect(() => {
    const fetchClubs = async () => {
      try {
        setClubsLoading(true);
        setClubsError(null);
        const response = await apiService.getClubs();
        const clubsMap: Record<string, ClubConfig & { key: string }> = {};
        response.clubs.forEach(club => {
          clubsMap[club.key] = club;
        });
        setClubs(clubsMap);
      } catch (error) {
        console.error('Failed to fetch clubs:', error);
        setClubsError('Failed to load clubs configuration');
      } finally {
        setClubsLoading(false);
      }
    };
    fetchClubs();
  }, []);

  // Helper function to get club display data for modal
  const getClubDisplayData = (club: ClubConfig & { key: string }) => {
    // Generate location from club name or use a default
    const location = club.name.includes('Monte Carlo') ? 'Monaco' :
                    club.name.includes('Cap d\'Agde') ? 'Cap d\'Agde, France' :
                    club.name.includes('Antibes') ? 'Antibes, France' :
                    club.name.includes('Sophia') ? 'Sophia Antipolis, France' :
                    'France';
    
    // Generate appropriate icon based on club name
    const icon = club.name.includes('Monte Carlo') ? '🏖️' :
                club.name.includes('Cap d\'Agde') ? '🏟️' :
                club.name.includes('Antibes') ? '🌅' :
                club.name.includes('Sophia') ? '🏛️' :
                '🎾';
    
    // Generate features based on club type or use defaults
    const features = club.name.includes('Monte Carlo') ? ['Courts extérieurs', 'Vue mer', 'Restaurant'] :
                    club.name.includes('Cap d\'Agde') ? ['Courts couverts', 'Éclairage LED', 'Vestiaires'] :
                    club.name.includes('Antibes') ? ['École de padel', 'Tournois', 'Parking gratuit'] :
                    club.name.includes('Sophia') ? ['Multiple courts', 'Coaching pro', 'Spa'] :
                    ['Courts de padel', 'Réservation en ligne', 'Équipement moderne'];
    
    return {
      ...club,
      location,
      icon,
      features,
      description: `Club de padel moderne situé à ${location}`,
      website: club.bookingUrl // Use bookingUrl as website for now
    };
  };

  // Handle escape key to close modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showClubsModal) {
        setShowClubsModal(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showClubsModal]);

  return (
    <div className="min-h-screen">
      {/* Hero Header */}
      <header className="relative overflow-hidden">
        {/* Background gradient with animated elements */}
        <div 
          className="absolute inset-0" 
          style={{background: 'linear-gradient(263deg, #0078FA -.28%, #004794 100%)'}}
        ></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4gIDxnIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+ICAgIDxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+ICAgICAgPGNpcmNsZSBjeD0iMzYiIGN5PSIxOCIgcj0iMS41Ii8+ICAgICAgPGNpcmNsZSBjeD0iNDQiIGN5PSIxMiIgcj0iMS41Ii8+ICAgICAgPGNpcmNsZSBjeD0iNiIgY3k9IjM2IiByPSIxLjUiLz4gICAgICA8Y2lyY2xlIGN4PSIyMCIgY3k9IjQyIiByPSIxLjUiLz4gICAgPC9nPiAgPC9nPjwvc3ZnPg==')] opacity-30"></div>
        
        <div className="relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-16">
            <div className="text-center">
              {/* Logo/Icon with animation - smaller on mobile */}
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-sm rounded-2xl sm:rounded-3xl mb-4 sm:mb-6 animate-float">
                <span className="text-2xl sm:text-4xl">🎾</span>
              </div>
              
              {/* Title - better mobile scaling */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 sm:mb-4">
                <span className="block">Padel Bot</span>
                <span className="block text-xl sm:text-2xl md:text-3xl lg:text-4xl font-medium text-primary-100 mt-1 sm:mt-2">
                  Trouvez vos créneaux parfaits
                </span>
              </h1>
              
              {/* Subtitle - improved mobile readability */}
              <p className="text-base sm:text-lg md:text-xl text-primary-100 max-w-2xl mx-auto mb-6 sm:mb-8 leading-relaxed px-2">
                Recherchez instantanément les disponibilités de padel dans tous vos clubs préférés. 
                Simple, rapide et efficace.
              </p>
              
              {/* Stats - mobile-optimized layout */}
              <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-8 text-center max-w-md sm:max-w-none mx-auto">
                <button
                  onClick={() => setShowClubsModal(true)}
                  className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4 hover:bg-white/20 transition-all duration-200 cursor-pointer transform hover:scale-105 hover:shadow-lg active:scale-95 touch-manipulation"
                >
                  <div className="text-2xl font-bold text-white">
                    {clubsLoading ? '...' : `${Object.keys(clubs).length}+`}
                  </div>
                  <div className="text-sm text-primary-100">Clubs</div>
                </button>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4">
                  <div className="text-2xl font-bold text-white">⚡</div>
                  <div className="text-sm text-primary-100">Temps Réel</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative pt-4 sm:pt-8">
        <PadelAvailabilityChecker 
          clubs={clubs}
          clubsLoading={clubsLoading}
          clubsError={clubsError}
        />
      </main>

      {/* Footer */}
      <footer className="bg-court-900 text-court-300 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center mb-4">
            <span className="text-2xl mr-3">🎾</span>
            <span className="text-xl font-semibold text-white">Padel Bot</span>
          </div>
          <p className="text-sm">
            Développé avec ❤️ pour les passionnés de padel
          </p>
          <p className="text-xs mt-2 text-court-400">
            © 2024 Padel Bot. Tous droits réservés.
          </p>
        </div>
      </footer>

      {/* Clubs Modal */}
      {showClubsModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setShowClubsModal(false)}
          ></div>
          
          {/* Modal Content */}
          <div className="relative min-h-screen flex items-center justify-center p-2 sm:p-4">
            <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-6xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden animate-fade-in">
              {/* Header */}
              <div 
                className="px-4 sm:px-8 py-4 sm:py-6 relative"
                style={{background: 'linear-gradient(263deg, #0078FA -.28%, #004794 100%)'}}
              >
                <button
                  onClick={() => setShowClubsModal(false)}
                  className="absolute top-3 sm:top-4 right-3 sm:right-4 w-10 h-10 sm:w-12 sm:h-12 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 touch-manipulation"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </button>
                
                <div className="text-center pr-12 sm:pr-0">
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1 sm:mb-2">🏟️ Nos Clubs Partenaires</h2>
                  <p className="text-sm sm:text-base text-primary-100">Découvrez tous les clubs où vous pouvez réserver</p>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-[calc(95vh-100px)] sm:max-h-[calc(90vh-120px)]">
                {clubsLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center animate-pulse">
                      <span className="text-2xl">🏟️</span>
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-court-800 mb-2">Chargement des clubs...</h3>
                      <p className="text-sm text-court-600">Récupération des informations</p>
                    </div>
                  </div>
                ) : clubsError ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-4">
                    <div className="w-12 h-12 bg-error-100 rounded-2xl flex items-center justify-center">
                      <span className="text-2xl text-error-600">⚠️</span>
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-error-800 mb-2">Erreur de chargement</h3>
                      <p className="text-sm text-error-600">{clubsError}</p>
                    </div>
                  </div>
                ) : Object.keys(clubs).length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-4">
                    <div className="w-12 h-12 bg-warning-100 rounded-2xl flex items-center justify-center">
                      <span className="text-2xl text-warning-600">🏟️</span>
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-warning-800 mb-2">Aucun club disponible</h3>
                      <p className="text-sm text-warning-600">Les clubs ne sont pas encore configurés</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {Object.values(clubs).map((club) => {
                      const displayData = getClubDisplayData(club);
                      return (
                        <div key={club.id} className="card card-hover p-4 sm:p-6 animate-slide-up">
                          <div className="flex items-start gap-3 sm:gap-4">
                            <div className="text-2xl sm:text-3xl lg:text-4xl">{displayData.icon}</div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg sm:text-xl font-bold text-court-800 mb-1 sm:mb-2">{displayData.name}</h3>
                              <p className="text-sm sm:text-base text-court-600 mb-2 sm:mb-3">{displayData.description}</p>
                              
                              <div className="flex items-center gap-2 text-xs sm:text-sm text-court-500 mb-3 sm:mb-4">
                                <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                <span className="truncate">{displayData.location}</span>
                              </div>

                              <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4">
                                {displayData.features.map((feature, index) => (
                                  <span key={index} className="px-2 sm:px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium">
                                    {feature}
                                  </span>
                                ))}
                              </div>

                              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                                <a
                                  href={displayData.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn-secondary flex items-center justify-center gap-2 text-xs sm:text-sm px-3 sm:px-4 py-2 min-h-[44px] touch-manipulation"
                                >
                                  <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
                                  Site web
                                </a>
                                <a
                                  href={displayData.bookingUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn-primary flex items-center justify-center gap-2 text-xs sm:text-sm px-3 sm:px-4 py-2 min-h-[44px] touch-manipulation"
                                >
                                  <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                                  Réserver
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
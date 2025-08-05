import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ProfileDetail from './profile/ProfileDetail';
import './App.css';

function App() {
  // Search input state
  const [searchTerm, setSearchTerm] = useState('');
  // List of profiles from search results
  const [profiles, setProfiles] = useState([]);
  // Global loading state for search requests
  const [isLoading, setIsLoading] = useState(false);
  // Error message state
  const [error, setError] = useState(null);
  // Selected profile for detail view
  const [selectedProfile, setSelectedProfile] = useState(null);
  // Loading state per profile when fetching details
  const [loadingProfiles, setLoadingProfiles] = useState({}); // { username: true/false }
  // Current pagination page
  const [currentPage, setCurrentPage] = useState(1);
  // Number of profiles per page
  const itemsPerPage = 10;

  // Cache for profile details to avoid repeated requests
  const profileCache = useRef({});
  // Ref for debounce timer in search input
  const debounceTimer = useRef(null);

  // Debounce effect: triggers search 500ms after user stops typing
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(() => {
      if (searchTerm.trim().length >= 3) {
        executeSearch(searchTerm);
      } else if (searchTerm.trim().length < 3 && profiles.length > 0) {
        // Clear profiles and reset page if search term is too short
        setProfiles([]);
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(debounceTimer.current);
  }, [searchTerm]);

  // Perform search request with query
  const executeSearch = async (query) => {
    setIsLoading(true);
    setError(null);
    setCurrentPage(1);

    try {
      const response = await axios.post('http://localhost:4000/api/search', { query });
      setProfiles(response.data);
    } catch (err) {
      setError('Could not fetch profiles. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch detailed profile data when profile is clicked
  const handleProfileClick = async (username) => {
    // Use cached data if available
    if (profileCache.current[username]) {
      setSelectedProfile(profileCache.current[username]);
      return;
    }

    // Set loading state only for clicked profile
    setLoadingProfiles((prev) => ({ ...prev, [username]: true }));
    setSelectedProfile(null);

    try {
      const response = await axios.get(`http://localhost:4000/api/profile/${username}`);
      profileCache.current[username] = response.data;
      setSelectedProfile(response.data);
    } catch {
      setError('Could not load profile details. Please try again.');
    } finally {
      setLoadingProfiles((prev) => ({ ...prev, [username]: false }));
    }
  };

  // Close profile detail modal
  const closeDetail = () => {
    setSelectedProfile(null);
  };

  // Calculate current page slice of profiles
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProfiles = profiles.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(profiles.length / itemsPerPage);

  // Pagination controls
  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Torre Profile Search</h1>
      </header>

      <main>
        {/* Search input form */}
        <form onSubmit={(e) => e.preventDefault()}>
          <input
            type="text"
            placeholder="e.g., developer, designer, sales..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {/* Disabled button since search triggers automatically */}
          <button
            type="button"
            disabled
            style={{ cursor: 'default', opacity: 1, backgroundColor: '#2e7d32', color: '#c8e6c9' }}
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </form>

        <div className="results-container">
          {/* Display error message */}
          {error && <p className="error-message">{error}</p>}

          {/* Display global loading message */}
          {isLoading && <p>Searching profiles...</p>}

          {/* Render profile list with loading indicator on individual profile */}
          {!isLoading && currentProfiles.length > 0 && (
            <>
              <div className="profile-list">
                {currentProfiles.map((profile, index) => {
                  const isLoadingThisProfile = !!loadingProfiles[profile.username];
                  return (
                    <div
                      key={index}
                      className="profile-card"
                      onClick={() => !isLoadingThisProfile && handleProfileClick(profile.username)}
                      style={{ position: 'relative', cursor: isLoadingThisProfile ? 'default' : 'pointer' }}
                    >
                      {/* Overlay spinner on profile while loading details */}
                      {isLoadingThisProfile && (
                        <div className="loading-spinner-overlay">
                          <div className="loading-spinner"></div>
                        </div>
                      )}
                      {/* Show profile image and info only if not loading */}
                      {!isLoadingThisProfile && profile.picture && (
                        <img
                          src={profile.picture}
                          alt={profile.name}
                          className="profile-picture"
                        />
                      )}
                      {!isLoadingThisProfile && (
                        <div className="profile-info">
                          <h3>{profile.name}</h3>
                          <p>{profile.headline}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="pagination-controls">
                  <button onClick={goToPrevPage} disabled={currentPage === 1}>
                    Previous
                  </button>
                  <span>Page {currentPage} of {totalPages}</span>
                  <button onClick={goToNextPage} disabled={currentPage === totalPages}>
                    Next
                  </button>
                </div>
              )}
            </>
          )}

          {/* Messages for no results or short search term */}
          {!isLoading && !error && profiles.length === 0 && searchTerm.trim().length >= 3 && (
            <p>No profiles found.</p>
          )}
          {!isLoading && !error && profiles.length === 0 && searchTerm.trim().length > 0 && searchTerm.trim().length < 3 && (
            <p>Enter at least 3 characters to search.</p>
          )}
        </div>
      </main>

      {/* Show selected profile details modal */}
      {selectedProfile && (
        <ProfileDetail profile={selectedProfile} onClose={closeDetail} />
      )}
    </div>
  );
}

export default App;

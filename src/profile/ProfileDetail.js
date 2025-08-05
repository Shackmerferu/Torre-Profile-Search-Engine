import React, { useState, useEffect } from 'react';
import './ProfileDetail.css';

const ProfileDetail = ({ profile, onClose }) => {
  // State for current page in strengths pagination
  const [currentStrengthPage, setCurrentStrengthPage] = useState(1);
  const strengthsPerPage = 12;

  // State for search input to filter strengths and filtered results list
  const [strengthSearchTerm, setStrengthSearchTerm] = useState('');
  const [filteredStrengths, setFilteredStrengths] = useState([]);

  // Reset filtered strengths and pagination when profile changes
  useEffect(() => {
    if (profile && profile.strengths) {
      setFilteredStrengths(profile.strengths);
    } else {
      setFilteredStrengths([]);
    }
    setStrengthSearchTerm('');
    setCurrentStrengthPage(1);
  }, [profile]);

  // Debounce filtering of strengths based on search term and profile strengths
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const trimmedSearchTerm = strengthSearchTerm.trim();
      const baseStrengths = profile?.strengths || [];

      if (trimmedSearchTerm.length >= 3) {
        // Split input by commas, trim spaces, filter empty terms
        const searchTermsArray = trimmedSearchTerm
          .toLowerCase()
          .split(',')
          .map(term => term.trim())
          .filter(term => term.length > 0);

        // Filter strengths containing any of the search terms (case-insensitive)
        const newFilteredStrengths = baseStrengths.filter(strength =>
          searchTermsArray.some(term => strength.name.toLowerCase().includes(term))
        );
        setFilteredStrengths(newFilteredStrengths);
        setCurrentStrengthPage(1);
      } else {
        setFilteredStrengths(baseStrengths);
        setCurrentStrengthPage(1);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [strengthSearchTerm, profile?.strengths]);

  // Return null if no profile is provided
  if (!profile) return null;

  // Format date string to readable format or return "Present" if null
  const formatDate = (dateString) => {
    if (!dateString) return 'Present';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Calculate slice indices for current strengths page
  const indexOfLastStrength = currentStrengthPage * strengthsPerPage;
  const indexOfFirstStrength = indexOfLastStrength - strengthsPerPage;
  const currentStrengthsToDisplay = filteredStrengths.slice(indexOfFirstStrength, indexOfLastStrength);
  const totalStrengthPages = Math.ceil((filteredStrengths.length || 0) / strengthsPerPage);

  // Pagination controls for strengths
  const goToNextStrengthPage = () => {
    if (currentStrengthPage < totalStrengthPages) {
      setCurrentStrengthPage(currentStrengthPage + 1);
    }
  };

  const goToPrevStrengthPage = () => {
    if (currentStrengthPage > 1) {
      setCurrentStrengthPage(currentStrengthPage - 1);
    }
  };

  // Helper: group strengths in pairs for two-column table display
  const groupStrengthsInPairs = (strengths) => {
    const pairs = [];
    for (let i = 0; i < strengths.length; i += 2) {
      pairs.push([strengths[i], strengths[i + 1]]);
    }
    return pairs;
  };

  const strengthPairs = groupStrengthsInPairs(currentStrengthsToDisplay);

  // Extract LinkedIn URL if exists in profile links
  const linkedInLink = profile.person?.links?.find(link => link.name === 'linkedin')?.address;

  return (
    <div className="profile-detail-overlay">
      <div className="profile-detail-card">
        {/* Close button triggers onClose prop */}
        <button className="close-button" onClick={onClose}>&times;</button>

        <div className="detail-header">
          {/* Profile picture */}
          {profile.person?.picture && <img src={profile.person.picture} alt={profile.person.name} />}
          <div>
            {/* Name and headline */}
            <h2>{profile.person?.name}</h2>
            <p className="headline">{profile.person?.professionalHeadline}</p>

            {/* Contact buttons: email, Torre profile, LinkedIn */}
            <div className="contact-buttons-container">
              {profile.contact?.publicEmail && (
                <a href={`mailto:${profile.contact.publicEmail}`} className="contact-button email-button">
                  Email
                </a>
              )}
              {profile.person?.publicId && (
                <a
                  href={`https://torre.ai/${profile.person.publicId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-button torre-button"
                >
                  View profile on Torre.ai
                </a>
              )}
              {linkedInLink && (
                <a
                  href={linkedInLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-button linkedin-button"
                >
                  LinkedIn
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h3>Strengths / Skills</h3>

          {/* Search input to filter strengths */}
          <div className="strength-search-container">
            <input
              type="text"
              placeholder="Search skills (e.g., React, Node.js, sales)"
              value={strengthSearchTerm}
              onChange={(e) => setStrengthSearchTerm(e.target.value)}
            />
          </div>

          {/* Strengths list with pagination */}
          {profile.strengths && profile.strengths.length > 0 ? (
            <>
              {filteredStrengths.length > 0 ? (
                <table className="strengths-table">
                  <tbody>
                    {strengthPairs.map((pair, rowIndex) => (
                      <tr key={rowIndex}>
                        {pair.map((strength, colIndex) => (
                          <td key={colIndex}>
                            {strength ? (
                              <>
                                <strong>{strength.name}</strong> - Level: {strength.proficiency}
                              </>
                            ) : null}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No skills matched your search.</p>
              )}

              {/* Pagination controls for strengths */}
              {totalStrengthPages > 1 && (
                <div className="pagination-controls">
                  <button onClick={goToPrevStrengthPage} disabled={currentStrengthPage === 1}>
                    Previous
                  </button>
                  <span>Page {currentStrengthPage} of {totalStrengthPages}</span>
                  <button onClick={goToNextStrengthPage} disabled={currentStrengthPage === totalStrengthPages}>
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <p>No strengths or skills listed for this profile.</p>
          )}
        </div>

        <div className="detail-section">
          <h3>Experience</h3>

          {/* List work experiences */}
          {profile.experiences && profile.experiences.length > 0 ? (
            <ul>
              {profile.experiences.map((exp, index) => (
                <li key={index}>
                  <h4>{exp.name}</h4>
                  <p>
                    {exp.organizations?.[0]?.name} | {exp.remote ? 'Remote' : (exp.organizations?.[0]?.location || 'Location not specified')}
                  </p>
                  <p>
                    {formatDate(exp.fromMonth)} - {formatDate(exp.toMonth)}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No work experience listed.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileDetail;

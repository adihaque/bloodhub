import React, { useState, useEffect } from 'react';
import LocationFilter from './LocationFilter';
import './DonorsList.css';
import { db } from '@/app/firebase/config';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

const DonorsList = () => {
  const [donors, setDonors] = useState([]);
  const [filteredDonors, setFilteredDonors] = useState([]);
  const [locationFilters, setLocationFilters] = useState({
    division: '',
    district: '',
    subDistrict: ''
  });
  const [bloodTypeFilter, setBloodTypeFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch donors from Firestore
  useEffect(() => {
    const fetchDonors = async () => {
      try {
        setLoading(true);
        const usersRef = collection(db, 'users');
        const q = query(
          usersRef,
          where('role', '==', 'donor'),
          orderBy('createdAt', 'desc'),
          limit(50)
        );
        
        const querySnapshot = await getDocs(q);
        const donorsData = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          
          // Parse location string into structured format
          const parseLocation = (locationStr) => {
            if (!locationStr) return { division: '', district: '', subDistrict: '' };
            const parts = locationStr.split(', ');
            return {
              subDistrict: parts[0] || '',
              district: parts[1] || '',
              division: parts[2] || ''
            };
          };
          
          return {
            id: doc.id,
            name: data.fullName || 'Anonymous',
            bloodType: data.bloodGroup || 'Unknown',
            location: parseLocation(data.location),
            lastDonation: data.lastDonation?.toDate ? data.lastDonation.toDate().toISOString().split('T')[0] : '2024-01-01',
            phone: data.whatsappNumber || data.phone || 'Not provided',
            email: data.email || 'Not provided',
            available: true, // Could be determined by lastDonation date
            distance: 'Calculating...' // Would calculate based on coordinates
          };
        });
        
        setDonors(donorsData);
        setFilteredDonors(donorsData);
      } catch (error) {
        console.error('Error fetching donors:', error);
        setDonors([]);
        setFilteredDonors([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDonors();
  }, []);

  // Apply filters when they change
  useEffect(() => {
    let filtered = [...donors];

    // Apply location filters with case-insensitive matching
    if (locationFilters.division) {
      filtered = filtered.filter(donor => 
        donor.location.division.toLowerCase().includes(locationFilters.division.toLowerCase())
      );
    }
    if (locationFilters.district) {
      filtered = filtered.filter(donor => 
        donor.location.district.toLowerCase().includes(locationFilters.district.toLowerCase())
      );
    }
    if (locationFilters.subDistrict) {
      filtered = filtered.filter(donor => 
        donor.location.subDistrict.toLowerCase().includes(locationFilters.subDistrict.toLowerCase())
      );
    }

    // Apply blood type filter
    if (bloodTypeFilter) {
      filtered = filtered.filter(donor => 
        donor.bloodType === bloodTypeFilter
      );
    }

    setFilteredDonors(filtered);
  }, [donors, locationFilters, bloodTypeFilter]);

  const handleLocationFilterChange = (filters) => {
    setLocationFilters(filters);
  };

  const handleBloodTypeFilterChange = (e) => {
    setBloodTypeFilter(e.target.value);
  };

  const clearAllFilters = () => {
    setLocationFilters({ division: '', district: '', subDistrict: '' });
    setBloodTypeFilter('');
  };

  const getLastDonationStatus = (lastDonation) => {
    const lastDonationDate = new Date(lastDonation);
    const today = new Date();
    const daysSince = Math.floor((today - lastDonationDate) / (1000 * 60 * 60 * 24));
    
    if (daysSince < 56) { // Less than 8 weeks
      return { status: 'recent', text: 'Recently donated', color: '#e74c3c' };
    } else if (daysSince < 112) { // Less than 16 weeks
      return { status: 'available', text: 'Available soon', color: '#f39c12' };
    } else {
      return { status: 'ready', text: 'Ready to donate', color: '#27ae60' };
    }
  };

  const formatDistance = (distance) => {
    const num = parseFloat(distance);
    if (num < 1) {
      return `${Math.round(num * 1000)}m`;
    } else if (num < 10) {
      return `${num.toFixed(1)} km`;
    } else {
      return `${Math.round(num)} km`;
    }
  };

  if (loading) {
    return (
      <div className="donors-loading">
        <div className="loading-spinner"></div>
        <p>Loading available donors...</p>
      </div>
    );
  }

  return (
    <div className="donors-list-container">
      <div className="donors-header">
        <h1>Available Blood Donors</h1>
        <p>Find and connect with blood donors in your area</p>
      </div>

      <div className="filters-section">
        <div className="filters-header">
          <h3>Filter Donors</h3>
          <button 
            className="clear-all-filters-btn"
            onClick={clearAllFilters}
            disabled={!locationFilters.division && !bloodTypeFilter}
          >
            Clear All Filters
          </button>
        </div>

        <div className="filters-content">
          <LocationFilter
            title="Location Filter"
            onFilterChange={handleLocationFilterChange}
            initialFilters={locationFilters}
            className="donors-location-filter"
          />

          <div className="blood-type-filter">
            <label htmlFor="bloodTypeFilter">Blood Type</label>
            <select
              id="bloodTypeFilter"
              value={bloodTypeFilter}
              onChange={handleBloodTypeFilterChange}
            >
              <option value="">All Blood Types</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>
        </div>

        <div className="filter-summary">
          <span className="results-count">
            {filteredDonors.length} donor{filteredDonors.length !== 1 ? 's' : ''} found
          </span>
          {(locationFilters.division || bloodTypeFilter) && (
            <span className="active-filters-count">
              with active filters
            </span>
          )}
        </div>
      </div>

      <div className="donors-grid">
        {filteredDonors.length === 0 ? (
          <div className="no-donors">
            <div className="no-donors-icon">🩸</div>
            <h3>No donors found</h3>
            <p>Try adjusting your filters or expanding your search area</p>
            <button className="reset-filters-btn" onClick={clearAllFilters}>
              Reset Filters
            </button>
          </div>
        ) : (
          filteredDonors.map(donor => {
            const donationStatus = getLastDonationStatus(donor.lastDonation);
            
            return (
              <div key={donor.id} className={`donor-card ${donor.available ? 'available' : 'unavailable'}`}>
                <div className="donor-header">
                  <div className="donor-avatar">
                    {donor.name.charAt(0)}
                  </div>
                  <div className="donor-info">
                    <h3 className="donor-name">{donor.name}</h3>
                    <div className="donor-location">
                      📍 {donor.location.subDistrict}, {donor.location.district}
                    </div>
                  </div>
                  <div className="donor-status">
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: donationStatus.color }}
                    >
                      {donationStatus.text}
                    </span>
                  </div>
                </div>

                <div className="donor-details">
                  <div className="detail-row">
                    <span className="detail-label">Blood Type:</span>
                    <span className="detail-value blood-type">{donor.bloodType}</span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="detail-label">Distance:</span>
                    <span className="detail-value">{formatDistance(donor.distance)}</span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="detail-label">Last Donation:</span>
                    <span className="detail-value">
                      {new Date(donor.lastDonation).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="donor-actions">
                  <button className="contact-btn primary">
                    📞 Contact
                  </button>
                  <button className="contact-btn secondary">
                    📧 Email
                  </button>
                  <button className="view-profile-btn">
                    👤 View Profile
                  </button>
                </div>

                {!donor.available && (
                  <div className="unavailable-notice">
                    ⚠️ This donor is currently unavailable
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {filteredDonors.length > 0 && (
        <div className="donors-footer">
          <p>
            Showing {filteredDonors.length} of {donors.length} total donors
          </p>
          <button className="load-more-btn">
            Load More Donors
          </button>
        </div>
      )}
    </div>
  );
};

export default DonorsList;

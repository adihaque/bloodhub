import React, { useState, useEffect } from 'react';
import LocationFilter from './LocationFilter';
import './BloodRequestsList.css';

const BloodRequestsList = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [locationFilters, setLocationFilters] = useState({
    division: '',
    district: '',
    subDistrict: ''
  });
  const [bloodTypeFilter, setBloodTypeFilter] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Mock data - in real app, this would come from API
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockRequests = [
        {
          id: 1,
          patientName: 'Rahima Begum',
          bloodType: 'A+',
          units: 2,
          urgency: 'emergency',
          hospital: 'Dhaka Medical College Hospital',
          location: {
            division: 'Dhaka Division',
            district: 'Dhaka',
            subDistrict: 'Ramna'
          },
          contactPerson: 'Dr. Ahmed Khan',
          contactPhone: '+880 1712-345678',
          reason: 'Emergency surgery due to accident',
          requiredDate: '2024-01-25',
          requestDate: '2024-01-24',
          status: 'pending',
          additionalNotes: 'Patient is in critical condition'
        },
        {
          id: 2,
          patientName: 'Karim Hossain',
          bloodType: 'O+',
          units: 3,
          urgency: 'urgent',
          hospital: 'Square Hospital',
          location: {
            division: 'Dhaka Division',
            district: 'Dhaka',
            subDistrict: 'Dhanmondi'
          },
          contactPerson: 'Dr. Fatima Rahman',
          contactPhone: '+880 1812-345678',
          reason: 'Heart surgery scheduled',
          requiredDate: '2024-01-27',
          requestDate: '2024-01-24',
          status: 'pending',
          additionalNotes: 'Patient has rare blood type'
        },
        {
          id: 3,
          patientName: 'Ayesha Khan',
          bloodType: 'B+',
          units: 1,
          urgency: 'normal',
          hospital: 'Chattogram Medical College',
          location: {
            division: 'Chattogram Division',
            district: 'Chattogram',
            subDistrict: 'Agrabad'
          },
          contactPerson: 'Dr. Mohammad Ali',
          contactPhone: '+880 1912-345678',
          reason: 'Regular treatment for thalassemia',
          requiredDate: '2024-02-01',
          requestDate: '2024-01-24',
          status: 'pending',
          additionalNotes: 'Monthly transfusion required'
        },
        {
          id: 4,
          patientName: 'Sakib Ahmed',
          bloodType: 'AB+',
          units: 4,
          urgency: 'emergency',
          hospital: 'United Hospital',
          location: {
            division: 'Dhaka Division',
            district: 'Dhaka',
            subDistrict: 'Gulshan'
          },
          contactPerson: 'Dr. Nusrat Jahan',
          contactPhone: '+880 1612-345678',
          reason: 'Severe blood loss from accident',
          requiredDate: '2024-01-24',
          requestDate: '2024-01-24',
          status: 'pending',
          additionalNotes: 'Immediate response needed'
        },
        {
          id: 5,
          patientName: 'Fatima Begum',
          bloodType: 'O-',
          units: 2,
          urgency: 'urgent',
          hospital: 'Sylhet MAG Osmani Medical College',
          location: {
            division: 'Sylhet Division',
            district: 'Sylhet',
            subDistrict: 'Sylhet Sadar'
          },
          contactPerson: 'Dr. Rezaul Karim',
          contactPhone: '+880 1512-345678',
          reason: 'Complicated delivery case',
          requiredDate: '2024-01-26',
          requestDate: '2024-01-24',
          status: 'pending',
          additionalNotes: 'Mother and baby both need blood'
        }
      ];
      
      setRequests(mockRequests);
      setFilteredRequests(mockRequests);
      setLoading(false);
    }, 1000);
  }, []);

  // Apply filters when they change
  useEffect(() => {
    let filtered = [...requests];

    // Apply location filters
    if (locationFilters.division) {
      filtered = filtered.filter(request => 
        request.location.division === locationFilters.division
      );
    }
    if (locationFilters.district) {
      filtered = filtered.filter(request => 
        request.location.district === locationFilters.district
      );
    }
    if (locationFilters.subDistrict) {
      filtered = filtered.filter(request => 
        request.location.subDistrict === locationFilters.subDistrict
      );
    }

    // Apply blood type filter
    if (bloodTypeFilter) {
      filtered = filtered.filter(request => 
        request.bloodType === bloodTypeFilter
      );
    }

    // Apply urgency filter
    if (urgencyFilter) {
      filtered = filtered.filter(request => 
        request.urgency === urgencyFilter
      );
    }

    setFilteredRequests(filtered);
  }, [requests, locationFilters, bloodTypeFilter, urgencyFilter]);

  const handleLocationFilterChange = (filters) => {
    setLocationFilters(filters);
  };

  const handleBloodTypeFilterChange = (e) => {
    setBloodTypeFilter(e.target.value);
  };

  const handleUrgencyFilterChange = (e) => {
    setUrgencyFilter(e.target.value);
  };

  const clearAllFilters = () => {
    setLocationFilters({ division: '', district: '', subDistrict: '' });
    setBloodTypeFilter('');
    setUrgencyFilter('');
  };

  const getUrgencyInfo = (urgency) => {
    switch (urgency) {
      case 'emergency':
        return { label: 'Emergency', color: '#e74c3c', icon: '🚨' };
      case 'urgent':
        return { label: 'Urgent', color: '#f39c12', icon: '⚠️' };
      case 'normal':
        return { label: 'Normal', color: '#27ae60', icon: '📋' };
      default:
        return { label: 'Unknown', color: '#95a5a6', icon: '❓' };
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending':
        return { label: 'Pending', color: '#f39c12', icon: '⏳' };
      case 'fulfilled':
        return { label: 'Fulfilled', color: '#27ae60', icon: '✅' };
      case 'cancelled':
        return { label: 'Cancelled', color: '#e74c3c', icon: '❌' };
      default:
        return { label: 'Unknown', color: '#95a5a6', icon: '❓' };
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTimeRemaining = (requiredDate) => {
    const required = new Date(requiredDate);
    const now = new Date();
    const diffTime = required - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { text: 'Overdue', color: '#e74c3c' };
    } else if (diffDays === 0) {
      return { text: 'Today', color: '#e74c3c' };
    } else if (diffDays === 1) {
      return { text: 'Tomorrow', color: '#f39c12' };
    } else if (diffDays <= 3) {
      return { text: `${diffDays} days left`, color: '#f39c12' };
    } else {
      return { text: `${diffDays} days left`, color: '#27ae60' };
    }
  };

  if (loading) {
    return (
      <div className="requests-loading">
        <div className="loading-spinner"></div>
        <p>Loading blood requests...</p>
      </div>
    );
  }

  return (
    <div className="blood-requests-list-container">
      <div className="requests-header">
        <h1>Blood Requests</h1>
        <p>View and respond to blood donation requests in your area</p>
      </div>

      <div className="filters-section">
        <div className="filters-header">
          <h3>Filter Requests</h3>
          <button 
            className="clear-all-filters-btn"
            onClick={clearAllFilters}
            disabled={!locationFilters.division && !bloodTypeFilter && !urgencyFilter}
          >
            Clear All Filters
          </button>
        </div>

        <div className="filters-content">
          <LocationFilter
            title="Location Filter"
            onFilterChange={handleLocationFilterChange}
            initialFilters={locationFilters}
            className="requests-location-filter"
          />

          <div className="additional-filters">
            <div className="filter-group">
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

            <div className="filter-group">
              <label htmlFor="urgencyFilter">Urgency Level</label>
              <select
                id="urgencyFilter"
                value={urgencyFilter}
                onChange={handleUrgencyFilterChange}
              >
                <option value="">All Urgency Levels</option>
                <option value="emergency">Emergency</option>
                <option value="urgent">Urgent</option>
                <option value="normal">Normal</option>
              </select>
            </div>
          </div>
        </div>

        <div className="filter-summary">
          <span className="results-count">
            {filteredRequests.length} request{filteredRequests.length !== 1 ? 's' : ''} found
          </span>
          {(locationFilters.division || bloodTypeFilter || urgencyFilter) && (
            <span className="active-filters-count">
              with active filters
            </span>
          )}
        </div>
      </div>

      <div className="requests-grid">
        {filteredRequests.length === 0 ? (
          <div className="no-requests">
            <div className="no-requests-icon">🩸</div>
            <h3>No blood requests found</h3>
            <p>Try adjusting your filters or expanding your search area</p>
            <button className="reset-filters-btn" onClick={clearAllFilters}>
              Reset Filters
            </button>
          </div>
        ) : (
          filteredRequests.map(request => {
            const urgencyInfo = getUrgencyInfo(request.urgency);
            const statusInfo = getStatusInfo(request.status);
            const timeRemaining = getTimeRemaining(request.requiredDate);
            
            return (
              <div key={request.id} className={`request-card ${request.urgency}`}>
                <div className="request-header">
                  <div className="urgency-badge" style={{ backgroundColor: urgencyInfo.color }}>
                    {urgencyInfo.icon} {urgencyInfo.label}
                  </div>
                  <div className="status-badge" style={{ backgroundColor: statusInfo.color }}>
                    {statusInfo.icon} {statusInfo.text}
                  </div>
                </div>

                <div className="request-content">
                  <div className="patient-info">
                    <h3 className="patient-name">{request.patientName}</h3>
                    <div className="blood-requirement">
                      <span className="blood-type">{request.bloodType}</span>
                      <span className="units">({request.units} units)</span>
                    </div>
                  </div>

                  <div className="hospital-info">
                    <div className="hospital-name">
                      🏥 {request.hospital}
                    </div>
                    <div className="hospital-location">
                      📍 {request.location.subDistrict}, {request.location.district}
                    </div>
                  </div>

                  <div className="request-details">
                    <div className="detail-row">
                      <span className="detail-label">Reason:</span>
                      <span className="detail-value">{request.reason}</span>
                    </div>
                    
                    <div className="detail-row">
                      <span className="detail-label">Required Date:</span>
                      <span className="detail-value required-date">
                        {formatDate(request.requiredDate)}
                      </span>
                    </div>
                    
                    <div className="detail-row">
                      <span className="detail-label">Time Remaining:</span>
                      <span 
                        className="detail-value time-remaining"
                        style={{ color: timeRemaining.color }}
                      >
                        {timeRemaining.text}
                      </span>
                    </div>
                  </div>

                  {request.additionalNotes && (
                    <div className="additional-notes">
                      <strong>Notes:</strong> {request.additionalNotes}
                    </div>
                  )}

                  <div className="contact-info">
                    <div className="contact-person">
                      👤 {request.contactPerson}
                    </div>
                    <div className="contact-phone">
                      📞 {request.contactPhone}
                    </div>
                  </div>
                </div>

                <div className="request-actions">
                  <button className="action-btn primary">
                    🩸 I Can Donate
                  </button>
                  <button className="action-btn secondary">
                    📞 Contact
                  </button>
                  <button className="action-btn tertiary">
                    📋 View Details
                  </button>
                </div>

                <div className="request-footer">
                  <span className="request-date">
                    Requested on {formatDate(request.requestDate)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {filteredRequests.length > 0 && (
        <div className="requests-footer">
          <p>
            Showing {filteredRequests.length} of {requests.length} total requests
          </p>
          <button className="load-more-btn">
            Load More Requests
          </button>
        </div>
      )}
    </div>
  );
};

export default BloodRequestsList;

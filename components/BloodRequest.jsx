import React, { useState } from 'react';
import LocationSelector from './LocationSelector';
import './BloodRequest.css';

const BloodRequest = () => {
  const [requestData, setRequestData] = useState({
    patientName: '',
    bloodType: '',
    units: '',
    urgency: '',
    hospital: '',
    contactPerson: '',
    contactPhone: '',
    reason: '',
    requiredDate: '',
    additionalNotes: ''
  });

  const [location, setLocation] = useState({
    division: '',
    district: '',
    subDistrict: ''
  });

  const [errors, setErrors] = useState({});

  const bloodTypes = [
    'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
  ];

  const urgencyLevels = [
    { value: 'emergency', label: 'Emergency (Within 24 hours)', color: '#e74c3c' },
    { value: 'urgent', label: 'Urgent (Within 48 hours)', color: '#f39c12' },
    { value: 'normal', label: 'Normal (Within a week)', color: '#27ae60' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRequestData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleLocationChange = (newLocation) => {
    setLocation(newLocation);
  };

  const validateForm = () => {
    const newErrors = {};

    // Required field validation
    if (!requestData.patientName.trim()) newErrors.patientName = 'Patient name is required';
    if (!requestData.bloodType) newErrors.bloodType = 'Blood type is required';
    if (!requestData.units) newErrors.units = 'Number of units is required';
    if (!requestData.urgency) newErrors.urgency = 'Urgency level is required';
    if (!requestData.hospital.trim()) newErrors.hospital = 'Hospital name is required';
    if (!requestData.contactPerson.trim()) newErrors.contactPerson = 'Contact person is required';
    if (!requestData.contactPhone.trim()) newErrors.contactPhone = 'Contact phone is required';
    if (!requestData.reason.trim()) newErrors.reason = 'Reason for blood request is required';
    if (!requestData.requiredDate) newErrors.requiredDate = 'Required date is required';

    // Location validation
    if (!location.division) newErrors.location = 'Please select the location';
    if (!location.district) newErrors.location = 'Please select the location';
    if (!location.subDistrict) newErrors.location = 'Please select the location';

    // Phone validation
    if (requestData.contactPhone && !/^(\+880|880|0)?1[3-9]\d{8}$/.test(requestData.contactPhone.replace(/\s/g, ''))) {
      newErrors.contactPhone = 'Please enter a valid Bangladeshi phone number';
    }

    // Units validation
    if (requestData.units && (isNaN(requestData.units) || parseInt(requestData.units) < 1 || parseInt(requestData.units) > 50)) {
      newErrors.units = 'Please enter a valid number of units (1-50)';
    }

    // Date validation
    if (requestData.requiredDate) {
      const selectedDate = new Date(requestData.requiredDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.requiredDate = 'Required date cannot be in the past';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Form is valid, proceed with submission
      const bloodRequest = {
        ...requestData,
        location,
        requestDate: new Date().toISOString(),
        status: 'pending'
      };
      
      console.log('Blood request submitted:', bloodRequest);
      // Here you would typically send the data to your backend
      alert('Blood request submitted successfully! We will notify nearby donors.');
      
      // Reset form
      setRequestData({
        patientName: '',
        bloodType: '',
        units: '',
        urgency: '',
        hospital: '',
        contactPerson: '',
        contactPhone: '',
        reason: '',
        requiredDate: '',
        additionalNotes: ''
      });
      setLocation({ division: '', district: '', subDistrict: '' });
    }
  };

  const getUrgencyColor = (urgency) => {
    const urgencyLevel = urgencyLevels.find(level => level.value === urgency);
    return urgencyLevel ? urgencyLevel.color : '#95a5a6';
  };

  return (
    <div className="blood-request-container">
      <div className="request-header">
        <h1>Request Blood</h1>
        <p>Submit a blood request to find donors in your area</p>
      </div>

      <form className="blood-request-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>Patient Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="patientName">Patient Name *</label>
              <input
                type="text"
                id="patientName"
                name="patientName"
                value={requestData.patientName}
                onChange={handleInputChange}
                className={errors.patientName ? 'error' : ''}
                placeholder="Enter patient's full name"
              />
              {errors.patientName && <span className="error-message">{errors.patientName}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="bloodType">Blood Type Required *</label>
              <select
                id="bloodType"
                name="bloodType"
                value={requestData.bloodType}
                onChange={handleInputChange}
                className={errors.bloodType ? 'error' : ''}
              >
                <option value="">Select Blood Type</option>
                {bloodTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {errors.bloodType && <span className="error-message">{errors.bloodType}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="units">Units Required *</label>
              <input
                type="number"
                id="units"
                name="units"
                value={requestData.units}
                onChange={handleInputChange}
                className={errors.units ? 'error' : ''}
                placeholder="Number of units"
                min="1"
                max="50"
              />
              {errors.units && <span className="error-message">{errors.units}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="urgency">Urgency Level *</label>
              <select
                id="urgency"
                name="urgency"
                value={requestData.urgency}
                onChange={handleInputChange}
                className={errors.urgency ? 'error' : ''}
              >
                <option value="">Select Urgency</option>
                {urgencyLevels.map(level => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
              {errors.urgency && <span className="error-message">{errors.urgency}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reason">Reason for Blood Request *</label>
            <textarea
              id="reason"
              name="reason"
              value={requestData.reason}
              onChange={handleInputChange}
              className={errors.reason ? 'error' : ''}
              placeholder="Describe why blood is needed (e.g., surgery, accident, treatment)"
              rows="3"
            />
            {errors.reason && <span className="error-message">{errors.reason}</span>}
          </div>
        </div>

        <div className="form-section">
          <h3>Hospital & Location</h3>
          <div className="form-group">
            <label htmlFor="hospital">Hospital/Medical Center *</label>
            <input
              type="text"
              id="hospital"
              name="hospital"
              value={requestData.hospital}
              onChange={handleInputChange}
              className={errors.hospital ? 'error' : ''}
              placeholder="Enter hospital or medical center name"
            />
            {errors.hospital && <span className="error-message">{errors.hospital}</span>}
          </div>

          <LocationSelector
            title="Hospital Location"
            onLocationChange={handleLocationChange}
            required={true}
            className="request-location"
          />
          {errors.location && <span className="error-message">{errors.location}</span>}
        </div>

        <div className="form-section">
          <h3>Contact Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="contactPerson">Contact Person *</label>
              <input
                type="text"
                id="contactPerson"
                name="contactPerson"
                value={requestData.contactPerson}
                onChange={handleInputChange}
                className={errors.contactPerson ? 'error' : ''}
                placeholder="Enter contact person's name"
              />
              {errors.contactPerson && <span className="error-message">{errors.contactPerson}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="contactPhone">Contact Phone *</label>
              <input
                type="tel"
                id="contactPhone"
                name="contactPhone"
                value={requestData.contactPhone}
                onChange={handleInputChange}
                className={errors.contactPhone ? 'error' : ''}
                placeholder="Enter contact phone number"
              />
              {errors.contactPhone && <span className="error-message">{errors.contactPhone}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="requiredDate">Required Date *</label>
            <input
              type="date"
              id="requiredDate"
              name="requiredDate"
              value={requestData.requiredDate}
              onChange={handleInputChange}
              className={errors.requiredDate ? 'error' : ''}
            />
            {errors.requiredDate && <span className="error-message">{errors.requiredDate}</span>}
          </div>
        </div>

        <div className="form-section">
          <h3>Additional Information</h3>
          <div className="form-group">
            <label htmlFor="additionalNotes">Additional Notes</label>
            <textarea
              id="additionalNotes"
              name="additionalNotes"
              value={requestData.additionalNotes}
              onChange={handleInputChange}
              placeholder="Any additional information that might help donors (optional)"
              rows="3"
            />
          </div>
        </div>

        {requestData.urgency && (
          <div className="urgency-notice" style={{ borderLeftColor: getUrgencyColor(requestData.urgency) }}>
            <strong>Urgency Notice:</strong> This is a {requestData.urgency} request. 
            {requestData.urgency === 'emergency' && ' Please contact us immediately if you can donate.'}
            {requestData.urgency === 'urgent' && ' Please respond within 48 hours if you can donate.'}
            {requestData.urgency === 'normal' && ' Please respond within a week if you can donate.'}
          </div>
        )}

        <div className="form-actions">
          <button type="submit" className="submit-btn">
            Submit Blood Request
          </button>
          <button type="button" className="cancel-btn">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default BloodRequest;

import React, { useState } from 'react';
import LocationSelector from './LocationSelector';
import './SignUp.css';

const SignUp = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    bloodType: '',
    dateOfBirth: '',
    gender: '',
    emergencyContact: '',
    emergencyPhone: ''
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
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
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    if (!formData.bloodType) newErrors.bloodType = 'Blood type is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.emergencyContact.trim()) newErrors.emergencyContact = 'Emergency contact is required';
    if (!formData.emergencyPhone.trim()) newErrors.emergencyPhone = 'Emergency phone is required';

    // Location validation
    if (!location.division) newErrors.location = 'Please select your location';
    if (!location.district) newErrors.location = 'Please select your location';
    if (!location.subDistrict) newErrors.location = 'Please select your location';

    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Phone validation
    if (formData.phone && !/^(\+880|880|0)?1[3-9]\d{8}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid Bangladeshi phone number';
    }

    if (formData.emergencyPhone && !/^(\+880|880|0)?1[3-9]\d{8}$/.test(formData.emergencyPhone.replace(/\s/g, ''))) {
      newErrors.emergencyPhone = 'Please enter a valid Bangladeshi phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Form is valid, proceed with submission
      const userData = {
        ...formData,
        location
      };
      
      console.log('Form submitted:', userData);
      // Here you would typically send the data to your backend
      alert('Account created successfully! Welcome to BloodHub.');
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        bloodType: '',
        dateOfBirth: '',
        gender: '',
        emergencyContact: '',
        emergencyPhone: ''
      });
      setLocation({ division: '', district: '', subDistrict: '' });
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-header">
        <h1>Join BloodHub</h1>
        <p>Create your account to start saving lives through blood donation</p>
      </div>

      <form className="signup-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>Personal Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name *</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className={errors.firstName ? 'error' : ''}
                placeholder="Enter your first name"
              />
              {errors.firstName && <span className="error-message">{errors.firstName}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Last Name *</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className={errors.lastName ? 'error' : ''}
                placeholder="Enter your last name"
              />
              {errors.lastName && <span className="error-message">{errors.lastName}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={errors.email ? 'error' : ''}
                placeholder="Enter your email address"
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={errors.phone ? 'error' : ''}
                placeholder="Enter your phone number"
              />
              {errors.phone && <span className="error-message">{errors.phone}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="dateOfBirth">Date of Birth *</label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                className={errors.dateOfBirth ? 'error' : ''}
              />
              {errors.dateOfBirth && <span className="error-message">{errors.dateOfBirth}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="gender">Gender *</label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className={errors.gender ? 'error' : ''}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {errors.gender && <span className="error-message">{errors.gender}</span>}
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Blood Information</h3>
          <div className="form-group">
            <label htmlFor="bloodType">Blood Type *</label>
            <select
              id="bloodType"
              name="bloodType"
              value={formData.bloodType}
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

        <div className="form-section">
          <h3>Location</h3>
          <LocationSelector
            onLocationChange={handleLocationChange}
            required={true}
            showAutoDetect={false}
            className="signup-location"
          />
          {errors.location && <span className="error-message">{errors.location}</span>}
        </div>

        <div className="form-section">
          <h3>Emergency Contact</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="emergencyContact">Emergency Contact Name *</label>
              <input
                type="text"
                id="emergencyContact"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleInputChange}
                className={errors.emergencyContact ? 'error' : ''}
                placeholder="Enter emergency contact name"
              />
              {errors.emergencyContact && <span className="error-message">{errors.emergencyContact}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="emergencyPhone">Emergency Contact Phone *</label>
              <input
                type="tel"
                id="emergencyPhone"
                name="emergencyPhone"
                value={formData.emergencyPhone}
                onChange={handleInputChange}
                className={errors.emergencyPhone ? 'error' : ''}
                placeholder="Enter emergency contact phone"
              />
              {errors.emergencyPhone && <span className="error-message">{errors.emergencyPhone}</span>}
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Account Security</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Password *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={errors.password ? 'error' : ''}
                placeholder="Create a strong password"
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password *</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={errors.confirmPassword ? 'error' : ''}
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-btn">
            Create Account
          </button>
          <button type="button" className="cancel-btn">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default SignUp;

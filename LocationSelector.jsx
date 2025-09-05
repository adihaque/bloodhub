import React, { useState, useEffect } from 'react';
import './LocationSelector.css';

const LocationSelector = ({ onLocationChange }) => {
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedSubDistrict, setSelectedSubDistrict] = useState('');
  const [districts, setDistricts] = useState([]);
  const [subDistricts, setSubDistricts] = useState([]);

  // Location data structure
  const locationData = {
    'Dhaka Division': {
      'Dhaka': ['Dhamrai', 'Dohar', 'Keraniganj', 'Nawabganj', 'Savar'],
      'Faridpur': ['Alfadanga', 'Bhanga', 'Boalmari', 'Charbhadrasan', 'Madhukhali', 'Nagarkanda', 'Sadarpur', 'Saltha'],
      'Gazipur': ['Gazipur Sadar', 'Kaliakair', 'Kaliganj', 'Kapasia', 'Sreepur'],
      'Gopalganj': ['Gopalganj Sadar', 'Kashiani', 'Kotalipara', 'Muksudpur', 'Tungipara'],
      'Kishoreganj': ['Austagram', 'Bajitpur', 'Bhairab', 'Hossainpur', 'Itna', 'Karimganj', 'Katiadi', 'Kishoreganj Sadar', 'Kuliarchar', 'Mithamain', 'Nikli', 'Pakundia', 'Tarail'],
      'Madaripur': ['Kalkini', 'Madaripur Sadar', 'Rajoir', 'Shibchar'],
      'Manikganj': ['Daulatpur', 'Ghior', 'Harirampur', 'Manikganj Sadar', 'Saturia', 'Shivalaya', 'Singair'],
      'Munshiganj': ['Gazaria', 'Lohajang', 'Munshiganj Sadar', 'Sirajdikhan', 'Tongibari', 'Sreenagar'],
      'Narayanganj': ['Araihazar', 'Bandar', 'Narayanganj Sadar', 'Rupganj', 'Sonargaon'],
      'Narsingdi': ['Belabo', 'Monohardi', 'Narsingdi Sadar', 'Palash', 'Raipura', 'Shibpur'],
      'Rajbari': ['Baliakandi', 'Goalanda', 'Kalukhali', 'Pangsha', 'Rajbari Sadar'],
      'Shariatpur': ['Bhedarganj', 'Damudya', 'Gosairhat', 'Naria', 'Shariatpur Sadar', 'Zanjira'],
      'Tangail': ['Basail', 'Bhuapur', 'Delduar', 'Dhanbari', 'Ghatail', 'Gopalpur', 'Kalihati', 'Madhupur', 'Mirzapur', 'Nagarpur', 'Sakhipur', 'Tangail Sadar']
    },
    'Chattogram Division': {
      'Bandarban': ['Alikadam', 'Bandarban Sadar', 'Lama', 'Naikhongchhari', 'Rowangchhari', 'Ruma', 'Thanchi'],
      'Brahmanbaria': ['Ashuganj', 'Bancharampur', 'Bijoynagar', 'Brahmanbaria Sadar', 'Kasba', 'Nabinagar', 'Nasirnagar', 'Sarail'],
      'Chandpur': ['Chandpur Sadar', 'Faridganj', 'Haimchar', 'Hajiganj', 'Kachua', 'Matlab Dakshin', 'Matlab Uttar', 'Shahrasti'],
      'Chattogram': ['Anwara', 'Banshkhali', 'Boalkhali', 'Chandanaish', 'Fatikchhari', 'Hathazari', 'Lohagara', 'Mirsharai', 'Patiya', 'Rangunia', 'Raozan', 'Sandwip', 'Satkania', 'Sitakunda'],
      'Cox\'s Bazar': ['Chakaria', 'Cox\'s Bazar Sadar', 'Kutubdia', 'Maheshkhali', 'Pekua', 'Ramu', 'Teknaf', 'Ukhiya'],
      'Cumilla': ['Barura', 'Brahmanpara', 'Burichang', 'Chandina', 'Cumilla Adarsha Sadar', 'Cumilla Sadar Dakshin', 'Daudkandi', 'Debidwar', 'Homna', 'Laksham', 'Manoharganj', 'Meghna', 'Monohorgonj', 'Muradnagar', 'Nangalkot', 'Titas'],
      'Feni': ['Chhagalnaiya', 'Daganbhuiyan', 'Feni Sadar', 'Fulgazi', 'Parshuram', 'Sonagazi'],
      'Khagrachhari': ['Dighinala', 'Khagrachhari Sadar', 'Lakshmichhari', 'Mahalchhari', 'Manikchhari', 'Matiranga', 'Panchhari', 'Ramgarh'],
      'Lakshmipur': ['Kamalnagar', 'Lakshmipur Sadar', 'Raipur', 'Ramganj', 'Ramgati'],
      'Noakhali': ['Begumganj', 'Chatkhil', 'Companiganj', 'Hatiya', 'Noakhali Sadar', 'Senbagh', 'Subarnachar'],
      'Rangamati': ['Baghaichhari', 'Barkal', 'Belaichhari', 'Juraichhari', 'Kaptai', 'Langadu', 'Naniarchar', 'Rajasthali', 'Rangamati Sadar']
    },
    'Khulna Division': {
      'Bagerhat': ['Chitalmari', 'Fakirhat', 'Kachua', 'Mollahat', 'Mongla', 'Morrelganj', 'Rampal', 'Sarankhola', 'Bagerhat Sadar'],
      'Chuadanga': ['Alamdanga', 'Chuadanga Sadar', 'Damurhuda', 'Jibannagar'],
      'Jashore': ['Abhaynagar', 'Bagherpara', 'Chaugachha', 'Jhikargachha', 'Jashore Sadar', 'Keshabpur', 'Manirampur', 'Sharsha'],
      'Jhenaidah': ['Harinakunda', 'Jhenaidah Sadar', 'Kaliganj', 'Kotchandpur', 'Maheshpur', 'Shailkupa'],
      'Khulna': ['Batiaghata', 'Dacope', 'Dighalia', 'Dumuria', 'Koyra', 'Paikgachha', 'Phultala', 'Rupsha', 'Terokhada', 'Khulna Sadar'],
      'Kushtia': ['Bheramara', 'Daulatpur', 'Khoksa', 'Kumarkhali', 'Kushtia Sadar', 'Mirpur'],
      'Magura': ['Magura Sadar', 'Mohammadpur', 'Shalikha', 'Sreepur'],
      'Meherpur': ['Gangni', 'Meherpur Sadar', 'Mujibnagar'],
      'Narail': ['Kalia', 'Lohagara', 'Narail Sadar'],
      'Satkhira': ['Assasuni', 'Debhata', 'Kalaroa', 'Kaliganj', 'Satkhira Sadar', 'Shaymnagar', 'Tala']
    },
    'Rajshahi Division': {
      'Bogura': ['Adamdighi', 'Bogura Sadar', 'Dhunat', 'Dhupchanchia', 'Gabtali', 'Kahalu', 'Nandigram', 'Sariakandi', 'Shahjahanpur', 'Sherpur', 'Shibganj', 'Sonatola'],
      'Joypurhat': ['Akkelpur', 'Joypurhat Sadar', 'Kalai', 'Khetlal', 'Panchbibi'],
      'Naogaon': ['Atrai', 'Badalgachhi', 'Dhamoirhat', 'Manda', 'Mohadevpur', 'Naogaon Sadar', 'Niamatpur', 'Patnitala', 'Porsha', 'Raninagar', 'Sapahar'],
      'Natore': ['Bagatipara', 'Baraigram', 'Gurudaspur', 'Lalpur', 'Naldanga', 'Natore Sadar', 'Singra'],
      'Chapai Nawabganj': ['Bholahat', 'Gomastapur', 'Nachole', 'Chapai Nawabganj Sadar', 'Shibganj'],
      'Pabna': ['Atgharia', 'Bera', 'Bhangura', 'Chatmohar', 'Faridpur', 'Ishwardi', 'Pabna Sadar', 'Santhia', 'Sujanagar'],
      'Rajshahi': ['Bagha', 'Bagmara', 'Charghat', 'Durgapur', 'Godagari', 'Mohanpur', 'Paba', 'Puthia', 'Rajshahi Sadar', 'Tanore'],
      'Sirajganj': ['Belkuchi', 'Chauhali', 'Kamarkhanda', 'Kazipur', 'Raiganj', 'Shahjadpur', 'Sirajganj Sadar', 'Tarash', 'Ullahpara']
    },
    'Rangpur Division': {
      'Dinajpur': ['Birampur', 'Birganj', 'Birol', 'Bochaganj', 'Chirirbandar', 'Dinajpur Sadar', 'Ghoraghat', 'Hakimpur', 'Kaharole', 'Khansama', 'Nawabganj', 'Parbatipur'],
      'Gaibandha': ['Fulchhari', 'Gaibandha Sadar', 'Gobindaganj', 'Palashbari', 'Sadullapur', 'Sughatta', 'Sundarganj'],
      'Kurigram': ['Bhurungamari', 'Chilmari', 'Kurigram Sadar', 'Nageshwari', 'Phulbari', 'Rajarhat', 'Raomari', 'Ulipur'],
      'Lalmonirhat': ['Aditmari', 'Hatibandha', 'Kaliganj', 'Lalmonirhat Sadar', 'Patgram'],
      'Nilphamari': ['Dimla', 'Domar', 'Jaldhaka', 'Kishoreganj (Nilphamari)', 'Nilphamari Sadar', 'Saidpur'],
      'Panchagarh': ['Atwari', 'Boda', 'Debiganj', 'Panchagarh Sadar', 'Tetulia'],
      'Rangpur': ['Badarganj', 'Gangachhara', 'Kaunia', 'Mithapukur', 'Pirgachha', 'Pirganj', 'Rangpur Sadar', 'Taraganj'],
      'Thakurgaon': ['Baliadangi', 'Haripur', 'Pirganj', 'Ranisankail', 'Thakurgaon Sadar']
    },
    'Sylhet Division': {
      'Habiganj': ['Ajmiriganj', 'Bahubal', 'Baniachong', 'Chunarughat', 'Habiganj Sadar', 'Lakhai', 'Madhabpur', 'Nabiganj', 'Shayestaganj'],
      'Moulvibazar': ['Barlekha', 'Juri', 'Kamalganj', 'Kulaura', 'Moulvibazar Sadar', 'Rajnagar', 'Sreemangal'],
      'Sunamganj': ['Bishwamvarpur', 'Chhatak', 'Derai', 'Dharmapasha', 'Dowarabazar', 'Jagannathpur', 'Jamalganj', 'Sullah', 'Sunamganj Sadar', 'Shanthiganj', 'Tahirpur'],
      'Sylhet': ['Balaganj', 'Beanibazar', 'Bishwanath', 'Companiganj', 'Fenchuganj', 'Golapganj', 'Gowainghat', 'Jaintiapur', 'Kanaighat', 'Osmaninagar', 'Sylhet Sadar', 'Zakiganj']
    }
  };

  const divisions = Object.keys(locationData);

  // Handle division change
  const handleDivisionChange = (division) => {
    setSelectedDivision(division);
    setSelectedDistrict('');
    setSelectedSubDistrict('');
    setDistricts(Object.keys(locationData[division] || {}));
    setSubDistricts([]);
    
    if (onLocationChange) {
      onLocationChange({ division, district: '', subDistrict: '' });
    }
  };

  // Handle district change
  const handleDistrictChange = (district) => {
    setSelectedDistrict(district);
    setSelectedSubDistrict('');
    setSubDistricts(locationData[selectedDivision]?.[district] || []);
    
    if (onLocationChange) {
      onLocationChange({ division: selectedDivision, district, subDistrict: '' });
    }
  };

  // Handle sub-district change
  const handleSubDistrictChange = (subDistrict) => {
    setSelectedSubDistrict(subDistrict);
    
    if (onLocationChange) {
      onLocationChange({ division: selectedDivision, district: selectedDistrict, subDistrict });
    }
  };

  // Auto-detect location (placeholder for map integration)
  const handleAutoDetect = () => {
    // This would integrate with a map service to get current coordinates
    // For now, it's a placeholder
    alert('Auto-detect feature would integrate with map service to get current coordinates');
  };

  return (
    <div className="location-selector">
      <div className="location-header">
        <h3>Current Location</h3>
        <button 
          className="auto-detect-btn"
          onClick={handleAutoDetect}
          title="Click map pin to auto-detect or enter manually"
        >
          📍 Auto-detect
        </button>
      </div>
      
      <div className="location-inputs">
        <div className="input-group">
          <label htmlFor="division">Division *</label>
          <select
            id="division"
            value={selectedDivision}
            onChange={(e) => handleDivisionChange(e.target.value)}
            required
          >
            <option value="">Select Division</option>
            {divisions.map((division) => (
              <option key={division} value={division}>
                {division}
              </option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <label htmlFor="district">District *</label>
          <select
            id="district"
            value={selectedDistrict}
            onChange={(e) => handleDistrictChange(e.target.value)}
            required
            disabled={!selectedDivision}
          >
            <option value="">Select District</option>
            {districts.map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <label htmlFor="subDistrict">Sub-district *</label>
          <select
            id="subDistrict"
            value={selectedSubDistrict}
            onChange={(e) => handleSubDistrictChange(e.target.value)}
            required
            disabled={!selectedDistrict}
          >
            <option value="">Select Sub-district</option>
            {subDistricts.map((subDistrict) => (
              <option key={subDistrict} value={subDistrict}>
                {subDistrict}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedDivision && selectedDistrict && selectedSubDistrict && (
        <div className="selected-location">
          <p>
            <strong>Selected Location:</strong> {selectedSubDistrict}, {selectedDistrict}, {selectedDivision}
          </p>
        </div>
      )}
    </div>
  );
};

export default LocationSelector;

import React, { useState, useEffect } from 'react';
import './LocationFilter.css';

const LocationFilter = ({ 
  onFilterChange, 
  title = "Filter by Location",
  showClearButton = true,
  className = "",
  initialFilters = null
}) => {
  const [filters, setFilters] = useState({
    division: initialFilters?.division || '',
    district: initialFilters?.district || '',
    subDistrict: initialFilters?.subDistrict || ''
  });
  
  const [districts, setDistricts] = useState([]);
  const [subDistricts, setSubDistricts] = useState([]);

  // Location data structure (same as LocationSelector)
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

  // Initialize districts when division changes
  useEffect(() => {
    if (filters.division) {
      setDistricts(Object.keys(locationData[filters.division] || {}));
    } else {
      setDistricts([]);
    }
  }, [filters.division]);

  // Initialize sub-districts when district changes
  useEffect(() => {
    if (filters.district) {
      setSubDistricts(locationData[filters.division]?.[filters.district] || []);
    } else {
      setSubDistricts([]);
    }
  }, [filters.district, filters.division]);

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    const newFilters = { ...filters };
    
    if (field === 'division') {
      newFilters.division = value;
      newFilters.district = '';
      newFilters.subDistrict = '';
    } else if (field === 'district') {
      newFilters.district = value;
      newFilters.subDistrict = '';
    } else {
      newFilters.subDistrict = value;
    }
    
    setFilters(newFilters);
    
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    const clearedFilters = { division: '', district: '', subDistrict: '' };
    setFilters(clearedFilters);
    setDistricts([]);
    setSubDistricts([]);
    
    if (onFilterChange) {
      onFilterChange(clearedFilters);
    }
  };

  // Check if any filters are active
  const hasActiveFilters = filters.division || filters.district || filters.subDistrict;

  return (
    <div className={`location-filter ${className}`}>
      <div className="filter-header">
        <h4>{title}</h4>
        {showClearButton && hasActiveFilters && (
          <button 
            className="clear-filters-btn"
            onClick={clearFilters}
            title="Clear all filters"
          >
            Clear
          </button>
        )}
      </div>
      
      <div className="filter-inputs">
        <div className="filter-group">
          <label htmlFor="filter-division">Division</label>
          <select
            id="filter-division"
            value={filters.division}
            onChange={(e) => handleFilterChange('division', e.target.value)}
          >
            <option value="">All Divisions</option>
            {divisions.map((division) => (
              <option key={division} value={division}>
                {division}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="filter-district">District</label>
          <select
            id="filter-district"
            value={filters.district}
            onChange={(e) => handleFilterChange('district', e.target.value)}
            disabled={!filters.division}
          >
            <option value="">All Districts</option>
            {districts.map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="filter-subDistrict">Sub-district</label>
          <select
            id="filter-subDistrict"
            value={filters.subDistrict}
            onChange={(e) => handleFilterChange('subDistrict', e.target.value)}
            disabled={!filters.district}
          >
            <option value="">All Sub-districts</option>
            {subDistricts.map((subDistrict) => (
              <option key={subDistrict} value={subDistrict}>
                {subDistrict}
              </option>
            ))}
          </select>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="active-filters">
          <span className="filter-label">Active Filters:</span>
          {filters.division && (
            <span className="filter-tag">
              {filters.division}
              {filters.district && ` > ${filters.district}`}
              {filters.subDistrict && ` > ${filters.subDistrict}`}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationFilter;

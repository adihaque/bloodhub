# BloodHub Location System

A comprehensive React-based location selection and filtering system for BloodHub, covering all 8 divisions of Bangladesh with cascading dropdowns for Division, District, and Sub-district.

## 🎯 **Features Overview**

- **Complete Location Coverage**: All 8 divisions of Bangladesh with their districts and sub-districts
- **Cascading Dropdowns**: Division → District → Sub-district selection
- **Location Filtering**: Filter donors and blood requests by location
- **Multiple Use Cases**: Sign up, blood requests, donor lists, and more
- **Auto-detect Integration**: Ready for map service integration
- **Responsive Design**: Works on all devices
- **Modern UI**: Clean, professional design with smooth animations

## 🏗️ **Components Architecture**

### 1. **LocationSelector** (`components/LocationSelector.jsx`)
- **Purpose**: Primary location selection component
- **Features**: 
  - Cascading dropdowns (Division → District → Sub-district)
  - Auto-detect button for map integration
  - Configurable title and requirements
  - Initial location support
- **Props**:
  - `onLocationChange`: Callback for location changes
  - `title`: Custom title for the component
  - `showAutoDetect`: Toggle auto-detect button
  - `required`: Make fields required
  - `className`: Custom CSS classes
  - `initialLocation`: Pre-populate location data

### 2. **LocationFilter** (`components/LocationFilter.jsx`)
- **Purpose**: Filter data by location criteria
- **Features**:
  - Same cascading structure as LocationSelector
  - "All" options for each level
  - Clear filters functionality
  - Active filters display
- **Props**:
  - `onFilterChange`: Callback for filter changes
  - `title`: Custom title
  - `showClearButton`: Toggle clear button
  - `className`: Custom CSS classes
  - `initialFilters`: Pre-populate filters

### 3. **SignUp** (`components/SignUp.jsx`)
- **Purpose**: User registration with location selection
- **Features**:
  - Complete user registration form
  - Integrated location selector
  - Form validation
  - Blood type selection
  - Emergency contact information

### 4. **BloodRequest** (`components/BloodRequest.jsx`)
- **Purpose**: Submit blood donation requests
- **Features**:
  - Patient information form
  - Blood type and units specification
  - Urgency level selection
  - Hospital location selection
  - Contact information

### 5. **DonorsList** (`components/DonorsList.jsx`)
- **Purpose**: Display available blood donors
- **Features**:
  - Location-based filtering
  - Blood type filtering
  - Donor availability status
  - Distance information
  - Contact actions

### 6. **BloodRequestsList** (`components/BloodRequestsList.jsx`)
- **Purpose**: Display blood donation requests
- **Features**:
  - Location-based filtering
  - Blood type and urgency filtering
  - Request status tracking
  - Time remaining indicators
  - Response actions

## 🗺️ **Location Coverage**

### **Dhaka Division** (13 districts)
- Dhaka, Faridpur, Gazipur, Gopalganj, Kishoreganj, Madaripur, Manikganj, Munshiganj, Narayanganj, Narsingdi, Rajbari, Shariatpur, Tangail

### **Chattogram Division** (11 districts)
- Bandarban, Brahmanbaria, Chandpur, Chattogram, Cox's Bazar, Cumilla, Feni, Khagrachhari, Lakshmipur, Noakhali, Rangamati

### **Khulna Division** (10 districts)
- Bagerhat, Chuadanga, Jashore, Jhenaidah, Khulna, Kushtia, Magura, Meherpur, Narail, Satkhira

### **Rajshahi Division** (8 districts)
- Bogura, Joypurhat, Naogaon, Natore, Chapai Nawabganj, Pabna, Rajshahi, Sirajganj

### **Rangpur Division** (8 districts)
- Dinajpur, Gaibandha, Kurigram, Lalmonirhat, Nilphamari, Panchagarh, Rangpur, Thakurgaon

### **Sylhet Division** (4 districts)
- Habiganj, Moulvibazar, Sunamganj, Sylhet

## 🚀 **Quick Start**

### 1. **Installation**
```bash
npm install
```

### 2. **Basic Usage**
```jsx
import LocationSelector from './components/LocationSelector';

function App() {
  const handleLocationChange = (location) => {
    console.log('Selected:', location.division, location.district, location.subDistrict);
  };

  return (
    <LocationSelector onLocationChange={handleLocationChange} />
  );
}
```

### 3. **Location Filtering**
```jsx
import LocationFilter from './components/LocationFilter';

function App() {
  const handleFilterChange = (filters) => {
    console.log('Filters:', filters);
  };

  return (
    <LocationFilter onFilterChange={handleFilterChange} />
  );
}
```

## 📱 **Component Integration Examples**

### **Sign Up Form**
```jsx
<SignUp />
// Automatically includes location selection
```

### **Blood Request Form**
```jsx
<BloodRequest />
// Includes hospital location selection
```

### **Donors List with Filtering**
```jsx
<DonorsList />
// Built-in location and blood type filtering
```

### **Blood Requests with Filtering**
```jsx
<BloodRequestsList />
// Location, blood type, and urgency filtering
```

## 🎨 **Customization**

### **Styling**
- Each component has its own CSS file
- Responsive design with mobile-first approach
- Customizable color schemes and themes
- Smooth animations and transitions

### **Data Structure**
```javascript
const locationData = {
  'Division Name': {
    'District Name': ['Sub-district 1', 'Sub-district 2', ...]
  }
};
```

### **Adding New Locations**
```javascript
// In LocationSelector.jsx or LocationFilter.jsx
'New Division': {
  'New District': ['Sub-district 1', 'Sub-district 2']
}
```

## 🔧 **Advanced Features**

### **Auto-detect Integration**
```javascript
const handleAutoDetect = async () => {
  try {
    // Get coordinates from map service
    const coords = await getCurrentLocation();
    
    // Reverse geocode to get location details
    const location = await reverseGeocode(coords);
    
    // Update the form
    setSelectedDivision(location.division);
    setSelectedDistrict(location.district);
    setSelectedSubDistrict(location.subDistrict);
  } catch (error) {
    console.error('Failed to auto-detect location:', error);
  }
};
```

### **Filter Combinations**
- Location + Blood Type filtering
- Location + Urgency filtering
- Multi-level location filtering
- Clear all filters functionality

### **Form Validation**
- Required field validation
- Location completeness validation
- Phone number format validation (Bangladesh)
- Email format validation

## 📱 **Responsive Design**

- **Desktop**: Full-width layouts with side-by-side forms
- **Tablet**: Adaptive grid layouts
- **Mobile**: Stacked layouts with touch-friendly controls
- **iOS**: Prevents zoom on input focus

## 🌐 **Browser Support**

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## 📁 **Project Structure**

```
bloodhub-location-system/
├── components/
│   ├── LocationSelector.jsx      # Main location selector
│   ├── LocationSelector.css
│   ├── LocationFilter.jsx        # Location filtering
│   ├── LocationFilter.css
│   ├── SignUp.jsx               # User registration
│   ├── SignUp.css
│   ├── BloodRequest.jsx         # Blood request form
│   ├── BloodRequest.css
│   ├── DonorsList.jsx           # Available donors
│   ├── DonorsList.css
│   ├── BloodRequestsList.jsx    # Blood requests
│   └── BloodRequestsList.css
├── App.jsx                      # Main demo application
├── App.css                      # App styles
├── package.json                 # Dependencies
└── README.md                    # This file
```

## 🚀 **Running the Project**

### **Development**
```bash
npm start
```
Access at `http://localhost:3000`

### **Production Build**
```bash
npm run build
```

### **Testing**
```bash
npm test
```

## 🔮 **Future Enhancements**

- **Map Integration**: Google Maps/OpenStreetMap integration
- **GPS Support**: Real-time location detection
- **Search Functionality**: Location search with autocomplete
- **Distance Calculation**: Calculate distances between locations
- **API Integration**: Connect to real backend services
- **Multi-language**: Bengali language support
- **Offline Support**: PWA capabilities

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 **License**

MIT License - see LICENSE file for details

## 🆘 **Support**

For questions or issues:
- Open an issue on GitHub
- Check the component documentation
- Review the demo application

## 🎉 **Acknowledgments**

- Bangladesh Administrative Divisions data
- React community for excellent tooling
- Modern CSS features for beautiful UI
- Blood donation community for inspiration

---

**BloodHub Location System** - Making blood donation location-aware and efficient across Bangladesh! 🩸🇧🇩

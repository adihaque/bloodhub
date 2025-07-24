// Dummy data and types for development (replace with backend data later)

export interface Donor {
  name: string;
  group: string;
  distance: string;
  lastDonated: string;
  phone: string;
  email: string;
  age: number;
  gender: string;
}

export interface UrgentRequest {
  bloodGroup: string;
  totalUnits: number;
  urgency: string;
  requestCount: number;
  timePosted: string;
  patients: Array<{
    id: number;
    cause: string;
    age: string;
    gender: string;
    unitsNeeded: number;
    hospital: string;
    hospitalAddress: string;
    distance: string;
    contactPerson: string;
    contactPhone: string;
    timePosted: string;
    coordinates: { lat: number; lng: number };
  }>;
}

export const donors: Donor[] = [
  { name: "Rafiq Ahmed", group: "O-", distance: "1.2 km", lastDonated: "2 months ago", phone: "+880 1711-123456", email: "rafiq@email.com", age: 32, gender: "Male" },
  { name: "Sadia Rahman", group: "A+", distance: "2.8 km", lastDonated: "1 month ago", phone: "+880 1712-234567", email: "sadia@email.com", age: 27, gender: "Female" },
  { name: "Imran Hossain", group: "B+", distance: "0.8 km", lastDonated: "3 weeks ago", phone: "+880 1713-345678", email: "imran@email.com", age: 29, gender: "Male" },
  { name: "Nusrat Jahan", group: "AB+", distance: "3.5 km", lastDonated: "1 week ago", phone: "+880 1714-456789", email: "nusrat@email.com", age: 24, gender: "Female" },
  { name: "Tanvir Islam", group: "O+", distance: "2.1 km", lastDonated: "2 months ago", phone: "+880 1715-567890", email: "tanvir@email.com", age: 35, gender: "Male" },
  { name: "Farhana Akter", group: "A-", distance: "1.7 km", lastDonated: "5 weeks ago", phone: "+880 1716-678901", email: "farhana@email.com", age: 31, gender: "Female" },
];

export const urgentRequests: UrgentRequest[] = [
  {
    bloodGroup: "O-",
    totalUnits: 5,
    urgency: "Critical",
    requestCount: 3,
    timePosted: "8 mins ago",
    patients: [
      {
        id: 1,
        cause: "Emergency Surgery",
        age: "45 years old",
        gender: "Male",
        unitsNeeded: 2,
        hospital: "Dhaka Medical College Hospital",
        hospitalAddress: "Dhaka Medical College Hospital, Ramna, Dhaka 1000",
        distance: "1.2 km",
        contactPerson: "Dr. Rahman",
        contactPhone: "+880 1711-123456",
        timePosted: "15 mins ago",
        coordinates: { lat: 23.7261, lng: 90.3961 },
      },
      {
        id: 2,
        cause: "Jet Crash Victim",
        age: "35 years old",
        gender: "Male",
        unitsNeeded: 3,
        hospital: "Diabari Emergency Center",
        hospitalAddress: "Diabari Emergency Medical Center, Uttara, Dhaka",
        distance: "0.8 km",
        contactPerson: "Dr. Ahmed",
        contactPhone: "+880 1713-345678",
        timePosted: "8 mins ago",
        coordinates: { lat: 23.8759, lng: 90.3795 },
      },
    ],
  },
  {
    bloodGroup: "A+",
    totalUnits: 4,
    urgency: "Urgent",
    requestCount: 2,
    timePosted: "12 mins ago",
    patients: [
      {
        id: 3,
        cause: "Road Accident",
        age: "28 years old",
        gender: "Female",
        unitsNeeded: 1,
        hospital: "Square Hospital Ltd",
        hospitalAddress: "Square Hospital Ltd, West Panthapath, Dhaka 1205",
        distance: "2.8 km",
        contactPerson: "Dr. Fatima",
        contactPhone: "+880 1712-234567",
        timePosted: "32 mins ago",
        coordinates: { lat: 23.7516, lng: 90.374 },
      },
      {
        id: 4,
        cause: "Surgery Complications",
        age: "52 years old",
        gender: "Male",
        unitsNeeded: 3,
        hospital: "United Hospital",
        hospitalAddress: "United Hospital, Gulshan, Dhaka 1212",
        distance: "3.5 km",
        contactPerson: "Dr. Khan",
        contactPhone: "+880 1714-456789",
        timePosted: "12 mins ago",
        coordinates: { lat: 23.7806, lng: 90.4193 },
      },
    ],
  },
  {
    bloodGroup: "B+",
    totalUnits: 6,
    urgency: "Critical",
    requestCount: 2,
    timePosted: "5 mins ago",
    patients: [
      {
        id: 5,
        cause: "Jet Crash Victim",
        age: "29 years old",
        gender: "Female",
        unitsNeeded: 2,
        hospital: "Diabari Emergency Center",
        hospitalAddress: "Diabari Emergency Medical Center, Uttara, Dhaka",
        distance: "0.8 km",
        contactPerson: "Dr. Ahmed",
        contactPhone: "+880 1713-345678",
        timePosted: "5 mins ago",
        coordinates: { lat: 23.8759, lng: 90.3795 },
      },
      {
        id: 6,
        cause: "Internal Bleeding",
        age: "41 years old",
        gender: "Male",
        unitsNeeded: 4,
        hospital: "Apollo Hospital",
        hospitalAddress: "Apollo Hospital, Bashundhara, Dhaka 1229",
        distance: "4.2 km",
        contactPerson: "Dr. Hasan",
        contactPhone: "+880 1715-567890",
        timePosted: "18 mins ago",
        coordinates: { lat: 23.8041, lng: 90.4152 },
      },
    ],
  },
]; 
export interface EquipmentItem {
  id: string;
  name: string;
  category: 'Medical Imaging' | 'Biotechnology' | 'Microscopy' | 'Laboratory Systems';
  modelNumber: string;
  status: 'Active' | 'Rented' | 'Maintenance';
  ratePerHour: number;
  totalEarningsAlgo: number;
  utilizationRate: number;
  location: string;
  imageUrl: string;
}

export interface BookingRequest {
  id: string;
  equipmentId: string;
  equipmentName: string;
  equipmentCategory: string;
  equipmentLocation: string;
  requesterInstitutionId: string;
  requesterInstitutionName: string;
  requesterInstitutionType: string;
  requesterInstitutionLocation: string;
  requesterInstitutionVerified: boolean;
  requesterName: string;
  startTime: string;
  endTime: string;
  hours: number;
  totalCostAlgo: number;
  purpose: string;
  status: 'Pending Payment' | 'Accepted' | 'Rejected' | 'Cancelled' | 'Completed';
  createdAt: string;
}

export const PROVIDER_STATS = {
  institutionName: 'SRM Medical & Research Institute',
  nodeId: 'SRM-CHE-092',
  totalRevenueAlgo: 28450,
  growthPercentage: 11.2,
  totalLeasedHours: 2480,
  activeLeases: 6,
  totalEquipment: 8,
  overallUtilization: 84.0,
  ratings: {
    maintenance: 96,
    uptime: 99,
    operatorSupport: 92,
  },
  timeDistribution: [
    { name: 'Morning (08:00 - 13:00)', value: 42, hours: '1,041 hrs' },
    { name: 'Afternoon (13:00 - 18:00)', value: 38, hours: '942 hrs' },
    { name: 'Night (18:00 - 00:00)', value: 20, hours: '497 hrs' },
  ],
  dailyCapacityTrend: [
    { day: '01', current: 68, previous: 45 },
    { day: '02', current: 74, previous: 50 },
    { day: '03', current: 82, previous: 62 },
    { day: '04', current: 90, previous: 70 },
    { day: '05', current: 85, previous: 65 },
    { day: '06', current: 60, previous: 40 },
    { day: '07', current: 78, previous: 55 },
    { day: '08', current: 92, previous: 68 },
    { day: '09', current: 88, previous: 60 },
    { day: '10', current: 96, previous: 75 },
    { day: '11', current: 80, previous: 58 },
    { day: '12', current: 89, previous: 64 },
  ],
  hourlyLeaseVolume: [
    { time: '08:00', current: 20, previous: 15 },
    { time: '10:00', current: 48, previous: 30 },
    { time: '12:00', current: 65, previous: 45 },
    { time: '14:00', current: 85, previous: 55 },
    { time: '16:00', current: 70, previous: 60 },
    { time: '18:00', current: 95, previous: 72 },
    { time: '20:00', current: 50, previous: 40 },
  ],
};

export const MOCK_BOOKING_REQUESTS: BookingRequest[] = [
  {
    id: 'BK-9001',
    equipmentId: 'EQ-102',
    equipmentName: 'Cryo-EM Transmission Scope',
    equipmentCategory: 'Microscopy',
    equipmentLocation: 'Nanotechnology Complex 4',
    requesterInstitutionId: 'INST-014',
    requesterInstitutionName: 'Anna University - Structural Biology Lab',
    requesterInstitutionType: 'University',
    requesterInstitutionLocation: 'Chennai, TN',
    requesterInstitutionVerified: true,
    requesterName: 'Dr. Kavitha Raman',
    startTime: '2026-09-15T09:00:00Z',
    endTime: '2026-09-15T15:00:00Z',
    hours: 6,
    totalCostAlgo: 1440,
    purpose: 'Cryo-EM imaging session for a spike-protein structural study ahead of a grant deadline.',
    status: 'Pending Payment',
    createdAt: '2026-09-10T05:12:00Z',
  },
  {
    id: 'BK-9002',
    equipmentId: 'EQ-105',
    equipmentName: 'High-Throughput DNA Sequencer',
    equipmentCategory: 'Biotechnology',
    equipmentLocation: 'Genomics Hub - Bay 1',
    requesterInstitutionId: 'INST-021',
    requesterInstitutionName: 'IIT Madras - Genomics Research Group',
    requesterInstitutionType: 'Research Institute',
    requesterInstitutionLocation: 'Chennai, TN',
    requesterInstitutionVerified: true,
    requesterName: 'Arjun Mehta',
    startTime: '2026-09-17T08:00:00Z',
    endTime: '2026-09-17T20:00:00Z',
    hours: 12,
    totalCostAlgo: 2340,
    purpose: 'Whole-genome sequencing run for a rice crop resilience project.',
    status: 'Pending Payment',
    createdAt: '2026-09-09T18:40:00Z',
  },
  {
    id: 'BK-9003',
    equipmentId: 'EQ-107',
    equipmentName: 'Dual-Source 128-Slice CT',
    equipmentCategory: 'Medical Imaging',
    equipmentLocation: 'Radiology Wing - Suite 3',
    requesterInstitutionId: 'INST-008',
    requesterInstitutionName: 'Apollo Diagnostics Network',
    requesterInstitutionType: 'Hospital',
    requesterInstitutionLocation: 'Coimbatore, TN',
    requesterInstitutionVerified: false,
    requesterName: 'Dr. Priya Shankar',
    startTime: '2026-09-12T06:30:00Z',
    endTime: '2026-09-12T10:30:00Z',
    hours: 4,
    totalCostAlgo: 560,
    purpose: 'Overflow patient scans while our own CT unit is under scheduled maintenance.',
    status: 'Pending Payment',
    createdAt: '2026-09-08T11:05:00Z',
  },
];

export const MOCK_EQUIPMENT: EquipmentItem[] = [
  {
    id: 'EQ-101',
    name: '3T Clinical MRI Scanner',
    category: 'Medical Imaging',
    modelNumber: 'Siemens Magnetom Vida',
    status: 'Rented',
    ratePerHour: 125,
    totalEarningsAlgo: 5200,
    utilizationRate: 91,
    location: 'Diagnostic Wing - Bay 2',
    imageUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'EQ-102',
    name: 'Cryo-EM Transmission Scope',
    category: 'Microscopy',
    modelNumber: 'Thermo Scientific Krios G4',
    status: 'Active',
    ratePerHour: 240,
    totalEarningsAlgo: 7680,
    utilizationRate: 94,
    location: 'Nanotechnology Complex 4',
    imageUrl: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'EQ-103',
    name: 'Confocal Spectral Scanner',
    category: 'Microscopy',
    modelNumber: 'Leica TCS SP8 X',
    status: 'Active',
    ratePerHour: 85,
    totalEarningsAlgo: 2150,
    utilizationRate: 72,
    location: 'Advanced Imaging Block B',
    imageUrl: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'EQ-104',
    name: 'Floor Ultracentrifuge',
    category: 'Laboratory Systems',
    modelNumber: 'Beckman Optima XPN',
    status: 'Maintenance',
    ratePerHour: 45,
    totalEarningsAlgo: 1420,
    utilizationRate: 48,
    location: 'Biochem Central Lab 1',
    imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'EQ-105',
    name: 'High-Throughput DNA Sequencer',
    category: 'Biotechnology',
    modelNumber: 'Illumina NovaSeq 6000',
    status: 'Active',
    ratePerHour: 195,
    totalEarningsAlgo: 6240,
    utilizationRate: 88,
    location: 'Genomics Hub - Bay 1',
    imageUrl: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'EQ-106',
    name: 'Orbitrap Mass Spectrometer',
    category: 'Laboratory Systems',
    modelNumber: 'Thermo Exploris 480',
    status: 'Rented',
    ratePerHour: 160,
    totalEarningsAlgo: 4800,
    utilizationRate: 95,
    location: 'Proteomics Core Facility',
    imageUrl: 'https://images.unsplash.com/photo-1581093588401-fbb62a02f120?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'EQ-107',
    name: 'Dual-Source 128-Slice CT',
    category: 'Medical Imaging',
    modelNumber: 'Siemens SOMATOM Force',
    status: 'Active',
    ratePerHour: 140,
    totalEarningsAlgo: 3920,
    utilizationRate: 79,
    location: 'Radiology Wing - Suite 3',
    imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'EQ-108',
    name: 'Flow Cytometry Cell Sorter',
    category: 'Biotechnology',
    modelNumber: 'BD FACSAria Fusion',
    status: 'Active',
    ratePerHour: 110,
    totalEarningsAlgo: 3100,
    utilizationRate: 83,
    location: 'Immunology Suite C',
    imageUrl: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&w=800&q=80',
  },
];
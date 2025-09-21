// User types
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  preferredLanguage?: string;
  createdAt: string;
  updatedAt: string;
}

// Club types
export interface Club {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  rating: number;
  totalReviews: number;
  images: string[];
  amenities: string[];
  latitude: number;
  longitude: number;
  distance?: number;
  priceRange: {
    min: number;
    max: number;
  };
  operatingHours: {
    [key: string]: {
      open: string;
      close: string;
      closed: boolean;
    };
  };
  courts: Court[];
  createdAt: string;
  updatedAt: string;
}

// Court types
export interface Court {
  id: string;
  clubId: string;
  name: string;
  type: 'indoor' | 'outdoor';
  surface: 'artificial_grass' | 'concrete' | 'glass';
  hasLighting: boolean;
  pricePerHour: number;
  status: 'active' | 'maintenance' | 'inactive';
  images: string[];
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// Booking types
export interface Booking {
  id: string;
  userId: string;
  clubId: string;
  courtId: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentMethod?: 'card' | 'cash' | 'transfer';
  splitPayment?: {
    enabled: boolean;
    participants: SplitParticipant[];
  };
  notes?: string;
  club: Club;
  court: Court;
  user: User;
  createdAt: string;
  updatedAt: string;
}

export interface SplitParticipant {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  amount: number;
  status: 'pending' | 'paid';
}

// Time slot types
export interface TimeSlot {
  time: string;
  available: boolean;
  price: number;
  courtId: string;
}

export interface AvailableSlot {
  date: string;
  slots: TimeSlot[];
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// Location types
export interface Location {
  latitude: number;
  longitude: number;
}

export interface LocationPermission {
  granted: boolean;
  canAskAgain: boolean;
}

// Notification types
export interface PushNotification {
  id: string;
  title: string;
  body: string;
  data?: any;
  sound?: boolean;
  badge?: number;
}

// Filter types
export interface ClubFilters {
  search?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  priceMin?: number;
  priceMax?: number;
  amenities?: string[];
  rating?: number;
  sortBy?: 'distance' | 'rating' | 'price';
  sortOrder?: 'asc' | 'desc';
}

// Form types
export interface BookingFormData {
  clubId: string;
  courtId: string;
  date: string;
  startTime: string;
  duration: number;
  splitPayment?: boolean;
  participants?: Omit<SplitParticipant, 'id' | 'status'>[];
  notes?: string;
}
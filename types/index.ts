//app/types.ts
export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface Conversation {
  id: string;
  provider_id: string;
  customer_id: string;
  last_message: string | null;
  last_message_at: string | null;
  created_at: string;
  booking_id: string | null;
}

export interface Provider {
  id: string;
  company_name: string;
  category: string;
  region: string;
  rating: number | null;
  reviews: number | null;
  verified: boolean | null;
  image: string | null;
  bio: string | null;
  response_time: string | null;
  jobs_completed: number | null;
  skills: string[] | null;
  user_id: string | null;
  years_experience: number | null;
  service_areas: string[] | null;
  pricing_type: string | null;
  price_min: number | null;
  price_max: number | null;
  trade_id: number | null;
}

export interface Booking {
  id: string;
  provider_id: string;
  client_id: string;
  client_name: string;
  service: string;
  status: string | null;
  scheduled_date: string;
  scheduled_time: string;
  price: number | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
  payment_method: string | null;
  quoted_price: number | null;
  client_confirmed_at: string | null;
  commission_due: number | null;
}

export interface Review {
  id: string;
  provider_id: string;
  reviewer_name: string;
  reviewer_id: string | null;
  rating: number;
  comment: string | null;
  created_at: string | null;
  photo_url: string | null;
}

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  region: string | null;
  created_at: string | null;
  updated_at: string | null;
  role: string;
}

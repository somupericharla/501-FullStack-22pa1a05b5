export type Task = {
  id: string;
  title: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  user_id: string;
  created_at: string;
  updated_at: string;
}

export type Profile = {
  id: string;
  email: string;
  name: string;
  created_at: string;
}
export type UserRole = 'admin' | 'user';

export interface Profile {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  author_id: string;
  author_name: string;
  image_url?: string;
  likes_count?: number;
  created_at: string;
  updated_at: string;
  type: 'blog';
}

export interface Like {
  id: string;
  user_id: string;
  post_id: string;
  created_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  author_name: string;
  content: string;
  created_at: string;
}

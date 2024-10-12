export interface IUser {
  id: string;
  firstname?: string;
  lastname?: string;
  address: string;
  message?: string;
  signature: string;
  phone: string;
  slug: string;
  linkedin: string;
  score: number;
  about: string;
  createdAt: Date;
  country?: string;
  discord?: string;
  facebook?: string;
  twitter?: string;
}

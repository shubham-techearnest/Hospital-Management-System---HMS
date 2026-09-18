export type HeroAudienceFocus = 'none' | 'patient' | 'hospital';

export interface LandingHeroProps {
  isAuthenticated: boolean;
  displayName?: string;
  roles?: string[];
}

import { useState } from 'react';
import LandingPage from './LandingPage.tsx';
import { PRDConfigurationForm } from '../components/PRDConfigurationForm.tsx';

type PageState = 'landing' | 'builder';

export default function HomePage() {
  const [currentPage, setCurrentPage] = useState<PageState>('landing');

  if (currentPage === 'landing') {
    return <LandingPage onStartBuilding={() => setCurrentPage('builder')} />;
  }

  return <PRDConfigurationForm onBack={() => setCurrentPage('landing')} />;
}
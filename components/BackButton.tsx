'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@tremor/react';

interface BackButtonProps {
  className?: string;
}

const BackButton = ({ className = '' }: BackButtonProps) => {
  const router = useRouter();

  return (
    <Button
      size="sm"
      variant="secondary"
      icon={() => (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className={`w-4 h-4 ${className}`}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
          />
        </svg>
      )}
      onClick={() => router.back()}
    >
      Voltar
    </Button>
  );
};

export default BackButton; 
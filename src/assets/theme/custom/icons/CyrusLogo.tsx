import { createIcon } from '@chakra-ui/react';

export const CyrusLogo = createIcon({
  displayName: 'CyrusLogo',
  viewBox: '0 0 100 100',
  path: (
    <>
      <defs>
        <linearGradient id="cyrus-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="50%" stopColor="#FFA500" />
          <stop offset="100%" stopColor="#B8860B" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="#1a1a2e" />
      <circle cx="50" cy="50" r="44" fill="none" stroke="url(#cyrus-gold)" strokeWidth="3" />
      <text
        x="50"
        y="68"
        fontFamily="Georgia, serif"
        fontSize="56"
        fontWeight="bold"
        fill="url(#cyrus-gold)"
        textAnchor="middle"
      >
        C
      </text>
    </>
  ),
});

// Alternative simple version that works better at small sizes
export const CyrusLogoSimple = createIcon({
  displayName: 'CyrusLogoSimple',
  viewBox: '0 0 100 100',
  path: (
    <>
      <circle cx="50" cy="50" r="48" fill="currentColor" opacity="0.1" />
      <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="3" />
      <text
        x="50"
        y="68"
        fontFamily="Georgia, serif"
        fontSize="56"
        fontWeight="bold"
        fill="currentColor"
        textAnchor="middle"
      >
        C
      </text>
    </>
  ),
});

import React from 'react';

interface IllustratedArtProps {
  artKey: string;
  label: string;
  size?: number;
  className?: string;
}

export const IllustratedArt: React.FC<IllustratedArtProps> = ({
  artKey,
  label,
  size = 96,
  className = '',
}) => {
  const key = artKey.toLowerCase();

  const renderArtwork = () => {
    switch (key) {
      case 'mamae':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#FCE7F3" />
            <path d="M26 78 C28 58 72 58 74 78 Z" fill="#EC4899" />
            <circle cx="50" cy="39" r="18" fill="#78350F" />
            <circle cx="50" cy="42" r="14" fill="#FDE68A" />
            <circle cx="45" cy="41" r="2.2" fill="#0F172A" />
            <circle cx="55" cy="41" r="2.2" fill="#0F172A" />
            <path d="M44 48 Q50 53 56 48" stroke="#BE185D" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M72 28 C72 24 77 24 77 28 C77 24 82 24 82 28 C82 32 77 36 77 36 C77 36 72 32 72 28 Z" fill="#EC4899" />
          </>
        );
      case 'papai':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#E0F2FE" />
            <path d="M25 80 C27 59 73 59 75 80 Z" fill="#0284C7" />
            <circle cx="50" cy="41" r="15" fill="#FDE68A" />
            <path d="M35 38 C36 24 64 24 65 38 C60 32 40 32 35 38 Z" fill="#334155" />
            <circle cx="44.5" cy="41" r="2.2" fill="#0F172A" />
            <circle cx="55.5" cy="41" r="2.2" fill="#0F172A" />
            <path d="M44 49 Q50 53 56 49" stroke="#0F172A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </>
        );
      case 'vovo_f':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#F3E8FF" />
            <circle cx="50" cy="23" r="8" fill="#CBD5E1" />
            <path d="M26 80 C28 60 72 60 74 80 Z" fill="#8B5CF6" />
            <circle cx="50" cy="42" r="15" fill="#FDE68A" />
            <path d="M35 37 C36 25 64 25 65 37" fill="#CBD5E1" />
            <circle cx="44" cy="42" r="4.5" fill="none" stroke="#475569" strokeWidth="1.8" />
            <circle cx="56" cy="42" r="4.5" fill="none" stroke="#475569" strokeWidth="1.8" />
            <line x1="48.5" y1="42" x2="51.5" y2="42" stroke="#475569" strokeWidth="1.8" />
            <path d="M45 50 Q50 54 55 50" stroke="#7C3AED" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          </>
        );
      case 'vovo_m':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#ECFDF5" />
            <path d="M26 80 C28 60 72 60 74 80 Z" fill="#10B981" />
            <circle cx="50" cy="42" r="15" fill="#FDE68A" />
            <path d="M35 36 C37 29 44 28 45 35 M55 35 C56 28 63 29 65 36" stroke="#CBD5E1" strokeWidth="4" fill="none" strokeLinecap="round" />
            <circle cx="44.5" cy="41" r="2.1" fill="#0F172A" />
            <circle cx="55.5" cy="41" r="2.1" fill="#0F172A" />
            <path d="M43 47 Q50 45 57 47" stroke="#CBD5E1" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            <path d="M46 51 Q50 54 54 51" stroke="#0F172A" strokeWidth="2" fill="none" strokeLinecap="round" />
          </>
        );
      case 'bebe':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#FEF3C7" />
            <circle cx="50" cy="48" r="20" fill="#FDE68A" />
            <path d="M46 28 Q50 20 55 27" stroke="#92400E" strokeWidth="3" fill="none" strokeLinecap="round" />
            <circle cx="43" cy="46" r="2.4" fill="#0F172A" />
            <circle cx="57" cy="46" r="2.4" fill="#0F172A" />
            <circle cx="38" cy="52" r="3" fill="#FDA4AF" />
            <circle cx="62" cy="52" r="3" fill="#FDA4AF" />
            <circle cx="50" cy="56" r="4.5" fill="#38BDF8" />
          </>
        );
      case 'irmao':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#E0F2FE" />
            <path d="M28 80 C30 62 70 62 72 80 Z" fill="#F97316" />
            <circle cx="50" cy="44" r="14" fill="#FDE68A" />
            <path d="M35 38 C38 24 66 26 65 40 C60 32 42 32 35 38 Z" fill="#0284C7" />
            <circle cx="45" cy="44" r="2.1" fill="#0F172A" />
            <circle cx="55" cy="44" r="2.1" fill="#0F172A" />
            <path d="M44 51 Q50 55 56 51" stroke="#0F172A" strokeWidth="2.3" fill="none" strokeLinecap="round" />
          </>
        );
      case 'irma':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#FCE7F3" />
            <circle cx="33" cy="36" r="7" fill="#78350F" />
            <circle cx="67" cy="36" r="7" fill="#78350F" />
            <circle cx="34" cy="30" r="3" fill="#F43F5E" />
            <circle cx="66" cy="30" r="3" fill="#F43F5E" />
            <path d="M28 80 C30 62 70 62 72 80 Z" fill="#F43F5E" />
            <circle cx="50" cy="43" r="14" fill="#FDE68A" />
            <path d="M36 40 C38 26 62 26 64 40 C58 34 42 34 36 40 Z" fill="#78350F" />
            <circle cx="45" cy="43" r="2.1" fill="#0F172A" />
            <circle cx="55" cy="43" r="2.1" fill="#0F172A" />
            <path d="M44 50 Q50 54 56 50" stroke="#BE123C" strokeWidth="2.3" fill="none" strokeLinecap="round" />
          </>
        );
      case 'prima':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#F3E8FF" />
            <path d="M32 54 C30 32 70 32 68 54" fill="#92400E" />
            <path d="M27 80 C29 61 71 61 73 80 Z" fill="#A855F7" />
            <circle cx="50" cy="43" r="14" fill="#FDE68A" />
            <path d="M36 37 Q50 28 64 37" stroke="#EC4899" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            <circle cx="45" cy="43" r="2.1" fill="#0F172A" />
            <circle cx="55" cy="43" r="2.1" fill="#0F172A" />
            <path d="M44 50 Q50 54 56 50" stroke="#7E22CE" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          </>
        );
      case 'primo':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#ECFDF5" />
            <path d="M28 80 C30 62 70 62 72 80 Z" fill="#10B981" />
            <circle cx="41" cy="31" r="6" fill="#451A03" />
            <circle cx="50" cy="28" r="7" fill="#451A03" />
            <circle cx="59" cy="31" r="6" fill="#451A03" />
            <circle cx="50" cy="44" r="14" fill="#FDE68A" />
            <circle cx="45" cy="44" r="2.1" fill="#0F172A" />
            <circle cx="55" cy="44" r="2.1" fill="#0F172A" />
            <path d="M44 51 Q50 55 56 51" stroke="#0F172A" strokeWidth="2.3" fill="none" strokeLinecap="round" />
          </>
        );
      case 'tia':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#FFF7ED" />
            <path d="M31 58 C31 28 69 28 69 58 Z" fill="#7C2D12" />
            <path d="M26 80 C28 59 72 59 74 80 Z" fill="#F97316" />
            <circle cx="50" cy="42" r="14.5" fill="#FDE68A" />
            <path d="M36 38 C39 27 61 27 64 38 C58 33 42 33 36 38 Z" fill="#7C2D12" />
            <circle cx="35" cy="45" r="2.2" fill="#F59E0B" />
            <circle cx="65" cy="45" r="2.2" fill="#F59E0B" />
            <circle cx="45" cy="42" r="2.1" fill="#0F172A" />
            <circle cx="55" cy="42" r="2.1" fill="#0F172A" />
            <path d="M44 49 Q50 53 56 49" stroke="#C2410C" strokeWidth="2.3" fill="none" strokeLinecap="round" />
          </>
        );
      case 'tio':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#EEF2FF" />
            <path d="M25 80 C27 59 73 59 75 80 Z" fill="#6366F1" />
            <circle cx="50" cy="41" r="15" fill="#FDE68A" />
            <path d="M35 37 C37 24 63 24 65 37 C59 31 41 31 35 37 Z" fill="#1E293B" />
            <rect x="38" y="38" width="10" height="7" rx="2.5" fill="none" stroke="#334155" strokeWidth="2" />
            <rect x="52" y="38" width="10" height="7" rx="2.5" fill="none" stroke="#334155" strokeWidth="2" />
            <line x1="48" y1="41" x2="52" y2="41" stroke="#334155" strokeWidth="2" />
            <circle cx="43" cy="41.5" r="1.8" fill="#0F172A" />
            <circle cx="57" cy="41.5" r="1.8" fill="#0F172A" />
            <path d="M44 49 Q50 53 56 49" stroke="#0F172A" strokeWidth="2.3" fill="none" strokeLinecap="round" />
          </>
        );
      case 'titio':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#FEF3C7" />
            <path d="M26 80 C28 59 72 59 74 80 Z" fill="#F59E0B" />
            <circle cx="50" cy="43" r="14.5" fill="#FDE68A" />
            <path d="M35 35 C37 22 63 22 65 35 Z" fill="#0284C7" />
            <path d="M34 35 L71 35" stroke="#0369A1" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="44.5" cy="43" r="2.1" fill="#0F172A" />
            <circle cx="55.5" cy="43" r="2.1" fill="#0F172A" />
            <path d="M44 50 Q50 54 56 50" stroke="#0F172A" strokeWidth="2.4" fill="none" strokeLinecap="round" />
          </>
        );
      case 'madrinha':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#FFE4E6" />
            <circle cx="50" cy="24" r="7" fill="#78350F" />
            <circle cx="57" cy="24" r="3" fill="#FB7185" />
            <path d="M26 80 C28 59 72 59 74 80 Z" fill="#E11D48" />
            <circle cx="50" cy="42" r="14.5" fill="#FDE68A" />
            <path d="M35 39 C37 26 63 26 65 39 C58 33 42 33 35 39 Z" fill="#78350F" />
            <circle cx="44.5" cy="42" r="2.1" fill="#0F172A" />
            <circle cx="55.5" cy="42" r="2.1" fill="#0F172A" />
            <path d="M44 49 Q50 53 56 49" stroke="#9F1239" strokeWidth="2.3" fill="none" strokeLinecap="round" />
            <polygon points="75,24 77,29 82,29 78,32 79,37 75,34 71,37 72,32 68,29 73,29" fill="#F59E0B" />
          </>
        );
      case 'padrinho':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#E0F2FE" />
            <path d="M25 80 C27 59 73 59 75 80 Z" fill="#0369A1" />
            <polygon points="47,62 53,62 52,78 48,78" fill="#F59E0B" />
            <circle cx="50" cy="41" r="15" fill="#FDE68A" />
            <path d="M35 37 C37 24 63 24 65 37 C58 31 42 31 35 37 Z" fill="#475569" />
            <circle cx="44.5" cy="41" r="2.1" fill="#0F172A" />
            <circle cx="55.5" cy="41" r="2.1" fill="#0F172A" />
            <path d="M44 49 Q50 53 56 49" stroke="#0F172A" strokeWidth="2.3" fill="none" strokeLinecap="round" />
            <polygon points="75,24 77,29 82,29 78,32 79,37 75,34 71,37 72,32 68,29 73,29" fill="#F59E0B" />
          </>
        );
      case 'bisavo_f':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#F5F3FF" />
            <circle cx="50" cy="22" r="8" fill="#E2E8F0" />
            <path d="M26 80 C28 60 72 60 74 80 Z" fill="#7C3AED" />
            <circle cx="44" cy="64" r="2" fill="#F8FAFC" />
            <circle cx="50" cy="66" r="2" fill="#F8FAFC" />
            <circle cx="56" cy="64" r="2" fill="#F8FAFC" />
            <circle cx="50" cy="42" r="15" fill="#FDE68A" />
            <path d="M35 37 C36 25 64 25 65 37" fill="#E2E8F0" />
            <circle cx="44" cy="42" r="4.3" fill="none" stroke="#475569" strokeWidth="1.8" />
            <circle cx="56" cy="42" r="4.3" fill="none" stroke="#475569" strokeWidth="1.8" />
            <line x1="48.3" y1="42" x2="51.7" y2="42" stroke="#475569" strokeWidth="1.8" />
            <path d="M45 50 Q50 54 55 50" stroke="#6D28D9" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          </>
        );
      case 'bisavo_m':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#ECFDF5" />
            <path d="M26 80 C28 60 72 60 74 80 Z" fill="#059669" />
            <circle cx="50" cy="42" r="15" fill="#FDE68A" />
            <path d="M35 36 C37 28 45 27 46 34 M54 34 C55 27 63 28 65 36" stroke="#E2E8F0" strokeWidth="4" fill="none" strokeLinecap="round" />
            <circle cx="44" cy="41.5" r="4.2" fill="none" stroke="#475569" strokeWidth="1.7" />
            <circle cx="56" cy="41.5" r="4.2" fill="none" stroke="#475569" strokeWidth="1.7" />
            <line x1="48.2" y1="41.5" x2="51.8" y2="41.5" stroke="#475569" strokeWidth="1.7" />
            <path d="M42 48 Q50 45 58 48" stroke="#E2E8F0" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            <path d="M46 52 Q50 55 54 52" stroke="#0F172A" strokeWidth="2" fill="none" strokeLinecap="round" />
          </>
        );
      case 'sobrinha':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#FEF9C3" />
            <path d="M62 32 C72 30 74 44 66 47" fill="#92400E" />
            <circle cx="62" cy="32" r="3.5" fill="#EC4899" />
            <path d="M29 80 C31 63 69 63 71 80 Z" fill="#EC4899" />
            <circle cx="50" cy="44" r="13.5" fill="#FDE68A" />
            <path d="M36 40 C39 27 61 27 64 40 C58 34 42 34 36 40 Z" fill="#92400E" />
            <circle cx="45" cy="44" r="2" fill="#0F172A" />
            <circle cx="55" cy="44" r="2" fill="#0F172A" />
            <path d="M45 51 Q50 55 55 51" stroke="#BE185D" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          </>
        );
      case 'sobrinho':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#ECFEFF" />
            <path d="M29 80 C31 63 69 63 71 80 Z" fill="#06B6D4" />
            <polygon points="39,34 44,23 50,31 55,22 61,34" fill="#78350F" />
            <circle cx="50" cy="44" r="13.5" fill="#FDE68A" />
            <circle cx="45" cy="44" r="2" fill="#0F172A" />
            <circle cx="55" cy="44" r="2" fill="#0F172A" />
            <path d="M45 51 Q50 55 55 51" stroke="#0F172A" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          </>
        );
      case 'cunhado':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#CCFBF1" />
            <path d="M25 80 C27 59 73 59 75 80 Z" fill="#0D9488" />
            <circle cx="50" cy="41" r="15" fill="#FDE68A" />
            <path d="M35 37 C37 24 63 24 65 37 C58 31 42 31 35 37 Z" fill="#0F172A" />
            <circle cx="44.5" cy="41" r="2.1" fill="#0F172A" />
            <circle cx="55.5" cy="41" r="2.1" fill="#0F172A" />
            <path d="M44 49 Q50 53 56 49" stroke="#0F172A" strokeWidth="2.3" fill="none" strokeLinecap="round" />
          </>
        );
      case 'cunhada':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#FDF2F8" />
            <path d="M33 54 C33 27 67 27 67 54 L63 58 L37 58 Z" fill="#451A03" />
            <path d="M26 80 C28 59 72 59 74 80 Z" fill="#DB2777" />
            <circle cx="50" cy="42" r="14" fill="#FDE68A" />
            <path d="M36 39 C38 28 62 28 64 39 C58 33 42 33 36 39 Z" fill="#451A03" />
            <circle cx="45" cy="42" r="2.1" fill="#0F172A" />
            <circle cx="55" cy="42" r="2.1" fill="#0F172A" />
            <path d="M44 49 Q50 53 56 49" stroke="#9D174D" strokeWidth="2.3" fill="none" strokeLinecap="round" />
          </>
        );
      case 'agua':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#E0F2FE" />
            <path d="M33 28 L38 76 C38 80 62 80 62 76 L67 28 Z" fill="#FFFFFF" stroke="#0284C7" strokeWidth="3" />
            <path d="M36 46 L39 74 C39 76 61 76 61 74 L64 46 Q50 51 36 46 Z" fill="#38BDF8" />
            <circle cx="46" cy="60" r="2.5" fill="#FFFFFF" opacity="0.8" />
            <circle cx="55" cy="66" r="2" fill="#FFFFFF" opacity="0.8" />
          </>
        );
      case 'leite':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#EFF6FF" />
            <rect x="34" y="34" width="32" height="44" rx="5" fill="#FFFFFF" stroke="#38BDF8" strokeWidth="3" />
            <polygon points="34,34 50,20 66,34" fill="#0284C7" />
            <rect x="40" y="47" width="20" height="16" rx="4" fill="#BAE6FD" />
            <circle cx="50" cy="55" r="4" fill="#FFFFFF" />
          </>
        );
      case 'pao':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#FEF3C7" />
            <path d="M22 58 C22 34 78 34 78 58 C78 68 70 72 50 72 C30 72 22 68 22 58 Z" fill="#D97706" />
            <path d="M26 56 C26 38 74 38 74 56 C74 63 66 66 50 66 C34 66 26 63 26 56 Z" fill="#FBBF24" />
            <path d="M36 44 L44 50 M48 42 L56 48 M60 44 L66 50" stroke="#B45309" strokeWidth="3" strokeLinecap="round" />
          </>
        );
      case 'banana':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#FEF9C3" />
            <path d="M26 62 C36 74 68 68 74 32 C76 26 70 24 67 28 C60 52 40 58 28 54 C24 53 23 59 26 62 Z" fill="#FACC15" stroke="#CA8A04" strokeWidth="2.5" />
            <rect x="68" y="23" width="5" height="6" rx="1" fill="#78350F" />
          </>
        );
      case 'maca':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#FEE2E2" />
            <path d="M50 32 C34 26 24 40 27 56 C30 71 42 78 50 75 C58 78 70 71 73 56 C76 40 66 26 50 32 Z" fill="#EF4444" />
            <path d="M50 32 L52 21" stroke="#78350F" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M52 25 C60 19 67 23 64 30 C59 31 54 29 52 25 Z" fill="#22C55E" />
            <ellipse cx="38" cy="45" rx="4" ry="8" fill="#FCA5A5" opacity="0.6" transform="rotate(-15 38 45)" />
          </>
        );
      case 'uva':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#F3E8FF" />
            <path d="M50 24 L50 33" stroke="#78350F" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M50 27 C58 21 64 25 60 31 Z" fill="#22C55E" />
            {[
              [40, 40], [50, 40], [60, 40],
              [44, 51], [56, 51],
              [50, 62], [50, 72],
            ].map(([cx, cy], i) => (
              <circle key={i} cx={cx} cy={cy} r="7.5" fill="#8B5CF6" stroke="#6D28D9" strokeWidth="1.5" />
            ))}
          </>
        );
      case 'queijo':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#FEF3C7" />
            <polygon points="22,64 76,64 62,32 22,52" fill="#FBBF24" stroke="#D97706" strokeWidth="2.5" strokeLinejoin="round" />
            <circle cx="40" cy="55" r="4.5" fill="#D97706" />
            <circle cx="58" cy="57" r="3.5" fill="#D97706" />
            <circle cx="52" cy="45" r="3" fill="#D97706" />
          </>
        );
      case 'arroz':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#EFF6FF" />
            <path d="M26 48 C26 30 74 30 74 48 Z" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
            <path d="M22 48 L78 48 C76 68 64 75 50 75 C36 75 24 68 22 48 Z" fill="#0284C7" />
            <rect x="36" y="55" width="28" height="4" rx="2" fill="#BAE6FD" />
            <circle cx="42" cy="41" r="2" fill="#CBD5E1" />
            <circle cx="52" cy="38" r="2" fill="#CBD5E1" />
            <circle cx="60" cy="42" r="2" fill="#CBD5E1" />
          </>
        );
      case 'feijao':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#FEF3C7" />
            <ellipse cx="38" cy="44" rx="11" ry="8" fill="#78350F" transform="rotate(-25 38 44)" />
            <ellipse cx="62" cy="43" rx="11" ry="8" fill="#92400E" transform="rotate(20 62 43)" />
            <ellipse cx="50" cy="63" rx="12" ry="8.5" fill="#78350F" transform="rotate(8 50 63)" />
            <path d="M35 43 Q39 41 42 44" stroke="#FDE68A" strokeWidth="2.2" fill="none" strokeLinecap="round" />
            <path d="M58 42 Q62 40 65 43" stroke="#FDE68A" strokeWidth="2.2" fill="none" strokeLinecap="round" />
            <path d="M46 62 Q50 60 54 62" stroke="#FDE68A" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          </>
        );
      case 'bolo':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#FCE7F3" />
            <rect x="25" y="44" width="50" height="30" rx="6" fill="#FBBF24" stroke="#D97706" strokeWidth="2" />
            <path d="M25 46 C25 41 75 41 75 46 L75 54 Q69 60 63 54 Q57 60 50 54 Q43 60 37 54 Q31 60 25 54 Z" fill="#F472B6" />
            <line x1="50" y1="30" x2="50" y2="43" stroke="#38BDF8" strokeWidth="4" strokeLinecap="round" />
            <circle cx="50" cy="25" r="4.5" fill="#EF4444" />
          </>
        );
      case 'pera':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#ECFDF5" />
            <path d="M50 25 L52 19" stroke="#78350F" strokeWidth="3.2" strokeLinecap="round" />
            <path d="M52 22 C59 18 65 21 62 27 C57 28 53 26 52 22 Z" fill="#16A34A" />
            <path d="M50 26 C42 26 40 37 37 44 C32 54 31 74 50 75 C69 74 68 54 63 44 C60 37 58 26 50 26 Z" fill="#A3E635" stroke="#65A30D" strokeWidth="2.2" />
            <ellipse cx="41" cy="57" rx="3" ry="7" fill="#ECFCCB" opacity="0.7" transform="rotate(-10 41 57)" />
          </>
        );
      case 'mamao':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#FFF7ED" />
            <ellipse cx="50" cy="51" rx="23" ry="27" fill="#65A30D" />
            <ellipse cx="50" cy="51" rx="18" ry="22" fill="#FB923C" />
            <ellipse cx="50" cy="52" rx="9" ry="13" fill="#FDBA74" />
            {[
              [47, 45], [53, 45], [46, 51], [54, 51],
              [50, 48], [47, 57], [53, 57], [50, 61],
            ].map(([cx, cy], i) => (
              <circle key={i} cx={cx} cy={cy} r="2.2" fill="#1E293B" />
            ))}
          </>
        );
      case 'melancia':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#ECFDF5" />
            <path d="M22 46 C26 70 74 70 78 46 Z" fill="#16A34A" />
            <path d="M25 46 C29 66 71 66 75 46 Z" fill="#BBF7D0" />
            <path d="M27 46 C31 63 69 63 73 46 Z" fill="#EF4444" />
            <circle cx="40" cy="51" r="2" fill="#0F172A" />
            <circle cx="50" cy="54" r="2" fill="#0F172A" />
            <circle cx="60" cy="51" r="2" fill="#0F172A" />
          </>
        );
      case 'laranja':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#FFF7ED" />
            <circle cx="50" cy="53" r="23" fill="#F97316" stroke="#EA580C" strokeWidth="2" />
            <path d="M50 30 L52 22" stroke="#78350F" strokeWidth="3.2" strokeLinecap="round" />
            <path d="M52 24 C60 19 67 23 64 29 C58 30 54 28 52 24 Z" fill="#22C55E" />
            <circle cx="40" cy="45" r="3" fill="#FDBA74" opacity="0.7" />
            <circle cx="58" cy="59" r="1.5" fill="#C2410C" />
            <circle cx="63" cy="52" r="1.5" fill="#C2410C" />
          </>
        );
      case 'morango':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#FEE2E2" />
            <path d="M50 32 C32 30 27 48 35 63 C41 74 47 77 50 77 C53 77 59 74 65 63 C73 48 68 30 50 32 Z" fill="#EF4444" />
            <path d="M36 33 L45 27 L50 32 L55 27 L64 33 L56 37 L50 34 L44 37 Z" fill="#16A34A" />
            {[
              [42, 46], [50, 44], [58, 46],
              [40, 56], [50, 54], [60, 56],
              [46, 65], [54, 65],
            ].map(([cx, cy], i) => (
              <circle key={i} cx={cx} cy={cy} r="1.8" fill="#FEF08A" />
            ))}
          </>
        );
      case 'abacaxi':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#FEFCE8" />
            <polygon points="50,17 44,33 56,33" fill="#16A34A" />
            <polygon points="37,22 44,34 50,33" fill="#22C55E" />
            <polygon points="63,22 56,34 50,33" fill="#22C55E" />
            <ellipse cx="50" cy="55" rx="18" ry="22" fill="#FACC15" stroke="#D97706" strokeWidth="2.2" />
            <path d="M37 43 L63 63 M34 53 L58 72 M42 38 L66 56 M63 43 L37 63 M66 53 L42 72 M58 38 L34 56" stroke="#D97706" strokeWidth="1.8" opacity="0.65" />
          </>
        );
      case 'batata':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#FEF3C7" />
            <ellipse cx="50" cy="51" rx="25" ry="18" fill="#D97706" transform="rotate(-12 50 51)" />
            <ellipse cx="48" cy="49" rx="21" ry="14" fill="#F59E0B" transform="rotate(-12 48 49)" />
            <circle cx="38" cy="48" r="2.2" fill="#92400E" />
            <circle cx="56" cy="43" r="2" fill="#92400E" />
            <circle cx="60" cy="55" r="2.4" fill="#92400E" />
          </>
        );
      case 'cenoura':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#FFF7ED" />
            <g transform="rotate(28 50 50)">
              <path d="M44 33 L42 20 M50 33 L50 18 M56 33 L58 20" stroke="#16A34A" strokeWidth="4" strokeLinecap="round" />
              <path d="M38 35 C38 30 62 30 62 35 L53 76 C51 80 49 80 47 76 Z" fill="#F97316" stroke="#EA580C" strokeWidth="2" />
              <line x1="42" y1="43" x2="50" y2="43" stroke="#C2410C" strokeWidth="2.2" strokeLinecap="round" />
              <line x1="50" y1="53" x2="57" y2="53" stroke="#C2410C" strokeWidth="2.2" strokeLinecap="round" />
            </g>
          </>
        );
      case 'tomate':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#FEE2E2" />
            <circle cx="50" cy="53" r="22" fill="#EF4444" stroke="#DC2626" strokeWidth="2" />
            <path d="M39 33 L50 37 L61 33 L53 29 L50 23 L47 29 Z" fill="#16A34A" />
            <ellipse cx="39" cy="47" rx="3.5" ry="7" fill="#FCA5A5" opacity="0.65" transform="rotate(-18 39 47)" />
          </>
        );
      case 'carne':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#FFE4E6" />
            <path d="M25 52 C23 36 42 30 62 35 C76 39 78 55 70 64 C61 74 36 72 28 62 Z" fill="#E11D48" stroke="#9F1239" strokeWidth="2.5" />
            <path d="M31 52 C30 41 44 36 59 40 C69 43 71 53 65 59 C58 67 38 66 33 58 Z" fill="#F43F5E" />
            <circle cx="42" cy="49" r="5" fill="#FFF1F2" />
            <path d="M54 47 Q60 52 57 58" stroke="#FFE4E6" strokeWidth="2.8" fill="none" strokeLinecap="round" />
          </>
        );
      case 'frango':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#FEF3C7" />
            <g transform="rotate(-30 50 50)">
              <rect x="46" y="54" width="8" height="20" rx="3" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.8" />
              <circle cx="46" cy="74" r="4.5" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
              <circle cx="54" cy="74" r="4.5" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
              <ellipse cx="50" cy="41" rx="18" ry="20" fill="#D97706" stroke="#B45309" strokeWidth="2" />
              <ellipse cx="44" cy="36" rx="5" ry="9" fill="#F59E0B" opacity="0.7" />
            </g>
          </>
        );
      case 'macarrao':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#FEF9C3" />
            <path d="M22 50 L78 50 C76 68 64 75 50 75 C36 75 24 68 22 50 Z" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2.5" />
            <path d="M27 50 C29 33 71 33 73 50 Z" fill="#FACC15" />
            <path d="M32 47 Q42 38 52 47 Q60 40 68 47" stroke="#D97706" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <circle cx="44" cy="40" r="5" fill="#EF4444" />
            <circle cx="56" cy="41" r="5" fill="#EF4444" />
            <path d="M40 43 Q50 37 60 43" stroke="#DC2626" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          </>
        );
      case 'sopa':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#FFF7ED" />
            <path d="M38 25 Q35 20 39 16 M50 24 Q47 19 51 15 M62 25 Q59 20 63 16" stroke="#CBD5E1" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M23 47 L77 47 C75 67 64 75 50 75 C36 75 25 67 23 47 Z" fill="#0EA5E9" />
            <ellipse cx="50" cy="47" rx="27" ry="8" fill="#F97316" stroke="#FFFFFF" strokeWidth="2" />
            <circle cx="42" cy="47" r="2.5" fill="#22C55E" />
            <circle cx="54" cy="48" r="2.5" fill="#FACC15" />
            <circle cx="60" cy="45" r="2" fill="#22C55E" />
          </>
        );
      case 'biscoito':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#FEF3C7" />
            <circle cx="50" cy="50" r="25" fill="#F59E0B" stroke="#B45309" strokeWidth="2.5" />
            <circle cx="41" cy="41" r="3.5" fill="#451A03" />
            <circle cx="59" cy="42" r="3.2" fill="#451A03" />
            <circle cx="49" cy="52" r="3.8" fill="#451A03" />
            <circle cx="39" cy="58" r="3" fill="#451A03" />
            <circle cx="61" cy="58" r="3.4" fill="#451A03" />
          </>
        );
      case 'gato':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#FFF7ED" />
            <polygon points="28,40 31,20 44,31" fill="#F97316" />
            <polygon points="72,40 69,20 56,31" fill="#F97316" />
            <circle cx="50" cy="50" r="22" fill="#FB923C" />
            <circle cx="42" cy="47" r="3" fill="#0F172A" />
            <circle cx="58" cy="47" r="3" fill="#0F172A" />
            <polygon points="47,53 53,53 50,57" fill="#EC4899" />
            <path d="M44 59 Q50 63 56 59" stroke="#0F172A" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M24 51 L36 53 M24 57 L36 56 M76 51 L64 53 M76 57 L64 56" stroke="#7C2D12" strokeWidth="2" strokeLinecap="round" />
          </>
        );
      case 'cachorro':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#E0F2FE" />
            <ellipse cx="26" cy="50" rx="8" ry="15" fill="#92400E" transform="rotate(15 26 50)" />
            <ellipse cx="74" cy="50" rx="8" ry="15" fill="#92400E" transform="rotate(-15 74 50)" />
            <circle cx="50" cy="48" r="21" fill="#D97706" />
            <ellipse cx="50" cy="56" rx="12" ry="9" fill="#FDE68A" />
            <circle cx="42" cy="44" r="3" fill="#0F172A" />
            <circle cx="58" cy="44" r="3" fill="#0F172A" />
            <ellipse cx="50" cy="52" rx="4.5" ry="3.2" fill="#0F172A" />
            <path d="M48 61 Q50 67 53 61" fill="#EC4899" />
          </>
        );
      case 'pato':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#FEF9C3" />
            <circle cx="48" cy="46" r="19" fill="#FACC15" />
            <path d="M62 47 L79 49 C80 54 72 57 62 55 Z" fill="#F97316" />
            <circle cx="53" cy="41" r="3" fill="#0F172A" />
            <circle cx="54" cy="40" r="1" fill="#FFFFFF" />
            <path d="M24 72 Q38 66 50 72 Q62 78 76 72" stroke="#38BDF8" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          </>
        );
      case 'vaca':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#ECFDF5" />
            <path d="M28 32 C22 25 25 20 33 26 M72 32 C78 25 75 20 67 26" stroke="#CBD5E1" strokeWidth="5" fill="none" strokeLinecap="round" />
            <circle cx="50" cy="48" r="21" fill="#FFFFFF" stroke="#1E293B" strokeWidth="2.5" />
            <circle cx="38" cy="39" r="5" fill="#1E293B" />
            <circle cx="43" cy="44" r="2.8" fill="#0F172A" />
            <circle cx="57" cy="44" r="2.8" fill="#0F172A" />
            <ellipse cx="50" cy="59" rx="15" ry="10" fill="#FBCFE8" />
            <circle cx="44" cy="58" r="2" fill="#BE185D" />
            <circle cx="56" cy="58" r="2" fill="#BE185D" />
          </>
        );
      case 'galinha':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#FEE2E2" />
            <path d="M42 26 C44 18 50 18 51 24 C54 18 60 20 58 27 Z" fill="#EF4444" />
            <circle cx="50" cy="49" r="20" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" />
            <polygon points="56,48 70,51 56,55" fill="#F59E0B" />
            <circle cx="46" cy="45" r="3" fill="#0F172A" />
            <ellipse cx="50" cy="59" rx="4" ry="5.5" fill="#EF4444" />
          </>
        );
      case 'leao':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#FEF3C7" />
            <circle cx="50" cy="50" r="28" fill="#EA580C" />
            <circle cx="50" cy="50" r="19" fill="#FBBF24" />
            <circle cx="43" cy="46" r="2.8" fill="#0F172A" />
            <circle cx="57" cy="46" r="2.8" fill="#0F172A" />
            <polygon points="46,53 54,53 50,57" fill="#7C2D12" />
            <path d="M44 60 Q50 64 56 60" stroke="#7C2D12" strokeWidth="2" fill="none" strokeLinecap="round" />
          </>
        );
      case 'cavalo':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#E0F2FE" />
            <polygon points="34,34 38,20 46,31" fill="#78350F" />
            <polygon points="66,34 62,20 54,31" fill="#78350F" />
            <rect x="34" y="30" width="32" height="40" rx="14" fill="#92400E" />
            <rect x="40" y="50" width="20" height="19" rx="9" fill="#B45309" />
            <circle cx="42" cy="42" r="2.6" fill="#0F172A" />
            <circle cx="58" cy="42" r="2.6" fill="#0F172A" />
            <circle cx="45" cy="58" r="2" fill="#451A03" />
            <circle cx="55" cy="58" r="2" fill="#451A03" />
          </>
        );
      case 'peixe':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#E0F2FE" />
            <polygon points="22,38 38,50 22,62" fill="#0284C7" />
            <ellipse cx="53" cy="50" rx="22" ry="15" fill="#38BDF8" />
            <circle cx="64" cy="47" r="3" fill="#0F172A" />
            <path d="M46 43 Q51 50 46 57" stroke="#E0F2FE" strokeWidth="2.5" fill="none" />
          </>
        );
      case 'passaro':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#FCE7F3" />
            <circle cx="48" cy="50" r="18" fill="#EC4899" />
            <polygon points="64,47 77,50 64,54" fill="#F59E0B" />
            <ellipse cx="43" cy="53" rx="9" ry="6" fill="#F472B6" />
            <circle cx="55" cy="45" r="2.8" fill="#0F172A" />
          </>
        );
      case 'papagaio':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#ECFDF5" />
            <ellipse cx="46" cy="52" rx="18" ry="22" fill="#16A34A" />
            <ellipse cx="41" cy="55" rx="10" ry="14" fill="#22C55E" />
            <circle cx="56" cy="39" r="9" fill="#FFFFFF" />
            <path d="M61 36 C73 36 75 46 66 50 C66 44 63 43 60 44 Z" fill="#FACC15" stroke="#0F172A" strokeWidth="1.8" />
            <path d="M58 43 Q62 46 65 44" stroke="#0F172A" strokeWidth="2" fill="none" />
            <circle cx="55" cy="38" r="2.8" fill="#0F172A" />
            <ellipse cx="38" cy="62" rx="5" ry="12" fill="#EF4444" transform="rotate(15 38 62)" />
          </>
        );
      case 'pintinho':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#FEFCE8" />
            <circle cx="50" cy="55" r="19" fill="#FACC15" />
            <circle cx="50" cy="39" r="14" fill="#FDE047" />
            <path d="M47 25 Q50 18 54 25" stroke="#F59E0B" strokeWidth="3" fill="none" strokeLinecap="round" />
            <polygon points="46,41 54,41 50,47" fill="#F97316" />
            <circle cx="44" cy="37" r="2.4" fill="#0F172A" />
            <circle cx="56" cy="37" r="2.4" fill="#0F172A" />
            <path d="M42 74 L42 79 M58 74 L58 79" stroke="#F97316" strokeWidth="3" strokeLinecap="round" />
          </>
        );
      case 'porco':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#FCE7F3" />
            <polygon points="27,38 30,21 43,31" fill="#F472B6" />
            <polygon points="73,38 70,21 57,31" fill="#F472B6" />
            <circle cx="50" cy="50" r="23" fill="#F9A8D4" />
            <circle cx="41" cy="44" r="2.8" fill="#0F172A" />
            <circle cx="59" cy="44" r="2.8" fill="#0F172A" />
            <ellipse cx="50" cy="56" rx="11" ry="8" fill="#F472B6" />
            <circle cx="46" cy="56" r="2.2" fill="#9D174D" />
            <circle cx="54" cy="56" r="2.2" fill="#9D174D" />
          </>
        );
      case 'ovelha':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#F1F5F9" />
            <circle cx="33" cy="40" r="11" fill="#FFFFFF" />
            <circle cx="67" cy="40" r="11" fill="#FFFFFF" />
            <circle cx="33" cy="58" r="11" fill="#FFFFFF" />
            <circle cx="67" cy="58" r="11" fill="#FFFFFF" />
            <circle cx="50" cy="30" r="12" fill="#FFFFFF" />
            <circle cx="50" cy="66" r="11" fill="#FFFFFF" />
            <ellipse cx="29" cy="49" rx="7" ry="4" fill="#CBD5E1" transform="rotate(-20 29 49)" />
            <ellipse cx="71" cy="49" rx="7" ry="4" fill="#CBD5E1" transform="rotate(20 71 49)" />
            <ellipse cx="50" cy="51" rx="14" ry="15" fill="#FDE68A" />
            <circle cx="45" cy="48" r="2.4" fill="#0F172A" />
            <circle cx="55" cy="48" r="2.4" fill="#0F172A" />
            <path d="M46 56 Q50 59 54 56" stroke="#0F172A" strokeWidth="2" fill="none" strokeLinecap="round" />
            <circle cx="45" cy="37" r="6" fill="#FFFFFF" />
            <circle cx="54" cy="37" r="6" fill="#FFFFFF" />
          </>
        );
      case 'coelho':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#FFE4E6" />
            <ellipse cx="39" cy="30" rx="6" ry="16" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" transform="rotate(-8 39 30)" />
            <ellipse cx="61" cy="30" rx="6" ry="16" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" transform="rotate(8 61 30)" />
            <ellipse cx="39" cy="31" rx="3" ry="10" fill="#FBCFE8" transform="rotate(-8 39 31)" />
            <ellipse cx="61" cy="31" rx="3" ry="10" fill="#FBCFE8" transform="rotate(8 61 31)" />
            <circle cx="50" cy="55" r="20" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" />
            <circle cx="43" cy="51" r="2.6" fill="#0F172A" />
            <circle cx="57" cy="51" r="2.6" fill="#0F172A" />
            <polygon points="47,57 53,57 50,60" fill="#EC4899" />
            <path d="M46 63 Q50 66 54 63" stroke="#0F172A" strokeWidth="2" fill="none" strokeLinecap="round" />
          </>
        );
      case 'macaco':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#FEF3C7" />
            <circle cx="25" cy="48" r="8" fill="#92400E" />
            <circle cx="25" cy="48" r="4.5" fill="#FDE68A" />
            <circle cx="75" cy="48" r="8" fill="#92400E" />
            <circle cx="75" cy="48" r="4.5" fill="#FDE68A" />
            <circle cx="50" cy="50" r="22" fill="#92400E" />
            <ellipse cx="50" cy="57" rx="16" ry="12" fill="#FDE68A" />
            <circle cx="43" cy="45" r="6" fill="#FDE68A" />
            <circle cx="57" cy="45" r="6" fill="#FDE68A" />
            <circle cx="43" cy="45" r="2.6" fill="#0F172A" />
            <circle cx="57" cy="45" r="2.6" fill="#0F172A" />
            <path d="M43 59 Q50 64 57 59" stroke="#78350F" strokeWidth="2.4" fill="none" strokeLinecap="round" />
          </>
        );
      case 'tigre':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#FFF7ED" />
            <circle cx="31" cy="31" r="7" fill="#F97316" />
            <circle cx="69" cy="31" r="7" fill="#F97316" />
            <circle cx="50" cy="50" r="23" fill="#FB923C" />
            <path d="M46 28 L50 35 L54 28 M29 44 L36 47 L29 51 M71 44 L64 47 L71 51" stroke="#0F172A" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <ellipse cx="50" cy="57" rx="11" ry="8" fill="#FFFFFF" />
            <circle cx="42" cy="46" r="2.8" fill="#0F172A" />
            <circle cx="58" cy="46" r="2.8" fill="#0F172A" />
            <polygon points="47,53 53,53 50,57" fill="#0F172A" />
            <path d="M45 60 Q50 63 55 60" stroke="#0F172A" strokeWidth="2" fill="none" strokeLinecap="round" />
          </>
        );
      case 'girafa':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#FEFCE8" />
            <rect x="42" y="48" width="16" height="30" rx="5" fill="#FACC15" />
            <line x1="43" y1="29" x2="41" y2="21" stroke="#92400E" strokeWidth="3" strokeLinecap="round" />
            <line x1="57" y1="29" x2="59" y2="21" stroke="#92400E" strokeWidth="3" strokeLinecap="round" />
            <circle cx="41" cy="20" r="3" fill="#92400E" />
            <circle cx="59" cy="20" r="3" fill="#92400E" />
            <ellipse cx="34" cy="35" rx="6" ry="3.5" fill="#FACC15" transform="rotate(-20 34 35)" />
            <ellipse cx="66" cy="35" rx="6" ry="3.5" fill="#FACC15" transform="rotate(20 66 35)" />
            <ellipse cx="50" cy="41" rx="14" ry="15" fill="#FACC15" />
            <ellipse cx="50" cy="49" rx="10" ry="7" fill="#FDE68A" />
            <circle cx="44" cy="38" r="2.4" fill="#0F172A" />
            <circle cx="56" cy="38" r="2.4" fill="#0F172A" />
            <circle cx="47" cy="60" r="3.5" fill="#D97706" />
            <circle cx="53" cy="69" r="3" fill="#D97706" />
          </>
        );
      case 'zebra':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#F1F5F9" />
            <polygon points="34,34 38,20 46,31" fill="#1E293B" />
            <polygon points="66,34 62,20 54,31" fill="#1E293B" />
            <rect x="34" y="30" width="32" height="40" rx="14" fill="#FFFFFF" stroke="#1E293B" strokeWidth="2.5" />
            <path d="M35 38 L44 41 M65 38 L56 41 M35 46 L42 48 M65 46 L58 48" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
            <rect x="40" y="51" width="20" height="18" rx="8" fill="#CBD5E1" />
            <circle cx="42" cy="43" r="2.6" fill="#0F172A" />
            <circle cx="58" cy="43" r="2.6" fill="#0F172A" />
            <circle cx="45" cy="59" r="2" fill="#0F172A" />
            <circle cx="55" cy="59" r="2" fill="#0F172A" />
          </>
        );
      case 'urso':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#FEF3C7" />
            <circle cx="31" cy="31" r="9" fill="#78350F" />
            <circle cx="31" cy="31" r="4.5" fill="#FDE68A" />
            <circle cx="69" cy="31" r="9" fill="#78350F" />
            <circle cx="69" cy="31" r="4.5" fill="#FDE68A" />
            <circle cx="50" cy="50" r="23" fill="#92400E" />
            <ellipse cx="50" cy="56" rx="11" ry="8.5" fill="#FDE68A" />
            <circle cx="42" cy="45" r="2.7" fill="#0F172A" />
            <circle cx="58" cy="45" r="2.7" fill="#0F172A" />
            <ellipse cx="50" cy="53" rx="4" ry="2.8" fill="#0F172A" />
            <path d="M46 59 Q50 62 54 59" stroke="#451A03" strokeWidth="2" fill="none" strokeLinecap="round" />
          </>
        );
      case 'tartaruga':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#ECFDF5" />
            <circle cx="29" cy="65" r="5" fill="#4ADE80" />
            <circle cx="63" cy="65" r="5" fill="#4ADE80" />
            <circle cx="74" cy="48" r="9" fill="#4ADE80" />
            <circle cx="77" cy="46" r="2.2" fill="#0F172A" />
            <path d="M23 58 C23 34 67 34 67 58 Z" fill="#16A34A" stroke="#14532D" strokeWidth="2.5" />
            <polygon points="45,42 52,47 49,55 41,55 38,47" fill="#86EFAC" opacity="0.65" />
            <rect x="22" y="57" width="46" height="6" rx="3" fill="#FACC15" />
          </>
        );
      case 'borboleta':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#FCE7F3" />
            <ellipse cx="34" cy="42" rx="14" ry="12" fill="#EC4899" />
            <ellipse cx="66" cy="42" rx="14" ry="12" fill="#EC4899" />
            <ellipse cx="37" cy="60" rx="11" ry="10" fill="#F472B6" />
            <ellipse cx="63" cy="60" rx="11" ry="10" fill="#F472B6" />
            <circle cx="33" cy="42" r="4.5" fill="#FEF08A" />
            <circle cx="67" cy="42" r="4.5" fill="#FEF08A" />
            <rect x="47" y="34" width="6" height="36" rx="3" fill="#1E293B" />
            <path d="M48 34 Q42 23 37 25 M52 34 Q58 23 63 25" stroke="#1E293B" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          </>
        );
      case 'formiga':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#FEE2E2" />
            <path d="M36 53 L26 65 M50 54 L50 67 M63 53 L73 65" stroke="#7F1D1D" strokeWidth="2.5" strokeLinecap="round" />
            <ellipse cx="34" cy="53" rx="10" ry="8" fill="#B91C1C" />
            <circle cx="49" cy="50" r="7" fill="#DC2626" />
            <circle cx="63" cy="44" r="9" fill="#EF4444" />
            <path d="M62 35 Q60 24 55 24 M67 36 Q71 25 76 26" stroke="#7F1D1D" strokeWidth="2.2" fill="none" strokeLinecap="round" />
            <circle cx="66" cy="42" r="2.2" fill="#0F172A" />
          </>
        );
      case 'sapo':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#ECFDF5" />
            <circle cx="37" cy="36" r="8" fill="#22C55E" />
            <circle cx="63" cy="36" r="8" fill="#22C55E" />
            <circle cx="37" cy="36" r="4.5" fill="#FFFFFF" />
            <circle cx="63" cy="36" r="4.5" fill="#FFFFFF" />
            <circle cx="37" cy="36" r="2.4" fill="#0F172A" />
            <circle cx="63" cy="36" r="2.4" fill="#0F172A" />
            <ellipse cx="50" cy="55" rx="23" ry="17" fill="#22C55E" />
            <ellipse cx="50" cy="61" rx="16" ry="9" fill="#BBF7D0" />
            <path d="M36 52 Q50 60 64 52" stroke="#14532D" strokeWidth="2.4" fill="none" strokeLinecap="round" />
          </>
        );
      case 'cobra':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#ECFDF5" />
            <path d="M26 67 C26 57 74 57 74 67 C74 74 26 74 26 67 Z" fill="#16A34A" />
            <path d="M31 58 C31 49 69 49 69 58 C69 64 31 64 31 58 Z" fill="#22C55E" />
            <path d="M44 50 C44 37 52 30 62 32" stroke="#22C55E" strokeWidth="10" fill="none" strokeLinecap="round" />
            <circle cx="64" cy="33" r="8.5" fill="#4ADE80" />
            <circle cx="66" cy="31" r="2.2" fill="#0F172A" />
            <path d="M72 35 L79 34 M76 34.5 L80 37" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
          </>
        );
      case 'baleia':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#E0F2FE" />
            <path d="M48 34 Q42 22 36 25 M50 34 Q56 22 62 25" stroke="#38BDF8" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M22 54 C22 35 66 35 66 56 L77 45 L79 56 L71 62 C61 68 25 69 22 54 Z" fill="#0284C7" />
            <path d="M26 57 C32 66 54 66 60 58 Z" fill="#BAE6FD" />
            <circle cx="35" cy="48" r="2.8" fill="#0F172A" />
            <circle cx="36" cy="47" r="1" fill="#FFFFFF" />
          </>
        );
      case 'golfinho':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#E0F2FE" />
            <path d="M25 63 C25 36 58 26 70 48 L79 51 L71 55 C60 55 47 47 38 59 L29 69 L25 63 Z" fill="#0EA5E9" />
            <polygon points="46,35 53,24 56,36" fill="#0284C7" />
            <circle cx="63" cy="45" r="2.4" fill="#0F172A" />
            <path d="M24 72 Q38 66 52 72 Q66 77 77 72" stroke="#38BDF8" strokeWidth="3" fill="none" strokeLinecap="round" />
          </>
        );
      case 'coruja':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#F3E8FF" />
            <polygon points="31,32 34,20 43,28" fill="#7C3AED" />
            <polygon points="69,32 66,20 57,28" fill="#7C3AED" />
            <ellipse cx="50" cy="52" rx="22" ry="24" fill="#8B5CF6" />
            <ellipse cx="50" cy="60" rx="14" ry="13" fill="#DDD6FE" />
            <circle cx="41" cy="42" r="8.5" fill="#FFFFFF" />
            <circle cx="59" cy="42" r="8.5" fill="#FFFFFF" />
            <circle cx="41" cy="42" r="4" fill="#0F172A" />
            <circle cx="59" cy="42" r="4" fill="#0F172A" />
            <polygon points="47,47 53,47 50,53" fill="#F59E0B" />
          </>
        );
      case 'rato':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#F1F5F9" />
            <circle cx="34" cy="35" r="10" fill="#94A3B8" />
            <circle cx="34" cy="35" r="5.5" fill="#FBCFE8" />
            <circle cx="66" cy="35" r="10" fill="#94A3B8" />
            <circle cx="66" cy="35" r="5.5" fill="#FBCFE8" />
            <path d="M32 52 C32 36 68 36 68 52 C68 66 56 71 50 71 C44 71 32 66 32 52 Z" fill="#CBD5E1" />
            <circle cx="43" cy="49" r="2.6" fill="#0F172A" />
            <circle cx="57" cy="49" r="2.6" fill="#0F172A" />
            <circle cx="50" cy="61" r="3.5" fill="#EC4899" />
            <path d="M27 57 L39 58 M27 62 L39 61 M73 57 L61 58 M73 62 L61 61" stroke="#475569" strokeWidth="1.8" strokeLinecap="round" />
          </>
        );
      case 'leao-marinho':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#E0F2FE" />
            <path d="M26 67 C26 52 38 40 50 40 C62 40 74 52 74 67 Z" fill="#0369A1" />
            <circle cx="50" cy="38" r="15" fill="#0284C7" />
            <ellipse cx="50" cy="43" rx="9" ry="6" fill="#7DD3FC" />
            <circle cx="44" cy="35" r="2.5" fill="#0F172A" />
            <circle cx="56" cy="35" r="2.5" fill="#0F172A" />
            <circle cx="50" cy="40" r="2.8" fill="#0F172A" />
            <path d="M29 44 L41 44 M29 48 L41 46 M71 44 L59 44 M71 48 L59 46" stroke="#E0F2FE" strokeWidth="1.8" strokeLinecap="round" />
          </>
        );
      case 'bola':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#FEE2E2" />
            <circle cx="50" cy="50" r="25" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2.5" />
            <polygon points="50,38 59,45 55,56 45,56 41,45" fill="#0F172A" />
            <path d="M50 38 L50 25 M59 45 L72 41 M55 56 L64 69 M45 56 L36 69 M41 45 L28 41" stroke="#0F172A" strokeWidth="2.2" />
          </>
        );
      case 'casa':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#FFF7ED" />
            <polygon points="22,48 50,23 78,48" fill="#EF4444" stroke="#B91C1C" strokeWidth="2" strokeLinejoin="round" />
            <rect x="29" y="48" width="42" height="29" rx="3" fill="#FEF3C7" stroke="#D97706" strokeWidth="2" />
            <rect x="44" y="57" width="12" height="20" rx="2" fill="#0284C7" />
            <rect x="33" y="54" width="7" height="7" rx="1" fill="#38BDF8" />
            <rect x="60" y="54" width="7" height="7" rx="1" fill="#38BDF8" />
          </>
        );
      case 'carro':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#E0F2FE" />
            <path d="M24 54 L31 38 L66 38 L75 54 Z" fill="#0284C7" />
            <rect x="19" y="52" width="62" height="14" rx="6" fill="#0EA5E9" />
            <rect x="35" y="41" width="13" height="10" rx="2" fill="#BAE6FD" />
            <rect x="52" y="41" width="12" height="10" rx="2" fill="#BAE6FD" />
            <circle cx="33" cy="67" r="7" fill="#1E293B" />
            <circle cx="33" cy="67" r="3" fill="#CBD5E1" />
            <circle cx="67" cy="67" r="7" fill="#1E293B" />
            <circle cx="67" cy="67" r="3" fill="#CBD5E1" />
          </>
        );
      case 'boneca':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#FCE7F3" />
            <circle cx="32" cy="36" r="8" fill="#92400E" />
            <circle cx="68" cy="36" r="8" fill="#92400E" />
            <polygon points="34,78 50,52 66,78" fill="#EC4899" />
            <circle cx="50" cy="40" r="14" fill="#FDE68A" />
            <circle cx="45" cy="39" r="2.2" fill="#0F172A" />
            <circle cx="55" cy="39" r="2.2" fill="#0F172A" />
            <path d="M45 45 Q50 49 55 45" stroke="#BE185D" strokeWidth="2" fill="none" strokeLinecap="round" />
          </>
        );
      case 'livro':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#F3E8FF" />
            <rect x="26" y="28" width="24" height="44" rx="3" fill="#8B5CF6" />
            <rect x="50" y="28" width="24" height="44" rx="3" fill="#7C3AED" />
            <rect x="30" y="32" width="18" height="36" rx="2" fill="#FFFFFF" />
            <rect x="52" y="32" width="18" height="36" rx="2" fill="#F8FAFC" />
            <line x1="34" y1="40" x2="44" y2="40" stroke="#CBD5E1" strokeWidth="2.5" />
            <line x1="34" y1="48" x2="44" y2="48" stroke="#CBD5E1" strokeWidth="2.5" />
            <line x1="56" y1="40" x2="66" y2="40" stroke="#CBD5E1" strokeWidth="2.5" />
          </>
        );
      case 'lapis':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#ECFDF5" />
            <g transform="rotate(-35 50 50)">
              <rect x="43" y="24" width="14" height="42" rx="2" fill="#F59E0B" />
              <rect x="43" y="20" width="14" height="8" rx="2" fill="#EC4899" />
              <polygon points="43,66 57,66 50,80" fill="#FDE68A" />
              <polygon points="48,74 52,74 50,80" fill="#0F172A" />
            </g>
          </>
        );
      case 'mesa':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#FEF3C7" />
            <rect x="20" y="38" width="60" height="9" rx="4" fill="#D97706" />
            <rect x="27" y="47" width="6" height="27" rx="2" fill="#B45309" />
            <rect x="67" y="47" width="6" height="27" rx="2" fill="#B45309" />
            <rect x="35" y="47" width="5" height="20" rx="2" fill="#92400E" />
            <rect x="60" y="47" width="5" height="20" rx="2" fill="#92400E" />
          </>
        );
      case 'cadeira':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#E0F2FE" />
            <rect x="33" y="24" width="34" height="24" rx="4" fill="#0284C7" />
            <rect x="37" y="29" width="26" height="14" rx="2" fill="#38BDF8" />
            <rect x="31" y="48" width="38" height="8" rx="3" fill="#0369A1" />
            <rect x="34" y="56" width="6" height="21" rx="2" fill="#0284C7" />
            <rect x="60" y="56" width="6" height="21" rx="2" fill="#0284C7" />
          </>
        );
      case 'cama':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#F3E8FF" />
            <rect x="20" y="35" width="7" height="38" rx="3" fill="#7C3AED" />
            <rect x="73" y="45" width="7" height="28" rx="3" fill="#7C3AED" />
            <rect x="27" y="46" width="16" height="10" rx="4" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
            <rect x="27" y="51" width="46" height="14" rx="4" fill="#A855F7" />
            <rect x="20" y="61" width="60" height="7" rx="2" fill="#6D28D9" />
          </>
        );
      case 'porta':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#FEF3C7" />
            <rect x="32" y="22" width="36" height="56" rx="4" fill="#B45309" stroke="#78350F" strokeWidth="2.5" />
            <rect x="38" y="28" width="24" height="17" rx="2" fill="#D97706" />
            <rect x="38" y="51" width="24" height="20" rx="2" fill="#D97706" />
            <circle cx="62" cy="50" r="3" fill="#FACC15" />
          </>
        );
      case 'janela':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#E0F2FE" />
            <rect x="25" y="26" width="50" height="48" rx="5" fill="#7DD3FC" stroke="#0284C7" strokeWidth="4" />
            <line x1="50" y1="26" x2="50" y2="74" stroke="#0284C7" strokeWidth="3.5" />
            <line x1="25" y1="50" x2="75" y2="50" stroke="#0284C7" strokeWidth="3.5" />
            <rect x="21" y="72" width="58" height="6" rx="2.5" fill="#0369A1" />
          </>
        );
      case 'copo':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#E0F2FE" />
            <polygon points="34,26 66,26 60,74 40,74" fill="#FFFFFF" stroke="#0284C7" strokeWidth="3" strokeLinejoin="round" />
            <polygon points="36,42 64,42 60,72 40,72" fill="#38BDF8" />
            <ellipse cx="50" cy="26" rx="16" ry="3.5" fill="#E0F2FE" stroke="#0284C7" strokeWidth="2.5" />
          </>
        );
      case 'prato':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#F1F5F9" />
            <circle cx="50" cy="50" r="28" fill="#FFFFFF" stroke="#64748B" strokeWidth="3" />
            <circle cx="50" cy="50" r="18" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2.5" />
          </>
        );
      case 'colher':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#F1F5F9" />
            <g transform="rotate(30 50 50)">
              <ellipse cx="50" cy="31" rx="10" ry="14" fill="#94A3B8" stroke="#475569" strokeWidth="2" />
              <ellipse cx="48" cy="29" rx="4" ry="7" fill="#CBD5E1" />
              <rect x="47" y="45" width="6" height="35" rx="3" fill="#94A3B8" stroke="#475569" strokeWidth="2" />
            </g>
          </>
        );
      case 'garfo':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#F1F5F9" />
            <g transform="rotate(30 50 50)">
              <path d="M41 20 L41 37 C41 43 59 43 59 37 L59 20 M47 20 L47 36 M53 20 L53 36" stroke="#475569" strokeWidth="3.2" fill="none" strokeLinecap="round" />
              <rect x="47" y="42" width="6" height="37" rx="3" fill="#94A3B8" stroke="#475569" strokeWidth="2" />
            </g>
          </>
        );
      case 'panela':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#FEE2E2" />
            <rect x="20" y="46" width="12" height="5" rx="2.5" fill="#475569" />
            <rect x="68" y="46" width="12" height="5" rx="2.5" fill="#475569" />
            <path d="M29 44 H71 V64 C71 71 65 75 50 75 C35 75 29 71 29 64 Z" fill="#EF4444" stroke="#B91C1C" strokeWidth="2" />
            <path d="M27 42 C29 33 71 33 73 42 Z" fill="#CBD5E1" stroke="#64748B" strokeWidth="2" />
            <circle cx="50" cy="31" r="4" fill="#475569" />
          </>
        );
      case 'telefone':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#EEF2FF" />
            <rect x="33" y="21" width="34" height="58" rx="6" fill="#1E293B" />
            <rect x="37" y="27" width="26" height="42" rx="3" fill="#38BDF8" />
            <circle cx="50" cy="74" r="2.5" fill="#94A3B8" />
            <circle cx="50" cy="48" r="8" fill="#FFFFFF" opacity="0.9" />
            <path d="M46 48 L49 51 L54 45" stroke="#4F46E5" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </>
        );
      case 'carrinho':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#FEE2E2" />
            <path d="M27 54 L34 40 L63 40 L72 54 Z" fill="#EF4444" />
            <rect x="21" y="52" width="58" height="13" rx="6" fill="#DC2626" />
            <rect x="37" y="43" width="11" height="8" rx="2" fill="#E0F2FE" />
            <rect x="51" y="43" width="10" height="8" rx="2" fill="#E0F2FE" />
            <circle cx="34" cy="67" r="6.5" fill="#0F172A" />
            <circle cx="34" cy="67" r="2.5" fill="#E2E8F0" />
            <circle cx="66" cy="67" r="6.5" fill="#0F172A" />
            <circle cx="66" cy="67" r="2.5" fill="#E2E8F0" />
          </>
        );
      case 'brinquedo':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#FEF3C7" />
            <rect x="24" y="49" width="24" height="24" rx="4" fill="#EF4444" stroke="#B91C1C" strokeWidth="2" />
            <rect x="52" y="49" width="24" height="24" rx="4" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="2" />
            <rect x="38" y="24" width="24" height="24" rx="4" fill="#FACC15" stroke="#CA8A04" strokeWidth="2" />
            <text x="50" y="41" textAnchor="middle" fontSize="14" fontWeight="800" fill="#78350F">A</text>
            <text x="36" y="66" textAnchor="middle" fontSize="14" fontWeight="800" fill="#FFFFFF">B</text>
            <text x="64" y="66" textAnchor="middle" fontSize="14" fontWeight="800" fill="#FFFFFF">C</text>
          </>
        );
      case 'sapato':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#E0F2FE" />
            <path d="M24 62 L27 42 L42 42 L48 51 C58 52 72 52 76 62 Z" fill="#0284C7" />
            <rect x="23" y="61" width="54" height="7" rx="3.5" fill="#FFFFFF" stroke="#0369A1" strokeWidth="2" />
            <line x1="45" y1="45" x2="50" y2="49" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="49" y1="49" x2="54" y2="52" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
          </>
        );
      case 'chinelo':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#ECFDF5" />
            <g transform="rotate(-15 50 50)">
              <ellipse cx="50" cy="51" rx="16" ry="27" fill="#10B981" stroke="#047857" strokeWidth="2.5" />
              <path d="M36 47 Q50 32 64 47" stroke="#FACC15" strokeWidth="4.5" fill="none" strokeLinecap="round" />
              <line x1="50" y1="35" x2="50" y2="41" stroke="#FACC15" strokeWidth="4" strokeLinecap="round" />
            </g>
          </>
        );
      case 'mochila':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#F3E8FF" />
            <path d="M40 28 C40 20 60 20 60 28" stroke="#6D28D9" strokeWidth="4" fill="none" strokeLinecap="round" />
            <rect x="28" y="28" width="44" height="48" rx="12" fill="#8B5CF6" />
            <rect x="34" y="51" width="32" height="19" rx="6" fill="#A78BFA" />
            <line x1="33" y1="42" x2="67" y2="42" stroke="#EDE9FE" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="50" cy="58" r="2.5" fill="#FACC15" />
          </>
        );
      case 'tesoura':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#FFE4E6" />
            <path d="M46 47 L28 24 M54 47 L72 24" stroke="#94A3B8" strokeWidth="6" strokeLinecap="round" />
            <path d="M46 47 L63 60 M54 47 L37 60" stroke="#F43F5E" strokeWidth="4.5" strokeLinecap="round" />
            <circle cx="34" cy="66" r="8" fill="none" stroke="#F43F5E" strokeWidth="4.5" />
            <circle cx="66" cy="66" r="8" fill="none" stroke="#F43F5E" strokeWidth="4.5" />
            <circle cx="50" cy="47" r="3" fill="#475569" />
          </>
        );
      case 'escova':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#ECFEFF" />
            <g transform="rotate(-35 50 50)">
              <rect x="46" y="40" width="8" height="39" rx="4" fill="#06B6D4" />
              <rect x="43" y="22" width="14" height="22" rx="5" fill="#0891B2" />
              <rect x="36" y="25" width="9" height="16" rx="2" fill="#FFFFFF" />
              <line x1="36" y1="29" x2="45" y2="29" stroke="#CBD5E1" strokeWidth="1.5" />
              <line x1="36" y1="33" x2="45" y2="33" stroke="#CBD5E1" strokeWidth="1.5" />
              <line x1="36" y1="37" x2="45" y2="37" stroke="#CBD5E1" strokeWidth="1.5" />
            </g>
          </>
        );
      case 'relogio':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#FEF3C7" />
            <circle cx="50" cy="50" r="26" fill="#FFFFFF" stroke="#F59E0B" strokeWidth="4" />
            <line x1="50" y1="50" x2="50" y2="33" stroke="#0F172A" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="50" y1="50" x2="62" y2="56" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" />
            <circle cx="50" cy="50" r="3" fill="#0F172A" />
          </>
        );
      case 'chave':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#FEF9C3" />
            <g transform="rotate(-30 50 50)">
              <circle cx="50" cy="34" r="12" fill="none" stroke="#CA8A04" strokeWidth="5.5" />
              <rect x="47" y="46" width="6" height="30" rx="2.5" fill="#EAB308" />
              <rect x="53" y="61" width="9" height="5" rx="1.5" fill="#EAB308" />
              <rect x="53" y="69" width="7" height="5" rx="1.5" fill="#EAB308" />
            </g>
          </>
        );
      case 'mao':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#FFF7ED" />
            <rect x="36" y="46" width="28" height="26" rx="11" fill="#FDBA74" />
            <rect x="35" y="28" width="6" height="22" rx="3" fill="#FDBA74" />
            <rect x="43" y="23" width="6" height="26" rx="3" fill="#FDBA74" />
            <rect x="51" y="25" width="6" height="24" rx="3" fill="#FDBA74" />
            <rect x="59" y="31" width="6" height="20" rx="3" fill="#FDBA74" />
            <rect x="26" y="48" width="14" height="6.5" rx="3.2" fill="#FDBA74" transform="rotate(-25 33 51)" />
          </>
        );
      case 'pe':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#ECFDF5" />
            <ellipse cx="50" cy="56" rx="14" ry="20" fill="#FDBA74" transform="rotate(-10 50 56)" />
            <circle cx="39" cy="34" r="4.5" fill="#FDBA74" />
            <circle cx="47" cy="31" r="3.8" fill="#FDBA74" />
            <circle cx="54" cy="32" r="3.4" fill="#FDBA74" />
            <circle cx="60" cy="35" r="3" fill="#FDBA74" />
          </>
        );
      case 'boca':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#FCE7F3" />
            <path d="M24 50 Q38 35 50 42 Q62 35 76 50 Q62 69 50 69 Q38 69 24 50 Z" fill="#EC4899" />
            <path d="M31 50 Q50 54 69 50 Q61 61 50 61 Q39 61 31 50 Z" fill="#881337" />
            <path d="M34 49 Q50 52 66 49 L62 53 L38 53 Z" fill="#FFFFFF" />
            <ellipse cx="50" cy="60" rx="9" ry="4.5" fill="#FB7185" />
          </>
        );
      case 'nariz':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#E0F2FE" />
            <path d="M50 26 C50 42 63 51 62 60 C61 66 54 68 48 67 C42 68 38 64 40 58" fill="#FDBA74" stroke="#EA580C" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="45" cy="62" r="2.3" fill="#9A3412" />
            <circle cx="55" cy="62" r="2.3" fill="#9A3412" />
          </>
        );
      case 'olho':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#F3E8FF" />
            <path d="M20 50 Q50 28 80 50 Q50 72 20 50 Z" fill="#FFFFFF" stroke="#334155" strokeWidth="2.5" />
            <circle cx="50" cy="50" r="11" fill="#0284C7" />
            <circle cx="50" cy="50" r="5" fill="#0F172A" />
            <circle cx="54" cy="46" r="2.5" fill="#FFFFFF" />
          </>
        );
      case 'orelha':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#FEF3C7" />
            <path d="M40 34 C40 22 65 22 65 40 C65 53 56 57 54 68 C53 74 44 74 42 68" fill="#FDBA74" stroke="#EA580C" strokeWidth="3" strokeLinecap="round" />
            <path d="M47 38 C54 34 57 44 50 51" fill="none" stroke="#EA580C" strokeWidth="2.5" strokeLinecap="round" />
          </>
        );
      case 'cabeca':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#FCE7F3" />
            <rect x="44" y="64" width="12" height="12" rx="4" fill="#FDBA74" />
            <circle cx="50" cy="46" r="21" fill="#FDE68A" />
            <path d="M29 43 C30 23 70 23 71 43 C64 34 36 34 29 43 Z" fill="#78350F" />
            <circle cx="43" cy="46" r="2.5" fill="#0F172A" />
            <circle cx="57" cy="46" r="2.5" fill="#0F172A" />
            <path d="M43 55 Q50 60 57 55" stroke="#EC4899" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </>
        );
      case 'cabelo':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#FEF3C7" />
            <circle cx="50" cy="53" r="18" fill="#FDE68A" />
            <path d="M27 52 C25 22 75 22 73 52 C68 38 61 32 50 35 C39 32 32 38 27 52 Z" fill="#78350F" />
            <path d="M37 25 Q50 17 63 25" stroke="#92400E" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            <circle cx="44" cy="53" r="2.2" fill="#0F172A" />
            <circle cx="56" cy="53" r="2.2" fill="#0F172A" />
            <path d="M45 60 Q50 64 55 60" stroke="#0F172A" strokeWidth="2" fill="none" strokeLinecap="round" />
          </>
        );
      case 'rosto':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#FEF9C3" />
            <circle cx="50" cy="50" r="24" fill="#FDE68A" stroke="#F59E0B" strokeWidth="2" />
            <circle cx="41" cy="45" r="3" fill="#0F172A" />
            <circle cx="59" cy="45" r="3" fill="#0F172A" />
            <circle cx="35" cy="53" r="3.5" fill="#FDA4AF" />
            <circle cx="65" cy="53" r="3.5" fill="#FDA4AF" />
            <path d="M41 58 Q50 66 59 58" stroke="#E11D48" strokeWidth="3" fill="none" strokeLinecap="round" />
          </>
        );
      case 'lingua':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#FFE4E6" />
            <path d="M24 42 Q50 30 76 42 Q66 64 50 64 Q34 64 24 42 Z" fill="#881337" stroke="#E11D48" strokeWidth="3" />
            <path d="M38 48 C38 45 62 45 62 48 L60 66 C59 75 41 75 40 66 Z" fill="#FB7185" stroke="#E11D48" strokeWidth="2" />
            <line x1="50" y1="49" x2="50" y2="66" stroke="#E11D48" strokeWidth="2.2" strokeLinecap="round" />
          </>
        );
      case 'dente':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#E0F2FE" />
            <path d="M30 40 C30 25 46 25 50 31 C54 25 70 25 70 40 C70 51 64 57 62 72 C61 77 54 76 53 66 C52 60 48 60 47 66 C46 76 39 77 38 72 C36 57 30 51 30 40 Z" fill="#FFFFFF" stroke="#0284C7" strokeWidth="2.8" />
            <circle cx="43" cy="41" r="2.2" fill="#0F172A" />
            <circle cx="57" cy="41" r="2.2" fill="#0F172A" />
            <path d="M45 48 Q50 52 55 48" stroke="#0284C7" strokeWidth="2" fill="none" strokeLinecap="round" />
          </>
        );
      case 'pescoco':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#F3E8FF" />
            <path d="M25 80 C27 65 73 65 75 80 Z" fill="#8B5CF6" />
            <rect x="41" y="51" width="18" height="20" rx="5" fill="#FDBA74" />
            <circle cx="50" cy="39" r="15" fill="#FDE68A" />
            <path d="M40 60 L60 60" stroke="#EA580C" strokeWidth="2.5" strokeDasharray="3 3" strokeLinecap="round" />
          </>
        );
      case 'ombro':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#ECFDF5" />
            <rect x="43" y="25" width="14" height="15" rx="5" fill="#FDE68A" />
            <path d="M23 72 C24 44 35 38 50 38 C65 38 76 44 77 72 Z" fill="#10B981" />
            <circle cx="31" cy="47" r="5" fill="none" stroke="#FEF08A" strokeWidth="2.5" />
            <circle cx="69" cy="47" r="5" fill="none" stroke="#FEF08A" strokeWidth="2.5" />
          </>
        );
      case 'braco':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#FFF7ED" />
            <path d="M28 65 C28 48 40 42 48 47 C55 51 64 42 66 31" stroke="#FDBA74" strokeWidth="14" fill="none" strokeLinecap="round" />
            <circle cx="67" cy="29" r="7.5" fill="#FDBA74" />
            <path d="M36 45 C42 40 50 42 52 47" stroke="#EA580C" strokeWidth="2" fill="none" strokeLinecap="round" />
          </>
        );
      case 'cotovelo':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#EEF2FF" />
            <path d="M34 26 L36 58 L69 58" stroke="#FDBA74" strokeWidth="13" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="36" cy="58" r="7" fill="none" stroke="#6366F1" strokeWidth="3" />
          </>
        );
      case 'dedo':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#FEF3C7" />
            <rect x="42" y="22" width="16" height="53" rx="8" fill="#FDBA74" stroke="#EA580C" strokeWidth="2" />
            <rect x="45" y="25" width="10" height="11" rx="4" fill="#FED7AA" />
            <line x1="45" y1="48" x2="55" y2="48" stroke="#EA580C" strokeWidth="2" strokeLinecap="round" />
          </>
        );
      case 'barriga':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#FCE7F3" />
            <path d="M31 28 L69 28 L72 72 L28 72 Z" fill="#EC4899" />
            <ellipse cx="50" cy="54" rx="18" ry="15" fill="#FDBA74" />
            <circle cx="50" cy="56" r="2.2" fill="#C2410C" />
          </>
        );
      case 'costas':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#E0F2FE" />
            <circle cx="50" cy="31" r="11" fill="#78350F" />
            <path d="M29 74 C30 46 70 46 71 74 Z" fill="#0284C7" />
            <line x1="50" y1="48" x2="50" y2="70" stroke="#BAE6FD" strokeWidth="3" strokeDasharray="3 3" strokeLinecap="round" />
          </>
        );
      case 'perna':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#ECFDF5" />
            <path d="M40 22 L42 68 L62 68" stroke="#FDBA74" strokeWidth="14" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="31" y="20" width="18" height="16" rx="4" fill="#10B981" />
          </>
        );
      case 'joelho':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#F3E8FF" />
            <path d="M36 22 L54 49 L40 76" stroke="#FDBA74" strokeWidth="13" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="54" cy="49" r="7.5" fill="none" stroke="#8B5CF6" strokeWidth="3" />
          </>
        );
      case 'coracao':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#FEE2E2" />
            <path d="M50 75 C50 75 23 58 23 39 C23 29 31 24 39 24 C45 24 49 28 50 32 C51 28 55 24 61 24 C69 24 77 29 77 39 C77 58 50 75 50 75 Z" fill="#EF4444" />
            <path d="M33 34 C30 37 30 41 32 45" stroke="#FCA5A5" strokeWidth="3" fill="none" strokeLinecap="round" />
          </>
        );
      case 'pulmao':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#E0F2FE" />
            <path d="M50 22 L50 42 M50 42 L38 48 M50 42 L62 48" stroke="#0284C7" strokeWidth="4.5" strokeLinecap="round" />
            <path d="M44 37 C31 35 23 50 25 68 C26 73 43 74 44 65 Z" fill="#FB7185" />
            <path d="M56 37 C69 35 77 50 75 68 C74 73 57 74 56 65 Z" fill="#FB7185" />
          </>
        );
      case 'pele':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#FFF7ED" />
            <ellipse cx="50" cy="54" rx="26" ry="18" fill="#FDBA74" stroke="#EA580C" strokeWidth="2.5" />
            <circle cx="38" cy="51" r="2.2" fill="#C2410C" />
            <circle cx="50" cy="48" r="2.2" fill="#C2410C" />
            <circle cx="62" cy="52" r="2.2" fill="#C2410C" />
            <path d="M35 61 Q50 56 65 61" stroke="#FED7AA" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </>
        );
      case 'unha':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#FCE7F3" />
            <rect x="37" y="24" width="26" height="52" rx="13" fill="#FDBA74" />
            <rect x="41" y="27" width="18" height="20" rx="8" fill="#F9A8D4" stroke="#EC4899" strokeWidth="2" />
            <ellipse cx="47" cy="34" rx="2" ry="5" fill="#FCE7F3" />
          </>
        );
      case 'sol':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#FEF9C3" />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
              <line
                key={deg}
                x1="50"
                y1="18"
                x2="50"
                y2="26"
                stroke="#F59E0B"
                strokeWidth="4"
                strokeLinecap="round"
                transform={`rotate(${deg} 50 50)`}
              />
            ))}
            <circle cx="50" cy="50" r="19" fill="#FACC15" stroke="#F59E0B" strokeWidth="2" />
            <circle cx="44" cy="47" r="2.2" fill="#0F172A" />
            <circle cx="56" cy="47" r="2.2" fill="#0F172A" />
            <path d="M44 54 Q50 59 56 54" stroke="#0F172A" strokeWidth="2" fill="none" strokeLinecap="round" />
          </>
        );
      case 'lua':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#EEF2FF" />
            <path d="M58 26 C40 28 30 46 38 62 C44 74 62 76 70 67 C55 68 46 58 47 45 C48 36 53 30 58 26 Z" fill="#FBBF24" />
            <circle cx="66" cy="34" r="3" fill="#FDE047" />
            <circle cx="72" cy="48" r="2" fill="#FDE047" />
          </>
        );
      case 'flor':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#FCE7F3" />
            <line x1="50" y1="50" x2="50" y2="79" stroke="#16A34A" strokeWidth="4" strokeLinecap="round" />
            {[0, 60, 120, 180, 240, 300].map((deg) => (
              <circle
                key={deg}
                cx="50"
                cy="31"
                r="9"
                fill="#EC4899"
                transform={`rotate(${deg} 50 44)`}
              />
            ))}
            <circle cx="50" cy="44" r="9" fill="#FACC15" />
          </>
        );
      case 'arvore':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#ECFDF5" />
            <rect x="44" y="52" width="12" height="25" rx="3" fill="#92400E" />
            <circle cx="50" cy="38" r="18" fill="#10B981" />
            <circle cx="37" cy="44" r="13" fill="#059669" />
            <circle cx="63" cy="44" r="13" fill="#059669" />
            <circle cx="45" cy="36" r="3" fill="#EF4444" />
            <circle cx="58" cy="42" r="3" fill="#EF4444" />
          </>
        );
      case 'estrela':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#FEFCE8" />
            <polygon
              points="50,20 58,38 78,40 62,53 67,73 50,62 33,73 38,53 22,40 42,38"
              fill="#FACC15"
              stroke="#EAB308"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
          </>
        );
      case 'nuvem':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#E0F2FE" />
            <circle cx="37" cy="54" r="13" fill="#FFFFFF" />
            <circle cx="51" cy="44" r="16" fill="#FFFFFF" />
            <circle cx="65" cy="54" r="12" fill="#FFFFFF" />
            <rect x="36" y="52" width="30" height="15" rx="7" fill="#FFFFFF" />
          </>
        );
      case 'ceu':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#38BDF8" />
            <circle cx="66" cy="34" r="9" fill="#FACC15" />
            <circle cx="34" cy="55" r="10" fill="#FFFFFF" />
            <circle cx="46" cy="49" r="12" fill="#FFFFFF" />
            <circle cx="57" cy="55" r="9" fill="#FFFFFF" />
            <rect x="34" y="53" width="23" height="12" rx="6" fill="#FFFFFF" />
          </>
        );
      case 'chuva':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#E0F2FE" />
            <circle cx="37" cy="42" r="11" fill="#94A3B8" />
            <circle cx="50" cy="34" r="13" fill="#94A3B8" />
            <circle cx="63" cy="42" r="10" fill="#94A3B8" />
            <rect x="36" y="40" width="28" height="13" rx="6" fill="#94A3B8" />
            <path d="M36 60 L33 69 M46 62 L43 72 M56 60 L53 69 M65 62 L62 72" stroke="#0284C7" strokeWidth="3.2" strokeLinecap="round" />
          </>
        );
      case 'vento':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#ECFEFF" />
            <path d="M22 42 H58 C66 42 66 32 58 32 C53 32 51 35 52 38" stroke="#0EA5E9" strokeWidth="4" fill="none" strokeLinecap="round" />
            <path d="M20 53 H68 C76 53 76 63 68 63 C63 63 61 60 62 57" stroke="#38BDF8" strokeWidth="4" fill="none" strokeLinecap="round" />
            <path d="M26 65 H48 C54 65 54 73 48 73" stroke="#0284C7" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          </>
        );
      case 'arco-iris':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#E0F2FE" />
            <path d="M22 62 A28 28 0 0 1 78 62" stroke="#EF4444" strokeWidth="5" fill="none" strokeLinecap="round" />
            <path d="M27 62 A23 23 0 0 1 73 62" stroke="#FACC15" strokeWidth="5" fill="none" strokeLinecap="round" />
            <path d="M32 62 A18 18 0 0 1 68 62" stroke="#22C55E" strokeWidth="5" fill="none" strokeLinecap="round" />
            <path d="M37 62 A13 13 0 0 1 63 62" stroke="#3B82F6" strokeWidth="5" fill="none" strokeLinecap="round" />
            <circle cx="24" cy="64" r="7" fill="#FFFFFF" />
            <circle cx="76" cy="64" r="7" fill="#FFFFFF" />
          </>
        );
      case 'folha':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#ECFDF5" />
            <path d="M26 72 C24 38 45 22 74 26 C76 55 58 74 26 72 Z" fill="#22C55E" stroke="#16A34A" strokeWidth="2.5" />
            <path d="M24 74 L62 38" stroke="#15803D" strokeWidth="3" strokeLinecap="round" />
            <path d="M42 56 L42 43 M52 47 L63 47" stroke="#15803D" strokeWidth="2.2" strokeLinecap="round" />
          </>
        );
      case 'grama':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#ECFDF5" />
            <path d="M24 72 L30 43 L38 66 L47 34 L55 66 L64 41 L71 67 L77 48 L75 72 Z" fill="#16A34A" stroke="#15803D" strokeWidth="2" strokeLinejoin="round" />
          </>
        );
      case 'terra':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#FEF3C7" />
            <path d="M20 68 C25 46 38 42 50 42 C62 42 75 46 80 68 Z" fill="#92400E" />
            <circle cx="38" cy="58" r="2.5" fill="#78350F" />
            <circle cx="56" cy="53" r="3" fill="#78350F" />
            <circle cx="64" cy="62" r="2.2" fill="#78350F" />
            <path d="M50 42 V30 M50 35 C56 29 62 32 58 37 Z" stroke="#16A34A" strokeWidth="3" fill="#22C55E" strokeLinecap="round" />
          </>
        );
      case 'rio':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#ECFDF5" />
            <path d="M46 22 C35 34 65 44 40 58 C28 65 38 74 52 78" stroke="#0EA5E9" strokeWidth="14" fill="none" strokeLinecap="round" />
            <path d="M47 26 C39 36 60 44 42 57" stroke="#BAE6FD" strokeWidth="3" fill="none" strokeLinecap="round" />
          </>
        );
      case 'mar':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#E0F2FE" />
            <path d="M20 44 Q30 37 40 44 Q50 51 60 44 Q70 37 80 44 V74 H20 Z" fill="#0284C7" />
            <path d="M20 57 Q30 50 40 57 Q50 64 60 57 Q70 50 80 57" stroke="#7DD3FC" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          </>
        );
      case 'praia':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#E0F2FE" />
            <circle cx="67" cy="31" r="8" fill="#FACC15" />
            <path d="M18 53 H82 V65 H18 Z" fill="#0EA5E9" />
            <path d="M18 61 Q50 54 82 61 V78 H18 Z" fill="#FDE68A" />
            <path d="M35 64 L32 39" stroke="#92400E" strokeWidth="4" strokeLinecap="round" />
            <path d="M21 43 C27 33 41 35 45 43 Z" fill="#EF4444" />
          </>
        );
      case 'pedra':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#F1F5F9" />
            <path d="M24 67 L31 42 L48 33 L68 41 L76 67 Z" fill="#64748B" stroke="#475569" strokeWidth="2.5" strokeLinejoin="round" />
            <polygon points="48,33 68,41 56,52 44,46" fill="#94A3B8" />
          </>
        );
      case 'montanha':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#E0F2FE" />
            <polygon points="18,72 44,29 70,72" fill="#059669" />
            <polygon points="43,72 64,37 83,72" fill="#10B981" />
            <polygon points="36,42 44,29 52,42 47,40 44,43 41,40" fill="#FFFFFF" />
          </>
        );
      case 'cachoeira':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#ECFEFF" />
            <rect x="24" y="25" width="22" height="45" rx="4" fill="#64748B" />
            <path d="M40 30 H58 C62 30 62 38 62 66" stroke="#06B6D4" strokeWidth="14" fill="none" strokeLinecap="round" />
            <path d="M57 35 V64 M64 38 V64" stroke="#E0F2FE" strokeWidth="2.5" strokeLinecap="round" />
            <ellipse cx="60" cy="70" rx="18" ry="6" fill="#38BDF8" />
          </>
        );
      case 'floresta':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#ECFDF5" />
            <rect x="31" y="57" width="7" height="16" fill="#78350F" />
            <polygon points="34.5,27 20,59 49,59" fill="#15803D" />
            <rect x="61" y="57" width="7" height="16" fill="#78350F" />
            <polygon points="64.5,31 51,59 78,59" fill="#16A34A" />
            <rect x="46" y="54" width="8" height="21" fill="#92400E" />
            <polygon points="50,21 34,57 66,57" fill="#22C55E" />
          </>
        );
      case 'semente':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#FEFCE8" />
            <path d="M50 24 C63 39 65 65 50 74 C35 65 37 39 50 24 Z" fill="#A16207" stroke="#713F12" strokeWidth="2.5" />
            <path d="M50 24 C50 18 55 15 60 17" stroke="#22C55E" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            <ellipse cx="45" cy="48" rx="3" ry="8" fill="#CA8A04" opacity="0.6" />
          </>
        );
      case 'jardim':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#ECFDF5" />
            <path d="M22 68 Q50 58 78 68 V76 H22 Z" fill="#22C55E" />
            <line x1="36" y1="45" x2="36" y2="66" stroke="#16A34A" strokeWidth="3" />
            <circle cx="36" cy="42" r="7" fill="#EC4899" />
            <circle cx="36" cy="42" r="3" fill="#FACC15" />
            <line x1="62" y1="47" x2="62" y2="66" stroke="#16A34A" strokeWidth="3" />
            <circle cx="62" cy="44" r="7" fill="#8B5CF6" />
            <circle cx="62" cy="44" r="3" fill="#FACC15" />
            <circle cx="49" cy="34" r="6" fill="#F97316" />
            <circle cx="49" cy="34" r="2.5" fill="#FEF08A" />
          </>
        );
      case 'fogo':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#FFF7ED" />
            <path d="M50 20 C65 35 72 48 67 63 C63 72 56 76 50 76 C44 76 37 72 33 63 C28 48 39 36 44 31 C45 37 48 40 48 40 C48 31 50 20 50 20 Z" fill="#F97316" />
            <path d="M50 40 C58 49 61 57 58 65 C55 71 45 71 42 65 C39 57 45 48 50 40 Z" fill="#FACC15" />
          </>
        );
      case 'abelha':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#FEF9C3" />
            <ellipse cx="42" cy="35" rx="8" ry="11" fill="#BAE6FD" transform="rotate(-20 42 35)" />
            <ellipse cx="58" cy="35" rx="8" ry="11" fill="#BAE6FD" transform="rotate(20 58 35)" />
            <ellipse cx="50" cy="53" rx="19" ry="14" fill="#FACC15" stroke="#0F172A" strokeWidth="2.5" />
            <line x1="45" y1="40" x2="45" y2="66" stroke="#0F172A" strokeWidth="4" />
            <line x1="55" y1="40" x2="55" y2="66" stroke="#0F172A" strokeWidth="4" />
            <circle cx="62" cy="50" r="2.3" fill="#0F172A" />
          </>
        );
      case 'dado':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#E0F2FE" />
            <rect x="27" y="27" width="46" height="46" rx="9" fill="#FFFFFF" stroke="#0284C7" strokeWidth="3" />
            <circle cx="39" cy="39" r="3.5" fill="#0284C7" />
            <circle cx="61" cy="39" r="3.5" fill="#0284C7" />
            <circle cx="50" cy="50" r="3.5" fill="#0284C7" />
            <circle cx="39" cy="61" r="3.5" fill="#0284C7" />
            <circle cx="61" cy="61" r="3.5" fill="#0284C7" />
          </>
        );
      case 'elefante':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#ECFDF5" />
            <circle cx="28" cy="48" r="13" fill="#94A3B8" />
            <circle cx="72" cy="48" r="13" fill="#94A3B8" />
            <circle cx="50" cy="47" r="19" fill="#CBD5E1" />
            <path d="M50 51 C50 64 56 69 62 64" stroke="#94A3B8" strokeWidth="7" fill="none" strokeLinecap="round" />
            <circle cx="43" cy="43" r="2.8" fill="#0F172A" />
            <circle cx="57" cy="43" r="2.8" fill="#0F172A" />
          </>
        );
      case 'ovo':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#FEF3C7" />
            <ellipse cx="50" cy="51" rx="18" ry="24" fill="#FFFFFF" stroke="#F59E0B" strokeWidth="3" />
            <circle cx="50" cy="54" r="8" fill="#FACC15" />
          </>
        );
      case 'foca':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#E0F2FE" />
            <ellipse cx="50" cy="57" rx="22" ry="18" fill="#64748B" />
            <circle cx="50" cy="40" r="15" fill="#94A3B8" />
            <circle cx="44" cy="37" r="2.8" fill="#0F172A" />
            <circle cx="56" cy="37" r="2.8" fill="#0F172A" />
            <ellipse cx="50" cy="43" rx="4" ry="2.6" fill="#0F172A" />
            <path d="M35 43 L44 43 M56 43 L65 43 M36 46 L44 45 M56 45 L64 46" stroke="#334155" strokeWidth="1.8" strokeLinecap="round" />
            <ellipse cx="32" cy="67" rx="8" ry="4" fill="#475569" transform="rotate(-18 32 67)" />
            <ellipse cx="68" cy="67" rx="8" ry="4" fill="#475569" transform="rotate(18 68 67)" />
          </>
        );
      case 'lata':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#FCE7F3" />
            <rect x="33" y="28" width="34" height="44" rx="5" fill="#38BDF8" />
            <ellipse cx="50" cy="28" rx="17" ry="4.5" fill="#E2E8F0" />
            <ellipse cx="50" cy="72" rx="17" ry="4.5" fill="#0284C7" />
            <rect x="33" y="42" width="34" height="16" fill="#FACC15" />
            <circle cx="50" cy="50" r="5" fill="#EF4444" />
          </>
        );
      case 'mala':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#EDE9FE" />
            <path d="M40 34 V27 A4 4 0 0 1 44 23 H56 A4 4 0 0 1 60 27 V34" fill="none" stroke="#6D28D9" strokeWidth="4" />
            <rect x="24" y="34" width="52" height="38" rx="8" fill="#8B5CF6" />
            <rect x="34" y="34" width="6" height="38" fill="#F59E0B" />
            <rect x="60" y="34" width="6" height="38" fill="#F59E0B" />
            <circle cx="50" cy="53" r="4" fill="#FDE047" />
          </>
        );
      case 'chocolate':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#FEF3C7" />
            <rect x="29" y="22" width="42" height="56" rx="6" fill="#78350F" />
            <rect x="33" y="26" width="15" height="14" rx="2" fill="#92400E" />
            <rect x="52" y="26" width="15" height="14" rx="2" fill="#92400E" />
            <rect x="33" y="43" width="15" height="14" rx="2" fill="#92400E" />
            <rect x="52" y="43" width="15" height="14" rx="2" fill="#92400E" />
            <path d="M27 52 H73 V72 A6 6 0 0 1 67 78 H33 A6 6 0 0 1 27 72 Z" fill="#EF4444" />
            <path d="M27 52 L40 46 L50 53 L62 46 L73 52" fill="#FCA5A5" />
          </>
        );
      case 'hipopotamo':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#EDE9FE" />
            <circle cx="33" cy="31" r="6" fill="#8B5CF6" />
            <circle cx="67" cy="31" r="6" fill="#8B5CF6" />
            <circle cx="50" cy="46" r="21" fill="#A78BFA" />
            <ellipse cx="50" cy="59" rx="20" ry="13" fill="#C4B5FD" />
            <circle cx="42" cy="42" r="2.8" fill="#0F172A" />
            <circle cx="58" cy="42" r="2.8" fill="#0F172A" />
            <circle cx="42" cy="58" r="2.5" fill="#6D28D9" />
            <circle cx="58" cy="58" r="2.5" fill="#6D28D9" />
          </>
        );
      case 'igreja':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#E0F2FE" />
            <rect x="31" y="44" width="38" height="32" rx="3" fill="#FFFFFF" stroke="#0284C7" strokeWidth="2.5" />
            <polygon points="28,45 50,24 72,45" fill="#F97316" />
            <path d="M50 14 V24 M45 18 H55" stroke="#0284C7" strokeWidth="3" strokeLinecap="round" />
            <path d="M43 76 V59 A7 7 0 0 1 57 59 V76 Z" fill="#38BDF8" />
          </>
        );
      case 'jacare':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#DCFCE7" />
            <ellipse cx="50" cy="55" rx="26" ry="15" fill="#16A34A" />
            <circle cx="38" cy="42" r="6" fill="#22C55E" />
            <circle cx="54" cy="42" r="6" fill="#22C55E" />
            <circle cx="38" cy="42" r="2.6" fill="#0F172A" />
            <circle cx="54" cy="42" r="2.6" fill="#0F172A" />
            <path d="M32 60 Q50 66 72 58" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeDasharray="3 4" strokeLinecap="round" />
          </>
        );
      case 'kiwi':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#ECFCCB" />
            <circle cx="50" cy="50" r="26" fill="#92400E" />
            <circle cx="50" cy="50" r="22" fill="#84CC16" />
            <circle cx="50" cy="50" r="8" fill="#ECFCCB" />
            <circle cx="40" cy="44" r="1.8" fill="#0F172A" />
            <circle cx="60" cy="44" r="1.8" fill="#0F172A" />
            <circle cx="40" cy="56" r="1.8" fill="#0F172A" />
            <circle cx="60" cy="56" r="1.8" fill="#0F172A" />
            <circle cx="50" cy="38" r="1.8" fill="#0F172A" />
            <circle cx="50" cy="62" r="1.8" fill="#0F172A" />
          </>
        );
      case 'navio':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#E0F2FE" />
            <rect x="48" y="23" width="4" height="31" fill="#78350F" />
            <polygon points="52,25 71,44 52,44" fill="#EF4444" />
            <polygon points="48,29 31,46 48,46" fill="#FACC15" />
            <path d="M24 54 H76 L69 68 H31 Z" fill="#0284C7" />
            <path d="M20 71 Q35 67 50 71 T80 71" fill="none" stroke="#38BDF8" strokeWidth="3.5" strokeLinecap="round" />
          </>
        );
      case 'waffle':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#FFF7ED" />
            <rect x="26" y="26" width="48" height="48" rx="10" fill="#F59E0B" />
            <path d="M38 26 V74 M50 26 V74 M62 26 V74 M26 38 H74 M26 50 H74 M26 62 H74" stroke="#B45309" strokeWidth="3" />
            <rect x="44" y="44" width="12" height="12" rx="3" fill="#FEF08A" />
          </>
        );
      case 'xicara':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#FCE7F3" />
            <path d="M65 44 H71 A7 7 0 0 1 71 58 H65" fill="none" stroke="#EC4899" strokeWidth="4.5" />
            <path d="M31 38 H66 V56 A17 17 0 0 1 31 56 Z" fill="#F472B6" />
            <ellipse cx="48.5" cy="74" rx="24" ry="4" fill="#F9A8D4" />
            <path d="M43 27 Q45 22 43 18 M53 27 Q55 22 53 18" fill="none" stroke="#94A3B8" strokeWidth="2.4" strokeLinecap="round" />
          </>
        );
      case 'cabra':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#FEF3C7" />
            <path d="M37 32 Q31 20 26 24 M63 32 Q69 20 74 24" fill="none" stroke="#92400E" strokeWidth="4" strokeLinecap="round" />
            <ellipse cx="29" cy="41" rx="7" ry="4" fill="#D97706" transform="rotate(-25 29 41)" />
            <ellipse cx="71" cy="41" rx="7" ry="4" fill="#D97706" transform="rotate(25 71 41)" />
            <ellipse cx="50" cy="50" rx="18" ry="20" fill="#FDE68A" />
            <ellipse cx="50" cy="59" rx="12" ry="9" fill="#FFFBEB" />
            <circle cx="43" cy="44" r="2.8" fill="#0F172A" />
            <circle cx="57" cy="44" r="2.8" fill="#0F172A" />
            <path d="M47 68 Q50 76 53 68" fill="#B45309" />
          </>
        );
      case 'galo':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#FEE2E2" />
            <path d="M40 28 Q44 18 49 26 Q54 17 58 26 Q64 20 62 31 Z" fill="#EF4444" />
            <circle cx="50" cy="49" r="20" fill="#FFFFFF" stroke="#F97316" strokeWidth="2.5" />
            <circle cx="43" cy="45" r="2.8" fill="#0F172A" />
            <circle cx="57" cy="45" r="2.8" fill="#0F172A" />
            <polygon points="45,51 55,51 50,59" fill="#F59E0B" />
            <ellipse cx="47" cy="64" rx="4" ry="5" fill="#EF4444" />
            <ellipse cx="53" cy="64" rx="4" ry="5" fill="#EF4444" />
          </>
        );
      case 'burro':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#E2E8F0" />
            <ellipse cx="37" cy="27" rx="5.5" ry="15" fill="#64748B" transform="rotate(-14 37 27)" />
            <ellipse cx="63" cy="27" rx="5.5" ry="15" fill="#64748B" transform="rotate(14 63 27)" />
            <ellipse cx="50" cy="52" rx="18" ry="20" fill="#94A3B8" />
            <ellipse cx="50" cy="61" rx="14" ry="10" fill="#F1F5F9" />
            <circle cx="42" cy="45" r="2.8" fill="#0F172A" />
            <circle cx="58" cy="45" r="2.8" fill="#0F172A" />
            <circle cx="45" cy="60" r="2.2" fill="#475569" />
            <circle cx="55" cy="60" r="2.2" fill="#475569" />
          </>
        );
      case 'lobo':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#E0E7FF" />
            <polygon points="29,40 35,20 46,35" fill="#475569" />
            <polygon points="71,40 65,20 54,35" fill="#475569" />
            <circle cx="50" cy="52" r="21" fill="#64748B" />
            <path d="M33 56 Q50 45 67 56 Q62 72 50 74 Q38 72 33 56 Z" fill="#F1F5F9" />
            <circle cx="42" cy="47" r="2.8" fill="#FACC15" />
            <circle cx="58" cy="47" r="2.8" fill="#FACC15" />
            <circle cx="42" cy="47" r="1.4" fill="#0F172A" />
            <circle cx="58" cy="47" r="1.4" fill="#0F172A" />
            <polygon points="46,59 54,59 50,64" fill="#0F172A" />
          </>
        );
      case 'pomba':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#E0F2FE" />
            <ellipse cx="52" cy="57" rx="20" ry="14" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
            <circle cx="40" cy="39" r="11" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
            <path d="M56 48 Q74 36 70 57 Z" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="1.5" />
            <circle cx="37" cy="37" r="2.4" fill="#0F172A" />
            <polygon points="29,39 23,41 29,43" fill="#F59E0B" />
          </>
        );
      case 'aguia':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#FEF3C7" />
            <path d="M28 60 Q50 72 72 60 L66 44 H34 Z" fill="#78350F" />
            <circle cx="50" cy="41" r="17" fill="#FFFFFF" />
            <path d="M36 37 Q42 33 46 37 M54 37 Q58 33 64 37" stroke="#78350F" strokeWidth="2.4" fill="none" strokeLinecap="round" />
            <circle cx="42" cy="40" r="2.6" fill="#0F172A" />
            <circle cx="58" cy="40" r="2.6" fill="#0F172A" />
            <path d="M45 46 H55 L52 57 Q49 54 45 46 Z" fill="#F59E0B" />
          </>
        );
      case 'grilo':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#DCFCE7" />
            <ellipse cx="52" cy="55" rx="20" ry="11" fill="#22C55E" />
            <circle cx="34" cy="49" r="9" fill="#16A34A" />
            <path d="M30 41 Q22 25 18 28 M36 40 Q32 23 28 24" fill="none" stroke="#15803D" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M54 57 L68 41 L74 66" fill="none" stroke="#15803D" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="32" cy="47" r="2.4" fill="#0F172A" />
          </>
        );
      case 'cigarra':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#ECFCCB" />
            <ellipse cx="42" cy="55" rx="11" ry="19" fill="#A3E635" opacity="0.7" transform="rotate(-18 42 55)" />
            <ellipse cx="58" cy="55" rx="11" ry="19" fill="#A3E635" opacity="0.7" transform="rotate(18 58 55)" />
            <ellipse cx="50" cy="52" rx="11" ry="20" fill="#65A30D" />
            <circle cx="42" cy="36" r="4" fill="#EF4444" />
            <circle cx="58" cy="36" r="4" fill="#EF4444" />
            <path d="M42 48 H58 M41 55 H59 M42 62 H58" stroke="#3F6212" strokeWidth="2" />
          </>
        );
      case 'abraco':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#FCE7F3" />
            <path d="M50 76 C50 76 23 59 23 41 C23 32 30 26 38 26 C44 26 48 30 50 34 C52 30 56 26 62 26 C70 26 77 32 77 41 C77 59 50 76 50 76 Z" fill="#F43F5E" />
            <path d="M24 55 Q38 66 50 56 Q62 66 76 55" fill="none" stroke="#FFF1F2" strokeWidth="4.5" strokeLinecap="round" />
            <circle cx="40" cy="43" r="2.8" fill="#FFF1F2" />
            <circle cx="60" cy="43" r="2.8" fill="#FFF1F2" />
          </>
        );
      case 'feliz':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#FEF9C3" />
            <circle cx="50" cy="52" r="25" fill="#FACC15" />
            <circle cx="41" cy="47" r="3.2" fill="#0F172A" />
            <circle cx="59" cy="47" r="3.2" fill="#0F172A" />
            <circle cx="35" cy="55" r="3.8" fill="#FB7185" opacity="0.6" />
            <circle cx="65" cy="55" r="3.8" fill="#FB7185" opacity="0.6" />
            <path d="M39 57 Q50 69 61 57" fill="none" stroke="#0F172A" strokeWidth="3.5" strokeLinecap="round" />
          </>
        );
      case 'triste':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#E0F2FE" />
            <circle cx="50" cy="52" r="25" fill="#BAE6FD" />
            <circle cx="41" cy="48" r="3" fill="#0F172A" />
            <circle cx="59" cy="48" r="3" fill="#0F172A" />
            <path d="M40 64 Q50 56 60 64" fill="none" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />
            <path d="M62 55 C65 59 65 63 62 63 C59 63 59 59 62 55 Z" fill="#0284C7" />
          </>
        );
      case 'medo':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#EDE9FE" />
            <circle cx="50" cy="53" r="24" fill="#DDD6FE" />
            <circle cx="41" cy="47" r="3.5" fill="#FFFFFF" />
            <circle cx="59" cy="47" r="3.5" fill="#FFFFFF" />
            <circle cx="41" cy="47" r="1.8" fill="#0F172A" />
            <circle cx="59" cy="47" r="1.8" fill="#0F172A" />
            <ellipse cx="50" cy="61" rx="4.5" ry="5.5" fill="#0F172A" />
            <path d="M71 27 L73 32 L78 33 L73 35 L71 40 L69 35 L64 33 L69 32 Z" fill="#F59E0B" />
          </>
        );
      case 'bravo':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#FEE2E2" />
            <circle cx="50" cy="53" r="24" fill="#FCA5A5" />
            <path d="M36 42 L45 46 M64 42 L55 46" stroke="#7F1D1D" strokeWidth="3" strokeLinecap="round" />
            <circle cx="41" cy="50" r="2.8" fill="#0F172A" />
            <circle cx="59" cy="50" r="2.8" fill="#0F172A" />
            <path d="M42 63 Q50 58 58 63" fill="none" stroke="#7F1D1D" strokeWidth="3" strokeLinecap="round" />
          </>
        );
      case 'calmo':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#CCFBF1" />
            <circle cx="50" cy="52" r="24" fill="#99F6E4" />
            <path d="M37 49 Q41 53 45 49 M55 49 Q59 53 63 49" fill="none" stroke="#0F766E" strokeWidth="2.8" strokeLinecap="round" />
            <path d="M43 60 Q50 65 57 60" fill="none" stroke="#0F766E" strokeWidth="2.8" strokeLinecap="round" />
          </>
        );
      case 'vergonha':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#FFE4E6" />
            <circle cx="50" cy="52" r="24" fill="#FED7AA" />
            <circle cx="36" cy="55" r="5" fill="#FB7185" opacity="0.7" />
            <circle cx="64" cy="55" r="5" fill="#FB7185" opacity="0.7" />
            <circle cx="42" cy="48" r="2.6" fill="#0F172A" />
            <circle cx="58" cy="48" r="2.6" fill="#0F172A" />
            <path d="M45 60 Q50 63 55 60" fill="none" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
          </>
        );
      case 'banheiro':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#E0F2FE" />
            <rect x="33" y="25" width="34" height="16" rx="5" fill="#FFFFFF" stroke="#0284C7" strokeWidth="2.5" />
            <path d="M31 46 H69 L64 66 Q50 74 36 66 Z" fill="#FFFFFF" stroke="#0284C7" strokeWidth="2.5" />
            <rect x="42" y="67" width="16" height="10" rx="3" fill="#BAE6FD" />
            <path d="M58 31 H63" stroke="#0284C7" strokeWidth="2.5" strokeLinecap="round" />
          </>
        );
      case 'frio':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#E0F2FE" />
            <path d="M50 24 V76 M28 37 L72 63 M72 37 L28 63" stroke="#0284C7" strokeWidth="4" strokeLinecap="round" />
            <circle cx="50" cy="50" r="8" fill="#BAE6FD" stroke="#0284C7" strokeWidth="3" />
          </>
        );
      case 'tchau':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#FEF3C7" />
            <path d="M35 55 V34 C35 31 39 31 39 34 V46 V28 C39 25 44 25 44 28 V45 V26 C44 23 49 23 49 26 V45 V29 C49 26 54 26 54 29 V49 L59 42 C61 39 65 41 63 45 L56 61 C54 67 48 72 42 72 C36 72 35 64 35 55 Z" fill="#FBBF24" stroke="#D97706" strokeWidth="2" />
            <path d="M64 26 Q71 32 69 40 M27 28 Q22 34 24 41" fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
          </>
        );
      case 'amigos':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#DCFCE7" />
            <circle cx="37" cy="40" r="10" fill="#FDE68A" />
            <circle cx="63" cy="40" r="10" fill="#FDBA74" />
            <path d="M24 68 C24 57 31 52 37 52 C43 52 50 57 50 68" fill="#38BDF8" />
            <path d="M50 68 C50 57 57 52 63 52 C69 52 76 57 76 68" fill="#34D399" />
            <circle cx="34" cy="39" r="1.6" fill="#0F172A" />
            <circle cx="40" cy="39" r="1.6" fill="#0F172A" />
            <circle cx="60" cy="39" r="1.6" fill="#0F172A" />
            <circle cx="66" cy="39" r="1.6" fill="#0F172A" />
          </>
        );
      case 'pergunta':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#E0E7FF" />
            <path d="M26 30 H74 A6 6 0 0 1 80 36 V60 A6 6 0 0 1 74 66 H45 L33 76 V66 H26 A6 6 0 0 1 20 60 V36 A6 6 0 0 1 26 30 Z" fill="#6366F1" />
            <text x="50" y="57" textAnchor="middle" fontSize="28" fontWeight="800" fill="#FFFFFF" fontFamily="Outfit, sans-serif">
              ?
            </text>
          </>
        );
      case 'escola':
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#FEF3C7" />
            <rect x="22" y="29" width="56" height="38" rx="6" fill="#15803D" stroke="#B45309" strokeWidth="4" />
            <path d="M32 44 H58 M32 53 H48" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
            <path d="M40 67 L35 76 M60 67 L65 76" stroke="#B45309" strokeWidth="3.5" strokeLinecap="round" />
          </>
        );
      default:
        return (
          <>
            <circle cx="50" cy="50" r="44" fill="#E0F2FE" />
            <circle cx="50" cy="50" r="26" fill="#38BDF8" />
            <text x="50" y="59" textAnchor="middle" fontSize="26" fontWeight="800" fill="#FFFFFF" fontFamily="Outfit, sans-serif">
              {label.slice(0, 2).toUpperCase()}
            </text>
          </>
        );
    }
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-label={label}
    >
      {renderArtwork()}
    </svg>
  );
};

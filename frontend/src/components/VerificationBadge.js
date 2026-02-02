import React from 'react';
import { ShieldCheck } from 'lucide-react';

const VerificationBadge = ({ verification_status, buyer_type }) => {
  if (verification_status !== 'verified') return null;

  const badgeText = buyer_type ? `Verified ${buyer_type}` : 'Verified';

  return (
    <span className="verification-badge" data-testid="verification-badge">
      <ShieldCheck className="h-3 w-3" />
      {badgeText}
    </span>
  );
};

export default VerificationBadge;
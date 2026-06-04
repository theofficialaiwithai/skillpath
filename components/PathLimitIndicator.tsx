"use client";

import { useState } from "react";
import UpgradeModal from "./UpgradeModal";
// Hardcoded to avoid importing lib/subscription (which pulls lib/db into the client bundle)
const FREE_PATH_LIMIT = 2;

interface Props {
  activeCount: number;
  isSubscribed: boolean;
}

/**
 * Shows a subtle path-count indicator below the dashboard heading for free users.
 * Hidden when subscribed, or when activeCount is 0.
 */
export default function PathLimitIndicator({ activeCount, isSubscribed }: Props) {
  const [modalOpen, setModalOpen] = useState(false);

  // Hide for paying users and for users with zero active paths
  if (isSubscribed || activeCount === 0) return null;

  return (
    <>
      <p className="text-sm text-gray-500 mt-1">
        {activeCount} of {FREE_PATH_LIMIT} paths used
        {" · "}
        <button
          onClick={() => setModalOpen(true)}
          className="text-brand font-medium hover:underline transition-colors"
          style={{ color: "#FF4D2E" }}
        >
          Upgrade for unlimited →
        </button>
      </p>

      <UpgradeModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}

"use client";

import dynamic from "next/dynamic";

const WaitlistForm = dynamic(() => import("./WaitlistForm"), { ssr: false });

export default function WaitlistFormWrapper() {
  return <WaitlistForm />;
}

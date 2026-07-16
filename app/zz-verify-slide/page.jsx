"use client";

import SlideToSubmit from "@/components/SlideToSubmit";

export default function VerifySlidePage() {
  return (
    <div style={{ maxWidth: 420, margin: "80px auto" }}>
      <h2>idle</h2>
      <SlideToSubmit onConfirm={() => {}} busy={false} />
      <h2>busy</h2>
      <SlideToSubmit onConfirm={() => {}} busy={true} />
    </div>
  );
}

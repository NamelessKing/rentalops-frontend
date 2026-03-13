// PlaceholderPage.tsx
// A temporary stub used for routes that are part of the Slice 0 route tree
// but whose real UI will be implemented in later slices.
//
// Why a shared placeholder instead of creating all pages now?
//   Slice 0 goal is "routing base funziona" — guards redirect correctly,
//   layouts render their shells, and the route tree is navigable.
//   The actual page content is out of scope for this foundation step and
//   belongs to later implementation slices.
//
//   One reusable stub avoids creating 15+ empty files that would be
//   immediately replaced in the next slice.

interface PlaceholderPageProps {
  // Name of the future page — shown in the heading so it is clear
  // which route matched during manual testing.
  title: string;
}

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <div className="py-5 text-center text-muted">
      <h2>{title}</h2>
      <p className="small">This page will be implemented in a future slice.</p>
    </div>
  );
}

// RouteShell — exact port of routeShell from the design:
// dashboard + copilot render with display:contents; every other route
// renders in a white card with 26px side/bottom margins.
export default function RouteShell({ bare, children }: { bare?: boolean; children: React.ReactNode }) {
  if (bare) return <div style={{ display: 'contents' }}>{children}</div>;
  return (
    <div style={{ margin: '0 26px 26px 26px', background: '#ffffff', border: '1px solid #e9e6de', borderRadius: 13, overflowX: 'auto', overflowY: 'hidden' }}>
      {children}
    </div>
  );
}

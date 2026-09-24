'use client';

import { switchOrgFromForm } from '@/app/actions/session';

export type OrgOption = { id: string; name: string; isAgency: boolean };

/** Dropdown that re-scopes the session to another org the user belongs to. */
export default function OrgSwitcher({ orgs, currentOrgId }: { orgs: OrgOption[]; currentOrgId?: string }) {
  if (orgs.length < 2) return null;
  return (
    <form action={switchOrgFromForm} className="px-3 pb-2">
      <label className="text-[10px] font-mono uppercase tracking-wider text-ink-subtle px-1">Workspace</label>
      <select
        name="orgId"
        defaultValue={currentOrgId}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="input h-9 text-[13px] mt-1 w-full"
      >
        {orgs.map((o) => (
          <option key={o.id} value={o.id}>{o.isAgency ? `${o.name} (agency)` : o.name}</option>
        ))}
      </select>
    </form>
  );
}

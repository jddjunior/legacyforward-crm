import { getSession } from '@/lib/auth';
import DashboardContent from '@/components/portal/DashboardContent';

export default async function DashboardPage() {
  const session = await getSession();
  if (!session?.orgId) return null;

  return <DashboardContent orgId={session.orgId} />;
}

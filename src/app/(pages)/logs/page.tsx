import { WithAuth, type WithAuthProps } from "~/components/common/withAuth";
import { getAuditLogsByUser } from "~/server/api/auditLog";
import LogsTable from "~/components/common/LogsTable";

const AuditLogs = async ({ user }: WithAuthProps) => {
  const logs = await getAuditLogsByUser(user.id);
  return <LogsTable logs={logs} showUser={false} />;
};

export default WithAuth(AuditLogs, false);

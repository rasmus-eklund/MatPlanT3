import { WithAuth } from "~/components/common/withAuth";
import { getAuditLogs } from "~/server/api/auditLog";
import LogsTable from "~/components/common/LogsTable";

const AuditLogs = async () => {
  const logs = await getAuditLogs();
  return <LogsTable logs={logs} showUser />;
};

export default WithAuth(AuditLogs, true);

import { WithAuth } from "~/components/common/withAuth";
import { getAuditLogs } from "~/server/api/auditLog";
import LogsTable from "./_components/LogsTable";

const AuditLogs = async () => {
  const logs = await getAuditLogs();
  return <LogsTable logs={logs} />;
};

export default WithAuth(AuditLogs, true);

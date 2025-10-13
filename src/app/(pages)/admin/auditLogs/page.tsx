import { WithAuth } from "~/components/common/withAuth";
import { getAuditLogs } from "~/server/api/auditLog";
import type { AuditLog } from "~/server/shared";

const AuditLogs = async () => {
  const logs = await getAuditLogs();
  return (
    <div className="flex flex-col gap-2 overflow-auto">
      {logs.map((log) => (
        <Log key={log.id} log={log} />
      ))}
    </div>
  );
};

const Log = ({ log }: { log: AuditLog }) => {
  return (
    <div className="flex items-center gap-2 text-nowrap">
      <div>{log.user.name}</div>
      <div>{log.action}</div>
      <div>{log.method}</div>
      <div>{JSON.stringify(log.data)}</div>
    </div>
  );
};

export default WithAuth(AuditLogs, true);

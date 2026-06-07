import { WithAuth } from "~/components/common/withAuth";
import { getAuditLogsByUser } from "~/server/api/auditLog";
import LogsTable from "~/components/common/LogsTable";

const AuditLogs = async () => {
  const logs = await getAuditLogsByUser();
  if (!logs.length) {
    return (
      <div className="flex size-full flex-col items-center justify-center gap-10">
        <h2 className="text-c1 text-xl">Du har inga loggar ännu</h2>
        <p>När du använt appen så kommer du att kunna se dina loggar här.</p>
      </div>
    );
  }
  return <LogsTable logs={logs} showUser={false} />;
};

export default WithAuth(AuditLogs, false, async () => "/logs");

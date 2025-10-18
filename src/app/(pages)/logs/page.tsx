import { WithAuth, type WithAuthProps } from "~/components/common/withAuth";
import { getAuditLogsByUser } from "~/server/api/auditLog";
import LogsTable from "~/components/common/LogsTable";

const AuditLogs = async ({ user }: WithAuthProps) => {
  const logs = await getAuditLogsByUser(user.id);
  if (!logs.length)
    return (
      <div className="flex size-full flex-col items-center justify-center gap-10">
        <h2 className="text-c1 text-xl">Du har inga loggar ännu</h2>
        <p>När du använt appen så kommer du att kunna se dina loggar här.</p>
      </div>
    );
  return <LogsTable logs={logs} showUser={false} />;
};

export default WithAuth(AuditLogs, false);

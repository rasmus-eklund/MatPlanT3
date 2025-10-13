import { db } from "../db";
import { auditLog } from "../db/schema";

export const addLog = ({
  method,
  action,
  data,
  userId,
}: {
  method: "create" | "update" | "delete";
  action: string;
  data: object;
  userId: string;
}) => {
  db.insert(auditLog)
    .values({
      method,
      action,
      data: JSON.stringify(data),
      userId,
    })
    .catch((e) => console.error(e));
};

export const getAuditLogs = async () =>
  db.query.auditLog.findMany({ with: { user: { columns: { name: true } } } });

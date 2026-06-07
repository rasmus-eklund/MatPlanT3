import { db } from "../db";
import { auditLog } from "../db/schema";
import { authorize } from "../auth";

export const addLog = async ({
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
  try {
    await db.insert(auditLog).values({
      method,
      action,
      data: JSON.stringify(data),
      userId,
    });
  } catch (e) {
    console.error(e);
  }
};

export const getAuditLogs = async () =>
  db.query.auditLog.findMany({ with: { user: { columns: { name: true } } } });

export const getAuditLogsByUser = async () => {
  const user = await authorize();
  const logs = await db.query.auditLog.findMany({
    where: (m, { eq }) => eq(m.userId, user.id),
    with: { user: { columns: { name: true } } },
  });
  return logs;
};

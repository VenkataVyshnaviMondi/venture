import { prisma } from "../config/prisma.js";

export const getEmployeeAssignment = async (userId: string) => {
  const row = await prisma.employeeAssignment.findUnique({ where: { userId } });
  return {
    assignedLocationIds: row?.assignedLocationIds ?? [],
    assignedVentureIds: row?.assignedVentureIds ?? []
  };
};

export const getEmployeeAssignmentMap = async (userIds: string[]) => {
  const rows = await prisma.employeeAssignment.findMany({ where: { userId: { in: userIds } } });
  return new Map(rows.map((row) => [row.userId, {
    assignedLocationIds: row.assignedLocationIds,
    assignedVentureIds: row.assignedVentureIds
  }]));
};

export const upsertEmployeeAssignment = async (
  userId: string, assignedLocationIds: string[], assignedVentureIds: string[]
) => prisma.employeeAssignment.upsert({
  where: { userId },
  create: { userId, assignedLocationIds, assignedVentureIds },
  update: { assignedLocationIds, assignedVentureIds }
});

import { Op } from "sequelize";
import Distribution from "@/server/database/models/distribution";
import Beneficiary from "@/server/database/models/beneficiary";
import { sequelize } from "@/server/database/models/db";

export type DistributionActor = {
  id: number;
  userType: "admin" | "staff";
};

type DeleteRestoreResult = {
  success: boolean;
  requestedCount: number;
  affectedCount: number;
  affectedIds: number[];
  notFoundIds: number[];
  unauthorizedIds: number[];
  skippedIds: number[];
  error?: string;
};

function normalizeIds(ids: any[]): number[] {
  return ids
    .map((id) => Number(id))
    .filter((id) => Number.isInteger(id) && id > 0);
}

function isAuthorized(actor: DistributionActor | undefined, ownerUserId: number) {
  if (!actor) return true;
  if (actor.userType === "admin") return true;
  return actor.id === ownerUserId;
}

export async function softDeleteDistributions(params: {
  ids: any[];
  actor?: DistributionActor;
}): Promise<DeleteRestoreResult> {
  const normalizedIds = normalizeIds(params.ids);

  if (normalizedIds.length === 0) {
    return {
      success: false,
      error: "ids must contain valid numeric IDs",
      requestedCount: 0,
      affectedCount: 0,
      affectedIds: [],
      notFoundIds: [],
      unauthorizedIds: [],
      skippedIds: [],
    };
  }

  return sequelize.transaction(async (transaction) => {
    const distributions = await Distribution.findAll({
      paranoid: false,
      where: {
        id: {
          [Op.in]: normalizedIds,
        },
      },
      transaction,
    });

    const byId = new Map<number, any>();
    for (const dist of distributions) byId.set(dist.id, dist);

    const notFoundIds: number[] = [];
    const unauthorizedIds: number[] = [];
    const alreadyDeletedIds: number[] = [];
    const deletableIds: number[] = [];

    for (const id of normalizedIds) {
      const dist = byId.get(id);
      if (!dist) {
        notFoundIds.push(id);
        continue;
      }
      if (dist.deletedAt) {
        alreadyDeletedIds.push(id);
        continue;
      }
      if (!isAuthorized(params.actor, dist.userId)) {
        unauthorizedIds.push(id);
        continue;
      }
      deletableIds.push(id);
    }

    if (deletableIds.length === 0) {
      return {
        success: false,
        error: "No distributions eligible for deletion",
        requestedCount: normalizedIds.length,
        affectedCount: 0,
        affectedIds: [],
        notFoundIds,
        unauthorizedIds,
        skippedIds: alreadyDeletedIds,
      };
    }

    await Distribution.destroy({
      where: {
        id: {
          [Op.in]: deletableIds,
        },
      },
      transaction,
    });

    const stillActive = await Distribution.findAll({
      paranoid: false,
      where: {
        id: {
          [Op.in]: deletableIds,
        },
        deletedAt: null,
      },
      attributes: ["id"],
      transaction,
    });

    const stillActiveIds = new Set<number>(stillActive.map((row: any) => row.id));
    const deletedIds = deletableIds.filter((id) => !stillActiveIds.has(id));

    const deletedBeneficiaryIds = Array.from(
      new Set<number>(
        deletedIds
          .map((id) => byId.get(id)?.beneficiaryId)
          .filter((id: any) => Number.isInteger(id) && id > 0)
      )
    );

    if (deletedBeneficiaryIds.length > 0) {
      const remainingCounts = await Distribution.findAll({
        paranoid: false,
        where: {
          beneficiaryId: {
            [Op.in]: deletedBeneficiaryIds,
          },
          deletedAt: null,
        },
        attributes: ["beneficiaryId", [sequelize.fn("COUNT", sequelize.col("id")), "count"]],
        group: ["beneficiaryId"],
        transaction,
      });

      const stillHasActive = new Set<number>(
        remainingCounts.map((row: any) => Number(row.beneficiaryId))
      );

      const toDeleteBeneficiaries = deletedBeneficiaryIds.filter(
        (beneficiaryId) => !stillHasActive.has(beneficiaryId)
      );

      if (toDeleteBeneficiaries.length > 0) {
        await Beneficiary.destroy({
          where: {
            id: {
              [Op.in]: toDeleteBeneficiaries,
            },
          },
          transaction,
        });
      }
    }

    return {
      success: true,
      requestedCount: normalizedIds.length,
      affectedCount: deletedIds.length,
      affectedIds: deletedIds,
      notFoundIds,
      unauthorizedIds,
      skippedIds: alreadyDeletedIds,
    };
  });
}

export async function restoreDistributions(params: {
  ids: any[];
  actor?: DistributionActor;
}): Promise<DeleteRestoreResult> {
  const normalizedIds = normalizeIds(params.ids);

  if (normalizedIds.length === 0) {
    return {
      success: false,
      error: "ids must contain valid numeric IDs",
      requestedCount: 0,
      affectedCount: 0,
      affectedIds: [],
      notFoundIds: [],
      unauthorizedIds: [],
      skippedIds: [],
    };
  }

  return sequelize.transaction(async (transaction) => {
    const distributions = await Distribution.findAll({
      paranoid: false,
      where: {
        id: {
          [Op.in]: normalizedIds,
        },
      },
      transaction,
    });

    const byId = new Map<number, any>();
    for (const dist of distributions) byId.set(dist.id, dist);

    const notFoundIds: number[] = [];
    const unauthorizedIds: number[] = [];
    const alreadyActiveIds: number[] = [];
    const restorableIds: number[] = [];

    for (const id of normalizedIds) {
      const dist = byId.get(id);
      if (!dist) {
        notFoundIds.push(id);
        continue;
      }
      if (!dist.deletedAt) {
        alreadyActiveIds.push(id);
        continue;
      }
      if (!isAuthorized(params.actor, dist.userId)) {
        unauthorizedIds.push(id);
        continue;
      }
      restorableIds.push(id);
    }

    if (restorableIds.length === 0) {
      return {
        success: false,
        error: "No distributions eligible for restore",
        requestedCount: normalizedIds.length,
        affectedCount: 0,
        affectedIds: [],
        notFoundIds,
        unauthorizedIds,
        skippedIds: alreadyActiveIds,
      };
    }

    await Distribution.restore({
      where: {
        id: {
          [Op.in]: restorableIds,
        },
      },
      transaction,
    });

    const stillDeleted = await Distribution.findAll({
      paranoid: false,
      where: {
        id: {
          [Op.in]: restorableIds,
        },
        deletedAt: {
          [Op.not]: null,
        },
      },
      attributes: ["id"],
      transaction,
    });

    const stillDeletedIds = new Set<number>(
      stillDeleted.map((row: any) => row.id)
    );
    const restoredIds = restorableIds.filter((id) => !stillDeletedIds.has(id));

    const restoredBeneficiaryIds = Array.from(
      new Set<number>(
        restoredIds
          .map((id) => byId.get(id)?.beneficiaryId)
          .filter((id: any) => Number.isInteger(id) && id > 0)
      )
    );

    if (restoredBeneficiaryIds.length > 0) {
      await Beneficiary.restore({
        where: {
          id: {
            [Op.in]: restoredBeneficiaryIds,
          },
        },
        transaction,
      });
    }

    return {
      success: true,
      requestedCount: normalizedIds.length,
      affectedCount: restoredIds.length,
      affectedIds: restoredIds,
      notFoundIds,
      unauthorizedIds,
      skippedIds: alreadyActiveIds,
    };
  });
}

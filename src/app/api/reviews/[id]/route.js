import { fail, handler, ok, readJson, requireUserForWrite } from "@/lib/api";
import { getReview, toObjectId } from "@/lib/data";
import { reviews } from "@/lib/mongodb";
import { firstIssue, objectIdString, updateReviewSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const GET = handler(async (_req, ctx) => {
  const { id } = await ctx.params;
  const review = await getReview(id);
  if (!review) return fail(404, "Review not found.");
  return ok(review);
});

/**
 * Edits a review. Author only.
 *
 * The old endpoints took an id and nothing else — any visitor could rewrite or
 * delete any review on the site. The ownership predicate is part of the update
 * filter itself, so there is no window between the check and the write.
 */
export const PATCH = handler(async (req, ctx) => {
  const { id } = await ctx.params;
  if (!objectIdString.safeParse(id).success) return fail(400, "Invalid review id.");

  const user = await requireUserForWrite(req);

  const parsed = updateReviewSchema.safeParse(await readJson(req));
  if (!parsed.success) return fail(400, firstIssue(parsed.error));

  const $set = { updatedAt: new Date() };
  if (parsed.data.userReview !== undefined) $set.userReview = parsed.data.userReview;
  if (parsed.data.rating !== undefined) $set.rating = parsed.data.rating;

  const col = await reviews();
  const result = await col.updateOne(
    { _id: toObjectId(id), email: user.email },
    { $set }
  );

  if (result.matchedCount === 0) {
    return fail(404, "Review not found, or it isn't yours to edit.");
  }
  return ok({ acknowledged: true, modifiedCount: result.modifiedCount });
});

export const DELETE = handler(async (req, ctx) => {
  const { id } = await ctx.params;
  if (!objectIdString.safeParse(id).success) return fail(400, "Invalid review id.");

  const user = await requireUserForWrite(req);

  const col = await reviews();
  const result = await col.deleteOne({ _id: toObjectId(id), email: user.email });

  if (result.deletedCount === 0) {
    return fail(404, "Review not found, or it isn't yours to delete.");
  }
  return ok({ acknowledged: true, deletedCount: result.deletedCount });
});

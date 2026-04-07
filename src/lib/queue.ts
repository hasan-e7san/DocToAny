import { Queue } from "bullmq";
import { getRedisConnection } from "./redis";

const QUEUE_NAME = "document-processing";

export type DocumentJobName =
  | "parse-file"
  | "extract-with-openai"
  | "generate-output"
  | "cleanup-expired-files";

export interface DocumentJobData {
  documentId: string;
  userId: string;
}

export interface QueueStatusSnapshot {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
}

type EnqueueResult =
  | {
      accepted: true;
      jobId: string;
      queueStatus: QueueStatusSnapshot;
    }
  | {
      accepted: false;
      reason: "queue_unavailable";
    };

export async function enqueueDocumentJob(
  name: DocumentJobName,
  data: DocumentJobData
): Promise<EnqueueResult> {
  const redis = getRedisConnection();
  if (!redis) {
    return { accepted: false, reason: "queue_unavailable" as const };
  }

  const queue = new Queue<DocumentJobData>(QUEUE_NAME, {
    connection: redis,
    defaultJobOptions: {
      removeOnComplete: 100,
      removeOnFail: 300,
    },
  });

  try {
    const job = await queue.add(name, data, {
      attempts: name === "extract-with-openai" ? 3 : 2,
      backoff: {
        type: "exponential",
        delay: 1500,
      },
    });

    const counts = await queue.getJobCounts("waiting", "active", "completed", "failed", "delayed");
    return {
      accepted: true,
      jobId: String(job.id),
      queueStatus: {
        waiting: counts.waiting ?? 0,
        active: counts.active ?? 0,
        completed: counts.completed ?? 0,
        failed: counts.failed ?? 0,
        delayed: counts.delayed ?? 0,
      },
    };
  } finally {
    await queue.close();
    await redis.quit();
  }
}

export { QUEUE_NAME };

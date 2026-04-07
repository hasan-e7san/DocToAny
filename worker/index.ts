import { QUEUE_NAME } from "@/lib/queue";
import { getRedisConnection } from "@/lib/redis";
import { Worker } from "bullmq";
import { cleanupExpiredFilesJob } from "./jobs/cleanup-expired-files";
import { extractWithOpenAiJob } from "./jobs/extract-with-openai";
import { generateOutputJob } from "./jobs/generate-output";
import { parseFileJob } from "./jobs/parse-file";

const redis = getRedisConnection();

if (!redis) {
  throw new Error("REDIS_URL must be configured to run worker.");
}

const worker = new Worker(
  QUEUE_NAME,
  async (job) => {
    if (job.name === "parse-file") {
      await parseFileJob(job.data);
      return;
    }

    if (job.name === "extract-with-openai") {
      await extractWithOpenAiJob(job.data);
      return;
    }

    if (job.name === "generate-output") {
      await generateOutputJob(job.data);
      return;
    }

    if (job.name === "cleanup-expired-files") {
      await cleanupExpiredFilesJob();
      return;
    }

    throw new Error(`Unknown job: ${job.name}`);
  },
  {
    connection: redis,
  }
);

console.log(`Worker started. Listening on queue: ${QUEUE_NAME}`);

worker.on("completed", (job) => {
  console.log(`Job completed: ${job.id} (${job.name})`);
});

worker.on("failed", async (job, error) => {
  console.error(`Job failed: ${job?.id} (${job?.name})`, error.message);
  if (!job?.data?.documentId) {
    return;
  }
});

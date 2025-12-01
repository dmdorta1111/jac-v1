/**
 * Query Performance Benchmark Script
 * Measures query times for normalized schema operations
 *
 * Usage: npx ts-node --esm scripts/benchmark-queries.ts
 */

import { MongoClient, ObjectId } from 'mongodb';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

interface BenchmarkResult {
  name: string;
  iterations: number;
  avgMs: number;
  minMs: number;
  maxMs: number;
  p95Ms: number;
}

async function runBenchmark(
  name: string,
  fn: () => Promise<void>,
  iterations: number = 10
): Promise<BenchmarkResult> {
  const times: number[] = [];

  // Warmup
  await fn();

  for (let i = 0; i < iterations; i++) {
    const start = Date.now();
    await fn();
    times.push(Date.now() - start);
  }

  times.sort((a, b) => a - b);

  return {
    name,
    iterations,
    avgMs: Math.round(times.reduce((a, b) => a + b, 0) / times.length),
    minMs: times[0],
    maxMs: times[times.length - 1],
    p95Ms: times[Math.floor(times.length * 0.95)],
  };
}

async function benchmark() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('Error: MONGODB_URI not set');
    process.exit(1);
  }

  const dbName = process.env.MONGODB_DB || 'jac-forms';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);

    console.log('=== Query Performance Benchmark ===\n');

    const results: BenchmarkResult[] = [];

    // Get a sample project for testing
    const sampleProject = await db.collection('projects').findOne({
      isDeleted: { $ne: true }
    });

    if (!sampleProject) {
      console.log('No projects found. Run migration first.');
      return;
    }

    console.log(`Using project: ${sampleProject.salesOrderNumber}\n`);

    // Benchmark 1: Project lookup by salesOrderNumber
    results.push(await runBenchmark(
      'Project by salesOrderNumber',
      async () => {
        await db.collection('projects').findOne({
          salesOrderNumber: sampleProject.salesOrderNumber
        });
      }
    ));

    // Benchmark 2: Items by projectId
    results.push(await runBenchmark(
      'Items by projectId',
      async () => {
        await db.collection('items')
          .find({ projectId: sampleProject._id, isDeleted: { $ne: true } })
          .toArray();
      }
    ));

    // Benchmark 3: Project + Items aggregation
    results.push(await runBenchmark(
      'Project+Items aggregation',
      async () => {
        await db.collection('projects').aggregate([
          { $match: { _id: sampleProject._id } },
          {
            $lookup: {
              from: 'items',
              localField: '_id',
              foreignField: 'projectId',
              as: 'items'
            }
          }
        ]).toArray();
      }
    ));

    // Benchmark 4: Form submissions by projectId
    results.push(await runBenchmark(
      'Submissions by projectId',
      async () => {
        await db.collection('form_submissions')
          .find({ projectId: sampleProject._id })
          .limit(100)
          .toArray();
      }
    ));

    // Benchmark 5: Legacy query (old schema)
    results.push(await runBenchmark(
      'Submissions by SO# (legacy)',
      async () => {
        await db.collection('form_submissions')
          .find({ 'metadata.salesOrderNumber': sampleProject.salesOrderNumber })
          .limit(100)
          .toArray();
      }
    ));

    // Benchmark 6: Full project with items and submissions
    results.push(await runBenchmark(
      'Full project (2 lookups)',
      async () => {
        await db.collection('projects').aggregate([
          { $match: { _id: sampleProject._id } },
          {
            $lookup: {
              from: 'items',
              localField: '_id',
              foreignField: 'projectId',
              as: 'items'
            }
          },
          {
            $lookup: {
              from: 'form_submissions',
              localField: '_id',
              foreignField: 'projectId',
              as: 'submissions'
            }
          }
        ]).toArray();
      }
    ));

    // Print results
    console.log('Results (10 iterations each):');
    console.log('─'.repeat(70));
    console.log(
      'Query'.padEnd(30) +
      'Avg'.padStart(8) +
      'Min'.padStart(8) +
      'Max'.padStart(8) +
      'P95'.padStart(8)
    );
    console.log('─'.repeat(70));

    for (const r of results) {
      const status = r.avgMs <= 10 ? '✓' : r.avgMs <= 50 ? '~' : '✗';
      console.log(
        `${status} ${r.name}`.padEnd(30) +
        `${r.avgMs}ms`.padStart(8) +
        `${r.minMs}ms`.padStart(8) +
        `${r.maxMs}ms`.padStart(8) +
        `${r.p95Ms}ms`.padStart(8)
      );
    }

    console.log('─'.repeat(70));
    console.log('\nLegend: ✓ <10ms  ~ <50ms  ✗ >50ms');

    // Performance summary
    const aggregationResult = results.find(r => r.name === 'Project+Items aggregation');
    if (aggregationResult) {
      if (aggregationResult.avgMs <= 10) {
        console.log('\n✓ Performance target met: Project+Items aggregation <10ms');
      } else {
        console.log(`\n⚠ Performance target missed: ${aggregationResult.avgMs}ms > 10ms`);
        console.log('  Consider: Check indexes, increase connection pool, or optimize query');
      }
    }

  } catch (error) {
    console.error('Benchmark failed:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

benchmark();

/**
 * Seeds the Topic taxonomy: 6 major categories (parents) + subtopics
 * (children). Safe to re-run — everything is upserted by slug.
 *
 * Usage:
 *   npx tsx prisma/seed-topics.ts
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const TAXONOMY = [
  {
    slug: "number-theory",
    name: "Number Theory",
    children: [
      { slug: "nt-divisibility", name: "Divisibility" },
      { slug: "nt-gcd-lcm", name: "GCD & LCM" },
      { slug: "nt-modular-arithmetic", name: "Modular Arithmetic" },
      { slug: "nt-diophantine", name: "Diophantine Equations" },
      { slug: "nt-primes-factorization", name: "Primes & Factorization" },
      { slug: "nt-base-representations", name: "Base Representations" },
    ],
  },
  {
    slug: "algebra",
    name: "Algebra",
    children: [
      { slug: "algebra-polynomials", name: "Polynomials" },
      { slug: "algebra-functional-equations", name: "Functional Equations" },
      { slug: "algebra-sequences-series", name: "Sequences & Series" },
      { slug: "algebra-manipulation", name: "Algebraic Manipulation" },
    ],
  },
  {
    slug: "geometry",
    name: "Geometry",
    children: [
      { slug: "geometry-triangles", name: "Triangle Geometry" },
      { slug: "geometry-circles", name: "Circles" },
      { slug: "geometry-coordinate", name: "Coordinate Geometry" },
      { slug: "geometry-transformations", name: "Transformations & Symmetry" },
      { slug: "geometry-quadrilaterals", name: "Quadrilaterals & Polygons" },
    ],
  },
  {
    slug: "inequalities",
    name: "Inequalities",
    children: [
      { slug: "inequalities-classical", name: "AM-GM & Classical Inequalities" },
      { slug: "inequalities-cs-pm", name: "Cauchy-Schwarz & Power Mean" },
      { slug: "inequalities-substitution", name: "Substitution Techniques" },
    ],
  },
  {
    slug: "combinatorics",
    name: "Combinatorics",
    children: [
      { slug: "combinatorics-counting", name: "Counting Principles" },
      { slug: "combinatorics-pigeonhole", name: "Pigeonhole Principle" },
      { slug: "combinatorics-geometry", name: "Combinatorial Geometry" },
      { slug: "combinatorics-graph-theory", name: "Graph Theory Basics" },
    ],
  },
  {
    slug: "probability-stats",
    name: "Probability & Statistics",
    children: [
      { slug: "probability-expected-value", name: "Expected Value" },
      { slug: "probability-basic", name: "Basic Probability" },
    ],
  },
];

async function main() {
  let order = 0;

  for (const category of TAXONOMY) {
    const parent = await prisma.topic.upsert({
      where: { slug: category.slug },
      update: { name: category.name, displayOrder: order },
      create: { slug: category.slug, name: category.name, displayOrder: order },
    });
    console.log(`Category: ${parent.name}`);
    order++;

    let childOrder = 0;
    for (const child of category.children) {
      await prisma.topic.upsert({
        where: { slug: child.slug },
        update: { name: child.name, parentId: parent.id, displayOrder: childOrder },
        create: {
          slug: child.slug,
          name: child.name,
          parentId: parent.id,
          displayOrder: childOrder,
        },
      });
      console.log(`  - ${child.name}`);
      childOrder++;
    }
  }

  console.log("Topic taxonomy synced.");
}

main()
  .catch((err) => {
    console.error("Failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
    process.exit(process.exitCode ?? 0);
  });
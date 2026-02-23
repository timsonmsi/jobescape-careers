import { prisma } from "@/lib/prisma";
import { CandidatesTable } from "@/components/candidates/CandidatesTable";

async function getCandidates() {
  const [candidates, total] = await Promise.all([
    prisma.candidate.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      include: {
        applications: {
          include: {
            job: {
              select: {
                id: true,
                title: true,
                slug: true,
              },
            },
          },
        },
      },
    }),
    prisma.candidate.count(),
  ]);

  return {
    candidates,
    pagination: {
      page: 1,
      limit: 20,
      total,
      pages: Math.ceil(total / 20),
    },
  };
}

export default async function CandidatesPage() {
  const data = await getCandidates();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Candidates</h1>
        <p className="text-gray-600 mt-1">
          Manage and review all candidates
        </p>
      </div>

      <CandidatesTable initialData={data} />
    </div>
  );
}

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@jobescape.com" },
    update: {},
    create: {
      email: "admin@jobescape.com",
      password: hashedPassword,
      name: "Admin User",
      role: "ADMIN",
    },
  });

  console.log("Created admin user:", admin.email);

  // Create sample jobs
  const jobs = [
    {
      title: "Senior Software Engineer",
      slug: "senior-software-engineer",
      description: "We're looking for a Senior Software Engineer to join our growing team. You'll be working on building scalable backend services and delightful user experiences.",
      requirements: [
        "5+ years of software development experience",
        "Strong proficiency in TypeScript and Node.js",
        "Experience with React and modern frontend frameworks",
        "Familiarity with cloud platforms (AWS, GCP, or Azure)",
        "Excellent communication and teamwork skills",
      ],
      responsibilities: [
        "Design and implement scalable backend services",
        "Build responsive and intuitive user interfaces",
        "Collaborate with product and design teams",
        "Mentor junior engineers",
        "Participate in code reviews and technical discussions",
      ],
      benefits: [
        "Competitive salary and equity",
        "Health, dental, and vision insurance",
        "Flexible work arrangements",
        "Professional development budget",
        "Unlimited PTO",
      ],
      location: "San Francisco, CA (Remote Friendly)",
      type: "FULL_TIME",
      department: "Engineering",
      salaryMin: 150000,
      salaryMax: 220000,
      status: "PUBLISHED",
      postedById: admin.id,
    },
    {
      title: "Product Designer",
      slug: "product-designer",
      description: "Join our design team to create beautiful and intuitive experiences for our users. You'll work closely with product managers and engineers to bring ideas to life.",
      requirements: [
        "3+ years of product design experience",
        "Strong portfolio demonstrating UX/UI skills",
        "Proficiency in Figma and design systems",
        "Experience with user research and testing",
        "Excellent visual design skills",
      ],
      responsibilities: [
        "Design user flows, wireframes, and high-fidelity mockups",
        "Conduct user research and usability testing",
        "Maintain and evolve our design system",
        "Collaborate with cross-functional teams",
        "Present design concepts to stakeholders",
      ],
      benefits: [
        "Competitive salary and equity",
        "Health, dental, and vision insurance",
        "Flexible work arrangements",
        "Design conference budget",
        "Latest design tools and equipment",
      ],
      location: "New York, NY (Hybrid)",
      type: "FULL_TIME",
      department: "Design",
      salaryMin: 120000,
      salaryMax: 180000,
      status: "PUBLISHED",
      postedById: admin.id,
    },
    {
      title: "Technical Recruiter",
      slug: "technical-recruiter",
      description: "We're seeking a Technical Recruiter to help us build world-class engineering and product teams. You'll own the full recruitment lifecycle.",
      requirements: [
        "3+ years of technical recruiting experience",
        "Experience recruiting for engineering roles",
        "Strong sourcing and networking skills",
        "Familiarity with ATS systems",
        "Excellent communication and interpersonal skills",
      ],
      responsibilities: [
        "Manage full-cycle recruiting for engineering roles",
        "Source and engage passive candidates",
        "Coordinate interview processes",
        "Build talent pipelines",
        "Improve recruiting processes and candidate experience",
      ],
      benefits: [
        "Competitive salary and commission",
        "Health, dental, and vision insurance",
        "Remote-first culture",
        "Professional development opportunities",
        "Team retreats and events",
      ],
      location: "Remote",
      type: "FULL_TIME",
      department: "People",
      salaryMin: 90000,
      salaryMax: 140000,
      status: "PUBLISHED",
      postedById: admin.id,
    },
  ];

  for (const job of jobs) {
    const created = await prisma.job.create({
      data: job as any,
    });
    console.log("Created job:", created.title);
  }

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

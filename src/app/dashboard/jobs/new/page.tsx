"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, X } from "lucide-react";

const jobTypes = [
  { value: "FULL_TIME", label: "Full-time" },
  { value: "PART_TIME", label: "Part-time" },
  { value: "CONTRACT", label: "Contract" },
  { value: "INTERNSHIP", label: "Internship" },
  { value: "FREELANCE", label: "Freelance" },
];

export default function NewJobPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    department: "",
    location: "",
    type: "FULL_TIME",
    salaryMin: "",
    salaryMax: "",
    currency: "USD",
    description: "",
  });
  const [requirements, setRequirements] = useState([""]);
  const [responsibilities, setResponsibilities] = useState([""]);
  const [benefits, setBenefits] = useState([""]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          salaryMin: formData.salaryMin ? parseInt(formData.salaryMin) : null,
          salaryMax: formData.salaryMax ? parseInt(formData.salaryMax) : null,
          requirements: requirements.filter((r) => r.trim()),
          responsibilities: responsibilities.filter((r) => r.trim()),
          benefits: benefits.filter((b) => b.trim()),
          status: "PUBLISHED",
        }),
      });

      if (response.ok) {
        router.push("/dashboard/jobs");
      } else {
        alert("Failed to create job");
      }
    } catch (error) {
      console.error("Error creating job:", error);
      alert("Failed to create job");
    } finally {
      setLoading(false);
    }
  };

  const addListItem = (
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setter((prev) => [...prev, ""]);
  };

  const updateListItem = (
    items: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    index: number,
    value: string
  ) => {
    const newItems = [...items];
    newItems[index] = value;
    setter(newItems);
  };

  const removeListItem = (
    items: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    index: number
  ) => {
    setter(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Post New Job</h1>
        <p className="text-gray-600 mt-1">Create a new job posting</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="e.g. Senior Software Engineer"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
                placeholder="e.g. Engineering"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                placeholder="e.g. San Francisco, CA (Remote)"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Job Type *</Label>
              <Select
                id="type"
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
              >
                {jobTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="salaryMin">Salary Min</Label>
              <Input
                id="salaryMin"
                type="number"
                value={formData.salaryMin}
                onChange={(e) =>
                  setFormData({ ...formData, salaryMin: e.target.value })
                }
                placeholder="50000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salaryMax">Salary Max</Label>
              <Input
                id="salaryMax"
                type="number"
                value={formData.salaryMax}
                onChange={(e) =>
                  setFormData({ ...formData, salaryMax: e.target.value })
                }
                placeholder="150000"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Job Description *</Label>
              <textarea
                id="description"
                className="w-full min-h-[200px] p-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe the role, team, and company..."
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Requirements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {requirements.map((req, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={req}
                  onChange={(e) =>
                    updateListItem(requirements, setRequirements, index, e.target.value)
                  }
                  placeholder={`Requirement ${index + 1}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeListItem(requirements, setRequirements, index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addListItem(setRequirements)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Requirement
            </Button>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Responsibilities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {responsibilities.map((resp, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={resp}
                  onChange={(e) =>
                    updateListItem(responsibilities, setResponsibilities, index, e.target.value)
                  }
                  placeholder={`Responsibility ${index + 1}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    removeListItem(responsibilities, setResponsibilities, index)
                  }
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addListItem(setResponsibilities)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Responsibility
            </Button>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Benefits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={benefit}
                  onChange={(e) =>
                    updateListItem(benefits, setBenefits, index, e.target.value)
                  }
                  placeholder={`Benefit ${index + 1}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeListItem(benefits, setBenefits, index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addListItem(setBenefits)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Benefit
            </Button>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Post Job"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

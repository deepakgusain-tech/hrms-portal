"use client";

import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

export default function EmployeeFilters({ filters, setFilters }: any) {
  return (
    <div className="w-80 h-screen overflow-y-auto border-r p-4 space-y-4">

      {/* Name */}
      <Input
        placeholder="Full Name"
        value={filters.name}
        onChange={(e) =>
          setFilters({ ...filters, name: e.target.value })
        }
      />

      {/* Email */}
      <Input
        placeholder="Email"
        value={filters.email}
        onChange={(e) =>
          setFilters({ ...filters, email: e.target.value })
        }
      />

      {/* Company */}
      <Select
        onValueChange={(val) =>
          setFilters({ ...filters, company: val })
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="Company" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Company A">Company A</SelectItem>
          <SelectItem value="Company B">Company B</SelectItem>
        </SelectContent>
      </Select>

      {/* Status Multi */}
      {["Active", "On Leave", "Resigned"].map((s) => (
        <div key={s} className="flex items-center gap-2">
          <Checkbox
            checked={filters.status.includes(s)}
            onCheckedChange={(checked) => {
              if (checked) {
                setFilters({
                  ...filters,
                  status: [...filters.status, s],
                });
              } else {
                setFilters({
                  ...filters,
                  status: filters.status.filter((x: string) => x !== s),
                });
              }
            }}
          />
          {s}
        </div>
      ))}

      {/* Salary */}
      <Slider
        defaultValue={[0, 200000]}
        max={200000}
        step={1000}
        onValueChange={(val) =>
          setFilters({ ...filters, salary: val })
        }
      />
    </div>
  );
}
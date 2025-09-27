// src/features/employees/EmployeeDetail.jsx
import {
  useParams,
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getEmployeeByIdx } from "../../services/apiEmployee";
import Spinner from "../../ui/Spinner";
import Avatar from "../../ui/Avatar";
import Button from "../../ui/Button";
import { Tab, TabGroup, TabList, TabPanels, TabPanel } from "@headlessui/react";
import Career from "./Career";
import Family from "./Family";
import StatusBadge from "../../ui/StatusBadge";
import InfoItem from "../../ui/InfoItem";

export default function EmployeeDetail() {
  const params = useParams(); // parent route includes :role, child has :idx
  const { idx, role } = params;

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const page = searchParams.get("page") || 1;

  const { data, isPending, error } = useQuery({
    queryKey: ["employee", idx],
    queryFn: () => getEmployeeByIdx(idx),
  });

  if (isPending) return <Spinner />;
  if (error) return <p className="text-red-500">Failed to load employee</p>;
  if (!data) return null;

  const emp = data;
  const photoSrc = emp.photo || emp.photo_url || "";
  const fullName = `${emp.first_name ?? ""} ${emp.family_name ?? ""}`.trim();
  const email = emp.user?.email;
  const gender = emp.user?.gender;
  const roleName = emp.user?.role;

  return (
    <div className="space-y-8">
      {/* Top actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={() => navigate(`/${role}/employees?page=${page}`)}
          >
            ← Back
          </Button>
          {role && (
            <Link
              to={`/${role}/employees`}
              className="text-sm text-blue-600 hover:underline"
            >
              All employees
            </Link>
          )}
        </div>
      </div>

      {/* Header card */}
      <div className="rounded-2xl border bg-white p-8 shadow-md transition hover:shadow-lg">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-10">
          <Avatar src={photoSrc} alt={fullName} size="xl" />

          <div className="min-w-0">
            <h1 className="truncate text-3xl font-semibold text-gray-900">
              {fullName || "—"}
            </h1>

            <div className="mt-1 flex flex-wrap items-center gap-3 text-base text-gray-600">
              {email && <span>{email}</span>}
              <StatusBadge isActive={emp.is_active} />
            </div>

            {/* Quick facts */}
            <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-4">
              <InfoItem label="Employee Code" value={emp.code} />
              <InfoItem label="Role" value={roleName} />
              <InfoItem label="Gender" value={gender} />
              <InfoItem
                label="Career Records"
                value={emp.career?.length ?? 0}
              />
              <InfoItem
                label="Family Records"
                value={emp.family?.length ?? 0}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <TabGroup>
        <TabList className="flex gap-2 rounded-xl bg-gray-100 p-2">
          {["Overview", "Career", "Family"].map((tab) => (
            <Tab
              key={tab}
              className={({ selected }) =>
                `w-full rounded-lg px-5 py-2 text-sm font-medium transition ${
                  selected
                    ? "bg-white text-blue-700 shadow"
                    : "text-gray-600 hover:text-gray-800"
                }`
              }
            >
              {tab}
            </Tab>
          ))}
        </TabList>

        <TabPanels className="mt-6">
          {/* Overview */}
          <TabPanel className="transition-opacity duration-200">
            <div className="rounded-2xl border bg-white p-8 shadow-md">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <InfoItem label="Employee Code" value={emp.code} />
                <InfoItem label="Email" value={email} />
                <InfoItem label="Gender" value={gender} />
                <InfoItem label="Role" value={roleName} />
                {/* Add more fields when backend supports them */}
                {/* <InfoItem label="Phone" value={emp.phone} /> */}
                {/* <InfoItem label="Address" value={emp.address} /> */}
              </div>
            </div>
          </TabPanel>

          {/* Career */}
          <TabPanel>
            <Career employeeIdx={idx} />
          </TabPanel>

          {/* Family */}
          <TabPanel>
            <Family employeeIdx={idx} />
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  );
}

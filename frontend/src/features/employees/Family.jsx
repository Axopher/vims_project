// src/features/employees/Family.jsx
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listFamily,
  createFamily,
  updateFamily,
  deleteFamily,
} from "../../services/apiEmployee";
import Spinner from "../../ui/Spinner";
import Button from "../../ui/Button";
import FamilyForm from "./FamilyForm";
import toast from "react-hot-toast";
import ConfirmDialog from "../../ui/ConfirmDialog";
import Table from "../../ui/Table";

export default function Family({ employeeIdx }) {
  const queryClient = useQueryClient();
  const {
    data = [],
    isFetching,
    error,
  } = useQuery({
    queryKey: ["family", employeeIdx],
    queryFn: () => listFamily(employeeIdx),
  });

  const [deleteId, setDeleteId] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const [isModalFormOpen, setIsModalFormOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const { mutateAsync: addFamily, isPending: isAdding } = useMutation({
    mutationFn: (data) => createFamily({ employeeIdx, data }),
    onSuccess: () => {
      queryClient.invalidateQueries(["family", employeeIdx]);
      setIsModalFormOpen(false);
      setFormErrors({});
    },
    onError: (err) => {
      if (err.response?.data && typeof err.response.data === "object") {
        setFormErrors(err.response.data);
      } else {
        toast.error(err.message || "Failed to create family record");
      }
    },
  });

  const { mutateAsync: editFamily, isPending: isEditing } = useMutation({
    mutationFn: ({ idx, data }) => updateFamily({ employeeIdx, idx, data }),
    onSuccess: () => {
      queryClient.invalidateQueries(["family", employeeIdx]);
      setIsModalFormOpen(false);
      setEditData(null);
      setFormErrors({});
    },
    onError: (err) => {
      if (err.response?.data && typeof err.response.data === "object") {
        setFormErrors(err.response.data);
      } else {
        toast.error(err.message || "Failed to update family record");
      }
    },
  });

  const { mutateAsync: removeFamily, isPending: isDeleting } = useMutation({
    mutationFn: (idx) => deleteFamily({ employeeIdx, idx }),
    onSuccess: () => {
      toast.success("Family member deleted");
      queryClient.invalidateQueries(["family", employeeIdx]);
      setIsConfirmOpen(false);
    },
    onError: (err) => toast.error(err.message || "Failed to delete"),
  });

  const confirmDelete = (id) => {
    setDeleteId(id);
    setIsConfirmOpen(true);
  };

  const handleConfirm = () => {
    if (deleteId) removeFamily(deleteId);
  };

  const handleFormClose = () => {
    setIsModalFormOpen(false);
    setEditData(null);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editData) {
        await editFamily({ idx: editData.idx, data: formData });
      } else {
        await addFamily(formData);
      }
    } catch (err) {
      console.error("Family form submit failed:", err);
    }
  };

  if (isFetching) return <Spinner />;
  if (error) return <p className="text-red-500">Failed to load family data</p>;

  const familyRecords = data?.data || [];

  const columns = [
    { header: "Name", accessor: "name" },
    { header: "Relation", accessor: "relation" },
    {
      header: "",
      render: (row) => (
        <div className="flex justify-end gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setEditData(row);
              setIsModalFormOpen(true);
            }}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="danger"
            disabled={isDeleting}
            onClick={() => confirmDelete(row.idx)}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="mb-4 flex justify-between">
        <h3 className="text-lg font-semibold">Family Members</h3>
        <Button onClick={() => setIsModalFormOpen(true)}>Add</Button>
      </div>

      {familyRecords.length === 0 ? (
        <p className="text-gray-500">No family records.</p>
      ) : (
        <Table columns={columns} data={familyRecords} isLoading={isFetching} />
      )}

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirm}
        isLoading={isDeleting}
        title="Delete Family Member"
        message="Are you sure you want to delete this family record?"
      />

      <FamilyForm
        key={editData?.idx || "create"}
        isOpen={isModalFormOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        defaultValues={editData || undefined}
        isEdit={!!editData}
        isSubmitting={isAdding || isEditing}
        serverErrors={formErrors}
      />
    </div>
  );
}

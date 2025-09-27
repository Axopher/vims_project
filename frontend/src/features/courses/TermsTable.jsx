// src/features/courses/TermsTable.jsx
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import Table from "../../ui/Table";
import Pagination from "../../ui/Pagination";
import ConfirmDialog from "../../ui/ConfirmDialog";
import TermForm from "./TermForm";
import {
  useTerms,
  useCreateTerm,
  useUpdateTerm,
  useDeleteTerm,
} from "./useTerms";
import SearchBox from "../../ui/SearchBox";
import { Edit, Trash2 } from "lucide-react";
import IconButton from "../../ui/IconButton";
import { formatDateISO } from "../../utils/helpers";

export default function TermsTable({ isModalFormOpen, setIsModalFormOpen }) {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [editData, setEditData] = useState(null);
  const [deleteIdx, setDeleteIdx] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const pageSize = 10;
  const { data, isFetching, error } = useTerms({
    page,
    page_size: pageSize,
    search: query,
  });
  const terms = data?.data || [];
  const total_pages = data?.total_pages || 1;

  const createTerm = useCreateTerm();
  const updateTerm = useUpdateTerm();
  const deleteTerm = useDeleteTerm();

  useEffect(() => {
    if (error) toast.error(error.message || "Failed to load terms");
  }, [error]);

  const openEdit = (row) => {
    setEditData(row);
    setIsModalFormOpen(true);
  };

  const handleFormClose = () => {
    setIsModalFormOpen(false);
    setEditData(null);
  };

  const handleFormSubmit = async (payload) => {
    try {
      if (editData?.idx) {
        await updateTerm.mutateAsync({ idx: editData.idx, data: payload });
        toast.success("Term updated");
      } else {
        await createTerm.mutateAsync(payload);
        toast.success("Term created");
      }
      setIsModalFormOpen(false);
    } catch (err) {
      toast.error(err?.message || "Failed to save term");
    }
  };

  const confirmDelete = (idx) => {
    setDeleteIdx(idx);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteTerm.mutateAsync(deleteIdx);
      toast.success("Term deleted");
      setIsConfirmOpen(false);
    } catch (err) {
      toast.error(err?.message || "Failed to delete term");
    }
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-tr-xl border-b border-gray-100 bg-gray-50 px-6 py-4">
        <div className="flex w-full items-center gap-3 sm:w-auto">
          <SearchBox
            value={query}
            onChange={(v) => {
              setQuery(v);
              setPage(1);
            }}
            placeholder="Search terms..."
          />
        </div>
      </div>

      <div className="overflow-x-auto p-6">
        <Table
          columns={[
            { header: "Name", accessor: "name" },
            {
              header: "Start Date",
              render: (row) => formatDateISO(row.start_date),
            },
            {
              header: "End Date",
              render: (row) => formatDateISO(row.end_date),
            },
            {
              header: <span className="sr-only">Actions</span>,
              accessor: "actions",
              render: (row) => (
                <div className="flex justify-end gap-2">
                  <IconButton
                    variant="ghost"
                    onClick={() => openEdit(row)}
                    title="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </IconButton>
                  <IconButton
                    variant="danger"
                    onClick={() => confirmDelete(row.idx)}
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </IconButton>
                </div>
              ),
            },
          ]}
          data={terms}
          isLoading={isFetching}
        />

        <div className="mt-4 flex justify-end">
          <Pagination
            page={page}
            totalPages={total_pages}
            onPageChange={setPage}
          />
        </div>
      </div>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={deleteTerm.isPending}
        title="Delete term"
        message="Are you sure? you want to delete this term? This action cannot be undone."
      />

      <TermForm
        key={editData?.idx || "create"}
        isOpen={isModalFormOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        defaultValues={editData || undefined}
      />
    </div>
  );
}

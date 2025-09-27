// vims_project/frontend/src/ui/Table.jsx
import { getNestedValue } from "../utils/helpers";
import Spinner from "./Spinner";

export default function Table({ columns, data, isLoading }) {
  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          {columns.map((col) => (
            <th
              key={col.header}
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
            >
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 bg-white">
        {isLoading ? (
          <tr>
            <td colSpan={columns.length} className="px-6 py-12 text-center">
              <Spinner />
            </td>
          </tr>
        ) : data.length === 0 ? (
          <tr>
            <td colSpan={columns.length} className="px-6 py-12 text-center">
              No records found
            </td>
          </tr>
        ) : (
          data.map((row) => (
            <tr key={row.idx} className="hover:bg-gray-50">
              {columns.map((col) => (
                <td
                  key={`${row.idx}-${col.header}`}
                  className="whitespace-nowrap px-6 py-4 align-middle text-sm text-gray-700"
                >
                  {col.render
                    ? col.render(row)
                    : getNestedValue(row, col.accessor)}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}

import React, { useMemo } from "react";
import { Eye, Edit, Trash2, Download, Send, MessageCircle, ChevronUp, ChevronDown } from "lucide-react";
export type TableColumn<T> = {
    label: string;
    value: (row: T) => React.ReactNode;
    sortKey?: string;
    isSort?: boolean;
};

export type ActionButton<T> = {
    label: string;
    iconType: string;
    onClick: (row: T) => void;
    isVisible?: (row: T) => boolean;
    isDisabled?: (row: T) => boolean;
    ispayment?: (row: T) => boolean;
};

export type SortState = {
    key: string;
    order: "asc" | "desc";
};

export type ReusableTableProps<T> = {
    columns: TableColumn<T>[];
    data: T[];
    actions?: ActionButton<T>[];
    page: number;
    totalPages: number;
    totalCount: number;
    onPageChange: (page: number) => void;
    sortState: SortState[];
    onSortChange: (newSortState: SortState[]) => void;
    pageSize: number;
    onPageSizeChange: (size: number) => void;
    loading?: boolean;
};

function ComanTable<T extends object>({
    columns,
    data,
    actions,
    page,
    totalPages,
    totalCount,
    onPageChange,
    sortState,
    onSortChange,
    pageSize,
    onPageSizeChange,
    loading = false,
}: ReusableTableProps<T>) {


    // Fallback function for missing translations
    const getTranslation = (key: string, fallback: string) => {
        try {
            const translation = key;
            return translation !== key ? translation : fallback;
        } catch {
            return fallback;
        }
    };



    const handleSort = (col: TableColumn<T>) => {
        if (!col.isSort || !col.sortKey) return;

        const existing = sortState.find((s) => s.key === col.sortKey);
        const newOrder: "asc" | "desc" = existing
            ? existing.order === "asc"
                ? "desc"
                : "asc"
            : "asc";

        onSortChange([{ key: col.sortKey, order: newOrder }]);
    };

    // Helper function to get nested object values
    const getNestedValue = (obj: any, path: string) => {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    };

    const getSortOrder = (key?: string) =>
        sortState.find((s) => s.key === key)?.order;

    // Sort data based on current sort state
    const sortedData = useMemo(() => {
        if (sortState.length === 0) return data;

        return [...data].sort((a, b) => {
            for (const sort of sortState) {
                const aValue = getNestedValue(a, sort.key);
                const bValue = getNestedValue(b, sort.key);

                let comparison = 0;

                if (aValue === null || aValue === undefined) {
                    comparison = bValue === null || bValue === undefined ? 0 : 1;
                } else if (bValue === null || bValue === undefined) {
                    comparison = -1;
                } else if (typeof aValue === 'string' && typeof bValue === 'string') {
                    comparison = aValue.localeCompare(bValue);
                } else if (typeof aValue === 'number' && typeof bValue === 'number') {
                    comparison = aValue - bValue;
                } else {
                    comparison = String(aValue).localeCompare(String(bValue));
                }

                if (comparison !== 0) {
                    return sort.order === 'asc' ? comparison : -comparison;
                }
            }
            return 0;
        });
    }, [data, sortState]);

    return (
        <>
            {/* Table */}
            <div className="overflow-hidden rounded-lg border border-[#E6E6EF] shadow-sm">
                <div className="relative w-full overflow-x-auto">
                    <table className="w-full caption-bottom text-sm">
                        <thead className="[&_tr]:border-b bg-[#fff]">
                            <tr className="hover:bg-muted/50 data-[state=selected]:bg-muted transition-colors">
                                {columns.map((col) => (
                                    <th
                                        key={col.label}
                                        className={`px-3 text-left align-middle font-medium whitespace-nowrap border-r border-[#E6E6EF] last:border-r-0 [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] text-[#575756] font-helveticaBold h-14 ${col.isSort ? 'cursor-pointer hover:bg-gray-50 transition-colors' : ''}`}
                                        onClick={() => col.isSort && handleSort(col)}
                                    >
                                        <div className="flex items-center gap-2 relative group justify-between">
                                            {col.label}
                                            {col.isSort && col.sortKey && (
                                                <div className="flex flex-col text-xs leading-none">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onSortChange([{ key: col.sortKey!, order: "asc" }]);
                                                        }}
                                                        className={`hover:text-primary transition-colors w-3 h-3 ${getSortOrder(col.sortKey) === "asc"
                                                            ? "text-primary font-bold"
                                                            : "text-gray-400"
                                                            }`}
                                                    >
                                                        <ChevronUp size={16} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onSortChange([{ key: col.sortKey!, order: "desc" }]);
                                                        }}
                                                        className={`hover:text-primary transition-colors w-3 h-3 ${getSortOrder(col.sortKey) === "desc"
                                                            ? "text-primary font-bold"
                                                            : "text-gray-400"
                                                            }`}
                                                    >
                                                        <ChevronDown size={16} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </th>
                                ))}
                                {actions && actions.length > 0 && (
                                    <th className="px-4 py-2 text-left whitespace-nowrap">
                                        {getTranslation("table.Actions", "Actions")}
                                    </th>
                                )}
                            </tr>
                        </thead>

                        <tbody className="[&_tr:last-child]:border-0">
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan={columns.length + (actions && actions.length > 0 ? 1 : 0)}
                                        className="px-4 py-12 text-center text-gray-500 font-medium"
                                    >
                                        Loading data...
                                    </td>
                                </tr>
                            ) : sortedData.length > 0 ? (
                                sortedData.map((row, idx) => (
                                    <tr key={idx} className={`data-[state=selected]:bg-muted transition-colors h-12 hover:!bg-[#00cbd9] group/table hover:cursor-pointer text-[#575756] font-helveticaMedium ${idx % 2 === 0 ? `even bg-[#f5f5f5]` : `odd bg-white`}`}>
                                        {columns.map((col, cidx) => (
                                            <td key={cidx} className="px-3 py-2 align-middle whitespace-nowrap border-r border-[#E6E6EF] last:border-r-0 [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]  ">
                                                {col.value(row)}
                                            </td>
                                        ))}

                                        {actions && actions.length > 0 && (
                                            <td className={`px-4 py-2 ${idx % 2 === 0 ? `!bg-[#f5f5f5]` : `!bg-white`}`}>
                                                <div className="action-buttons-container">
                                                    {actions.map((action) => {
                                                        if (action.isVisible && !action.isVisible(row)) {
                                                            return null;
                                                        }

                                                        if (action.iconType === "approve") {
                                                            return (
                                                                <button
                                                                    data-tooltip-id="approve-tooltip"
                                                                    key={action.label}
                                                                    onClick={() => action.onClick(row)}
                                                                    className="w-[30px] h-[30px] rounded-2xl  flex items-center justify-center bg-green-500"
                                                                >
                                                                    {/* <Check className="text-white" size={18} /> */}
                                                                </button>
                                                            );
                                                        }

                                                        if (action.iconType === "publish") {
                                                            return (
                                                                <button
                                                                    data-tooltip-id="publish-tooltip"
                                                                    key={action.label}
                                                                    onClick={() => action.onClick(row)}
                                                                    className="w-8 h-8 rounded-md flex items-center justify-center bg-blue-500 hover:bg-blue-600 transition-colors"
                                                                    title="Publish"
                                                                >
                                                                    <Send size={16} className="text-white" />
                                                                </button>
                                                            );
                                                        }
                                                        if (action.iconType === "upgrade") {
                                                            return (
                                                                <button
                                                                    data-tooltip-id="upgrade-tooltip"
                                                                    key={action.label}
                                                                    onClick={() => action.onClick(row)}
                                                                    className="w-[30px] h-[30px] rounded-2xl flex items-center justify-center "
                                                                >
                                                                    {/* <ArrowUp className="" size={18} /> */}
                                                                </button>
                                                            );
                                                        }

                                                        if (action.iconType === "reject") {
                                                            return (
                                                                <button
                                                                    data-tooltip-id="reject-tooltip"
                                                                    key={action.label}
                                                                    onClick={() => action.onClick(row)}
                                                                    className="w-[30px] h-[30px] flex items-center justify-center rounded-2xl bg-red-500"
                                                                >
                                                                    {/* <X className="text-white" size={18} /> */}
                                                                </button>
                                                            );
                                                        }

                                                        if (action.iconType === "view") {
                                                            return (
                                                                <button
                                                                    key={action.label}
                                                                    data-tooltip-id="view-tooltip"
                                                                    onClick={() => action.onClick(row)}
                                                                    className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors"
                                                                    title="View"
                                                                >
                                                                    <Eye size={16} className="text-gray-600" />
                                                                </button>
                                                            );
                                                        }

                                                        if (action.iconType === "advice") {
                                                            return (
                                                                <button
                                                                    key={action.label}
                                                                    data-tooltip-id="advice-tooltip"
                                                                    onClick={() => action.onClick(row)}
                                                                    className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-blue-100 transition-colors"
                                                                    title="Advice"
                                                                >
                                                                    <MessageCircle size={16} className="text-blue-600" />
                                                                </button>
                                                            );
                                                        }

                                                        if (action.iconType === "download") {
                                                            const disabled = typeof action.isDisabled === "function"
                                                                ? action.isDisabled(row)
                                                                : action.isDisabled;

                                                            return (
                                                                <button
                                                                    key={action.label}
                                                                    data-tooltip-id="download-tooltip"
                                                                    onClick={() => !disabled && action.onClick(row)}
                                                                    disabled={disabled}
                                                                    className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors ${disabled
                                                                        ? "opacity-50 cursor-not-allowed"
                                                                        : "hover:bg-green-100"
                                                                        }`}
                                                                    title="Download"
                                                                >
                                                                    <Download size={16} className={disabled ? "text-gray-400" : "text-green-600"} />
                                                                </button>
                                                            );
                                                        }
                                                        if (action.iconType === "export") {
                                                            const disabled = typeof action.isDisabled === "function"
                                                                ? action.isDisabled(row)
                                                                : action.isDisabled;

                                                            return (
                                                                <button
                                                                    key={action.label}
                                                                    data-tooltip-id="export-tooltip"
                                                                    onClick={() => !disabled && action.onClick(row)}
                                                                    disabled={disabled}
                                                                    className={`flex items-center justify-center w-8 h-8 
                                  ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                                                                >
                                                                    {/* <img
                                                                    src={ExportIcon}
                                                                    alt="export"
                                                                    className="w-5 h-5"
                                                                /> */}
                                                                </button>
                                                            );
                                                        }

                                                        if (action.iconType === "EditIcon" || action.iconType === "edit") {
                                                            return (
                                                                <button
                                                                    key={action.label}
                                                                    data-tooltip-id="edit-tooltip"
                                                                    onClick={() => action.onClick(row)}
                                                                    className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-blue-100 transition-colors"
                                                                    title="Edit"
                                                                >
                                                                    <Edit size={16} className="text-blue-600" />
                                                                </button>
                                                            );
                                                        }

                                                        if (action.iconType === "exportTwo") {
                                                            return (
                                                                <button
                                                                    key={action.label}
                                                                    data-tooltip-id="export-two-tooltip"
                                                                    onClick={() => action.onClick(row)}
                                                                    className="flex items-center justify-center w-8 h-8"
                                                                >
                                                                    {/* <img
                                                                    src={ExportTwoIcon}
                                                                    alt="export-two"
                                                                    className="w-5 h-5"
                                                                /> */}
                                                                </button>
                                                            );
                                                        }

                                                        if (action.iconType === "dataInOut") {
                                                            return (
                                                                <button
                                                                    key={action.label}
                                                                    data-tooltip-id="data-in-out-tooltip"
                                                                    onClick={() => action.onClick(row)}
                                                                    className="flex items-center justify-center w-8 h-8"
                                                                >
                                                                    {/* <img
                                                                    src={DataInOutIcon}
                                                                    alt="data-in-out"
                                                                    className="w-5 h-5"
                                                                /> */}
                                                                </button>
                                                            );
                                                        }

                                                        if (action.iconType === "fi") {
                                                            const disabled = action.isDisabled ? action.isDisabled(row) : false;
                                                            const isPayment = action.ispayment ? action.ispayment(row) : false;

                                                            return (
                                                                <button
                                                                    key={action.label}
                                                                    data-tooltip-id="fi-tooltip"
                                                                    onClick={() => !disabled && action.onClick(row)}
                                                                    disabled={disabled}
                                                                    className={`flex items-center justify-center w-8 h-8 
                                  ${isPayment ? "bg-green-500 rounded-full " : ""} 
                                  ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                                                                >
                                                                    {/* <img
                                                                    src={FiIcon}
                                                                    alt="fi-icon"
                                                                    className="w-5 h-5"
                                                                /> */}
                                                                </button>
                                                            );
                                                        }

                                                        if (action.iconType === "reschedule") {
                                                            return (
                                                                <button
                                                                    key={action.label}
                                                                    data-tooltip-id="reschedule-tooltip"
                                                                    onClick={() => action.onClick(row)}
                                                                    className="flex items-center justify-center w-8 h-8"
                                                                >
                                                                    {/* <CalendarClock size={24} /> */}
                                                                </button>
                                                            );
                                                        }


                                                        if (action.iconType === "delete") {
                                                            return (
                                                                <button
                                                                    key={action.label}
                                                                    data-tooltip-id="delete-tooltip"
                                                                    onClick={() => action.onClick(row)}
                                                                    className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-red-100 transition-colors"
                                                                    title="Delete"
                                                                >
                                                                    <Trash2 size={16} className="text-red-600" />
                                                                </button>
                                                            );
                                                        }

                                                        return null;
                                                    })}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr className="min-h-[55px] h-[55px]">
                                    <td
                                        colSpan={
                                            columns.length + (actions && actions.length > 0 ? 1 : 0)
                                        }
                                        className="px-4 py-6 text-center hover:!text-gray-700 text-gray-500 font-medium"
                                    >
                                        No data found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="w-full py-4 flex md:flex-row flex-col-reverse md:items-center justify-between sm:gap-2 gap-1.5">
                <div className="flex items-center xl:flex-[1_0_0%] !mr-auto xl:w-[calc(40%-200px)] md:w-[calc(100%-150px)] w-full">
                    <p className="w-fit text-[#808285] text-base font-medium ">
                        {getTranslation("pagination.showingData", `Showing data ${(page - 1) * pageSize + 1} to ${Math.min(page * pageSize, totalCount)} of ${totalCount} entries`)}
                    </p>
                </div>

                <div className="pgntopn-count flex items-center justify-center gap-2 flex-wrap w-auto flex-[0_0_auto]">
                    <button
                        className={`px-3 py-1 rounded-md text-base bg-[#e4e4e4] ${page === 1
                            ? "text-gray-400  cursor-not-allowed"
                            : "text-gray-500 hover:bg-[#e4e4e4] cursor-pointer"
                            }`}
                        disabled={page === 1}
                        onClick={() => page > 1 && onPageChange(page - 1)}
                    >
                        {getTranslation("registrationFlow.Common.Previous", "Previous")}
                    </button>

                    {[...Array(totalPages)].map((_, i) => (
                        <button
                            key={i}
                            className={`px-3 py-1 rounded-md text-base ${page === i + 1
                                ? "text-white bg-[#808285] font-medium"
                                : "text-gray-500 bg-[#e4e4e4] hover:bg-[#e4e4e4]"
                                }`}
                            onClick={() => onPageChange(i + 1)}
                        >
                            {i + 1}
                        </button>
                    ))}

                    <button
                        className={`px-3 py-1 rounded-md text-base bg-[#e4e4e4] ${page === totalPages
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-gray-500 hover:bg-[#e4e4e4] cursor-pointer"
                            }`}
                        disabled={page === totalPages}
                        onClick={() => page < totalPages && onPageChange(page + 1)}
                    >
                        {getTranslation("registrationFlow.Common.next", "Next")}
                    </button>
                </div>

                <div className="flex justify-end xl:flex-[1_0_0%] xl:w-[calc(40%-200px)] md:w-fit w-full">
                    <div className="enter-jump-page flex items-center justify-center space-x-2 flex-wrap">
                        <span className="text-gray-500 text-base font-medium">
                            {getTranslation("pagination.Show", "Show")}
                        </span>

                        <select
                            value={pageSize}
                            onChange={(e) => onPageSizeChange(Number(e.target.value))}
                            className="w-[90px] appearance-none px-3 py-2 rounded-md border border-[#808285] 
                bg-[#F5F5F5]  hover:bg-white text-gray-500 font-medium 
               text-[15px] focus:outline-none focus:ring-0"
                        >
                            {[5, 10, 20, 50].map((size) => (
                                <option
                                    key={size}
                                    value={size}
                                    className="bg-[#f2f2f2] text-gray-700"
                                >
                                    {size}
                                </option>
                            ))}
                        </select>

                        <span className="text-gray-500 text-base font-medium">
                            {getTranslation("pagination.of", "of")} {totalCount}
                        </span>
                    </div>
                </div>
            </div>
            {/* Pagination */}


        </>
    );
}

export default ComanTable;

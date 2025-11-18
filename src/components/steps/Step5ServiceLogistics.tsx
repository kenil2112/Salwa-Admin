import React from "react";
import { useTranslation } from "react-i18next";
import InputFiled from "../../antd/InputFiled";
import SelectFiled from "../../antd/SelectFiled";

interface Step5Data {
  itNetworkTechnicians: string;
  maintenanceDepartment: string;
  itStaffShop: string;
  priceListFile: File | null;
}

interface Step5Props {
  data: Step5Data;
  onChange: (data: Step5Data) => void;
}

const Step5ServiceLogistics: React.FC<Step5Props> = ({ data, onChange }) => {
  const { t } = useTranslation();
  const handleInputChange = (
    field: keyof Step5Data,
    value: string | File | null
  ) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  const renderDropdown = (field: keyof Step5Data, label: string) => (
    // <div>
    //   <label className="block text-sm font-medium text-gray-700 mb-1">
    //     {label}
    //   </label>
    //   <select
    //     value={data[field] as string}
    //     onChange={(e) => handleInputChange(field, e.target.value)}
    //     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    //   >
    //     <option value="">{t("steps.step1.selectOption")}</option>
    //     <option value="Pcs">{t("steps.step5.pcs")}</option>
    //     <option value="No">{t("steps.step5.no")}</option>
    //   </select>
    // </div>
    <SelectFiled
      label={label}
      value={data[field] as string}
      onChange={(e) => handleInputChange(field, e.target.value)}
    />
  );

  const handleFileUpload = (files: FileList | null) => {
    if (files && files[0]) {
      handleInputChange("priceListFile", files[0]);
    }
  };

  const handleDownloadExcel = () => {
    // Create a sample Excel file download
    const link = document.createElement("a");
    link.href =
      "data:text/csv;charset=utf-8,Service Name,Price,Description\nService 1,100,Description 1\nService 2,200,Description 2";
    link.download = "price_list_template.csv";
    link.click();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
      {renderDropdown(
        "itNetworkTechnicians",
        t("IT & Network Technicians")
      )}
      {renderDropdown(
        "maintenanceDepartment",
        t("Maintenance Department")
      )}
      {renderDropdown("itStaffShop", t("Is there Shops?"))}

      <div className="md:col-span-3 mt-2.5 flex items-center justify-between gap-2">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t("Price List")}
          </h3>
          <p className="text-gray-600">
            {t("Please download the provided Excel template, fill in the necessary information, and submit it below.")}
          </p>
        </div>
        <button
          onClick={handleDownloadExcel}
          className="px-6 py-2 rounded-md font-medium transition-colors bg-primary text-white hover:bg-[#060662]"
        >
          {t("Download Excel")}
        </button>
      </div>
      {/* <div className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <div className="text-center">
            {data.priceListFile ? (
              <div className="space-y-2">
                <svg
                  className="mx-auto h-12 w-12 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-sm font-medium text-gray-900">
                  {data.priceListFile.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(data.priceListFile.size / 1024).toFixed(1)} KB
                </p>
                <button
                  onClick={() => handleInputChange("priceListFile", null)}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  {t("steps.step5.remove")}
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p className="text-sm text-gray-600">
                  {t("steps.step5.uploadFilledExcel")}
                </p>

                <InputFiled
                  label={t("steps.step5.chooseFile")}
                  onChange={(e: { target: { files: FileList | null } }) =>
                    handleFileUpload(e.target.files)
                  }
                />
              </div>
            )}
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default Step5ServiceLogistics;

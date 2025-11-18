import React from "react";
import { useTranslation } from "react-i18next";
import InputFiled from "../../antd/InputFiled";

interface Step1Data {
  facilityName: string;
  facilityType: string;
  facilityArea: string;
  hasPrivateRooms: string;
  numberOfPrivateRooms: string;
  hasICURooms: string;
  numberOfICURooms: string;
  numberOfOperatingRooms: string;
  numberOfDaySurgeryRooms: string;
  hasPharmacy: string;
  hasPostOpRoom: string;
  hasER: string;
  numberOfDialysisMachines: string;
  facilityAddress: string;
  country: string;
  region: string;
  city: string;
  typeOfFacilityBranches: string;
  hasEmergencyDepartment: string;
  hasParking: string;
  numberOfParkingSlots: string;
  hasAmbulanceService: string;
  numberOfAmbulanceCars: string;
  waitingTimeForConsultation: string;
  evaluationDate: string;
  expirationDate: string;
  doctorInsuranceBoardNumber: string;
  evaluationDate2: string;
  expirationDate2: string;
  numberOfBeds: string;
  numberOfClinics: string;
  totalSpaceInSqM: string;
  privateWaitingArea: string;
  infectionControlOfficer: string;
  medicalWasteDepartment: string;
  sterilizationDepartment: string;
  pharmacyDepartment: string;
  medicalRecordsDepartment: string;
  labDepartment: string;
  bloodBank: string;
  ambulanceMedicalTransport: string;
  radiologyDepartment: string;
  physiotherapyDepartment: string;
  dentalDepartment: string;
  psychiatryDepartment: string;
  nutritionDieteticsDepartment: string;
  medicalEducation: string;
  publicRelationsDepartment: string;
  dermatologySkinCare: string;
  internalMedicine: string;
  cardiologyDepartment: string;
  pediatricsChildCare: string;
  medicalBoardDepartment: string;
  medicalStaff: string;
  educationalStaff: string;
  nurseTraining: string;
  employeeAccommodation: string;
  facilityPhotosOutside: File[];
  facilityPhotosInside: File[];
}

interface Step1Props {
  data: Step1Data;
  onChange: (data: Step1Data) => void;
}

const Step1Administrative: React.FC<Step1Props> = ({ data, onChange }) => {
  const { t } = useTranslation();

  const handleInputChange = (
    field: keyof Step1Data,
    value: string | File[]
  ) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  const renderYesNoDropdown = (field: keyof Step1Data, label: string) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <select
        value={data[field] as string}
        onChange={(e) => handleInputChange(field, e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">{t("selectOption")}</option>
        <option value="Yes">{t("yes")}</option>
        <option value="No">{t("no")}</option>
      </select>
    </div>
  );

  const renderTextInput = (field: keyof Step1Data, label: string) => (
    <div>
      <InputFiled
        label={label}
        onChange={(e: any) => handleInputChange(field, e.target.value)}
      />
    </div>
  );

  const renderDateInput = (field: keyof Step1Data, label: string) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          type="date"
          value={data[field] as string}
          onChange={(e) => handleInputChange(field, e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <svg
          className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    </div>
  );

  const renderImageUpload = (
    field: "facilityPhotosOutside" | "facilityPhotosInside",
    label: string
  ) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 6 }, (_, index) => {
          const file = data[field][index];
          return (
            <div
              key={index}
              className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors"
            >
              {file ? (
                <div className="space-y-2">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-20 object-cover rounded"
                  />
                  <p className="text-xs text-gray-600 truncate">{file.name}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <svg
                    className="mx-auto h-8 w-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-xs text-gray-500">{t("uploadImage")}</p>
                </div>
              )}

              <InputFiled
                label={file ? t("change") : t("upload")}
                onChange={(e: { target: { files: any } }) => {
                  const files = e.target.files;
                  if (files && files[0]) {
                    const newFiles = [...data[field]];
                    newFiles[index] = files[0];
                    handleInputChange(field, newFiles);
                  }
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Basic Facility Information */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t("basicFacilityInfo")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {renderTextInput("facilityName", t("facilityName"))}
          {renderTextInput("facilityType", t("facilityType"))}
          {renderTextInput("facilityArea", t("facilityArea"))}
          {renderYesNoDropdown("hasPrivateRooms", t("hasPrivateRooms"))}
          {renderTextInput("numberOfPrivateRooms", t("numberOfPrivateRooms"))}
          {renderYesNoDropdown("hasICURooms", t("hasICURooms"))}
          {renderTextInput("numberOfICURooms", t("numberOfICURooms"))}
          {renderTextInput(
            "numberOfOperatingRooms",
            t("numberOfOperatingRooms")
          )}
          {renderTextInput(
            "numberOfDaySurgeryRooms",
            t("numberOfDaySurgeryRooms")
          )}
          {renderYesNoDropdown("hasPharmacy", t("hasPharmacy"))}
          {renderYesNoDropdown("hasPostOpRoom", t("hasPostOpRoom"))}
          {renderYesNoDropdown("hasER", t("hasER"))}
        </div>
        <div className="mt-4">
          {renderTextInput(
            "numberOfDialysisMachines",
            t("numberOfDialysisMachines")
          )}
        </div>
      </div>

      {/* Address and Location */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t("addressLocation")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            {renderTextInput("facilityAddress", t("facilityAddress"))}
          </div>
          {renderTextInput("country", t("country"))}
          {renderTextInput("region", t("region"))}
          {renderTextInput("city", t("city"))}
        </div>
        <div className="mt-4 flex items-center space-x-4">
          <div className="flex-1">
            <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <svg
                  className="mx-auto h-8 w-8 text-gray-400 mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <p className="text-sm text-gray-500">{t("mapLocation")}</p>
              </div>
            </div>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            {t("setLocation")}
          </button>
        </div>
      </div>

      {/* Additional Facility Details */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t("additionalFacilityDetails")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {renderTextInput(
            "typeOfFacilityBranches",
            t("typeOfFacilityBranches")
          )}
          {renderYesNoDropdown(
            "hasEmergencyDepartment",
            t("hasEmergencyDepartment")
          )}
          {renderYesNoDropdown("hasParking", t("hasParking"))}
          {renderTextInput("numberOfParkingSlots", t("numberOfParkingSlots"))}
          {renderYesNoDropdown("hasAmbulanceService", t("hasAmbulanceService"))}
          {renderTextInput("numberOfAmbulanceCars", t("numberOfAmbulanceCars"))}
        </div>
      </div>

      {/* Time and Date Fields */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t("timeDateInfo")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {renderTextInput(
            "waitingTimeForConsultation",
            t("waitingTimeForConsultation")
          )}
          {renderDateInput("evaluationDate", t("evaluationDate"))}
          {renderDateInput("expirationDate", t("expirationDate"))}
          {renderTextInput(
            "doctorInsuranceBoardNumber",
            t("doctorInsuranceBoardNumber")
          )}
          {renderDateInput("evaluationDate2", t("evaluationDate"))}
          {renderDateInput("expirationDate2", t("expirationDate"))}
        </div>
      </div>

      {/* Capacity and Space */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t("capacitySpace")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {renderTextInput("numberOfBeds", t("numberOfBeds"))}
          {renderTextInput("numberOfClinics", t("numberOfClinics"))}
          {renderTextInput("totalSpaceInSqM", t("totalSpaceInSqM"))}
        </div>
      </div>

      {/* Department and Service Availability */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t("departmentServiceAvailability")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {renderYesNoDropdown("privateWaitingArea", t("privateWaitingArea"))}
          {renderYesNoDropdown(
            "infectionControlOfficer",
            t("infectionControlOfficer")
          )}
          {renderYesNoDropdown(
            "medicalWasteDepartment",
            t("medicalWasteDepartment")
          )}
          {renderYesNoDropdown(
            "sterilizationDepartment",
            t("sterilizationDepartment")
          )}
          {renderYesNoDropdown("pharmacyDepartment", t("pharmacyDepartment"))}
          {renderYesNoDropdown(
            "medicalRecordsDepartment",
            t("medicalRecordsDepartment")
          )}
          {renderYesNoDropdown("labDepartment", t("labDepartment"))}
          {renderYesNoDropdown("bloodBank", t("bloodBank"))}
          {renderYesNoDropdown(
            "ambulanceMedicalTransport",
            t("ambulanceMedicalTransport")
          )}
          {renderYesNoDropdown("radiologyDepartment", t("radiologyDepartment"))}
          {renderYesNoDropdown(
            "physiotherapyDepartment",
            t("physiotherapyDepartment")
          )}
          {renderYesNoDropdown("dentalDepartment", t("dentalDepartment"))}
          {renderYesNoDropdown(
            "psychiatryDepartment",
            t("psychiatryDepartment")
          )}
          {renderYesNoDropdown(
            "nutritionDieteticsDepartment",
            t("nutritionDieteticsDepartment")
          )}
          {renderYesNoDropdown("medicalEducation", t("medicalEducation"))}
          {renderYesNoDropdown(
            "publicRelationsDepartment",
            t("publicRelationsDepartment")
          )}
          {renderYesNoDropdown("dermatologySkinCare", t("dermatologySkinCare"))}
          {renderYesNoDropdown("internalMedicine", t("internalMedicine"))}
          {renderYesNoDropdown(
            "cardiologyDepartment",
            t("cardiologyDepartment")
          )}
          {renderYesNoDropdown("pediatricsChildCare", t("pediatricsChildCare"))}
          {renderYesNoDropdown(
            "medicalBoardDepartment",
            t("medicalBoardDepartment")
          )}
          {renderYesNoDropdown("medicalStaff", t("medicalStaff"))}
          {renderYesNoDropdown("educationalStaff", t("educationalStaff"))}
          {renderYesNoDropdown("nurseTraining", t("nurseTraining"))}
        </div>
        <div className="mt-4">
          {renderYesNoDropdown(
            "employeeAccommodation",
            t("employeeAccommodation")
          )}
        </div>
      </div>

      {/* Image Upload Sections */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        {renderImageUpload("facilityPhotosOutside", t("facilityPhotosOutside"))}
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm">
        {renderImageUpload("facilityPhotosInside", t("facilityPhotosInside"))}
      </div>
    </div>
  );
};

export default Step1Administrative;

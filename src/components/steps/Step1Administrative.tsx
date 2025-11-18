import React from "react";
import { useTranslation } from "react-i18next";
import InputFiled from "../../antd/InputFiled";
import SelectFiled from "../../antd/SelectFiled";
import DateFiled from "../../antd/DateFiled";

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
    // <div>
    //   <label className="block text-sm font-medium text-gray-700 mb-1">
    //     {label}
    //   </label>
    //   <select
    //     value={data[field] as string}
    //     onChange={(e) => handleInputChange(field, e.target.value)}
    //     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    //   >
    //     <option value="">{t("selectOption")}</option>
    //     <option value="Yes">{t("yes")}</option>
    //     <option value="No">{t("no")}</option>
    //   </select>
    // </div>
    <SelectFiled
      label={label}
      value={data[field] as string}
      onChange={(e) => handleInputChange(field, e.target.value)}
    />
  );

  const renderTextInput = (field: keyof Step1Data, label: string) => (
    <InputFiled
      label={label}
      value={data[field] as string}
      onChange={(e: any) => handleInputChange(field, e.target.value)}
    />
  );

  const renderDateInput = (field: keyof Step1Data, label: string) => (
    // <div>
    //   <label className="block text-sm font-medium text-gray-700 mb-1">
    //     {label}
    //   </label>
    //   <div className="relative">
    //     <input
    //       type="date"
    //       value={data[field] as string}
    //       onChange={(e) => handleInputChange(field, e.target.value)}
    //       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    //     />
    //     <svg
    //       className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
    //       fill="none"
    //       stroke="currentColor"
    //       viewBox="0 0 24 24"
    //     >
    //       <path
    //         strokeLinecap="round"
    //         strokeLinejoin="round"
    //         strokeWidth="2"
    //         d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    //       />
    //     </svg>
    //   </div>
    // </div>
    <DateFiled
      label={label}
      value={data[field] as string}
      onChange={(e) => handleInputChange(field, e.target.value)}
    />
  );

  const renderImageUpload = (
    field: "facilityPhotosOutside" | "facilityPhotosInside",
    label: string
  ) => (
    <div className="p-4">
      <label className="block text-[17px] font-medium text-gray-500 mb-4">
        {label}
      </label>
      <div className="grid grid-cols-6 gap-2.5">
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
      {renderTextInput("facilityName", t("Facility Name"))}
      {renderTextInput("facilityType", t("Facility Type"))}
      {renderTextInput("facilityArea", t("Facility Area"))}
      {renderYesNoDropdown("hasPrivateRooms", t("Are There Private Rooms?"))}
      {renderTextInput("numberOfPrivateRooms", t("Number of Private Rooms"))}
      {renderYesNoDropdown("hasICURooms", t("Are There vip Rooms?"))}
      {renderTextInput("numberOfICURooms", t("Number of vip Rooms"))}
      {renderTextInput(
        "numberOfOperatingRooms",
        t("Number of Operating Rooms")
      )}
      {renderTextInput(
        "numberOfDaySurgeryRooms",
        t("Number of day surgery Rooms")
      )}
      {renderYesNoDropdown("hasPharmacy", t("Is There a Pharmacy?"))}
      {renderYesNoDropdown("hasPostOpRoom", t("hasPostOpRoom"))}
      {renderYesNoDropdown("hasER", t("hasER"))}
      <div className="md:col-span-3">
        {renderTextInput(
          "numberOfDialysisMachines",
          t("numberOfDialysisMachines")
        )}
      </div>

      {/* Address and Location */}
      <div className="md:col-span-3 flex gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 w-full gap-4">
          <div className="md:col-span-2">
            {renderTextInput("facilityAddress", t("Facility Address"))}
          </div>
          {renderTextInput("country", t("Country"))}
          {renderTextInput("region", t("Region"))}
          <div className="md:col-span-2">
            {renderTextInput("city", t("City"))}
          </div>
        </div>
        <div className="flex items-center flex-col min-w-[218px] gap-4">
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
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
          <button className="px-4 py-2 bg-black w-full text-white hover:bg-blue-700">
            {t("Get Direction")}
          </button>
        </div>
      </div>

      {/* Additional Facility Details */}
      {renderTextInput(
        "typeOfFacilityBranches",
        t("Type of Facility Branches")
      )}
      {renderYesNoDropdown(
        "hasEmergencyDepartment",
        t("Is There an Emergency deparment?")
      )}
      {renderYesNoDropdown("hasParking", t("Is There a Parking Lot for Patients?"))}
      {renderTextInput("numberOfParkingSlots", t("Number of Patient Parking Lots"))}
      {renderYesNoDropdown("hasAmbulanceService", t("hasAmbulanceService"))}
      {renderTextInput("numberOfAmbulanceCars", t("numberOfAmbulanceCars"))}

      {/* Time and Date Fields */}
      {renderTextInput(
        "waitingTimeForConsultation",
        t("waitingTimeForConsultation")
      )}
      {renderDateInput("evaluationDate", t("Issuance date"))}
      {renderDateInput("expirationDate", t("Expiration date"))}
      {renderTextInput(
        "doctorInsuranceBoardNumber",
        t("Social insurance board number")
      )}
      {renderDateInput("evaluationDate2", t("Issuance date"))}
      {renderDateInput("expirationDate2", t("Expiration date"))}

      {/* Capacity and Space */}
      {renderTextInput("numberOfBeds", t("Number of Beds"))}
      {renderTextInput("numberOfClinics", t("Number of Clinics"))}
      {renderTextInput("totalSpaceInSqM", t("totalSpaceInSqM"))}

      {/* Department and Service Availability */}
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
      {renderYesNoDropdown("medicalStaff", t("Medical Library"))}
      {renderYesNoDropdown("educationalStaff", t("Educational Halls"))}
      {renderYesNoDropdown("nurseTraining", t("Basic Training Centers"))}
      <div className="md:col-span-3">
        {renderYesNoDropdown(
          "employeeAccommodation",
          t("Employee Accommodation")
        )}
      </div>

      {/* Image Upload Sections */}
      <div className="border border-[#e5e7eb] rounded-[16px] md:col-span-3">
        {renderImageUpload("facilityPhotosInside", t("A Picture of the Facility from the Inside"))}
      </div>
      <div className="border border-[#e5e7eb] rounded-[16px] md:col-span-3">
        {renderImageUpload("facilityPhotosOutside", t("A Picture of the Facility from the Outside"))}
      </div>

    </div>
  );
};

export default Step1Administrative;

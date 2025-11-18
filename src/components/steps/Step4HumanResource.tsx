import React from 'react';
import { useTranslation } from 'react-i18next';
import InputFiled from '../../antd/InputFiled';

interface Step4Data {
  totalStaff: string;
  numberOfLeadEmployees: string;
  numberOfForeignEmployees: string;
  numberOfGeneralDoctor: string;
  numberOfSpecialistDoctor: string;
  numberOfGeneralPractitioner: string;
  numberOfConsultantDoctor: string;
  numberOfEmergencyMedicine: string;
  numberOfAnesthesiaDoctor: string;
  numberOfSpecialistDentist: string;
  numberOfGeneralDentist: string;
  numberOfNursingOrParamedical: string;
  numberOfPharmacist: string;
  numberOfMidwives: string;
  numberOfTechnicianDoctor: string;
  numberOfRadiologyTechnician: string;
  numberOfLaboratoryTechnician: string;
  numberOfDentalTechnician: string;
  numberOfOtherHealthcareSchedules: string;
  numberOfDentalAssistant: string;
  numberOfNursingOrParamedicalAssistant: string;
  numberOfDentalHygienist: string;
  numberOfPublicHealthNurse: string;
  numberOfPublicHealthTechnician: string;
  numberOfOrthopedicTechnician: string;
  numberOfSocialPsychologistOrSocialWorker: string;
  numberOfCardioPulmonaryTechnician: string;
  numberOfOtherGroupOfTechnicalAndProfessionalStaff: string;
  numberOfContractOrTemporaryStaff: string;
  numberOfOtherStaff: string;
  numberOfMedicalRecordsStaff: string;
  numberOfPhysiotherapistSchedules: string;
  numberOfOtherGroupOfTechnicalAndProfessionalStaffSpecify: string;
  numberOfContractOrTemporaryStaffSpecify: string;
}

interface Step4Props {
  data: Step4Data;
  onChange: (data: Step4Data) => void;
}

const Step4HumanResource: React.FC<Step4Props> = ({ data, onChange }) => {
  const { t } = useTranslation();
  const handleInputChange = (field: keyof Step4Data, value: string) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  const renderTextInput = (field: keyof Step4Data, label: string, placeholder?: string) => (
    // <div>
    //   <label className="block text-sm font-medium text-gray-700 mb-1">
    //     {label}
    //   </label>
    //   <input
    //     type="text"
    //     value={data[field]}
    //     onChange={(e) => handleInputChange(field, e.target.value)}
    //     placeholder={placeholder}
    //     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    //   />
    // </div>
    <InputFiled
      label={label}
      value={data[field]}
      onChange={(e) => handleInputChange(field, e.target.value)}
    />
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
      {renderTextInput('totalStaff', t('Total Staff'))}
      {renderTextInput('numberOfLeadEmployees', t('steps.step4.numberOfLeadEmployees'))}
      {renderTextInput('numberOfForeignEmployees', t('steps.step4.numberOfForeignEmployees'))}
      {renderTextInput('numberOfGeneralDoctor', t('steps.step4.numberOfGeneralDoctor'))}
      {renderTextInput('numberOfSpecialistDoctor', t('steps.step4.numberOfSpecialistDoctor'))}
      {renderTextInput('numberOfGeneralPractitioner', t('steps.step4.numberOfGeneralPractitioner'))}
      {renderTextInput('numberOfConsultantDoctor', t('steps.step4.numberOfConsultantDoctor'))}
      {renderTextInput('numberOfEmergencyMedicine', t('steps.step4.numberOfEmergencyMedicine'))}
      {renderTextInput('numberOfAnesthesiaDoctor', t('steps.step4.numberOfAnesthesiaDoctor'))}
      {renderTextInput('numberOfSpecialistDentist', t('steps.step4.numberOfSpecialistDentist'))}
      {renderTextInput('numberOfGeneralDentist', t('steps.step4.numberOfGeneralDentist'))}
      {renderTextInput('numberOfNursingOrParamedical', t('steps.step4.numberOfNursingOrParamedical'))}
      {renderTextInput('numberOfPharmacist', t('steps.step4.numberOfPharmacist'))}
      {renderTextInput('numberOfMidwives', t('steps.step4.numberOfMidwives'))}
      {renderTextInput('numberOfTechnicianDoctor', t('steps.step4.numberOfTechnicianDoctor'))}
      {renderTextInput('numberOfRadiologyTechnician', t('steps.step4.numberOfRadiologyTechnician'))}
      {renderTextInput('numberOfLaboratoryTechnician', t('steps.step4.numberOfLaboratoryTechnician'))}
      {renderTextInput('numberOfDentalTechnician', t('steps.step4.numberOfDentalTechnician'))}
      {renderTextInput('numberOfOtherHealthcareSchedules', t('steps.step4.numberOfOtherHealthcareSchedules'))}
      {renderTextInput('numberOfDentalAssistant', t('steps.step4.numberOfDentalAssistant'))}
      {renderTextInput('numberOfNursingOrParamedicalAssistant', t('steps.step4.numberOfNursingOrParamedicalAssistant'))}
      {renderTextInput('numberOfDentalHygienist', t('steps.step4.numberOfDentalHygienist'))}
      {renderTextInput('numberOfPublicHealthNurse', t('steps.step4.numberOfPublicHealthNurse'))}
      {renderTextInput('numberOfPublicHealthTechnician', t('steps.step4.numberOfPublicHealthTechnician'))}
      {renderTextInput('numberOfOrthopedicTechnician', t('steps.step4.numberOfOrthopedicTechnician'))}
      {renderTextInput('numberOfSocialPsychologistOrSocialWorker', t('steps.step4.numberOfSocialPsychologistOrSocialWorker'))}
      {renderTextInput('numberOfCardioPulmonaryTechnician', t('steps.step4.numberOfCardioPulmonaryTechnician'))}
      {renderTextInput('numberOfOtherGroupOfTechnicalAndProfessionalStaff', t('steps.step4.numberOfOtherGroupOfTechnicalAndProfessionalStaff'))}
      {renderTextInput('numberOfContractOrTemporaryStaff', t('steps.step4.numberOfContractOrTemporaryStaff'))}
      {renderTextInput('numberOfOtherStaff', t('steps.step4.numberOfOtherStaff'))}
      {renderTextInput('numberOfMedicalRecordsStaff', t('steps.step4.numberOfMedicalRecordsStaff'))}
      {renderTextInput('numberOfPhysiotherapistSchedules', t('steps.step4.numberOfPhysiotherapistSchedules'))}
    </div>
  );
};

export default Step4HumanResource;

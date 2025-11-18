import React from 'react';
import { useTranslation } from 'react-i18next';
import InputFiled from '../../antd/InputFiled';
import SelectFiled from '../../antd/SelectFiled';

interface Step2Data {
  generalMedicalOperation: string;
  subspecialties: string;
  specializedUnits: string;
  knowledgeOfThe: string;
  icuMom: string;
  cardiacTeam: string;
  doctorsConsultationUnit: string;
  intensiveCareUnit: string;
  pediatricsIntensiveCareUnit: string;
  nonMedicalIntensiveCareUnit: string;
  intermediateCareUnit: string;
  isolationUnit: string;
  emergencyUnit: string;
  dialysisUnit: string;
  comprehensiveRehabilitationCenter: string;
  nursery: string;
  maternityUnit: string;
  organDonationTransplantCenter: string;
  drugAddictionUnit: string;
}

interface Step2Props {
  data: Step2Data;
  onChange: (data: Step2Data) => void;
}

const Step2Medical: React.FC<Step2Props> = ({ data, onChange }) => {
  const { t } = useTranslation();
  const handleInputChange = (field: keyof Step2Data, value: string) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  const renderTextInput = (field: keyof Step2Data, label: string) => (
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

  const renderYesNoDropdown = (field: keyof Step2Data, label: string) => (
    // <div>
    //   <label className="block text-sm font-medium text-gray-700 mb-1">
    //     {label}
    //   </label>
    //   <select
    //     value={data[field]}
    //     onChange={(e) => handleInputChange(field, e.target.value)}
    //     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    //   >
    //     <option value="">{t('steps.step1.selectOption')}</option>
    //     <option value="Yes">{t('steps.step1.yes')}</option>
    //     <option value="No">{t('steps.step1.no')}</option>
    //   </select>
    // </div>
    <SelectFiled
      label={label}
      value={data[field]}
      onChange={(e) => handleInputChange(field, e.target.value)}
    />
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
      {/* General Medical Information */}
      {renderTextInput('generalMedicalOperation', t('General Medical Specialties'))}
      {renderTextInput('subspecialties', t('Subspecialties'))}
      {renderTextInput('specializedUnits', t('Specialized Units'))}

      {/* Medical Units and Departments */}
      {renderYesNoDropdown('knowledgeOfThe', t('steps.step2.knowledgeOfThe'))}
      {renderYesNoDropdown('icuMom', t('steps.step2.icuMom'))}
      {renderYesNoDropdown('cardiacTeam', t('steps.step2.cardiacTeam'))}
      {renderYesNoDropdown('doctorsConsultationUnit', t('steps.step2.doctorsConsultationUnit'))}
      {renderYesNoDropdown('intensiveCareUnit', t('steps.step2.intensiveCareUnit'))}
      {renderYesNoDropdown('pediatricsIntensiveCareUnit', t('steps.step2.pediatricsIntensiveCareUnit'))}
      {renderYesNoDropdown('nonMedicalIntensiveCareUnit', t('steps.step2.nonMedicalIntensiveCareUnit'))}
      {renderYesNoDropdown('intermediateCareUnit', t('steps.step2.intermediateCareUnit'))}
      {renderYesNoDropdown('isolationUnit', t('steps.step2.isolationUnit'))}
      {renderYesNoDropdown('emergencyUnit', t('steps.step2.emergencyUnit'))}
      {renderYesNoDropdown('dialysisUnit', t('steps.step2.dialysisUnit'))}
      {renderYesNoDropdown('comprehensiveRehabilitationCenter', t('steps.step2.comprehensiveRehabilitationCenter'))}
      {renderYesNoDropdown('nursery', t('steps.step2.nursery'))}
      {renderYesNoDropdown('maternityUnit', t('steps.step2.maternityUnit'))}
      {renderYesNoDropdown('organDonationTransplantCenter', t('steps.step2.organDonationTransplantCenter'))}

      <div className="md:col-span-3">
        {renderYesNoDropdown('drugAddictionUnit', t('steps.step2.drugAddictionUnit'))}
      </div>
    </div>
  );
};

export default Step2Medical;

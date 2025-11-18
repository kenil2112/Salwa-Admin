import React from 'react';
import { useTranslation } from 'react-i18next';
import SelectFiled from '../../antd/SelectFiled';

interface Step6Data {
  healthAwarenessSupplements: string;
  epidemicControlDepartment: string;
  patientEducationServices: string;
  socialServices: string;
  medicalEquipmentRepairWorkshop: string;
  availabilityOfLongTermHospitalizationRiskManagement: string;
  availabilityOfHomecareServices: string;
  availabilityOfElderlyCareServices: string;
  availabilityOfMedicalEquipmentAndToolsStorage: string;
  availabilityOfMedicalEquipmentAnalysisStorage: string;
}

interface Step6Props {
  data: Step6Data;
  onChange: (data: Step6Data) => void;
}

const Step6PublicHealth: React.FC<Step6Props> = ({ data, onChange }) => {
  const { t } = useTranslation();
  const handleInputChange = (field: keyof Step6Data, value: string) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  const renderYesNoDropdown = (field: keyof Step6Data, label: string) => (
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
      <div className='md:col-span-2 grid md:grid-cols-3 gap-4'>
        {renderYesNoDropdown('healthAwarenessSupplements', t('steps.step6.healthAwarenessSupplements'))}
        {renderYesNoDropdown('epidemicControlDepartment', t('steps.step6.epidemicControlDepartment'))}
        {renderYesNoDropdown('patientEducationServices', t('steps.step6.patientEducationServices'))}
      </div>
      {renderYesNoDropdown('socialServices', t('Social Services'))}
      {renderYesNoDropdown('medicalEquipmentRepairWorkshop', t('Medical Equipment Repair Workshop'))}
      {renderYesNoDropdown('availabilityOfLongTermHospitalizationRiskManagement', t('Availability of long-term hospitalization care and management services'))}
      {renderYesNoDropdown('availabilityOfHomecareServices', t('Availability of home medical services'))}
      {renderYesNoDropdown('availabilityOfElderlyCareServices', t('Availability of elderly care services'))}
      {renderYesNoDropdown('availabilityOfMedicalEquipmentAndToolsStorage', t('Availability of medical equipment and tools storage'))}
      <div className='md:col-span-2'>{renderYesNoDropdown('availabilityOfMedicalEquipmentAnalysisStorage', t('Availability of medical equipment and tools storage'))}</div>
    </div>
  );
};

export default Step6PublicHealth;

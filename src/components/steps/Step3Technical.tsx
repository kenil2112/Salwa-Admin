import React from 'react';
import { useTranslation } from 'react-i18next';
import InputFiled from '../../antd/InputFiled';
import SelectFiled from '../../antd/SelectFiled';

interface Step3Data {
  radiologyDepartment: string;
  pathologyDepartment: string;
  laboratoryDepartment: string;
  anesthesiologyDepartment: string;
  availabilityOfMedicalEquipment: string;
  totalNumberOfBeds: string;
}

interface Step3Props {
  data: Step3Data;
  onChange: (data: Step3Data) => void;
}

const Step3Technical: React.FC<Step3Props> = ({ data, onChange }) => {
  const { t } = useTranslation();
  const handleInputChange = (field: keyof Step3Data, value: string) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  const renderTextInput = (field: keyof Step3Data, label: string, placeholder?: string) => (
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

  const renderYesNoDropdown = (field: keyof Step3Data, label: string) => (
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
      {renderYesNoDropdown('radiologyDepartment', t('Radiology Department?'))}
      {renderYesNoDropdown('pathologyDepartment', t('Pathology Department'))}
      {renderYesNoDropdown('laboratoryDepartment', t('Laboratory Department'))}
      {renderTextInput('anesthesiologyDepartment', t('Histopathology Department'))}
      {renderYesNoDropdown('availabilityOfMedicalEquipment', t('steps.step3.availabilityOfMedicalEquipment'))}
      {renderTextInput('totalNumberOfBeds', t('steps.step3.totalNumberOfBeds'))}
    </div>
  );
};

export default Step3Technical;

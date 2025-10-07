import { useMemo, useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import DashboardLayout from "../layouts/DashboardLayout";
import { getSuperAdminById } from "../services/superAdminService";
import type { SuperAdminRecord } from "../services/superAdminService";

const SupervisorDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useTranslation();
  const [showSuccess, setShowSuccess] = useState(false);
  const [supervisor, setSupervisor] = useState<SuperAdminRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    generalInfo: true,
    personalInfo: true,
    contactInfo: true,
    bankInfo: true,
    workInfo: true,
    systemInfo: true
  });

  // Load supervisor data
  useMemo(async () => {
    if (id) {
      try {
        setLoading(true);
        const response = await getSuperAdminById(parseInt(id));
        if (response && typeof response === 'object' && 'data' in response) {
          setSupervisor(response.data as SuperAdminRecord);
        } else {
          setSupervisor(response as SuperAdminRecord);
        }
      } catch (error) {
        console.error('Error loading supervisor:', error);
      } finally {
        setLoading(false);
      }
    }
  }, [id]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const TYPE_LABELS: Record<number, string> = {
    0: t('pages.supervisors.operationalSupervisor'),
    1: t('pages.supervisors.operationalEmployee'),
    2: t('pages.supervisors.financeSupervisor'),
    3: t('pages.supervisors.financeEmployee'),
    4: t('pages.supervisors.itSupportEmployee'),
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-500">{t('common.loading')}...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!supervisor) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-500">{t('pages.supervisors.supervisorNotFound')}</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto flex w-full flex-col gap-8 pb-16">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-[32px] border border-gray-200 bg-white px-8 py-6 shadow-sm">
          <button className="inline-flex items-center gap-2 text-sm font-semibold text-primary" onClick={() => navigate("/supervisor-management")}> 
            <ArrowLeftIcon />
            {t('common.back')}
          </button>
          <div className="text-sm font-semibold text-gray-500">
            <span className="text-gray-400">{t('pages.supervisors.employeeId')}:</span> <span className="text-primary">{supervisor.employeeId}</span>
          </div>
        </header>

        <section className="space-y-8 rounded-[32px] border border-gray-200 bg-white px-8 py-10 shadow-sm">
          <ExpandableSection 
            title={t('pages.supervisors.generalInformation')} 
            isExpanded={expandedSections.generalInfo}
            onToggle={() => toggleSection('generalInfo')}
          >
            <div className="grid gap-4 sm:grid-cols-3">
              <Input label={t('pages.supervisors.employeeId')} value={supervisor.employeeId?.toString() || ''} readOnly />
              <Input label={t('pages.supervisors.firstName')} value={supervisor.firstName || ''} readOnly />
              <Input label={t('pages.supervisors.middleName')} value={supervisor.middleName || ''} readOnly />
              <Input label={t('pages.supervisors.lastName')} value={supervisor.lastName || ''} readOnly />
              <Input label={t('pages.supervisors.idNumber')} value={supervisor.idNumber || ''} readOnly />
              <Input label={t('pages.supervisors.idExpiryDate')} type="date" value={supervisor.idExpiryDate || ''} readOnly />
              <Input label={t('pages.supervisors.dateOfBirth')} type="date" value={supervisor.dateOfBirth || ''} readOnly />
              <Select label={t('pages.supervisors.type')} value={supervisor.type?.toString() || ''} options={Object.entries(TYPE_LABELS).map(([key, value]) => ({ key, value }))} readOnly />
              <Input label={t('pages.supervisors.status')} value={supervisor.statusId === 1 ? t('common.active') : t('common.inactive')} readOnly />
            </div>
          </ExpandableSection>

          <ExpandableSection 
            title={t('pages.supervisors.personalInformation')} 
            isExpanded={expandedSections.personalInfo}
            onToggle={() => toggleSection('personalInfo')}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label={t('pages.supervisors.graduationCertificate')} value={supervisor.graduationCertificate || ''} readOnly />
              <Input label={t('pages.supervisors.acquiredLanguages')} value={supervisor.acquiredLanguages || ''} readOnly />
              <Input label={t('pages.supervisors.nationalAddress')} value={supervisor.nationalAddress || ''} readOnly />
              <Input label={t('pages.supervisors.address')} value={supervisor.address || ''} readOnly />
            </div>
          </ExpandableSection>

          <ExpandableSection 
            title={t('pages.supervisors.contactInformation')} 
            isExpanded={expandedSections.contactInfo}
            onToggle={() => toggleSection('contactInfo')}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label={t('pages.supervisors.telephone')} value={supervisor.telephone || ''} readOnly />
              <Input label={t('pages.supervisors.officialEmail')} value={supervisor.officialEmail || ''} readOnly />
              <Input label={t('pages.supervisors.country')} value={supervisor.country || ''} readOnly />
              <Input label={t('pages.supervisors.region')} value={supervisor.region || ''} readOnly />
              <Input label={t('pages.supervisors.city')} value={supervisor.city || ''} readOnly />
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">{t('pages.supervisors.locationMap')}</p>
                <div className="h-40 rounded-[24px] border border-gray-200 bg-[#f6f7fb] flex items-center justify-center">
                  <span className="text-gray-400 text-sm">📍 {t('pages.supervisors.mapPlaceholder')}</span>
                </div>
              </div>
            </div>
          </ExpandableSection>

          <ExpandableSection 
            title={t('pages.supervisors.bankInformation')} 
            isExpanded={expandedSections.bankInfo}
            onToggle={() => toggleSection('bankInfo')}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label={t('pages.supervisors.bankName')} value={supervisor.bankName || ''} readOnly />
              <Input label={t('pages.supervisors.ibanNumber')} value={supervisor.ibanNumber || ''} readOnly />
            </div>
          </ExpandableSection>

          <ExpandableSection 
            title={t('pages.supervisors.workInformation')} 
            isExpanded={expandedSections.workInfo}
            onToggle={() => toggleSection('workInfo')}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label={t('pages.supervisors.createdBy')} value={supervisor.createdBy?.toString() || ''} readOnly />
              <Input label={t('pages.supervisors.updatedBy')} value={supervisor.updatedBy?.toString() || ''} readOnly />
              <Input label={t('pages.supervisors.isActive')} value={supervisor.isActive ? t('common.yes') : t('common.no')} readOnly />
              <Input label={t('pages.supervisors.isPasswordSet')} value={supervisor.isPasswordset ? t('common.yes') : t('common.no')} readOnly />
              <Input label={t('pages.supervisors.isOtpVerify')} value={supervisor.isOtpVerify ? t('common.yes') : t('common.no')} readOnly />
              <Input label={t('pages.supervisors.isMobileNoVerify')} value={supervisor.isMobileNoVerify ? t('common.yes') : t('common.no')} readOnly />
            </div>
          </ExpandableSection>

          <ExpandableSection 
            title={t('pages.supervisors.systemInformation')} 
            isExpanded={expandedSections.systemInfo}
            onToggle={() => toggleSection('systemInfo')}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label={t('pages.supervisors.latitude')} value={supervisor.latitude || ''} readOnly />
              <Input label={t('pages.supervisors.longitude')} value={supervisor.longitude || ''} readOnly />
              <Input label={t('pages.supervisors.otp')} value={supervisor.otp?.toString() || ''} readOnly />
            </div>
          </ExpandableSection>

          <div className="flex justify-end gap-3">
            <button className="rounded-full bg-primary px-6 py-2 text-sm font-semibold text-white shadow hover:bg-[#030447]" onClick={() => setShowSuccess(true)}>
              {t('common.save')}
            </button>
            <button className="rounded-full border border-gray-300 px-6 py-2 text-sm font-semibold text-gray-500 hover:border-primary">
              {t('common.print')}
            </button>
          </div>
        </section>
      </div>

      {showSuccess && (
        <ModalOverlay>
          <div className="w-full max-w-md rounded-[32px] bg-white px-8 py-12 text-center shadow-[0_30px_60px_rgba(5,6,104,0.18)]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#e9fbf3] text-[#09a66d]">
              <CheckIcon />
            </div>
            <p className="mt-6 text-lg font-semibold text-primary">{t('pages.supervisors.supervisorUpdated')}</p>
            <p className="mt-2 text-sm text-gray-500">{t('pages.supervisors.supervisorUpdatedSuccess')}</p>
            <button className="mt-8 rounded-full bg-primary px-6 py-2 text-sm font-semibold text-white shadow hover:bg-[#030447]" onClick={() => setShowSuccess(false)}>
              {t('common.close')}
            </button>
          </div>
        </ModalOverlay>
      )}
    </DashboardLayout>
  );
};

const ExpandableSection = ({ 
  title, 
  children, 
  isExpanded, 
  onToggle 
}: { 
  title: string; 
  children: ReactNode; 
  isExpanded: boolean; 
  onToggle: () => void; 
}) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between cursor-pointer" onClick={onToggle}>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">{title}</p>
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400">{isExpanded ? 'Collapse' : 'Expand'}</span>
        <ChevronIcon isExpanded={isExpanded} />
      </div>
    </div>
    {isExpanded && (
      <div className="space-y-4">
        {children}
      </div>
    )}
  </div>
);

const Input = ({ label, value, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; value?: string }) => (
  <label className="space-y-2 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
    {label}
    <input {...props} value={value} className="w-full rounded-[18px] border border-gray-200 bg-[#f7f8fd] px-4 py-3 text-sm text-gray-600 shadow-inner focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
  </label>
);

const Select = ({ label, value, options, ...props }: { label: string; value: string; options: { key: string; value: string }[]; readOnly?: boolean }) => (
  <label className="space-y-2 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
    {label}
    <select value={value} {...props} className="w-full rounded-[18px] border border-gray-200 bg-[#f7f8fd] px-4 py-3 text-sm text-gray-600 shadow-inner focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20">
      {options.map((option) => (
        <option key={option.key} value={option.key}>{option.value}</option>
      ))}
    </select>
  </label>
);

const ModalOverlay = ({ children }: { children: ReactNode }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-[6px] px-4 py-6">
    {children}
  </div>
);

const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l-7 7 7 7" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-10 w-10">
    <path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2Zm-1 15-4-4 1.41-1.42L11 13.17l4.59-4.59L17 10l-6 7Z" />
  </svg>
);

const ChevronIcon = ({ isExpanded }: { isExpanded: boolean }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

export default SupervisorDetail;

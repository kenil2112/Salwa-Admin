import { useState, type ChangeEvent, type FormEvent } from "react";
import DashboardLayout from "../layouts/DashboardLayout";

const INDIVIDUAL_CATEGORIES = [
  "Insurance Card Holder",
  "Doctors",
  "Transition Students",
  "Salwa Network Programs",
  "Medical Real State Owner",
];

const BUSINESS_CATEGORIES = [
  "Service Providers / Food Sector / Healthy Food Business � Small Facilities",
  "Service Providers / Food Sector / Healthy Food Business � Medium Facilities",
  "Service Providers / Food Sector / Healthy Food Business � Large Facilities",
  "Service Providers / Food Sector / Healthy Food Business � Mega Facilities",
];

const DURATIONS = ["1 Year", "2 Year", "3 Year"];

const SubscriptionSettings = () => {
  const [activeTab, setActiveTab] = useState<"individuals" | "business">("individuals");
  const [categoryFilter, setCategoryFilter] = useState("All Category");
  const [subCategoryFilter, setSubCategoryFilter] = useState("All Subcategory");
  const [searchTerm, setSearchTerm] = useState("");

  const categories = activeTab === "individuals" ? INDIVIDUAL_CATEGORIES : BUSINESS_CATEGORIES;

  const filteredCategories = categories.filter((title) => {
    const matchesCategory = categoryFilter === "All Category" || title.includes(categoryFilter);
    const matchesSubCategory = subCategoryFilter === "All Subcategory" || title.includes(subCategoryFilter);
    const matchesSearch = searchTerm.trim().length === 0 || title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSubCategory && matchesSearch;
  });

  return (
    <DashboardLayout>
      <div className="mx-auto flex w-full  flex-col gap-8 pb-3">
        <Header />
        <section className="space-y-8 rounded-[32px] border border-gray-200 bg-white p-8 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-primary">Subscription Manage</h2>
              <p className="text-sm text-gray-400">Configure product plans for every audience</p>
            </div>
            <button className="rounded-full bg-primary px-8 py-2.5 text-sm font-semibold text-white shadow hover:bg-[#030447]">
              Save
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold text-gray-500">Subscription Type</span>
            <div className="flex rounded-full border border-gray-200 bg-[#f7f8fd] p-1 text-sm font-semibold text-gray-500">
              <ToggleButton
                label="Individuals"
                isActive={activeTab === "individuals"}
                onClick={() => setActiveTab("individuals")}
              />
              <ToggleButton
                label="Business"
                isActive={activeTab === "business"}
                onClick={() => setActiveTab("business")}
              />
            </div>
          </div>

          <FilterBar
            category={categoryFilter}
            subCategory={subCategoryFilter}
            search={searchTerm}
            onCategoryChange={setCategoryFilter}
            onSubCategoryChange={setSubCategoryFilter}
            onSearchChange={setSearchTerm}
          />

          <div className="space-y-10">
            {filteredCategories.map((title) => (
              <PlanSection key={title} title={title} />
            ))}
            {filteredCategories.length === 0 && (
              <div className="rounded-[28px] border border-dashed border-gray-300 bg-[#f7f8fd] px-6 py-12 text-center text-sm text-gray-500">
                No plans match the current filters.
              </div>
            )}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
};

const ToggleButton = ({ label, isActive, onClick }: { label: string; isActive: boolean; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-full px-4 py-2 transition ${isActive ? "bg-white text-primary shadow" : "text-gray-500 hover:text-primary"
      }`}
  >
    {label}
  </button>
);

const FilterBar = ({
  category,
  subCategory,
  search,
  onCategoryChange,
  onSubCategoryChange,
  onSearchChange,
}: {
  category: string;
  subCategory: string;
  search: string;
  onCategoryChange: (value: string) => void;
  onSubCategoryChange: (value: string) => void;
  onSearchChange: (value: string) => void;
}) => {
  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <form
      onSubmit={handleSearchSubmit}
      className="flex flex-wrap items-center gap-3 rounded-[28px] border border-gray-200 bg-[#f7f8fd] px-4 py-4"
    >
      <Select
        label="Category"
        id="category"
        value={category}
        options={["All Category", "Insurance", "Doctors", "Food Sector", "Education", "Hospitality"]}
        onChange={(event) => onCategoryChange(event.target.value)}
      />
      <Select
        label="Sub Category"
        id="sub_category"
        value={subCategory}
        options={["All Subcategory", "Small Facilities", "Medium Facilities", "Large Facilities", "Mega Facilities"]}
        onChange={(event) => onSubCategoryChange(event.target.value)}
      />
      <div className="flex items-center flex-1 min-w-[220px]">
        <div className="flex items-center gap-2 w-full relative input-filed-block">
          <input
            type="search"
            id="search_bar_subscription_settings"
            placeholder="Search plans"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            className="w-full rounded-md border border-slate-200 bg-white pl-3 pr-11 py-2 text-base text-gray-600 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 peer
          placeholder-transparent disabled:cursor-not-allowed disabled:bg-[#F4F5F9] disabled:text-[#A0A3BD]"
          />
          <label
            htmlFor="search_bar_subscription_settings"
            className={`
              label-filed absolute left-2.5 top-2 text-[#A0A3BD] text-base transition-all duration-200
              peer-placeholder-shown:top-2 peer-placeholder-shown:left-2.5 peer-placeholder-shown:text-base cursor-text
              peer-focus:-top-3 peer-focus:left-2.5 peer-focus:text-[13px] peer-focus:text-[#070B68]
              bg-white px-1 ${search && search.trim() !== "" ? "!-top-3 !text-[13px] " : ""} 
              `}
          >
            Search
          </label>
          <button className="shrink-0 rounded-full border border-gray-200 px-5 py-2 text-sm font-semibold text-primary hover:border-primary">
            Search
          </button>
        </div>
      </div>
    </form>
  );
};

const PlanSection = ({ title }: { title: string }) => (
  <section className="space-y-5">
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
      <div>
        <h3 className="text-xl font-semibold text-primary">{title}</h3>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Plan Packages</p>
      </div>
      <button className="rounded-full border border-gray-200 px-4 py-1.5 text-xs font-semibold text-primary hover:border-primary">
        Templates
      </button>
    </header>
    <div className="grid gap-4 lg:grid-cols-3">
      {DURATIONS.map((duration) => (
        <PlanCard key={duration} duration={duration} />
      ))}
    </div>
  </section>
);

const PlanCard = ({ duration }: { duration: string }) => (
  <article className="space-y-4 rounded-[28px] border border-gray-200 bg-[#f7f8fd] p-6 shadow-inner">
    <div className="flex items-center justify-between">
      <h4 className="text-lg font-semibold text-primary">{duration}</h4>
      <span className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-500">
        SAR 50
      </span>
    </div>
    <div className="space-y-3">
      <Input label="Plan name" placeholder="Plan name" />
      <Input label="Discount" placeholder="0%" />
      <Input label="Amount" placeholder="0 SAR" />
      <Input label="Subscription Amount" placeholder="0 SAR" />
    </div>
    <div className="grid gap-2 sm:grid-cols-2">
      <Input label="Additional Discount" placeholder="0%" />
      <Input label="Bonus Commission" placeholder="0 SAR" />
    </div>
    <button className="w-full rounded-full border border-gray-300 px-4 py-2 text-xs font-semibold text-primary hover:border-primary">
      Apply Changes
    </button>
  </article>
);

const Input = ({ label, placeholder }: { label: string; placeholder: string }) => (
  <label className="space-y-1 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
    {label}
    <input
      className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-normal text-gray-600 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      placeholder={placeholder}
    />
  </label>
);

const Select = ({
  label,
  options,
  value,
  onChange,
  id,
}: {
  label: string;
  id?: string;
  options: string[];
  value: string;
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
}) => (
  <label className="space-y-1 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
    <div className="relative input-filed-block min-w-[220px]">
      <select
        id={id}
        className="w-full px-3 py-2 h-[42px] text-sm text-gray-600 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 peer
            placeholder-transparent disabled:cursor-not-allowed disabled:bg-[#F4F5F9] disabled:text-[#A0A3BD]"
        value={value}
        onChange={onChange}
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
      <label
        htmlFor={id}
        className={`
        label-filed absolute capitalize left-3 top-2 text-[#A0A3BD] text-base transition-all duration-200
        peer-placeholder-shown:top-2 peer-placeholder-shown:left-3 peer-placeholder-shown:text-base cursor-text
        peer-focus:-top-3 peer-focus:left-3 peer-focus:text-[13px] peer-focus:text-[#070B68]
        bg-white px-1  ${value ? "!-top-3 !left-3 !text-[13px]" : ""} 
        `}
      >{label}</label>
    </div>
  </label>
);

const Header = () => (
  <div className="flex items-center gap-4 rounded-[28px] border border-gray-200 bg-white px-6 py-5 shadow-sm">
    <div className="grid h-16 w-16 place-items-center rounded-3xl bg-primary/10 text-primary">
      <Icon />
    </div>
    <div>
      <h1 className="text-2xl font-semibold text-primary">Subscription Settings</h1>
      <p className="text-sm text-gray-400">Manage plan tiers for every customer type</p>
    </div>
  </div>
);

const Icon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 72" className="h-10 w-10" fill="#050668">
    <path d="M54 12H18a6 6 0 0 0-6 6v36a6 6 0 0 0 6 6h36a6 6 0 0 0 6-6V18a6 6 0 0 0-6-6Zm-21 36H21v-6h12Zm0-12H21v-6h12Zm18 12H39v-6h12Zm0-12H39v-6h12Z" />
  </svg>
);

export default SubscriptionSettings;


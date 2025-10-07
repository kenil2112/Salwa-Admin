import DashboardLayout from "../layouts/DashboardLayout";

const options = [
  { name: "Enable Auto-Approval", description: "Automatically approve low-risk service requests" },
  { name: "Allow Draft Mode", description: "Let managers store partially completed assignments" },
  { name: "Notify Supervisors", description: "Send instant notifications for escalated queries" },
];

const AdvancedOptions = () => (
  <DashboardLayout>
    <div className="mx-auto flex w-full  flex-col gap-8 pb-16">
      <Header />
      <section className="space-y-4 rounded-[32px] border border-gray-200 bg-white p-8 shadow-sm">
        {options.map((option) => (
          <article key={option.name} className="rounded-[24px] border border-gray-200 bg-[#f7f8fd] px-6 py-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-primary">{option.name}</h3>
                <p className="mt-1 text-sm text-gray-500">{option.description}</p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input type="checkbox" className="peer sr-only" defaultChecked />
                <span className="h-6 w-11 rounded-full bg-gray-200 transition peer-checked:bg-primary"></span>
                <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-5"></span>
              </label>
            </div>
          </article>
        ))}
      </section>
    </div>
  </DashboardLayout>
);

const Header = () => (
  <div className="flex items-center gap-4 rounded-[28px] border border-gray-200 bg-white px-6 py-5 shadow-sm">
    <div className="grid h-16 w-16 place-items-center rounded-3xl bg-primary/10 text-primary">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 72" className="h-10 w-10" fill="#050668">
        <path d="M48 18H24a6 6 0 0 0-6 6v24a6 6 0 0 0 6 6h24a6 6 0 0 0 6-6V24a6 6 0 0 0-6-6Zm-6 24H30V30h12Z" />
      </svg>
    </div>
    <div>
      <h1 className="text-2xl font-semibold text-primary">Advanced Options</h1>
      <p className="text-sm text-gray-400">Configure granular platform behaviours</p>
    </div>
  </div>
);

export default AdvancedOptions;

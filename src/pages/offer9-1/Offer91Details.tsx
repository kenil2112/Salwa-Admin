import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";

interface LocationState {
  category: {
    id: string;
    title: string;
    icon: string;
    description: string;
  };
  service: {
    id: string;
    title: string;
    description: string;
    icon: string;
    categoryId: string;
    serviceId: string;
    serviceTitle: string;
  };
  action: string;
  logData: any;
  mode: "create" | "view" | "edit";
  offerId?: number;
}

const Offer91Details = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // const { offerId } = useParams<{ offerId: string }>();
  const state = location.state as LocationState;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    discount: "",
    startDate: "",
    endDate: "",
    status: "Active",
    terms: "",
    conditions: ""
  });

  const [loading, setLoading] = useState(false);
  // const [isEditMode] = useState(state?.mode === "edit");

  useEffect(() => {
    if (state?.mode === "view" || state?.mode === "edit") {
      // Load existing offer data
      setFormData({
        title: "Special Service Offer",
        description: "Exclusive offer for premium service packages with extended benefits",
        discount: "35",
        startDate: "2024-01-01",
        endDate: "2024-12-31",
        status: "Active",
        terms: "Valid for enterprise customers",
        conditions: "Minimum service duration of 18 months required"
      });
    }
  }, [state]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Navigate back to dashboard
      navigate("/offer9-1/dashboard", {
        state: {
          ...state,
          message: state?.mode === "create" ? "Offer created successfully!" : "Offer updated successfully!"
        }
      });
    } catch (error) {
      console.error("Error saving offer:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/offer9-1/dashboard", { state });
  };

  return (
    <DashboardLayout>
      <div className="mx-auto flex w-full flex-col gap-8 pb-3">
        <section className="space-y-8 rounded-2xl border border-slate-200 bg-white px-10 py-10 shadow-card">
          <header className="flex flex-wrap items-start justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-helveticaBold text-primary">
                {state?.mode === "create" ? "Create New Offer" :
                  state?.mode === "edit" ? "Edit Offer" : "Offer Details"}
              </h1>
              <p className="max-w-xl text-sm font-textMedium text-gray-500">
                {state?.category?.title || "Category 9"} - {state?.service?.title || "Service 1"}
              </p>
            </div>
            <button
              onClick={handleBack}
              className="rounded-full border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-500 transition hover:border-primary hover:text-primary"
            >
              Back to Dashboard
            </button>
          </header>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Offer Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  disabled={state?.mode === "view"}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 disabled:bg-gray-100"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Discount Percentage *
                </label>
                <input
                  type="number"
                  name="discount"
                  value={formData.discount}
                  onChange={handleInputChange}
                  disabled={state?.mode === "view"}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 disabled:bg-gray-100"
                  required
                  min="1"
                  max="100"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Start Date *
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  disabled={state?.mode === "view"}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 disabled:bg-gray-100"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  End Date *
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  disabled={state?.mode === "view"}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 disabled:bg-gray-100"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  disabled={state?.mode === "view"}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 disabled:bg-gray-100"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                disabled={state?.mode === "view"}
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 disabled:bg-gray-100"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Terms & Conditions
              </label>
              <textarea
                name="terms"
                value={formData.terms}
                onChange={handleInputChange}
                disabled={state?.mode === "view"}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 disabled:bg-gray-100"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Additional Conditions
              </label>
              <textarea
                name="conditions"
                value={formData.conditions}
                onChange={handleInputChange}
                disabled={state?.mode === "view"}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 disabled:bg-gray-100"
              />
            </div>

            {state?.mode !== "view" && (
              <div className="flex justify-end gap-3 pt-6">
                <button
                  type="button"
                  onClick={handleBack}
                  className="rounded-full border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-500 transition hover:border-primary hover:text-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow transition hover:bg-[#030447] disabled:cursor-not-allowed disabled:bg-primary/70"
                >
                  {loading ? "Saving..." : state?.mode === "create" ? "Create Offer" : "Update Offer"}
                </button>
              </div>
            )}
          </form>
        </section>
      </div>
    </DashboardLayout>
  );
};

export default Offer91Details;

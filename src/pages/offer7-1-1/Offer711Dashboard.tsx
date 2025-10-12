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
  subService?: {
    id: string;
    title: string;
    description: string;
    icon: string;
    optionId: string;
    optionTitle: string;
  };
  action: string;
  logData: any;
}

const Offer711Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;

  const [offers, setOffers] = useState<any[]>([]);
  const [loading] = useState(false);

  useEffect(() => {
    // Initialize offers data for subservice 7.1.1
    setOffers([
      {
        id: 1,
        offerNo: "#OFF711",
        title: "Medical Equipment Rental - Subservice 7.1.1",
        description: "Specialized medical equipment rental offer for subservice 7.1.1",
        status: "Active",
        startDate: "2024-01-01",
        endDate: "2024-12-31",
        discount: "25%",
        category: state?.category?.title || "Category 7",
        service: state?.service?.title || "Service 1",
        subService: "7.1.1 - " + (state?.subService?.title || "Sub-service 1")
      }
    ]);
  }, [state]);

  const handleCreateOffer = () => {
    navigate("/offer7-1-1/details/new", {
      state: {
        ...state,
        mode: "create"
      }
    });
  };

  const handleViewOffer = (offerId: number) => {
    navigate(`/offer7-1-1/details/${offerId}`, {
      state: {
        ...state,
        mode: "view",
        offerId
      }
    });
  };

  return (
    <DashboardLayout>
      <div className="mx-auto flex w-full flex-col gap-8 pb-3">
        <section className="space-y-8 rounded-2xl border border-slate-200 bg-white px-10 py-10 shadow-card">
          <header className="flex flex-wrap items-start justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-helveticaBold text-primary">
                Subservice 7.1.1 - Offers
              </h1>
              <p className="max-w-xl text-sm font-textMedium text-gray-500">
                Manage offers for {state?.category?.title || "Category 7"} - {state?.service?.title || "Service 1"} - Subservice 7.1.1
              </p>
            </div>
            <button
              onClick={handleCreateOffer}
              className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow transition hover:bg-[#030447]"
            >
              Create New Offer
            </button>
          </header>

          <div className="space-y-4">
            <h2 className="text-lg font-helveticaBold text-primary">
              Active Offers
            </h2>

            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, index) => (
                  <div
                    key={index}
                    className="flex h-44 animate-pulse flex-col justify-between rounded-2xl border border-slate-200 bg-slate-100 px-6 py-5"
                  >
                    <div className="h-12 w-12 rounded-xl bg-slate-200"></div>
                    <div className="space-y-3">
                      <div className="h-4 w-3/4 rounded bg-slate-200"></div>
                      <div className="h-3 w-1/2 rounded bg-slate-200"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : offers.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {offers.map((offer) => (
                  <div
                    key={offer.id}
                    className="flex h-44 flex-col justify-between rounded-2xl border border-slate-200 bg-white px-6 py-5 text-left transition shadow hover:shadow-lg cursor-pointer"
                    onClick={() => handleViewOffer(offer.id)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="grid h-12 w-12 place-items-center rounded-xl bg-cyan-100">
                        <span className="text-cyan-600 text-xl">🔬</span>
                      </span>
                      <div>
                        <span className="inline-flex items-center rounded-full bg-cyan-100 px-2.5 py-0.5 text-xs font-medium text-cyan-800">
                          {offer.status}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <p className="text-base font-helveticaBold text-primary">
                        {offer.title}
                      </p>
                      <span className="inline-flex items-center gap-2 text-sm font-textMedium text-primary">
                        {offer.offerNo} - {offer.discount} OFF
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          className="h-4 w-4 text-primary"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 12h14M13 6l6 6-6 6"
                          />
                        </svg>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-gray-100 bg-[#f7f8fd] px-6 py-10 text-center text-sm text-gray-500">
                No offers available yet. Create your first offer to get started.
              </div>
            )}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
};

export default Offer711Dashboard;

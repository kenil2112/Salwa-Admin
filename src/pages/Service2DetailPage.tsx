import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";

interface Service2Detail {
    id: string;
    serviceTitle: string;
    location: string;
    daysLeft: number;
    contactPersonName: string;
    contactPersonEmail: string;
    priority: number;
    duration: number;
    assignedTo: string;
    services: Service2Item[];
    otherDetails: string;
}

interface Service2Item {
    serviceNo: string;
    serviceName: string;
    serviceDuration: number;
}

const Service2DetailPage = () => {
    const { serviceId } = useParams<{ serviceId: string }>();
    const navigate = useNavigate();

    const [serviceDetail, setServiceDetail] = useState<Service2Detail | null>(null);
    const [loading, setLoading] = useState(true);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");

    useEffect(() => {
        // Simulate API call to fetch service details
        const fetchServiceDetail = async () => {
            setLoading(true);

            // Mock data based on the design
            const mockServiceDetail: Service2Detail = {
                id: serviceId || "#SRV2-0003",
                serviceTitle: "Service Title",
                location: "Jeddah, Saudi Arabia",
                daysLeft: 30,
                contactPersonName: "Lorem ipsum",
                contactPersonEmail: "Lorem ipsum",
                priority: 4,
                duration: 120,
                assignedTo: "John Doe",
                services: [
                    { serviceNo: "#0003", serviceName: "Maintenance", serviceDuration: 60 },
                    { serviceNo: "#0023", serviceName: "Inspection", serviceDuration: 45 },
                    { serviceNo: "#0045", serviceName: "Repair", serviceDuration: 90 },
                    { serviceNo: "#0034", serviceName: "Testing", serviceDuration: 30 }
                ],
                otherDetails: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt"
            };

            setTimeout(() => {
                setServiceDetail(mockServiceDetail);
                setLoading(false);
            }, 1000);
        };

        fetchServiceDetail();
    }, [serviceId]);

    const handleApprove = () => {
        alert("Service approved successfully!");
        navigate(-1); // Go back to previous page
    };

    const handleReject = () => {
        setShowRejectModal(true);
    };

    const handleRejectSubmit = () => {
        if (!rejectionReason.trim()) {
            alert("Please provide a reason for rejection.");
            return;
        }

        // Here you would typically send the rejection reason to your API
        console.log("Service rejected with reason:", rejectionReason);
        alert(`Service rejected successfully!\nReason: ${rejectionReason}`);

        // Reset and close modal
        setRejectionReason("");
        setShowRejectModal(false);
        navigate(-1); // Go back to previous page
    };

    const handleRejectCancel = () => {
        setRejectionReason("");
        setShowRejectModal(false);
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                </div>
            </DashboardLayout>
        );
    }

    if (!serviceDetail) {
        return (
            <DashboardLayout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-gray-500">Service not found</p>
                        <button
                            onClick={() => navigate(-1)}
                            className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="bg-white">
                <div className="mx-auto p-6">
                    {/* Header Section with Doctor Icon */}
                    <div className="bg-gray-100 rounded-lg p-8 mb-6">
                        <div className="flex items-center justify-center">
                            <div className="bg-gray-300 rounded-full p-8">
                                <svg className="w-16 h-16 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Back Button */}
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                    </button>

                    {/* Service Title */}
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">
                        {serviceDetail.serviceTitle}
                    </h1>

                    {/* Location and Days Left */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-2 text-gray-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {serviceDetail.location}
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                            </svg>
                            <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                                {serviceDetail.daysLeft} Days Left
                            </span>
                        </div>
                    </div>

                    {/* Divider */}
                    <hr className="border-gray-200 mb-8" />

                    {/* Key Details */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Key Details:</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
                                <span className="text-gray-700">
                                    <strong>Contact Person Name :</strong> {serviceDetail.contactPersonName}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
                                <span className="text-gray-700">
                                    <strong>Contact Person Email :</strong> {serviceDetail.contactPersonEmail}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
                                <span className="text-gray-700">
                                    <strong>Priority Level :</strong> Level {serviceDetail.priority}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
                                <span className="text-gray-700">
                                    <strong>Assigned To :</strong> {serviceDetail.assignedTo}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Service Items Table */}
                    <div className="mb-8">
                        <table className="w-full border-collapse border border-gray-300">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                                        <div className="flex items-center gap-2">
                                            Order No
                                            <div className="flex flex-col">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                                                </svg>
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </th>
                                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                                        Order Title
                                    </th>
                                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                                        Uniform Type
                                    </th>
                                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                                        Gender
                                    </th>
                                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                                        Size
                                    </th>
                                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                                        Color
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {serviceDetail.services.map((service, index) => (
                                    <tr key={service.serviceNo} className={index === 2 ? "bg-purple-50" : ""}>
                                        <td className="border border-gray-300 px-4 py-3 text-gray-900">
                                            {service.serviceNo}
                                        </td>
                                        <td className="border border-gray-300 px-4 py-3 text-gray-900">
                                            Uniform Cloths
                                        </td>
                                        <td className="border border-gray-300 px-4 py-3 text-gray-900">
                                            {service.serviceName}
                                        </td>
                                        <td className="border border-gray-300 px-4 py-3 text-gray-900">
                                            {index % 2 === 0 ? "Male" : "Female"}
                                        </td>
                                        <td className="border border-gray-300 px-4 py-3 text-gray-900">
                                            {["L", "S", "XXL", "M"][index]}
                                        </td>
                                        <td className="border border-gray-300 px-4 py-3 text-gray-900">
                                            White (#DDDDDD)
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Other Details */}
                    <div className="mb-12">
                        <div className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-gray-900 rounded-full mt-2"></div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 mb-2">Other Details :</h2>
                                <p className="text-gray-700 leading-relaxed">
                                    {serviceDetail.otherDetails}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-center gap-4">
                        <button
                            onClick={handleReject}
                            className="px-8 py-3 bg-white border-2 border-gray-900 text-gray-900 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Reject
                        </button>
                        <button
                            onClick={handleApprove}
                            className="px-8 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
                        >
                            Approve
                        </button>
                    </div>
                </div>
            </div>

            {/* Rejection Reason Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Reason for Cancellation</h3>
                            <button
                                onClick={handleRejectCancel}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Reason*
                            </label>
                            <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
                                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent resize-none"
                                required
                            />
                        </div>

                        {/* Modal Footer */}
                        <div className="flex justify-center">
                            <button
                                onClick={handleRejectSubmit}
                                className="px-8 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
                            >
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default Service2DetailPage;

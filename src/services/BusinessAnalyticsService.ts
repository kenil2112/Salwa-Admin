// ----- CSV Export for Business Idea Partners -----

export const exportBusinessIdeaPartners = async (records: any[]) => {
  // delay (optional, keep same behavior as your subscriber export)
  await new Promise((r) => setTimeout(r, 1000));

  const csvHeader =
    "Idea Partner ID,User ID,Partner Name,Idea Name,Description,Registered,Registration Date,Status,Country,Region,City,District";

  const csvRows = records.map((r) => {
    const status = r.statusId ?? "";
    const registrationDate = r.registrationDate
      ? new Date(r.registrationDate).toISOString().split("T")[0]
      : "";

    return [
      r.ideaPartnerId,
      r.userId,
      r.businessName ?? `User #${r.userId}`,
      r.ideaName ?? "",
      r.ideaDescription ?? "",
      r.isRegistered ? "Yes" : "No",
      registrationDate,
      status,
      r.country ?? "",
      r.region ?? "",
      r.city ?? "",
      r.district ?? "",
    ]
      .map((value) => `"${value}"`)
      .join(",");
  });

  const csvContent = [csvHeader, ...csvRows].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `business-idea-partners-${new Date().toISOString().split("T")[0]}.csv`;

  document.body.appendChild(a);
  a.click();

  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

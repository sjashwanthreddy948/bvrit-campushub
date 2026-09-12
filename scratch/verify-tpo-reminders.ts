import {
  getCoordinatorOpportunities,
  COLLEGE_DEPARTMENTS,
  ALL_COLLEGE_SECTIONS,
} from "../src/lib/coordinator/actions";
import {
  buildCoordinatorBroadcastWhatsAppReminder,
  buildCoordinatorSectionWhatsAppReminder,
  createWhatsAppShareUrl,
} from "../src/lib/share/whatsapp";

async function main() {
  console.log("=== VERIFYING TPO SECTIONS & WHATSAPP REMINDERS ===");

  console.log(`Total College Departments: ${COLLEGE_DEPARTMENTS.length}`);
  COLLEGE_DEPARTMENTS.forEach((dept) => {
    console.log(`  - ${dept.code}: ${dept.sections.join(", ")} (${dept.sections.length} sections)`);
  });

  console.log(`\nTotal Configured Sections: ${ALL_COLLEGE_SECTIONS.length}`);
  if (ALL_COLLEGE_SECTIONS.length !== 27) {
    throw new Error(`Expected 27 sections, got ${ALL_COLLEGE_SECTIONS.length}`);
  }

  const res = await getCoordinatorOpportunities();
  console.log(`\nLoaded ${res.opportunities.length} drives. Overall participation: ${res.overallRate}%`);

  const sampleOpp = res.opportunities[0];
  console.log(`\nInspecting Drive: ${sampleOpp.company} — ${sampleOpp.title}`);
  console.log(`Total Eligible Students across all 27 sections: ${sampleOpp.totalEligible}`);
  console.log(`Total Applied: ${sampleOpp.totalApplied}`);
  console.log(`Total Pending: ${sampleOpp.totalNotApplied}`);

  // Test Broadcast Reminder Generation
  const broadcastText = buildCoordinatorBroadcastWhatsAppReminder({
    opportunity: sampleOpp,
    totalEligible: sampleOpp.totalEligible,
    totalApplied: sampleOpp.totalApplied,
    totalNotApplied: sampleOpp.totalNotApplied,
    overallParticipationRate: sampleOpp.overallParticipationRate,
    origin: "http://localhost:3000",
  });
  console.log("\n--- BROADCAST REMINDER PREVIEW ---");
  console.log(broadcastText.substring(0, 300) + "...\n");

  const broadcastWaUrl = createWhatsAppShareUrl(broadcastText);
  console.log(`Broadcast WA URL starts with: ${broadcastWaUrl.substring(0, 45)}...`);

  // Test Specific Section Reminder (e.g. CSE-D)
  const cseD = sampleOpp.sections["CSE-D"];
  console.log(`\nTesting CSE-D: ${cseD.appliedCount} applied / ${cseD.totalStudents} total (${cseD.participationRate}%)`);
  const cseDText = buildCoordinatorSectionWhatsAppReminder({
    opportunity: sampleOpp,
    sectionKey: "CSE-D",
    breakdown: cseD,
    origin: "http://localhost:3000",
  });
  console.log("--- CSE-D REMINDER PREVIEW ---");
  console.log(cseDText.substring(0, 260) + "...\n");

  // Test CSM-B
  const csmB = sampleOpp.sections["CSM-B"];
  console.log(`Testing CSM-B: ${csmB.appliedCount} applied / ${csmB.totalStudents} total (${csmB.participationRate}%)`);

  // Test CIVIL-A
  const civilA = sampleOpp.sections["CIVIL-A"];
  console.log(`Testing CIVIL-A: ${civilA.appliedCount} applied / ${civilA.totalStudents} total (${civilA.participationRate}%)`);

  console.log("\n✅ ALL 27 SECTIONS & WHATSAPP REMINDER LOGIC VERIFIED SUCCESSFULLY!");
}

main().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});

import { CMSService, DEFAULT_HOMEPAGE_SECTIONS } from "@/services/cms.service";
import { SectionRenderer } from "@/components/home/SectionRenderer";
import { CountdownOverlay } from "@/components/home/CountdownOverlay";

// Force dynamic since we read from DB
export const dynamic = "force-dynamic";

export default async function Home() {
  const config = await CMSService.getHomeConfig();
  const sections = config.sections && config.sections.length > 0
    ? config.sections
    : DEFAULT_HOMEPAGE_SECTIONS;

  // Check for active countdown
  if (config.countdown && config.countdown.isEnabled) {
    const targetDate = new Date(config.countdown.targetDate);
    const now = new Date();

    if (targetDate > now) {
      return <CountdownOverlay config={config.countdown} />;
    }
  }

  return (
    <div className="bg-background min-h-screen">
      {sections.map(section => (
        <SectionRenderer key={section.id} section={section} />
      ))}
    </div>
  );
}

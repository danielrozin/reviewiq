import type { BuyingGuideStep } from "@/types";

export const buyingGuides: Record<string, { title: string; steps: BuyingGuideStep[] }> = {
  "robot-vacuums": {
    title: "How to Choose the Best Robot Vacuum",
    steps: [
      { name: "Assess your floor types", text: "Identify whether your home has hardwood, carpet, tile, or a mix. Some robot vacuums excel on hard floors but struggle with thick carpet, while others handle both well." },
      { name: "Consider your home layout", text: "Measure your space and note obstacles. Homes with multiple rooms, stairs, or lots of furniture benefit from LiDAR or camera-based navigation over random-bounce models." },
      { name: "Decide on mopping capability", text: "If you want vacuuming and mopping in one device, look for models with vibrating or rotating mop pads and automatic water control. Basic mopping attachments just drag a damp cloth." },
      { name: "Check suction power ratings", text: "Look for at least 2,000 Pa for light cleaning and 4,000+ Pa if you have pets or thick carpet. Higher suction means better deep cleaning but may increase noise." },
      { name: "Evaluate self-emptying options", text: "Self-emptying docks let the vacuum run for weeks without manual bin emptying. Check dock capacity and replacement bag costs as ongoing expenses." },
      { name: "Compare app and smart home integration", text: "Most models offer scheduling and zone cleaning via app. Check compatibility with your smart home ecosystem (Alexa, Google Home, HomeKit) and whether the app is well-reviewed." },
      { name: "Read verified owner reviews", text: "Check ReviewIQ's AI-powered review summaries to understand long-term reliability, recurring issues, and real-world performance beyond manufacturer claims." },
    ],
  },
  "coffee-machines": {
    title: "How to Choose the Right Coffee Machine",
    steps: [
      { name: "Identify your preferred coffee style", text: "Decide if you primarily drink espresso, drip coffee, pour-over, or specialty drinks like lattes. This determines whether you need an espresso machine, drip brewer, or all-in-one system." },
      { name: "Set your budget range", text: "Coffee machines range from $50 drip brewers to $2,000+ espresso machines. Factor in ongoing costs for pods, beans, filters, and descaling solutions." },
      { name: "Choose between manual and automatic", text: "Super-automatic machines handle grinding through brewing with one button. Semi-automatic espresso machines give more control but require practice and skill." },
      { name: "Check the grinder type", text: "Built-in burr grinders deliver fresher, more consistent results than blade grinders. If the machine lacks a grinder, budget for a separate quality burr grinder." },
      { name: "Evaluate milk frothing options", text: "Automatic milk systems are convenient for daily lattes. Manual steam wands produce better microfoam but require technique. Consider your willingness to learn." },
      { name: "Consider size and counter space", text: "Measure your available counter space and check machine dimensions. Some espresso machines with water reservoirs and bean hoppers need significant vertical clearance." },
      { name: "Read long-term owner experiences", text: "Use ReviewIQ to check reliability after 6+ months of use, common maintenance issues, and how well customer support handles warranty claims." },
    ],
  },
  "air-fryers": {
    title: "How to Choose the Best Air Fryer",
    steps: [
      { name: "Determine the right capacity", text: "For 1-2 people, a 3-4 quart model works. Families of 4+ should look at 6+ quart models or dual-basket designs that cook two foods simultaneously." },
      { name: "Choose between basket and oven style", text: "Basket air fryers are compact and heat quickly. Oven-style models offer more versatility (bake, toast, dehydrate) but take more counter space." },
      { name: "Check cooking presets and controls", text: "Digital controls with presets simplify cooking common items. Look for adjustable temperature (150-450°F) and timer settings that match your cooking needs." },
      { name: "Evaluate ease of cleaning", text: "Dishwasher-safe baskets and non-stick coatings save time. Check if the heating element is accessible for wiping down, as grease buildup affects performance." },
      { name: "Compare wattage and preheat time", text: "Higher wattage (1,700W+) means faster cooking and crispier results. Some models preheat in under 3 minutes while others take 5+ minutes." },
      { name: "Read real owner reviews on food quality", text: "Check ReviewIQ for verified owner feedback on actual cooking results, noise levels, and durability after months of regular use." },
    ],
  },
  "wireless-earbuds": {
    title: "How to Choose the Best Wireless Earbuds",
    steps: [
      { name: "Define your primary use case", text: "Commuting, workouts, calls, or music listening each demand different features. Exercise earbuds need water resistance and secure fit; call-heavy users need strong microphones." },
      { name: "Evaluate sound quality priorities", text: "Decide if you value bass-heavy sound, balanced profiles, or spatial audio. Check if the earbuds support high-quality codecs like LDAC or aptX for your device." },
      { name: "Test noise cancellation needs", text: "Active noise cancellation (ANC) blocks ambient sound for commuting and focus. Transparency mode lets in surroundings for safety. Not all ANC is equal — check dB reduction ratings." },
      { name: "Check battery life and charging", text: "Look for 6+ hours per charge with ANC on, and 24+ hours total with the case. Wireless charging cases add convenience. Fast charging (5 min = 1 hour playback) is a valuable feature." },
      { name: "Assess comfort and fit options", text: "Multiple ear tip sizes are essential. Some brands offer wing tips for sports. Check if the earbuds cause fatigue during extended wear — owner reviews are the best source for this." },
      { name: "Verify device compatibility", text: "Some features (spatial audio, seamless switching) work best within one ecosystem (Apple, Samsung, Google). Check multipoint connection if you switch between phone and laptop." },
      { name: "Read verified owner durability reports", text: "Use ReviewIQ to check real-world battery degradation, sweat resistance durability, and common failure points reported by owners after 3+ months." },
    ],
  },
  "mattresses": {
    title: "How to Choose the Right Mattress",
    steps: [
      { name: "Identify your sleep position", text: "Side sleepers need softer mattresses for pressure relief at hips and shoulders. Back sleepers need medium-firm support. Stomach sleepers need firm surfaces to prevent spinal misalignment." },
      { name: "Choose your mattress type", text: "Memory foam contours to your body, innerspring offers bounce and airflow, hybrid combines both, and latex provides responsive support with natural materials. Each has distinct trade-offs." },
      { name: "Consider temperature regulation", text: "If you sleep hot, look for gel-infused foam, open-cell construction, or innerspring/hybrid designs with better airflow. Avoid dense memory foam without cooling technology." },
      { name: "Check firmness on a standardized scale", text: "Firmness is rated 1-10 (soft to firm). Most people prefer 5-7 (medium to medium-firm). Your body weight affects how a mattress feels — heavier sleepers need firmer options." },
      { name: "Evaluate motion isolation", text: "If you share a bed, memory foam and pocket coils minimize partner disturbance. Traditional innerspring transfers more motion. This is critical for light sleepers." },
      { name: "Understand the trial period and warranty", text: "Most online mattresses offer 90-365 night trials. Check return shipping costs and warranty coverage for sagging (typically 1+ inch). A longer trial lets you adjust properly." },
      { name: "Read long-term owner sleep reports", text: "Check ReviewIQ for owner experiences after 6+ months. Initial comfort often differs from long-term performance — sagging, heat retention, and durability issues emerge over time." },
    ],
  },
  "smart-watches": {
    title: "How to Choose the Best Smart Watch",
    steps: [
      { name: "Check phone compatibility", text: "Apple Watch only works with iPhone. Wear OS and Samsung watches work best with Android. Garmin and Fitbit are cross-platform but may have limited features on one OS." },
      { name: "Define your health tracking needs", text: "Basic models track steps and heart rate. Advanced models add ECG, blood oxygen, skin temperature, and sleep staging. Decide which health metrics actually matter for your goals." },
      { name: "Evaluate battery life requirements", text: "Apple Watch lasts 1-2 days. Samsung Galaxy Watch lasts 2-3 days. Garmin watches last 1-2 weeks. If charging daily is a dealbreaker, prioritize longer battery life." },
      { name: "Consider display type and size", text: "AMOLED displays are bright and colorful but use more battery. MIP displays (Garmin) are always-on and sun-readable. Larger screens are easier to read but may feel bulky on smaller wrists." },
      { name: "Assess fitness and GPS accuracy", text: "If you run, cycle, or hike, dual-frequency GPS provides significantly better accuracy. Check if the watch supports your specific workout types and can connect to gym equipment." },
      { name: "Review app ecosystem and payments", text: "Check if your must-have apps are available. NFC payments (Apple Pay, Google Wallet, Samsung Pay) are convenient. Some watches support offline music and maps for phone-free outings." },
      { name: "Read real owner accuracy reports", text: "Use ReviewIQ to check actual heart rate, GPS, and sleep tracking accuracy from verified owners — these often differ from manufacturer claims." },
    ],
  },
  "standing-desks": {
    title: "How to Choose the Best Standing Desk",
    steps: [
      { name: "Measure your workspace", text: "Check available floor space, wall clearance for the desk at full height, and any cable management constraints. Standing desks need rear clearance for the lifting mechanism." },
      { name: "Determine the right desktop size", text: "Standard sizes range from 48×24 to 72×30 inches. Consider your monitor setup — dual monitors typically need 55+ inch width. Deeper desks (30 inches) accommodate monitor arms better." },
      { name: "Compare motor systems", text: "Dual-motor desks are faster, quieter, and handle heavier loads than single-motor. Check lifting speed (1.5+ inches/sec is good), noise level (under 50dB), and weight capacity (250+ lbs recommended)." },
      { name: "Check height range", text: "Ensure the desk's low position works for sitting (25-28 inches for most people) and high position works for standing (44-50 inches for most). Taller users (6'+) should verify maximum height." },
      { name: "Evaluate stability at standing height", text: "Wobble at standing height is the most common complaint. Look for crossbar support, heavy-gauge steel legs, and read owner reviews specifically about stability during typing." },
      { name: "Consider programmable presets", text: "Memory presets (3-4 positions) let you switch between sitting, standing, and perching heights with one button. Anti-collision sensors prevent damage to objects above or below." },
      { name: "Read long-term reliability reviews", text: "Check ReviewIQ for motor failures, control panel issues, and surface wear after 6+ months. Standing desks are a long-term investment — reliability matters more than initial impressions." },
    ],
  },
  "blenders": {
    title: "How to Choose the Best Blender",
    steps: [
      { name: "Define your primary blending needs", text: "Smoothies need less power than nut butters or hot soups. If you only make simple smoothies, a personal blender may be all you need. Heavy tasks require a full-size, high-powered model." },
      { name: "Check motor power and blade design", text: "For smoothies, 700+ watts works. For ice crushing, nut butters, and tough ingredients, look for 1,000+ watts with hardened stainless steel blades and a strong coupling." },
      { name: "Evaluate container material and size", text: "Tritan plastic is lightweight and durable. Glass is heavier but scratch-resistant and doesn't retain odors. Choose 64oz for families, 32oz for couples, or personal-size for solo use." },
      { name: "Compare speed controls and presets", text: "Variable speed dials offer more control than fixed settings. Pulse function is essential for chunky textures. Pre-programmed cycles automate common tasks like smoothies and soups." },
      { name: "Assess noise levels", text: "High-powered blenders can exceed 90dB (lawnmower level). Some models include sound enclosures or quieter motor designs. Check owner reviews for real-world noise comparisons." },
      { name: "Check cleaning ease", text: "Self-cleaning cycles (blend with soap and water) save time. Dishwasher-safe components are a plus. Avoid blenders with hard-to-reach crevices around the blade assembly." },
      { name: "Read verified owner reviews on durability", text: "Use ReviewIQ to check for motor burnout, blade dulling, container cracking, and seal leaking reported by owners after months of regular use." },
    ],
  },
  "laptops": {
    title: "How to Choose the Right Laptop",
    steps: [
      { name: "Define your primary use case", text: "Casual browsing and office work need different specs than video editing, gaming, or software development. Your use case determines the minimum processor, RAM, and GPU requirements." },
      { name: "Choose the right processor", text: "For general use, Intel Core i5/AMD Ryzen 5 or Apple M-series chips are excellent. Creative professionals and gamers should look at i7/i9 or Ryzen 7/9. Check benchmark scores, not just model names." },
      { name: "Determine RAM and storage needs", text: "8GB RAM is minimum for general use. 16GB is recommended for multitasking and development. 32GB+ for video editing. Get at least 512GB SSD — NVMe SSDs are significantly faster than SATA." },
      { name: "Select the right display", text: "For color-accurate work, look for 100% sRGB or DCI-P3 coverage. Higher resolution (2K+) reduces eye strain. 120Hz+ refresh rates benefit gamers. Matte screens reduce glare in bright environments." },
      { name: "Evaluate battery life for your workflow", text: "Check real-world battery tests, not manufacturer claims. Aim for 8+ hours for on-the-go work. Larger, more powerful laptops with discrete GPUs typically last 4-6 hours under load." },
      { name: "Check build quality and portability", text: "Consider weight (under 3 lbs for travel, 4-5 lbs for desk use), keyboard feel, trackpad quality, and port selection. USB-C/Thunderbolt 4 ports future-proof your connectivity." },
      { name: "Read owner reviews on real-world performance", text: "Use ReviewIQ to check thermal throttling, fan noise, keyboard reliability, and screen quality from verified owners who use the laptop daily." },
    ],
  },
  "electric-toothbrushes": {
    title: "How to Choose the Best Electric Toothbrush",
    steps: [
      { name: "Choose between sonic and oscillating", text: "Sonic toothbrushes vibrate at high frequency and are gentler on gums. Oscillating-rotating heads (like Oral-B) provide thorough mechanical cleaning. Both are effective — pick based on comfort preference." },
      { name: "Evaluate brushing modes", text: "Most people only need a standard clean mode. Sensitive, whitening, gum care, and deep clean modes add versatility. Don't overpay for modes you won't use." },
      { name: "Check pressure sensors", text: "Pressure sensors alert you when brushing too hard, preventing gum recession and enamel damage. This is especially valuable for aggressive brushers and those with sensitive gums." },
      { name: "Compare battery life", text: "Standard models last 2 weeks per charge. Premium models last 3-4 weeks. Travel-friendly models should last at least your typical trip length. USB-C charging is more convenient than proprietary chargers." },
      { name: "Consider replacement brush head costs", text: "Budget $20-40 per year for replacement heads (every 3 months). Check if compatible third-party heads are available — they can significantly reduce ongoing costs." },
      { name: "Evaluate smart features", text: "Bluetooth-connected models track brushing habits, coverage, and pressure via app. Useful for building habits but not essential. Built-in 2-minute timers with 30-second quadrant alerts are more universally helpful." },
      { name: "Read verified owner reviews", text: "Check ReviewIQ for battery degradation over time, motor reliability, and whether the cleaning improvement over manual brushing justifies the price." },
    ],
  },
  "headphones": {
    title: "How to Choose the Best Headphones",
    steps: [
      { name: "Decide between over-ear and on-ear", text: "Over-ear headphones provide better sound isolation and comfort for long sessions. On-ear models are more portable but can cause ear fatigue. Choose based on your listening duration and mobility needs." },
      { name: "Evaluate sound signature preferences", text: "Neutral/flat sound suits audio professionals. Bass-boosted profiles suit hip-hop and EDM listeners. Look for customizable EQ via companion apps to adjust to your taste." },
      { name: "Test noise cancellation quality", text: "Premium ANC (Sony, Bose, Apple) blocks significantly more noise than budget options. Check if ANC affects sound quality and whether transparency mode sounds natural for conversations." },
      { name: "Check comfort for extended wear", text: "Memory foam ear cushions, lightweight builds (under 250g), and adjustable headbands prevent fatigue. Glasses wearers should check for frames compatibility in owner reviews." },
      { name: "Compare wireless features", text: "Multipoint Bluetooth connects to two devices simultaneously. Check Bluetooth version (5.2+ for stability), codec support (LDAC, aptX HD for high-res audio), and wireless range." },
      { name: "Read long-term comfort and durability reviews", text: "Use ReviewIQ to check headband cracking, ear pad wear, hinge failures, and whether comfort holds up after daily 4+ hour listening sessions." },
    ],
  },
  "tablets": {
    title: "How to Choose the Best Tablet",
    steps: [
      { name: "Define your use case", text: "Media consumption needs a great display. Productivity needs keyboard support and multitasking. Drawing needs stylus support with low latency. Gaming needs a powerful processor and high refresh rate." },
      { name: "Choose the right operating system", text: "iPadOS has the best tablet app ecosystem and stylus support. Android offers more customization and file management. Windows tablets double as laptops but have fewer touch-optimized apps." },
      { name: "Select the right screen size", text: "8-inch tablets are portable for reading. 10-11 inch is the sweet spot for general use. 12-13 inch suits productivity and creative work but sacrifices portability." },
      { name: "Check processor and RAM", text: "For basic tasks, mid-range chips suffice. Video editing, drawing, and gaming need flagship processors. At least 4GB RAM for casual use, 8GB+ for multitasking and creative apps." },
      { name: "Evaluate accessory ecosystems", text: "Check availability and cost of keyboards, styluses, and cases. First-party accessories (Apple Pencil, Samsung S Pen) usually offer the best integration but cost more." },
      { name: "Read owner reviews on real daily use", text: "Check ReviewIQ for app compatibility issues, battery life under real workloads, and whether the tablet replaces a laptop as effectively as marketing claims suggest." },
    ],
  },
  "smart-speakers": {
    title: "How to Choose the Best Smart Speaker",
    steps: [
      { name: "Pick your voice assistant ecosystem", text: "Alexa (Amazon), Google Assistant, or Siri (Apple) each have strengths. Choose based on your existing smart home devices, preferred music services, and which assistant handles your typical requests best." },
      { name: "Evaluate sound quality for your room", text: "Larger rooms need speakers with more bass and volume. Stereo pairing and spatial audio features can fill bigger spaces. For bedrooms, a compact speaker with good mid-range is usually sufficient." },
      { name: "Check smart home hub capabilities", text: "Some speakers include Zigbee, Thread, or Matter hubs, eliminating the need for separate hub devices. This simplifies smart home setup and reduces latency for automations." },
      { name: "Consider display vs display-less", text: "Smart displays add video calls, recipe following, photo frames, and visual feedback. Display-less speakers are more affordable and less distracting for bedrooms and offices." },
      { name: "Review privacy features", text: "Check for physical microphone mute buttons, on-device processing options, and audio history deletion controls. Some models process voice locally without sending audio to the cloud." },
      { name: "Read owner reviews on daily reliability", text: "Use ReviewIQ to check how reliably the speaker hears commands, music quality satisfaction, and whether smart home integrations work as advertised over months of use." },
    ],
  },
  "gaming-mice": {
    title: "How to Choose the Best Gaming Mouse",
    steps: [
      { name: "Determine your grip style", text: "Palm grip suits ergonomic mice. Claw grip works with medium-sized ambidextrous mice. Fingertip grip benefits from lightweight, compact designs. Your grip style is the most important factor for comfort." },
      { name: "Choose wired vs wireless", text: "Modern wireless gaming mice (2.4GHz) match wired latency. Wireless offers clean desk setups but needs charging. Wired is lighter and never needs charging. Competitive FPS players increasingly prefer lightweight wireless." },
      { name: "Check sensor specifications", text: "Look for modern optical sensors (26,000+ DPI capability). Actual DPI used matters more than max — most pros play at 400-1600 DPI. Ensure the sensor has no smoothing, acceleration, or spin-out issues." },
      { name: "Evaluate weight and balance", text: "Lightweight mice (under 70g) reduce fatigue in long sessions and allow faster aim adjustments. Some models offer adjustable weights. Check if the balance point feels natural for your grip." },
      { name: "Compare button count and switches", text: "FPS games need fewer buttons with fast, reliable switches. MMO/MOBA players benefit from 6-12 side buttons. Optical switches offer faster actuation and longer lifespan than mechanical." },
      { name: "Read competitive gamer reviews", text: "Use ReviewIQ to check sensor tracking consistency, switch double-click issues, scroll wheel reliability, and whether the shape works for your hand size from verified gaming owners." },
    ],
  },
  "portable-power-stations": {
    title: "How to Choose the Best Portable Power Station",
    steps: [
      { name: "Calculate your power needs", text: "List the devices you plan to charge or run and their wattage. Add a 20% buffer. A 500Wh station handles phones and laptops; running appliances like mini-fridges or CPAP machines needs 1,000Wh+." },
      { name: "Check output ports and wattage", text: "Ensure the station has enough AC outlets, USB-A, USB-C, and 12V ports for your devices. Check continuous output wattage — a 1,000W station can't run a 1,500W device even briefly without surge capacity." },
      { name: "Evaluate battery chemistry", text: "LiFePO4 batteries last 3,000+ cycles and are safer. Li-ion NMC batteries are lighter and cheaper but last 500-800 cycles. For frequent use, LiFePO4 is worth the premium." },
      { name: "Check solar charging compatibility", text: "If using solar panels, verify maximum solar input wattage and supported voltage range. Higher input (400W+) means faster off-grid charging. MPPT charge controllers are more efficient than PWM." },
      { name: "Consider portability vs capacity", text: "Higher capacity means heavier. A 500Wh station weighs 12-15 lbs; 2,000Wh weighs 45-60 lbs. Decide if you need carry handles, wheels, or expandable battery options for your use case." },
      { name: "Read real-world capacity and reliability reviews", text: "Use ReviewIQ to check actual usable capacity (often 85-90% of rated), charging speed consistency, fan noise levels, and long-term battery health from verified owners." },
    ],
  },
};

export function getBuyingGuide(categorySlug: string) {
  return buyingGuides[categorySlug] || null;
}

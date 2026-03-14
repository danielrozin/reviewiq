import type { DiscussionThread, Comment } from "@/types";

export const discussions: DiscussionThread[] = [
  // Robot Vacuums
  {
    id: "thread-roborock-worth-it",
    title: "Is the Roborock S8 MaxV Ultra worth it in 2026?",
    body: "I've been looking at the S8 MaxV Ultra for a few months. The price is steep at $1,400+. For those who own it — is the auto-empty dock actually reliable? Does the mopping system leave streaks? I have a mix of hardwood and carpet with a golden retriever, so pet hair performance is make or break for me. My budget can stretch to $1,600 but I want to make sure I'm not overpaying for features I won't use.",
    threadType: "question",
    authorId: "user-emma-w",
    productId: "roborock-s8-maxv",
    productSlug: "roborock-s8-maxv-ultra",
    categoryId: "cat-robot-vacuums",
    categorySlug: "robot-vacuums",
    upvotes: 127,
    downvotes: 3,
    commentCount: 34,
    viewCount: 2840,
    isPinned: false,
    isResolved: false,
    tags: ["buying-advice", "pet-owners", "price-check"],
    createdAt: "2026-02-18",
    lastActivityAt: "2026-03-13",
  },
  {
    id: "thread-roomba-navigation",
    title: "Roomba j7+ keeps getting stuck under furniture — anyone else?",
    body: "I've had my j7+ for about 4 months now. It keeps getting stuck under my couch and dining table despite supposedly having obstacle avoidance. I've set up no-go zones but it still tries to squeeze under low furniture. Already tried a factory reset. Is this a common issue or did I get a lemon?",
    threadType: "issue",
    authorId: "user-david-r",
    productId: "irobot-roomba-j7",
    productSlug: "irobot-roomba-j7-plus",
    categoryId: "cat-robot-vacuums",
    categorySlug: "robot-vacuums",
    upvotes: 89,
    downvotes: 2,
    commentCount: 22,
    viewCount: 1650,
    isPinned: false,
    isResolved: false,
    tags: ["navigation", "bug", "obstacle-avoidance"],
    createdAt: "2026-01-25",
    lastActivityAt: "2026-03-10",
  },
  {
    id: "thread-roborock-vs-dreame",
    title: "Roborock S8 MaxV vs Dreame L20 Ultra — honest comparison from an owner of both",
    body: "I've owned the Roborock S8 MaxV Ultra for 8 months and just got the Dreame L20 Ultra two months ago. Both are flagship robot vacuums with similar features, but there are key differences most reviews miss. Here's my real-world comparison.\n\n**Suction:** Dreame wins marginally on carpet, Roborock better on hard floors.\n**Navigation:** Roborock is noticeably smarter with obstacle detection. The Dreame bumps into things more.\n**Mopping:** Roborock's VibraRise 2.0 is better at deep cleaning. Dreame's mop lifts higher though.\n**App:** Roborock's app is more polished. Dreame's has more features but feels cluttered.\n**Dock:** Both work well but Roborock's self-cleaning is quieter.\n**Reliability:** Roborock has been rock-solid. Dreame needed a firmware update to fix a mapping bug.\n\nOverall, I'd give the edge to Roborock for most people, but the Dreame is better value at its lower price point.",
    threadType: "comparison",
    authorId: "user-sarah-k",
    productId: "roborock-s8-maxv",
    productSlug: "roborock-s8-maxv-ultra",
    categoryId: "cat-robot-vacuums",
    categorySlug: "robot-vacuums",
    upvotes: 312,
    downvotes: 8,
    commentCount: 56,
    viewCount: 5200,
    isPinned: true,
    isResolved: false,
    tags: ["comparison", "long-term", "owner-verified"],
    createdAt: "2026-01-05",
    lastActivityAt: "2026-03-14",
  },

  // Coffee Machines
  {
    id: "thread-beginner-espresso",
    title: "Best espresso machine for a complete beginner under $500?",
    body: "I've been drinking drip coffee my whole life and want to get into espresso. I don't want to spend over $500 on the machine (grinder budget separate). I'm looking at the Breville Bambino and the De'Longhi Dedica. I want something forgiving that makes decent lattes. I'm willing to learn but I don't want something that requires a PhD to pull a shot. Which one should I go with?",
    threadType: "recommendation",
    authorId: "user-nina-c",
    productId: undefined,
    productSlug: undefined,
    categoryId: "cat-coffee-machines",
    categorySlug: "coffee-machines",
    upvotes: 95,
    downvotes: 1,
    commentCount: 28,
    viewCount: 1890,
    isPinned: false,
    isResolved: true,
    tags: ["beginner", "buying-advice", "espresso", "under-500"],
    createdAt: "2026-02-22",
    lastActivityAt: "2026-03-12",
  },
  {
    id: "thread-breville-barista-maintenance",
    title: "Breville Barista Express maintenance tips after 2 years of daily use",
    body: "I've been using my Barista Express every single day for 2 years. Here's what I've learned about keeping it running well:\n\n1. **Descale every 2-3 months**, not when the light comes on (that's too late)\n2. **Replace the shower screen** annually — $8 part, huge difference in extraction\n3. **Clean the grinder burrs** every 6 months with Grindz tablets\n4. **Don't leave water in the tank** overnight — helps prevent scale buildup\n5. **Buy the bottomless portafilter** — better feedback on your technique and easier to clean\n\nThe machine is still going strong. Build quality is solid if you maintain it properly.",
    threadType: "tip",
    authorId: "user-marcus-t",
    productId: "breville-barista-express",
    productSlug: "breville-barista-express",
    categoryId: "cat-coffee-machines",
    categorySlug: "coffee-machines",
    upvotes: 246,
    downvotes: 2,
    commentCount: 41,
    viewCount: 4100,
    isPinned: true,
    isResolved: false,
    tags: ["maintenance", "long-term", "tips", "owner-verified"],
    createdAt: "2025-12-08",
    lastActivityAt: "2026-03-11",
  },

  // Air Fryers
  {
    id: "thread-ninja-vs-cosori",
    title: "Ninja DZ201 vs Cosori Pro — which is better for a family of 4?",
    body: "Trying to decide between these two. We're a family of 4 and cook dinner in the air fryer at least 4 times a week. Priorities: capacity, even cooking, and easy cleanup. Don't care about smart features or app connectivity. Budget isn't an issue between these two — just want the better performer.",
    threadType: "comparison",
    authorId: "user-jessica-l",
    productId: undefined,
    productSlug: undefined,
    categoryId: "cat-air-fryers",
    categorySlug: "air-fryers",
    upvotes: 74,
    downvotes: 1,
    commentCount: 19,
    viewCount: 1340,
    isPinned: false,
    isResolved: false,
    tags: ["comparison", "family", "capacity"],
    createdAt: "2026-03-01",
    lastActivityAt: "2026-03-13",
  },
  {
    id: "thread-cosori-coating-peeling",
    title: "Warning: Cosori Pro basket coating started peeling after 6 months",
    body: "I want to flag this because I've seen other people mention it too. The non-stick coating on my Cosori Pro basket started flaking off after about 6 months of regular use (3-4 times per week). I always hand-wash and never use metal utensils. I contacted Cosori support and they sent a replacement basket, but the same thing happened to the replacement after another 4 months. Anyone else experiencing this? Is this a health concern?",
    threadType: "warning",
    authorId: "user-emma-w",
    productId: "cosori-pro",
    productSlug: "cosori-pro",
    categoryId: "cat-air-fryers",
    categorySlug: "air-fryers",
    upvotes: 156,
    downvotes: 5,
    commentCount: 32,
    viewCount: 3200,
    isPinned: false,
    isResolved: false,
    tags: ["quality-issue", "safety", "coating", "long-term"],
    createdAt: "2026-01-14",
    lastActivityAt: "2026-03-09",
  },

  // Wireless Earbuds
  {
    id: "thread-airpods-pro-2-update",
    title: "6-month update: AirPods Pro 2 — my honest experience as an audiophile",
    body: "I posted a review when I first got these and gave them 4/5. After 6 months of daily use (2-3 hours/day), here's what's changed:\n\n**What improved:** Adaptive audio got noticeably better with firmware updates. Conversation awareness works almost perfectly now.\n\n**What degraded:** Battery life dropped about 15-20% from new. I now get ~4.5 hours vs 6 hours initially. ANC performance seems slightly worse too, though this might be ear tip wear.\n\n**What I wish was different:** I still miss the granular EQ control of the Sony WF-XM5. The AirPods sound profile is good but not customizable enough for critical listening.\n\n**Verdict at 6 months:** Still 4/5. The ecosystem integration is unbeatable if you're in Apple. But if pure audio quality is #1, the Sony is still king.",
    threadType: "long_term_update",
    authorId: "user-alex-m",
    productId: "airpods-pro-2",
    productSlug: "airpods-pro-2",
    categoryId: "cat-wireless-earbuds",
    categorySlug: "wireless-earbuds",
    upvotes: 198,
    downvotes: 4,
    commentCount: 45,
    viewCount: 3800,
    isPinned: true,
    isResolved: false,
    tags: ["long-term", "audiophile", "battery", "owner-verified"],
    createdAt: "2026-02-01",
    lastActivityAt: "2026-03-14",
  },
  {
    id: "thread-galaxy-buds-fit",
    title: "Galaxy Buds 3 Pro keep falling out during workouts — solutions?",
    body: "Love the sound quality on these but they just won't stay in my ears during intense workouts. I've tried all the included ear tip sizes. The medium is the best seal but still comes loose during running. Anyone found aftermarket tips or hooks that work well? I really don't want to return them because the sound is incredible.",
    threadType: "question",
    authorId: "user-david-r",
    productId: "samsung-galaxy-buds-3",
    productSlug: "samsung-galaxy-buds-3-pro",
    categoryId: "cat-wireless-earbuds",
    categorySlug: "wireless-earbuds",
    upvotes: 62,
    downvotes: 1,
    commentCount: 18,
    viewCount: 980,
    isPinned: false,
    isResolved: true,
    tags: ["fit", "workout", "ear-tips", "help"],
    createdAt: "2026-02-28",
    lastActivityAt: "2026-03-12",
  },

  // Mattresses
  {
    id: "thread-purple-regret",
    title: "Anyone regret buying the Purple 4? I'm considering returning mine",
    body: "I spent $3,000 on the Purple 4 and I'm on day 60 of my trial. Mixed feelings. The temperature regulation is legitimately amazing — I went from waking up sweaty to sleeping cool all night. But the mattress is way too firm for my liking even after the break-in period. I'm a side sleeper (160 lbs) and I get shoulder pressure. My wife (who's a back sleeper) loves it though. Should I give it more time? Is there a topper that helps without ruining the cooling? Or should I return it and try the Saatva?",
    threadType: "question",
    authorId: "user-tom-h",
    productId: "purple-4",
    productSlug: "purple-4",
    categoryId: "cat-mattresses",
    categorySlug: "mattresses",
    upvotes: 108,
    downvotes: 2,
    commentCount: 36,
    viewCount: 2400,
    isPinned: false,
    isResolved: false,
    tags: ["buying-advice", "return-decision", "side-sleeper", "firmness"],
    createdAt: "2026-02-10",
    lastActivityAt: "2026-03-13",
  },
  {
    id: "thread-saatva-vs-casper",
    title: "Saatva Classic vs Casper Original — 1 year with both (different rooms)",
    body: "We bought a Saatva Classic for our master bedroom and a Casper Original for the guest room a year ago. Here's the honest comparison:\n\n**Saatva Classic:**\n- Feels more like a luxury hotel mattress\n- Innerspring + coil-on-coil gives great edge support\n- Sleeps cooler than the Casper\n- White glove delivery was excellent\n- After 1 year: minimal sagging, still supportive\n\n**Casper Original:**\n- More of a memory foam feel — hugs you\n- Better motion isolation (guests never complain)\n- Sleeps warmer, especially in summer\n- Bed-in-a-box delivery was easy\n- After 1 year: slight body impression forming where guest usually sleeps\n\n**Verdict:** Saatva for daily use if you prefer a traditional mattress feel. Casper for guest rooms or if you like that memory foam hug. Both are solid — just very different sleep experiences.",
    threadType: "comparison",
    authorId: "user-rachel-p",
    productId: undefined,
    productSlug: undefined,
    categoryId: "cat-mattresses",
    categorySlug: "mattresses",
    upvotes: 274,
    downvotes: 6,
    commentCount: 48,
    viewCount: 4600,
    isPinned: true,
    isResolved: false,
    tags: ["comparison", "long-term", "owner-verified", "1-year-update"],
    createdAt: "2025-11-20",
    lastActivityAt: "2026-03-14",
  },
  {
    id: "thread-nectar-off-gassing",
    title: "Nectar Premier off-gassing smell — how long does it really last?",
    body: "Just unboxed my Nectar Premier and the chemical smell is intense. The box says it dissipates in 24-48 hours but I've read reviews saying it took weeks. I have a newborn at home so I'm genuinely concerned. Currently airing it in the guest room with windows open. How long did the smell last for you? Any tips to speed it up?",
    threadType: "question",
    authorId: "user-jessica-l",
    productId: "nectar-premier",
    productSlug: "nectar-premier",
    categoryId: "cat-mattresses",
    categorySlug: "mattresses",
    upvotes: 84,
    downvotes: 1,
    commentCount: 24,
    viewCount: 1760,
    isPinned: false,
    isResolved: true,
    tags: ["off-gassing", "safety", "new-purchase", "health"],
    createdAt: "2026-03-05",
    lastActivityAt: "2026-03-13",
  },
];

// Comments organized by thread
export const comments: Comment[] = [
  // Comments on "Is the Roborock S8 MaxV Ultra worth it in 2026?"
  {
    id: "comment-1",
    threadId: "thread-roborock-worth-it",
    authorId: "user-sarah-k",
    body: "Owner of 10 months here. Short answer: yes, absolutely worth it for pet owners. The auto-empty dock handles golden retriever hair without clogging — I was shocked. The mopping leaves very faint streaks on dark hardwood but it's 90% better than my old Roborock S7. The obstacle avoidance is the real game changer though — it dodges dog toys, shoes, cables without hesitation.",
    upvotes: 89,
    downvotes: 1,
    isTopAnswer: true,
    isOwnerVerified: true,
    helpfulCount: 72,
    createdAt: "2026-02-18",
    replies: [
      {
        id: "comment-1-1",
        threadId: "thread-roborock-worth-it",
        parentId: "comment-1",
        authorId: "user-emma-w",
        body: "This is exactly what I needed to hear! Does it handle the transition from hardwood to carpet well? My living room has a thick area rug.",
        upvotes: 12,
        downvotes: 0,
        isTopAnswer: false,
        isOwnerVerified: false,
        helpfulCount: 3,
        createdAt: "2026-02-19",
      },
      {
        id: "comment-1-2",
        threadId: "thread-roborock-worth-it",
        parentId: "comment-1",
        authorId: "user-sarah-k",
        body: "Handles it perfectly. It automatically increases suction on carpet and lifts the mop pads so they don't wet the carpet. The transition is seamless even with thick rugs. Only issue I've had is with very dark/black rugs — it sometimes thinks they're cliffs and avoids them. A firmware update mostly fixed this though.",
        upvotes: 34,
        downvotes: 0,
        isTopAnswer: false,
        isOwnerVerified: true,
        helpfulCount: 28,
        createdAt: "2026-02-19",
      },
    ],
  },
  {
    id: "comment-2",
    threadId: "thread-roborock-worth-it",
    authorId: "user-tom-h",
    body: "I've had mine for 6 months. The dock self-cleaning works well but uses a lot of water and cleaning solution. Budget about $15/month for supplies. Also, the dock is HUGE — measure your space before buying. Other than that, it's the best robot vacuum I've ever owned (had 4 different brands over the years).",
    upvotes: 45,
    downvotes: 2,
    isTopAnswer: false,
    isOwnerVerified: true,
    helpfulCount: 38,
    createdAt: "2026-02-20",
    replies: [],
  },
  {
    id: "comment-3",
    threadId: "thread-roborock-worth-it",
    authorId: "user-david-r",
    body: "Counter-opinion: I returned mine after 2 months. For the price, I expected perfection and it wasn't. The AI obstacle avoidance failed on small items like USB cables. The mopping was mediocre on stubborn stains. And the app pushes notifications constantly. Ended up with the Dreame L20 for $400 less and I'm happier with it. The Roborock is good but not $1,400 good IMO.",
    upvotes: 28,
    downvotes: 8,
    isTopAnswer: false,
    isOwnerVerified: false,
    helpfulCount: 15,
    createdAt: "2026-02-22",
    replies: [
      {
        id: "comment-3-1",
        threadId: "thread-roborock-worth-it",
        parentId: "comment-3",
        authorId: "user-sarah-k",
        body: "Fair points, but I'd push back on the mopping — no robot vacuum replaces manual mopping for stubborn stains. They're maintenance tools, not deep cleaners. You can also disable all notifications in the app settings. Different expectations I think.",
        upvotes: 41,
        downvotes: 2,
        isTopAnswer: false,
        isOwnerVerified: true,
        helpfulCount: 22,
        createdAt: "2026-02-23",
      },
    ],
  },

  // Comments on "Best espresso machine for a complete beginner under $500?"
  {
    id: "comment-4",
    threadId: "thread-beginner-espresso",
    authorId: "user-marcus-t",
    body: "Go with the Bambino, no contest. Here's why:\n\n1. It heats up in 3 seconds vs 30+ for the Dedica\n2. The steam wand is significantly better — produces real microfoam\n3. The 54mm portafilter is more forgiving than the Dedica's pressurized basket\n4. Build quality is noticeably better\n\nThe Dedica looks nicer on the counter but the Bambino makes better coffee. Coming from drip, you'll be blown away by either one, but the Bambino will grow with you as your skills improve.",
    upvotes: 67,
    downvotes: 1,
    isTopAnswer: true,
    isOwnerVerified: true,
    helpfulCount: 58,
    createdAt: "2026-02-22",
    replies: [
      {
        id: "comment-4-1",
        threadId: "thread-beginner-espresso",
        parentId: "comment-4",
        authorId: "user-nina-c",
        body: "Thank you! Just ordered the Bambino. Any grinder recommendations to pair with it?",
        upvotes: 8,
        downvotes: 0,
        isTopAnswer: false,
        isOwnerVerified: false,
        helpfulCount: 2,
        createdAt: "2026-02-23",
      },
      {
        id: "comment-4-2",
        threadId: "thread-beginner-espresso",
        parentId: "comment-4",
        authorId: "user-james-b",
        body: "For the Bambino, get the Baratza Encore ESP or the 1Zpresso JX-Pro manual grinder. Both are under $200 and grind fine enough for espresso. The 1Zpresso is better value but manual. Don't cheap out on the grinder — it matters more than the machine.",
        upvotes: 52,
        downvotes: 0,
        isTopAnswer: false,
        isOwnerVerified: true,
        helpfulCount: 44,
        createdAt: "2026-02-23",
      },
    ],
  },

  // Comments on "Warning: Cosori Pro basket coating started peeling"
  {
    id: "comment-5",
    threadId: "thread-cosori-coating-peeling",
    authorId: "user-jessica-l",
    body: "Same issue here after 8 months. I switched to using parchment paper liners for everything and the second replacement basket has held up much better. Not ideal since you lose some air circulation, but it's a workaround. I've also heard the Cosori stainless steel basket (sold separately) doesn't have this issue but it's $30.",
    upvotes: 42,
    downvotes: 0,
    isTopAnswer: false,
    isOwnerVerified: true,
    helpfulCount: 36,
    createdAt: "2026-01-16",
    replies: [],
  },
  {
    id: "comment-6",
    threadId: "thread-cosori-coating-peeling",
    authorId: "user-james-b",
    body: "Professional perspective: This is unfortunately common with PTFE coatings at high temperatures. If you're using the air fryer above 400°F regularly, the coating degrades faster. The peeling itself isn't a major health concern according to most studies (PTFE is inert if ingested), but I'd still recommend the stainless basket or silicone liners. For what it's worth, I've tested 6 air fryer brands in my restaurant and every non-stick coating shows wear after heavy use.",
    upvotes: 78,
    downvotes: 3,
    isTopAnswer: true,
    isOwnerVerified: true,
    helpfulCount: 65,
    createdAt: "2026-01-17",
    replies: [
      {
        id: "comment-6-1",
        threadId: "thread-cosori-coating-peeling",
        parentId: "comment-6",
        authorId: "user-emma-w",
        body: "Thank you for the professional insight. I've been really worried about the health aspect. I'll order the stainless basket. Appreciate you clarifying that!",
        upvotes: 15,
        downvotes: 0,
        isTopAnswer: false,
        isOwnerVerified: true,
        helpfulCount: 4,
        createdAt: "2026-01-18",
      },
    ],
  },

  // Comments on "Purple 4 regret" thread
  {
    id: "comment-7",
    threadId: "thread-purple-regret",
    authorId: "user-rachel-p",
    body: "Sleep researcher here. A few things:\n\n1. **Break-in period:** The Purple GelFlex Grid typically needs 30-45 days to fully break in, but at day 60 you're past that\n2. **Side sleeper + firm mattress = pressure points.** This is physics, not a defect. The Purple 4 has the most grid layers but it's still firmer than traditional memory foam\n3. **Topper option:** A 2-inch medium-soft memory foam topper will add pressure relief without completely blocking the grid's cooling. You'll lose maybe 20% of the temperature benefit but gain a lot of comfort\n4. **Saatva comparison:** The Saatva Classic Luxury Firm would be better for a side sleeper. It has more give at the shoulder zone\n\nHonest recommendation: If you're still uncomfortable at day 60, the mattress probably isn't right for your body type and sleep position. The topper is worth trying before returning since you lose nothing, but don't force yourself to adjust to something that causes pain.",
    upvotes: 124,
    downvotes: 1,
    isTopAnswer: true,
    isOwnerVerified: true,
    helpfulCount: 98,
    createdAt: "2026-02-11",
    replies: [
      {
        id: "comment-7-1",
        threadId: "thread-purple-regret",
        parentId: "comment-7",
        authorId: "user-tom-h",
        body: "This is incredibly helpful, thank you. Going to try the topper route first. Do you have a specific topper recommendation that works with the Purple Grid?",
        upvotes: 18,
        downvotes: 0,
        isTopAnswer: false,
        isOwnerVerified: true,
        helpfulCount: 5,
        createdAt: "2026-02-12",
      },
      {
        id: "comment-7-2",
        threadId: "thread-purple-regret",
        parentId: "comment-7",
        authorId: "user-rachel-p",
        body: "The Tempur-Adapt 3\" topper works well with the Purple. Another option is the Viscosoft Active Cooling topper — it has gel infusion so you keep more of the cooling benefit. Stay away from thick (4\"+) toppers as they'll completely mask the grid and you might as well have a different mattress at that point.",
        upvotes: 56,
        downvotes: 0,
        isTopAnswer: false,
        isOwnerVerified: true,
        helpfulCount: 42,
        createdAt: "2026-02-12",
      },
    ],
  },

  // Comments on "AirPods Pro 2 6-month update"
  {
    id: "comment-8",
    threadId: "thread-airpods-pro-2-update",
    authorId: "user-david-r",
    body: "Great update. I'm at 4 months with mine and noticed the same battery degradation — down to about 5 hours from 6. Apple told me this is \"within normal parameters\" which is frustrating for $250 earbuds. Have you tried the Hearing Test feature? It's surprisingly accurate and makes the spatial audio calibration much better.",
    upvotes: 34,
    downvotes: 1,
    isTopAnswer: false,
    isOwnerVerified: true,
    helpfulCount: 20,
    createdAt: "2026-02-02",
    replies: [],
  },
  {
    id: "comment-9",
    threadId: "thread-airpods-pro-2-update",
    authorId: "user-alex-m",
    body: "Worth adding: I replaced the ear tips with Comply foam tips and the ANC improved noticeably. The seal is better than silicone for most ear shapes. It also helped with the fit during workouts. About $15 for a pack — highly recommended upgrade.",
    upvotes: 67,
    downvotes: 2,
    isTopAnswer: false,
    isOwnerVerified: true,
    helpfulCount: 55,
    createdAt: "2026-02-05",
    replies: [],
  },

  // Comments on Nectar off-gassing
  {
    id: "comment-10",
    threadId: "thread-nectar-off-gassing",
    authorId: "user-rachel-p",
    body: "The off-gassing is primarily VOCs (volatile organic compounds) from the foam manufacturing process. In my research, Nectar mattresses typically take 3-7 days for the smell to become unnoticeable, though trace amounts can persist for 2-3 weeks.\n\nWith a newborn, I'd recommend:\n1. Air it out in a separate room for at least 5-7 days with windows open\n2. Use a fan to increase air circulation\n3. Don't sleep on it until you can't detect the smell\n4. A mattress protector will help seal in any residual odor\n\nThe VOC levels in CertiPUR-US certified foams (which Nectar uses) are well below harmful thresholds, but with a newborn, extra caution is reasonable.",
    upvotes: 92,
    downvotes: 0,
    isTopAnswer: true,
    isOwnerVerified: true,
    helpfulCount: 78,
    createdAt: "2026-03-05",
    replies: [
      {
        id: "comment-10-1",
        threadId: "thread-nectar-off-gassing",
        parentId: "comment-10",
        authorId: "user-jessica-l",
        body: "Thank you so much for the detailed response. The CertiPUR-US certification puts my mind at ease. I'll keep airing it out for a full week before moving it to the bedroom.",
        upvotes: 14,
        downvotes: 0,
        isTopAnswer: false,
        isOwnerVerified: true,
        helpfulCount: 3,
        createdAt: "2026-03-06",
      },
    ],
  },
];

// Helper functions
export function getDiscussionById(id: string): DiscussionThread | undefined {
  return discussions.find((d) => d.id === id);
}

export function getDiscussionsByProduct(productSlug: string): DiscussionThread[] {
  return discussions.filter((d) => d.productSlug === productSlug);
}

export function getDiscussionsByCategory(categorySlug: string): DiscussionThread[] {
  return discussions.filter((d) => d.categorySlug === categorySlug);
}

export function getDiscussionsByUser(userId: string): DiscussionThread[] {
  return discussions.filter((d) => d.authorId === userId);
}

export function getCommentsByThread(threadId: string): Comment[] {
  return comments.filter((c) => c.threadId === threadId && !c.parentId);
}

export function getCommentsByUser(userId: string): Comment[] {
  const userComments: Comment[] = [];
  function collectComments(commentList: Comment[]) {
    for (const c of commentList) {
      if (c.authorId === userId) userComments.push(c);
      if (c.replies) collectComments(c.replies);
    }
  }
  collectComments(comments);
  return userComments;
}

export function getTrendingDiscussions(limit: number = 5): DiscussionThread[] {
  return [...discussions]
    .sort((a, b) => {
      const scoreA = a.upvotes * 2 + a.commentCount * 3 - a.downvotes;
      const scoreB = b.upvotes * 2 + b.commentCount * 3 - b.downvotes;
      return scoreB - scoreA;
    })
    .slice(0, limit);
}

export function getRecentDiscussions(limit: number = 5): DiscussionThread[] {
  return [...discussions]
    .sort((a, b) => new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime())
    .slice(0, limit);
}

export function getPinnedDiscussions(): DiscussionThread[] {
  return discussions.filter((d) => d.isPinned);
}

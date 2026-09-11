import { useEffect, useMemo, useRef, useState } from "react";

type Resource = {
  name: string;
  category: string;
  city: string;
  status: string;
  price: string;
  match: number;
  type: "Medical" | "Research";
};

type City = {
  name: string;
  x: number;
  y: number;
};

const resources: Resource[] = [
  {
    name: "3T MRI Scanner",
    category: "Medical Imaging",
    city: "Chennai",
    status: "Available tomorrow",
    price: "₹X / hour",
    match: 96,
    type: "Medical",
  },
  {
    name: "Scanning Electron Microscope",
    category: "Research Equipment",
    city: "Delhi",
    status: "Available tomorrow",
    price: "₹X / hour",
    match: 94,
    type: "Research",
  },
  {
    name: "DNA Sequencer",
    category: "Molecular Biology",
    city: "Bengaluru",
    status: "Available today",
    price: "₹X / hour",
    match: 91,
    type: "Research",
  },
  {
    name: "PCR Machine",
    category: "Laboratory",
    city: "Hyderabad",
    status: "Available today",
    price: "₹X / hour",
    match: 88,
    type: "Medical",
  },
  {
    name: "Mass Spectrometer",
    category: "Analytical",
    city: "Mumbai",
    status: "Available tomorrow",
    price: "₹X / hour",
    match: 87,
    type: "Research",
  },
  {
    name: "CT Scanner",
    category: "Medical Imaging",
    city: "Kolkata",
    status: "Available today",
    price: "₹X / hour",
    match: 85,
    type: "Medical",
  },
];

const stats = [
  {
    value: 30000,
    suffix: "+",
    label: "Scientific instruments",
  },
  {
    value: 3800,
    suffix: "+",
    label: "Research institutions",
  },
  {
    value: 17.15,
    suffix: "%",
    label: "Equipment underutilized",
  },
  {
    value: 12.9,
    suffix: " Cr",
    label: "Idle medical equipment",
  },
];

const cities: City[] = [
  { name: "New Delhi", x: 48, y: 29 },
  { name: "Jaipur", x: 39, y: 36 },
  { name: "Mumbai", x: 29, y: 61 },
  { name: "Bengaluru", x: 41, y: 80 },
  { name: "Chennai", x: 54, y: 78 },
  { name: "Kolkata", x: 73, y: 53 },
  { name: "Hyderabad", x: 48, y: 62 },
];

const navItems = [
  ["How It Works", "how-it-works"],
  ["Resources", "resources"],
  ["Institutions", "institutions"],
  ["About", "about"],
];

function Icon({
  name,
  size = 18,
}: {
  name: string;
  size?: number;
}) {
  const paths: Record<string, string> = {
    arrow: "M4 12h15m-6-6 6 6-6 6",
    check: "m5 12 4 4L19 6",
    search:
      "m21 21-4.35-4.35M10.8 18a7.2 7.2 0 1 1 0-14.4 7.2 7.2 0 0 1 0 14.4Z",
    plus: "M12 5v14M5 12h14",
    pin: "M12 21s7-6.1 7-12a7 7 0 1 0-14 0c0 5.9 7 12 7 12Z M12 11.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
    lock: "M7 10V7a5 5 0 0 1 10 0v3M6 10h12v10H6z",
    bolt: "m13 2-9 12h7l-1 8 9-12h-7l1-8Z",
    menu: "M4 7h16M4 12h16M4 17h16",
    close: "m6 6 12 12M18 6 6 18",
    external: "M14 5h5v5M19 5l-8 8M18 13v5H5V5h5",
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name] ?? paths.arrow} />
    </svg>
  );
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [selectedCity, setSelectedCity] = useState("Chennai");
  const [matchScore, setMatchScore] = useState(94);
  const [scrolled, setScrolled] = useState(false);
  const [counts, setCounts] = useState([0, 0, 0, 0]);

  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }

      if (event.key === "ArrowRight") {
        setActiveStep((step) => Math.min(4, step + 1));
      }

      if (event.key === "ArrowLeft") {
        setActiveStep((step) => Math.max(1, step - 1));
      }
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const node = statsRef.current;

    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        const start = performance.now();

        const animate = (now: number) => {
          const progress = Math.min((now - start) / 1200, 1);
          const eased = 1 - Math.pow(1 - progress, 3);

          setCounts(stats.map((stat) => stat.value * eased));

          if (progress < 1) {
            requestAnimationFrame(animate);
          }
        };

        requestAnimationFrame(animate);
        observer.disconnect();
      },
      {
        threshold: 0.25,
      }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  const visibleResources = useMemo(() => {
    return resources.filter((resource) => {
      const searchableText =
        `${resource.name} ${resource.category} ${resource.city} ${resource.type}`.toLowerCase();

      const queryMatch = searchableText.includes(query.toLowerCase());

      const filterMatch =
        filter === "All" ||
        resource.type === filter ||
        resource.category.toLowerCase().includes(filter.toLowerCase()) ||
        (filter === "Available Now" &&
          resource.status.toLowerCase().includes("today"));

      return queryMatch && filterMatch;
    });
  }, [query, filter]);

  const scrollTo = (id: string) => {
    document
      .getElementById(id)
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

    setMenuOpen(false);
  };

  const formatStat = (index: number) => {
    if (index === 0 || index === 1) {
      return Math.round(counts[index]).toLocaleString();
    }

    if (index === 2) {
      return counts[index].toFixed(2);
    }

    return counts[index].toFixed(1);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f8f8f6] text-[#111]">
      {/* NAVBAR */}
      <header
        className={`fixed left-1/2 top-3 z-50 flex w-[calc(100%-24px)] max-w-7xl -translate-x-1/2 items-center justify-between rounded-2xl border px-4 py-3 transition-all duration-300 md:px-6 ${
          scrolled
            ? "border-black/10 bg-white/90 shadow-lg shadow-black/5 backdrop-blur-xl"
            : "border-black/10 bg-white/70 backdrop-blur-md"
        }`}
      >
        <button
          onClick={() => scrollTo("top")}
          className="flex items-center gap-2 font-semibold tracking-tight"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-black">
            <span className="flex gap-[2px]">
              <span className="h-3 w-[2px] rounded-full bg-white" />
              <span className="h-5 w-[2px] rounded-full bg-white" />
              <span className="h-3 w-[2px] rounded-full bg-white" />
            </span>
          </span>

          ResourceLink
        </button>

        {/* DESKTOP NAV */}
        <nav className="hidden items-center gap-7 md:flex">
          {navItems.map(([label, id]) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className="text-xs text-black/55 transition hover:text-black"
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <button
            onClick={() => scrollTo("about")}
            className="rounded-xl px-4 py-2 text-xs font-medium text-black/60 transition hover:bg-black/5 hover:text-black"
          >
            Sign In
          </button>

          <button
            onClick={() => scrollTo("institutions")}
            className="flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-xs font-medium text-white transition hover:-translate-y-0.5"
          >
            Get Started
            <Icon name="arrow" size={14} />
          </button>
        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          onClick={() => setMenuOpen((value) => !value)}
          className="rounded-xl border border-black/10 bg-white p-2 md:hidden"
          aria-label="Toggle navigation"
        >
          <Icon name={menuOpen ? "close" : "menu"} />
        </button>

        {/* MOBILE NAV */}
        {menuOpen && (
          <div className="absolute left-0 right-0 top-[calc(100%+8px)] rounded-2xl border border-black/10 bg-white p-3 shadow-xl md:hidden">
            {navItems.map(([label, id]) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className="block w-full rounded-xl px-3 py-3 text-left text-sm text-black/65 hover:bg-black/5"
              >
                {label}
              </button>
            ))}

            <div className="mt-2 flex gap-2 border-t border-black/10 pt-3">
              <button
                onClick={() => scrollTo("about")}
                className="flex-1 rounded-xl border border-black/10 px-3 py-3 text-xs"
              >
                Sign In
              </button>

              <button
                onClick={() => scrollTo("institutions")}
                className="flex-1 rounded-xl bg-black px-3 py-3 text-xs text-white"
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </header>

      <main id="top">
        {/* HERO */}
        <section className="mx-auto grid min-h-screen max-w-7xl items-center gap-12 px-5 pb-16 pt-32 md:grid-cols-2 md:px-8 md:pt-28">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1.5 text-[9px] font-semibold tracking-[0.16em] text-black/50">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-black" />
              VERIFIED INSTITUTIONAL RESOURCE NETWORK
            </div>

            <h1 className="max-w-2xl text-5xl font-medium leading-[0.92] tracking-[-0.06em] sm:text-6xl md:text-7xl lg:text-[82px]">
              Resources exist.
              <br />
              <span className="text-black/30">Access doesn't.</span>
            </h1>

            <p className="mt-7 max-w-xl text-sm leading-7 text-black/55 md:text-base">
              ResourceLink connects verified institutions with underutilized
              equipment, specialized facilities and existing infrastructure —
              so institutions can access what they need without having to own
              it.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => scrollTo("resources")}
                className="flex items-center justify-center gap-2 rounded-xl bg-black px-5 py-3.5 text-xs font-medium text-white transition hover:-translate-y-1"
              >
                Find a Resource
                <Icon name="arrow" size={15} />
              </button>

              <button
                onClick={() => scrollTo("institutions")}
                className="rounded-xl border border-black/10 bg-white px-5 py-3.5 text-xs font-medium transition hover:-translate-y-1 hover:border-black/30"
              >
                List Your Resource
              </button>
            </div>

            <div className="mt-6 flex items-center gap-2 text-[10px] text-black/40">
              <Icon name="lock" size={13} />
              Institutional access · Verified resources · Transparent booking
            </div>
          </div>

          {/* NETWORK VISUAL */}
          <div className="relative h-[470px] overflow-hidden rounded-3xl border border-black/10 bg-white">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:30px_30px]" />

            <svg
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 600 500"
              preserveAspectRatio="none"
            >
              <path
                d="M100 110 C210 110 250 250 300 250 C350 250 390 110 500 110"
                fill="none"
                stroke="#111"
                strokeOpacity=".15"
              />

              <path
                d="M100 390 C210 390 250 270 300 250 C350 230 390 390 500 390"
                fill="none"
                stroke="#111"
                strokeOpacity=".15"
              />

              <circle cx="300" cy="250" r="7" fill="#111" />

              <circle
                cx="300"
                cy="250"
                r="35"
                fill="none"
                stroke="#111"
                strokeOpacity=".08"
              />

              <circle
                cx="300"
                cy="250"
                r="65"
                fill="none"
                stroke="#111"
                strokeOpacity=".05"
              />
            </svg>

            <div className="absolute left-1/2 top-1/2 flex h-32 w-32 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full bg-black text-center text-white shadow-2xl">
              <span className="text-xl font-bold">RL</span>
              <strong className="mt-1 text-[10px]">ResourceLink</strong>
              <small className="mt-1 text-[7px] text-white/50">
                VERIFIED ACCESS
              </small>
            </div>

            {[
              {
                title: "Research Institute",
                subtitle: "Needs equipment",
                position: "left-5 top-10",
              },
              {
                title: "Medical Institution",
                subtitle: "Has capacity",
                position: "right-5 top-10",
              },
              {
                title: "Diagnostic Centre",
                subtitle: "Specialized facility",
                position: "left-5 bottom-10",
              },
              {
                title: "University Lab",
                subtitle: "Equipment provider",
                position: "right-5 bottom-10",
              },
            ].map((node) => (
              <div
                key={node.title}
                className={`absolute ${node.position} rounded-xl border border-black/10 bg-white/90 p-3 shadow-lg backdrop-blur`}
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-black text-[10px] font-bold text-white">
                    {node.title.charAt(0)}
                  </span>

                  <div>
                    <strong className="block text-[9px]">
                      {node.title}
                    </strong>
                    <small className="text-[8px] text-black/40">
                      {node.subtitle}
                    </small>
                  </div>
                </div>
              </div>
            ))}

            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-3 text-[7px] tracking-[0.18em] text-black/30">
              <span>DEMAND</span>
              <span className="h-px w-8 bg-black/15" />
              <span>ACCESS LAYER</span>
              <span className="h-px w-8 bg-black/15" />
              <span>SUPPLY</span>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section
          ref={statsRef}
          className="border-y border-black/10 bg-white"
        >
          <div className="mx-auto grid max-w-7xl grid-cols-2 md:grid-cols-4">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="border-r border-black/10 px-5 py-9 last:border-r-0 md:px-8"
              >
                <div className="text-3xl font-medium tracking-tight md:text-4xl">
                  {formatStat(index)}
                  {stat.suffix}
                </div>

                <div className="mt-2 text-[10px] leading-4 text-black/45">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-black/5 py-3 text-center text-[8px] text-black/30">
            Selected figures shown for context · cited study and audit
            references
          </div>
        </section>

        {/* PROBLEM */}
        <section id="about" className="mx-auto max-w-7xl px-5 py-28 md:px-8">
          <div className="grid gap-10 md:grid-cols-[80px_1fr]">
            <span className="text-xs font-medium text-black/30">01</span>

            <div>
              <div className="text-[9px] font-semibold tracking-[0.2em] text-black/40">
                THE ACCESS GAP
              </div>

              <h2 className="mt-5 max-w-4xl text-4xl font-medium leading-tight tracking-[-0.04em] md:text-6xl">
                We don't always need more infrastructure.
                <br />
                <span className="text-black/30">
                  Sometimes, we need better access to what already exists.
                </span>
              </h2>

              <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-black/10 bg-black/10 md:grid-cols-3">
                {[
                  {
                    number: "01",
                    title: "Expensive ownership",
                    text: "Institutions invest heavily in equipment that may remain idle for significant periods.",
                  },
                  {
                    number: "02",
                    title: "Poor visibility",
                    text: "Resources exist across institutions, but there is no simple way to discover who has what.",
                  },
                  {
                    number: "03",
                    title: "Fragmented access",
                    text: "A researcher or medical institution may need a resource that already exists elsewhere nearby.",
                  },
                ].map((item) => (
                  <article
                    key={item.number}
                    className="min-h-[240px] bg-white p-7"
                  >
                    <span className="text-[9px] text-black/30">
                      {item.number}
                    </span>

                    <h3 className="mt-16 text-lg font-medium">
                      {item.title}
                    </h3>

                    <p className="mt-3 text-xs leading-6 text-black/45">
                      {item.text}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SOLUTION */}
        <section className="border-y border-black/10 bg-[#111] py-28 text-white">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <div className="grid gap-12 md:grid-cols-2 md:items-end">
              <div>
                <div className="text-[9px] font-semibold tracking-[0.2em] text-white/40">
                  THE SOLUTION
                </div>

                <h2 className="mt-5 text-5xl font-medium leading-[.95] tracking-[-0.05em] md:text-7xl">
                  Share access.
                  <br />
                  <span className="text-white/30">Not assets.</span>
                </h2>
              </div>

              <p className="max-w-xl text-sm leading-7 text-white/50">
                ResourceLink creates a verified network where institutions can
                discover, request and temporarily access resources from other
                institutions instead of purchasing duplicate infrastructure.
              </p>
            </div>

            <div className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 md:grid-cols-4">
              {[
                ["01", "Discover", "Find equipment and facilities."],
                ["02", "Match", "Match needs with available capacity."],
                ["03", "Request", "Send a verified access request."],
                ["04", "Access", "Pay and unlock access securely."],
              ].map(([number, title, text]) => (
                <div key={number} className="bg-[#111] p-6">
                  <span className="text-[9px] text-white/30">{number}</span>

                  <h3 className="mt-12 text-lg">{title}</h3>

                  <p className="mt-2 text-xs leading-5 text-white/40">
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section
          id="how-it-works"
          className="mx-auto max-w-7xl px-5 py-28 md:px-8"
        >
          <div className="grid gap-14 md:grid-cols-[.8fr_1.2fr]">
            <div>
              <span className="text-xs text-black/30">03</span>

              <div className="mt-4 text-[9px] font-semibold tracking-[0.2em] text-black/40">
                HOW IT WORKS
              </div>

              <h2 className="mt-5 text-4xl font-medium tracking-[-0.04em] md:text-6xl">
                From need
                <br />
                to access.
              </h2>

              <p className="mt-6 max-w-sm text-sm leading-6 text-black/45">
                A simple flow designed around institutional verification,
                transparent resource availability and secure access.
              </p>
            </div>

            <div className="space-y-2">
              {[
                {
                  number: "01",
                  title: "Tell us what you need",
                  text: "Search for equipment, facilities or specialized capabilities.",
                },
                {
                  number: "02",
                  title: "Get matched",
                  text: "ResourceLink identifies suitable verified resources.",
                },
                {
                  number: "03",
                  title: "Request access",
                  text: "Submit a request with your institution and intended usage.",
                },
                {
                  number: "04",
                  title: "Access securely",
                  text: "Complete payment and receive verified booking confirmation.",
                },
              ].map((step, index) => (
                <button
                  key={step.number}
                  onClick={() => setActiveStep(index + 1)}
                  className={`w-full rounded-2xl border p-5 text-left transition ${
                    activeStep === index + 1
                      ? "border-black bg-black text-white"
                      : "border-black/10 bg-white hover:border-black/25"
                  }`}
                >
                  <div className="flex items-start gap-5">
                    <span className="text-[10px] opacity-40">
                      {step.number}
                    </span>

                    <div className="flex-1">
                      <h3 className="text-sm font-medium">
                        {step.title}
                      </h3>

                      {activeStep === index + 1 && (
                        <p className="mt-2 max-w-lg text-xs leading-5 text-white/50">
                          {step.text}
                        </p>
                      )}
                    </div>

                    <Icon
                      name={activeStep === index + 1 ? "check" : "plus"}
                      size={15}
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* RESOURCES */}
        <section
          id="resources"
          className="border-y border-black/10 bg-white py-28"
        >
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <span className="text-xs text-black/30">04</span>

                <div className="mt-4 text-[9px] font-semibold tracking-[0.2em] text-black/40">
                  RESOURCE DISCOVERY
                </div>

                <h2 className="mt-4 text-4xl font-medium tracking-[-0.04em] md:text-6xl">
                  Find what
                  <br />
                  already exists.
                </h2>
              </div>

              <p className="max-w-sm text-xs leading-6 text-black/45">
                Search across verified medical and research resources.
              </p>
            </div>

            {/* SEARCH */}
            <div className="mt-12 flex flex-col gap-3 md:flex-row">
              <div className="relative flex-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-black/35">
                  <Icon name="search" size={16} />
                </span>

                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search MRI, microscope, sequencer..."
                  className="w-full rounded-xl border border-black/10 bg-[#f8f8f6] py-3.5 pl-11 pr-4 text-xs outline-none transition focus:border-black/30"
                />
              </div>

              <div className="flex gap-2 overflow-x-auto">
                {["All", "Medical", "Research", "Available Now"].map(
                  (item) => (
                    <button
                      key={item}
                      onClick={() => setFilter(item)}
                      className={`whitespace-nowrap rounded-xl border px-4 py-3 text-[10px] transition ${
                        filter === item
                          ? "border-black bg-black text-white"
                          : "border-black/10 bg-white hover:border-black/30"
                      }`}
                    >
                      {item}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* RESOURCE CARDS */}
            <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {visibleResources.map((resource) => (
                <article
                  key={resource.name}
                  className="group rounded-2xl border border-black/10 bg-[#f8f8f6] p-5 transition hover:-translate-y-1 hover:border-black/25"
                >
                  <div className="flex items-start justify-between">
                    <span className="rounded-full border border-black/10 bg-white px-2 py-1 text-[8px] text-black/50">
                      {resource.type}
                    </span>

                    <span className="text-[9px] font-medium">
                      {resource.match}% match
                    </span>
                  </div>

                  <h3 className="mt-12 text-lg font-medium tracking-tight">
                    {resource.name}
                  </h3>

                  <p className="mt-2 text-[10px] text-black/40">
                    {resource.category}
                  </p>

                  <div className="mt-5 flex items-center justify-between border-t border-black/10 pt-4">
                    <div className="flex items-center gap-1.5 text-[9px] text-black/50">
                      <Icon name="pin" size={12} />
                      {resource.city}
                    </div>

                    <span className="text-[9px] text-black/40">
                      {resource.status}
                    </span>
                  </div>

                  <button className="mt-4 flex w-full items-center justify-between rounded-xl bg-black px-3 py-3 text-[9px] text-white opacity-80 transition group-hover:opacity-100">
                    View resource
                    <Icon name="arrow" size={12} />
                  </button>
                </article>
              ))}
            </div>

            {visibleResources.length === 0 && (
              <div className="mt-6 rounded-2xl border border-dashed border-black/15 bg-[#f8f8f6] p-12 text-center">
                <p className="text-sm text-black/40">
                  No resources match your search.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* SMART MATCHING */}
        <section className="mx-auto max-w-7xl px-5 py-28 md:px-8">
          <div className="grid gap-14 md:grid-cols-2 md:items-center">
            <div>
              <span className="text-xs text-black/30">05</span>

              <div className="mt-4 text-[9px] font-semibold tracking-[0.2em] text-black/40">
                SMART MATCHING
              </div>

              <h2 className="mt-5 text-4xl font-medium tracking-[-0.04em] md:text-6xl">
                The right resource.
                <br />
                <span className="text-black/30">Not just a resource.</span>
              </h2>

              <p className="mt-6 max-w-lg text-sm leading-7 text-black/45">
                ResourceLink considers location, resource type, availability
                and institutional requirements to surface the most suitable
                options.
              </p>

              <button
                onClick={() =>
                  setMatchScore((score) => (score >= 98 ? 88 : score + 2))
                }
                className="mt-7 rounded-xl bg-black px-5 py-3 text-xs text-white transition hover:-translate-y-1"
              >
                Run matching demo
              </button>
            </div>

            <div className="rounded-3xl border border-black/10 bg-white p-7 shadow-xl shadow-black/5">
              <div className="flex items-center justify-between border-b border-black/10 pb-5">
                <div>
                  <span className="text-[9px] text-black/35">
                    REQUEST
                  </span>

                  <h3 className="mt-2 text-sm font-medium">
                    Need an MRI scanner
                  </h3>
                </div>

                <span className="rounded-full bg-black px-3 py-1 text-[8px] text-white">
                  MATCHING
                </span>
              </div>

              <div className="mt-8 flex items-center gap-7">
                <div
                  className="relative flex h-36 w-36 shrink-0 items-center justify-center rounded-full border-[10px] border-black/5"
                  style={{
                    background: `conic-gradient(#111 ${
                      matchScore * 3.6
                    }deg, #eee 0deg)`,
                  }}
                >
                  <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-white">
                    <strong className="text-3xl font-medium">
                      {matchScore}%
                    </strong>

                    <span className="text-[8px] text-black/40">
                      BEST MATCH
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[8px] uppercase tracking-wider text-black/35">
                    Recommended
                  </span>

                  <h3 className="mt-2 text-lg font-medium">
                    3T MRI Scanner
                  </h3>

                  <p className="mt-2 text-[10px] leading-5 text-black/40">
                    Chennai · Available tomorrow
                  </p>

                  <div className="mt-4 flex items-center gap-2 text-[9px]">
                    <span className="h-1.5 w-1.5 rounded-full bg-black" />
                    Verified institution
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TWO SIDED VALUE */}
        <section
          id="institutions"
          className="border-y border-black/10 bg-[#f0f0ee] py-28"
        >
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <div className="text-center">
              <div className="text-[9px] font-semibold tracking-[0.2em] text-black/40">
                TWO-SIDED NETWORK
              </div>

              <h2 className="mx-auto mt-5 max-w-3xl text-4xl font-medium tracking-[-0.04em] md:text-6xl">
                One network.
                <br />
                <span className="text-black/30">Two powerful outcomes.</span>
              </h2>
            </div>

            <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-black/10 bg-black/10 md:grid-cols-2">
              <div className="bg-white p-8 md:p-12">
                <span className="text-[9px] tracking-wider text-black/30">
                  FOR RESOURCE SEEKERS
                </span>

                <h3 className="mt-8 text-2xl font-medium">
                  Access without ownership.
                </h3>

                <ul className="mt-7 space-y-4">
                  {[
                    "Avoid expensive infrastructure purchases",
                    "Find specialized resources faster",
                    "Access verified institutional facilities",
                    "Pay only for the access you need",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex gap-3 text-xs text-black/50"
                    >
                      <span className="mt-1">
                        <Icon name="check" size={13} />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-[#111] p-8 text-white md:p-12">
                <span className="text-[9px] tracking-wider text-white/30">
                  FOR RESOURCE PROVIDERS
                </span>

                <h3 className="mt-8 text-2xl font-medium">
                  Monetize idle capacity.
                </h3>

                <ul className="mt-7 space-y-4">
                  {[
                    "Increase utilization of existing assets",
                    "Generate revenue from idle capacity",
                    "Reach verified institutions",
                    "Create new cross-institution partnerships",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex gap-3 text-xs text-white/50"
                    >
                      <span className="mt-1">
                        <Icon name="check" size={13} />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* X402 */}
        <section className="mx-auto max-w-7xl px-5 py-28 md:px-8">
          <div className="rounded-3xl bg-black p-8 text-white md:p-14">
            <div className="grid gap-12 md:grid-cols-2 md:items-center">
              <div>
                <div className="flex items-center gap-2 text-[9px] font-semibold tracking-[0.2em] text-white/40">
                  <Icon name="bolt" size={13} />
                  SECURE ACCESS PAYMENT
                </div>

                <h2 className="mt-5 text-4xl font-medium tracking-[-0.04em] md:text-6xl">
                  Access gets paid.
                  <br />
                  <span className="text-white/30">
                    Instantly and transparently.
                  </span>
                </h2>

                <p className="mt-6 max-w-lg text-sm leading-7 text-white/45">
                  ResourceLink uses an x402 payment flow on Algorand Testnet
                  to demonstrate pay-per-use resource access and transaction
                  verification.
                </p>
              </div>

              <div className="space-y-2">
                {[
                  "Request Access",
                  "Payment Required",
                  "x402 Payment",
                  "Algorand Testnet",
                  "Transaction Verified",
                  "Access Confirmed",
                ].map((step, index) => (
                  <div
                    key={step}
                    className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[.03] p-4"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 text-[9px] text-white/50">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <span className="text-xs text-white/70">{step}</span>

                    {index < 5 && (
                      <span className="ml-auto text-white/20">↓</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* INDIA MAP */}
        <section className="border-y border-black/10 bg-white py-28">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <div className="grid gap-10 md:grid-cols-[1.4fr_.6fr]">
              <div className="relative min-h-[480px] overflow-hidden rounded-3xl border border-black/10 bg-[#f3f3f1]">
                <div className="absolute inset-0 bg-[radial-gradient(#00000012_1px,transparent_1px)] bg-[size:18px_18px]" />

                {/* Simplified India visual */}
                <div className="absolute left-[28%] top-[9%] h-[80%] w-[48%] rotate-[8deg] rounded-[46%_35%_44%_48%] border border-black/20 bg-black/[.025] [clip-path:polygon(35%_0,67%_4%,85%_20%,91%_44%,76%_63%,68%_84%,51%_100%,40%_82%,25%_75%,15%_56%,3%_44%,10%_22%)]" />

                {cities.map((city) => (
                  <button
                    key={city.name}
                    onClick={() => setSelectedCity(city.name)}
                    className="absolute -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: `${city.x}%`,
                      top: `${city.y}%`,
                    }}
                    aria-label={`Select ${city.name}`}
                  >
                    <span
                      className={`block rounded-full border-4 border-[#f3f3f1] transition-all ${
                        selectedCity === city.name
                          ? "h-5 w-5 bg-black shadow-lg shadow-black/30"
                          : "h-3 w-3 bg-black/50"
                      }`}
                    />

                    {selectedCity === city.name && (
                      <span className="absolute left-1/2 top-7 -translate-x-1/2 whitespace-nowrap rounded-full bg-black px-3 py-1.5 text-[9px] text-white shadow-lg">
                        {city.name}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="flex flex-col justify-center">
                <span className="text-[9px] font-semibold tracking-[0.2em] text-black/40">
                  RESOURCE NETWORK
                </span>

                <h2 className="mt-5 text-4xl font-medium tracking-[-0.04em] md:text-6xl">
                  Connected
                  <br />
                  <span className="text-black/30">across India.</span>
                </h2>

                <p className="mt-6 text-sm leading-7 text-black/45">
                  ResourceLink is designed to connect institutions across
                  cities, turning isolated infrastructure into a distributed
                  access network.
                </p>

                <div className="mt-8 rounded-2xl border border-black/10 bg-[#f8f8f6] p-5">
                  <span className="text-[9px] text-black/35">
                    SELECTED NODE
                  </span>

                  <strong className="mt-2 block text-xl">
                    {selectedCity}
                  </strong>

                  <p className="mt-2 text-[10px] text-black/40">
                    Verified institutional resources available through the
                    network.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TRUST */}
        <section className="mx-auto max-w-7xl px-5 py-28 md:px-8">
          <div className="grid gap-12 md:grid-cols-2">
            <div>
              <span className="text-xs text-black/30">07</span>

              <div className="mt-4 text-[9px] font-semibold tracking-[0.2em] text-black/40">
                TRUST LAYER
              </div>

              <h2 className="mt-5 text-4xl font-medium tracking-[-0.04em] md:text-6xl">
                Built for
                <br />
                <span className="text-black/30">institutions.</span>
              </h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["Verified Institutions", "Access limited to verified organizations."],
                ["Verified Resources", "Resource availability is institution-controlled."],
                ["Transparent Access", "Clear booking and usage information."],
                ["Secure Payments", "Transaction flow designed around verified payment."],
              ].map(([title, text]) => (
                <div
                  key={title}
                  className="rounded-2xl border border-black/10 bg-white p-6"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-black text-white">
                    <Icon name="check" size={15} />
                  </div>

                  <h3 className="mt-8 text-sm font-medium">{title}</h3>

                  <p className="mt-2 text-[10px] leading-5 text-black/40">
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FUTURE */}
        <section className="border-y border-black/10 bg-[#f0f0ee] py-28">
          <div className="mx-auto grid max-w-7xl gap-14 px-5 md:grid-cols-2 md:items-center md:px-8">
            <div>
              <div className="text-[9px] font-semibold tracking-[0.2em] text-black/40">
                FUTURE VISION
              </div>

              <h2 className="mt-5 text-4xl font-medium tracking-[-0.04em] md:text-6xl">
                Infrastructure
                <br />
                <span className="text-black/30">as a network.</span>
              </h2>

              <p className="mt-6 max-w-lg text-sm leading-7 text-black/45">
                Start with medical and research institutions. Expand into
                universities, laboratories, industrial facilities and other
                specialized infrastructure.
              </p>

              <div className="mt-7 flex flex-wrap gap-2">
                {[
                  "Healthcare",
                  "Research",
                  "Universities",
                  "Laboratories",
                  "Industry",
                  "Specialized Facilities",
                ].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-lg border border-black/10 bg-white px-3 py-2 text-[9px] text-black/50"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative flex h-[350px] items-center justify-center">
              <div className="absolute h-32 w-32 rounded-full border border-black/15" />
              <div className="absolute h-56 w-56 rounded-full border border-black/10" />
              <div className="absolute h-80 w-80 rounded-full border border-black/5" />

              {cities.slice(0, 6).map((city, index) => (
                <span
                  key={city.name}
                  className="absolute flex h-7 w-7 items-center justify-center rounded-full border border-black/10 bg-white text-[7px] shadow-sm"
                  style={{
                    transform: `rotate(${index * 60}deg) translateY(-155px) rotate(-${
                      index * 60
                    }deg)`,
                  }}
                >
                  RL
                </span>
              ))}

              <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full bg-black text-lg font-bold text-white shadow-2xl">
                RL
              </div>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="bg-black px-5 py-32 text-center text-white md:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="text-[9px] font-semibold tracking-[0.2em] text-white/30">
              RESOURCE ACCESS, REIMAGINED
            </div>

            <h2 className="mt-6 text-5xl font-medium leading-[.95] tracking-[-0.06em] md:text-7xl lg:text-8xl">
              Don't buy what
              <br />
              <span className="text-white/30">you can access.</span>
            </h2>

            <p className="mx-auto mt-7 max-w-xl text-sm leading-6 text-white/40">
              ResourceLink turns underutilized infrastructure into accessible,
              discoverable institutional capacity.
            </p>

            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                onClick={() => scrollTo("resources")}
                className="flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-xs font-medium text-black transition hover:-translate-y-1"
              >
                Explore Resources
                <Icon name="arrow" size={14} />
              </button>

              <button
                onClick={() => scrollTo("institutions")}
                className="rounded-xl border border-white/15 px-6 py-3.5 text-xs text-white transition hover:bg-white/5"
              >
                Become a Provider
              </button>
            </div>
          </div>

          <div className="mx-auto mt-28 max-w-7xl border-t border-white/10 pt-6">
            <div className="flex flex-col items-center justify-between gap-3 text-[9px] text-white/30 md:flex-row">
              <span className="font-medium text-white/60">
                ResourceLink
              </span>

              <span>Share Access, Not Assets.</span>

              <span>© 2026 ResourceLink</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
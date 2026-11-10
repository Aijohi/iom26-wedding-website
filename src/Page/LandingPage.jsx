import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import "./LandingPage.css";

const WEDDING_DATE = new Date("2026-12-12T13:00:00+01:00");
const MEMORIES_DRIVE_URL = "https://drive.google.com/drive/folders/1OtZWn0l94uiA3zv0uprX22LVrccKKYna";
const MAP_URL = "https://www.google.com/maps/search/?api=1&query=Emi%27s+Event+Center%2C+INEC+Road%2C+Yenagoa%2C+Bayelsa+State";
const CALENDAR_URL = "https://calendar.google.com/calendar/render?action=TEMPLATE&text=Omonzele%20%26%20Ikponmwenosa%27s%20Wedding&dates=20261212T120000Z%2F20261212T180000Z&details=Join%20us%20as%20we%20celebrate%20the%20beginning%20of%20Omonzele%20and%20Ikponmwenosa%27s%20life%20together.&location=Emi%27s%20Event%20Center%2C%20INEC%20Road%2C%20Yenagoa%2C%20Bayelsa%20State";
const MAX_WISH_WORDS = 80;
const MIN_WISH_WORDS = 5;
const GALLERY_PAGE_SIZE = 6;

const galleryImages = [
  { src: "/images/iom26-prewedding-01.jpg", alt: "Omonzele and Ikponmwenosa together" },
  { src: "/images/iom26-prewedding-02.jpg", alt: "The couple sharing a joyful moment" },
  { src: "/images/iom26-prewedding-03.jpg", alt: "A pre-wedding portrait of the couple" },
  { src: "/images/iom26-prewedding-04.jpg", alt: "The couple walking together" },
  { src: "/images/iom26-prewedding-05.jpg", alt: "A quiet moment between the couple" },
  { src: "/images/iom26-prewedding-06.jpg", alt: "The couple smiling together" },
  { src: "/images/iom26-prewedding-07.jpg", alt: "An elegant portrait of the couple" },
  { src: "/images/iom26-prewedding-08.jpg", alt: "The couple sharing an intimate moment" },
  { src: "/images/iom26-prewedding-09.jpg", alt: "A timeless pre-wedding photograph" },
  { src: "/images/iom26-prewedding-10.jpg", alt: "The couple celebrating their love" },
  { src: "/images/iom26-prewedding-11.jpg", alt: "A joyful portrait before forever" },
  { src: "/images/iom26-prewedding-12.jpg", alt: "Omonzele and Ikponmwenosa before their wedding" },
];

const faqItems = [
  {
    question: "When is the wedding celebration?",
    answer: "Saturday, 12 December 2026. The celebration begins at 1:00 PM.",
  },
  {
    question: "Where is the venue?",
    answer: "Emi’s Event Center, INEC Road, Yenagoa, Bayelsa State.",
    action: "map",
  },
  {
    question: "What are the colours of the day?",
    answer: "Burgundy, beige and olive green. Guests are welcome to dress elegantly within this palette.",
  },
  {
    question: "How do I RSVP?",
    answer: "For attendance questions or changes, contact Omorede on 0802 850 9311, Aijohi on 0703 978 4348, or Isoken on 0703 246 2632.",
  },
  {
    question: "Can I leave a message for the couple?",
    answer: "Yes. Use the Wedding Wishes section to leave a prayer, memory or loving note for Omonzele and Ikponmwenosa.",
  },
];

const getCountdown = () => {
  const distance = Math.max(0, WEDDING_DATE.getTime() - Date.now());
  return {
    days: Math.floor(distance / 86400000),
    hours: Math.floor((distance / 3600000) % 24),
    minutes: Math.floor((distance / 60000) % 60),
    seconds: Math.floor((distance / 1000) % 60),
  };
};

const countWords = (value) => {
  const cleaned = value.trim();
  return cleaned ? cleaned.split(/\s+/).length : 0;
};

const formatWishDate = (value) =>
  new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));

function Modal({ label, title, children, onClose, className = "" }) {
  const closeButtonRef = useRef(null);

  useEffect(() => {
    const closeWithEscape = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", closeWithEscape);
    document.body.classList.add("modal-is-open");
    closeButtonRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", closeWithEscape);
      document.body.classList.remove("modal-is-open");
    };
  }, [onClose]);

  return (
    <div className="wedding-modal" role="presentation" onMouseDown={onClose}>
      <section
        className={`wedding-modal__card ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="wedding-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          ref={closeButtonRef}
          className="wedding-modal__close"
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
        >
          <span aria-hidden="true">×</span>
        </button>
        <p className="section-eyebrow">{label}</p>
        <h2 id="wedding-modal-title">{title}</h2>
        {children}
      </section>
    </div>
  );
}

function LandingPage() {
  const [countdown, setCountdown] = useState(getCountdown);
  const [menuOpen, setMenuOpen] = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [openFaq, setOpenFaq] = useState(0);
  const [modal, setModal] = useState(null);
  const [activePhoto, setActivePhoto] = useState(null);
  const [galleryPage, setGalleryPage] = useState(1);
  const [wishes, setWishes] = useState([]);
  const [wishesLoading, setWishesLoading] = useState(true);
  const [wishName, setWishName] = useState("");
  const [wishMessage, setWishMessage] = useState("");
  const [wishStatus, setWishStatus] = useState("idle");
  const [wishError, setWishError] = useState("");

  const wishWordCount = useMemo(() => countWords(wishMessage), [wishMessage]);
  const galleryPageCount = Math.ceil(galleryImages.length / GALLERY_PAGE_SIZE);
  const visibleGalleryImages = galleryImages.slice(
    (galleryPage - 1) * GALLERY_PAGE_SIZE,
    galleryPage * GALLERY_PAGE_SIZE,
  );
  const activePhotoIndex = activePhoto
    ? galleryImages.findIndex((image) => image.src === activePhoto.src)
    : -1;

  useEffect(() => {
    const timer = window.setInterval(() => setCountdown(getCountdown()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const updateNavigation = () => setNavScrolled(window.scrollY > 48);
    updateNavigation();
    window.addEventListener("scroll", updateNavigation, { passive: true });
    return () => window.removeEventListener("scroll", updateNavigation);
  }, []);

  useEffect(() => {
    const sectionIds = ["story", "details", "moments", "wishes", "faq", "memories"];

    const updateActiveSection = () => {
      const marker = Math.min(window.innerHeight * 0.45, 420);
      let currentSection = "";

      sectionIds.forEach((sectionId) => {
        const section = document.getElementById(sectionId);
        if (!section) return;
        const bounds = section.getBoundingClientRect();
        if (bounds.top <= marker && bounds.bottom > marker) currentSection = sectionId;
      });

      setActiveSection(currentSection);
    };

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);

    return () => {
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
    };
  }, []);

  useEffect(() => {
    const elements = document.querySelectorAll("[data-reveal]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14 },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [wishesLoading, wishes.length]);

  useEffect(() => {
    document.body.classList.toggle("menu-is-open", menuOpen);
    return () => document.body.classList.remove("menu-is-open");
  }, [menuOpen]);

  useEffect(() => {
    if (!activePhoto) return undefined;

    const navigateLightbox = (event) => {
      if (event.key === "ArrowLeft") {
        setActivePhoto(galleryImages[(activePhotoIndex - 1 + galleryImages.length) % galleryImages.length]);
      }
      if (event.key === "ArrowRight") {
        setActivePhoto(galleryImages[(activePhotoIndex + 1) % galleryImages.length]);
      }
    };

    document.addEventListener("keydown", navigateLightbox);
    return () => document.removeEventListener("keydown", navigateLightbox);
  }, [activePhoto, activePhotoIndex]);

  useEffect(() => {
    let active = true;

    const loadWishes = async () => {
      if (!supabase) {
        if (active) setWishesLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("wedding_wishes")
        .select("id, name, message, created_at")
        .eq("is_visible", true)
        .order("created_at", { ascending: false })
        .limit(12);

      if (!active) return;

      if (error) {
        setWishError("We could not load the wedding wishes right now.");
      } else {
        setWishes(data ?? []);
      }
      setWishesLoading(false);
    };

    loadWishes();
    return () => {
      active = false;
    };
  }, []);

  const closeMenu = () => setMenuOpen(false);

  const openWishModal = () => {
    setWishStatus("idle");
    setWishError("");
    setWishName("");
    setWishMessage("");
    setModal("wish");
  };

  const submitWish = async (event) => {
    event.preventDefault();
    setWishError("");

    const cleanName = wishName.trim();
    const cleanMessage = wishMessage.trim();

    if (!cleanName) {
      setWishError("Please enter your name.");
      return;
    }

    if (wishWordCount < MIN_WISH_WORDS) {
      setWishError(`Please write at least ${MIN_WISH_WORDS} words.`);
      return;
    }

    if (wishWordCount > MAX_WISH_WORDS) {
      setWishError(`Please keep your message within ${MAX_WISH_WORDS} words.`);
      return;
    }

    setWishStatus("posting");

    if (!supabase) {
      const localWish = {
        id: crypto.randomUUID(),
        name: cleanName,
        message: cleanMessage,
        created_at: new Date().toISOString(),
      };
      setWishes((current) => [localWish, ...current]);
      setWishStatus("success");
      return;
    }

    const { data, error } = await supabase
      .from("wedding_wishes")
      .insert({ name: cleanName, message: cleanMessage })
      .select("id, name, message, created_at")
      .single();

    if (error) {
      setWishStatus("idle");
      setWishError("Your wish could not be posted. Please try again.");
      return;
    }

    setWishes((current) => [data, ...current]);
    setWishStatus("success");
  };

  return (
    <main className="wedding-page">
      <header className="hero" id="home">
        <div className="hero__shade" aria-hidden="true" />
        <nav className={`hero__nav ${navScrolled ? "is-scrolled" : ""}`} aria-label="Main navigation">
          <a className="hero__logo" href="#home" onClick={closeMenu}>
            IOM<span>’26</span>
          </a>
          <button
            className={`hero__menu-button ${menuOpen ? "is-open" : ""}`}
            type="button"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((current) => !current)}
          >
            <span /><span /><span />
          </button>
          <button
            className={`hero__menu-overlay ${menuOpen ? "is-open" : ""}`}
            type="button"
            aria-label="Close navigation"
            onClick={closeMenu}
          />
          <div className={`hero__links ${menuOpen ? "hero__links--open" : ""}`}>
            <a className={activeSection === "story" ? "is-active" : ""} href="#story" onClick={closeMenu} aria-current={activeSection === "story" ? "page" : undefined}>Our story</a>
            <a className={activeSection === "details" ? "is-active" : ""} href="#details" onClick={closeMenu} aria-current={activeSection === "details" ? "page" : undefined}>The day</a>
            <a className={activeSection === "moments" ? "is-active" : ""} href="#moments" onClick={closeMenu} aria-current={activeSection === "moments" ? "page" : undefined}>Gallery</a>
            <a className={activeSection === "wishes" ? "is-active" : ""} href="#wishes" onClick={closeMenu} aria-current={activeSection === "wishes" ? "page" : undefined}>Wishes</a>
            <a className={activeSection === "faq" ? "is-active" : ""} href="#faq" onClick={closeMenu} aria-current={activeSection === "faq" ? "page" : undefined}>FAQ</a>
            <a className={activeSection === "memories" ? "is-active" : ""} href="#memories" onClick={closeMenu} aria-current={activeSection === "memories" ? "page" : undefined}>Memories</a>
            <a
              className="hero__reservation-link"
              href="#wishes"
              onClick={(event) => {
                event.preventDefault();
                closeMenu();
                openWishModal();
              }}
            >
              Leave a message
            </a>
          </div>
        </nav>

        <div className="hero__content">
          <p className="hero__kicker">Together with our families</p>
          <h1>Omonzele <span>&amp;</span> Ikponmwenosa</h1>
          <p className="hero__promise">Together, by grace, forever.</p>
          <p className="hero__date">12 · 12 · 2026</p>
          <div className="hero__countdown" aria-label="Countdown to the wedding">
            {Object.entries(countdown).map(([label, value]) => (
              <div className="countdown-item" key={label}>
                <strong>{String(value).padStart(2, "0")}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>
          <a
            className="button button--ivory"
            href="#wishes"
            onClick={(event) => {
              event.preventDefault();
              openWishModal();
            }}
          >
            Leave a message
          </a>
        </div>
        <a className="hero__scroll" href="#welcome" aria-label="Continue to the welcome message">
          <span>Explore our story</span><i aria-hidden="true" />
        </a>
      </header>

      <section className="welcome-letter" id="welcome" data-reveal>
        <div className="welcome-letter__paper">
          <span className="welcome-letter__seal" aria-hidden="true">I&amp;O</span>
          <p className="section-eyebrow">A note from our hearts</p>
          <h2>To everyone who has cheered us on</h2>
          <p>
            To our families, friends and everyone who has prayed for us, encouraged us and
            shared in our journey, thank you. Your love has carried us through every season
            and helped shape the story that brings us here. As we step into this beautiful
            new chapter, our hearts are full of gratitude. Whether you celebrate with us in
            person or from afar, we are honoured to have you as part of our story.
          </p>
          <strong>With love, Omonzele &amp; Ikponmwenosa</strong>
        </div>
      </section>

      <section className="story section" id="story">
        <div className="story__image-wrap" data-reveal>
          <img src="/images/iom26-story.png" alt="An intimate wedding editorial representing Omonzele and Ikponmwenosa's story" />
          <div className="story__frame-label"><span>Our story</span><small>IOM’26</small></div>
        </div>
        <div className="story__content" data-reveal>
          <p className="section-eyebrow">A friendship written with grace</p>
          <h2>One beautiful meeting.<br />One lifelong promise.</h2>
          <p>
            What began as a simple meeting grew into a love rooted in friendship, faith,
            laughter and a shared desire to build a beautiful life together.
          </p>
          <p>
            Through every season, they found home in one another. Now they are ready to begin
            their favourite chapter, surrounded by the people they love.
          </p>
          <button className="text-button" type="button" onClick={() => setModal("story")}>
            Read their full story <span aria-hidden="true">→</span>
          </button>
        </div>
      </section>

      <section className="family-banner" data-reveal>
        <div className="family-banner__ornament" aria-hidden="true" />
        <p className="section-eyebrow">Two families, one promise</p>
        <h2>With joyful hearts</h2>
        <div className="family-banner__names">
          <div><span>The family of</span><strong>Mr. &amp; Mrs. Daniel Ohani<br />Ihimire</strong></div>
          <div className="family-banner__and">&amp;</div>
          <div><span>The family of</span><strong>Late Mr. &amp; Mrs. Benson Erhunse Ediagbonya</strong></div>
        </div>
        <p>celebrate the marriage of</p>
        <h3>Omonzele <small>and</small> Ikponmwenosa</h3>
      </section>

      <section className="date-keepsake section" aria-labelledby="date-keepsake-title">
        <div className="date-keepsake__pearls" aria-hidden="true">
          {Array.from({ length: 18 }).map((_, index) => <i key={index} />)}
        </div>
        <div className="date-keepsake__card" data-reveal>
          <span className="date-keepsake__corner date-keepsake__corner--one" aria-hidden="true" />
          <span className="date-keepsake__corner date-keepsake__corner--two" aria-hidden="true" />
          <p className="section-eyebrow">Save our date</p>
          <span className="date-keepsake__month">December</span>
          <strong>12</strong>
          <span className="date-keepsake__year">Saturday · 2026</span>
        </div>
        <div className="date-keepsake__copy" data-reveal>
          <p className="section-eyebrow">A date written in time</p>
          <h2 id="date-keepsake-title">A December day,<br />chosen for forever.</h2>
          <p>
            Save this day for love, laughter and the beginning of a beautiful new chapter.
            We cannot wait to share it with the people who have shaped our story.
          </p>
          <a className="text-button" href={CALENDAR_URL} target="_blank" rel="noreferrer">
            Add wedding to calendar <span aria-hidden="true">→</span>
          </a>
        </div>
      </section>

      <section className="details section" id="details">
        <div className="section-heading" data-reveal>
          <p className="section-eyebrow">The wedding</p>
          <h2>A day held close to our hearts</h2>
          <p>The day begins with a private white wedding ceremony for both families, followed by the wider celebration.</p>
        </div>
        <div className="details__cards">
          <article className="detail-card detail-card--private" data-reveal>
            <span className="detail-card__number">01</span>
            <p className="detail-card__label">Private family ceremony</p>
            <h3>Private White Ceremony</h3>
            <p>An intimate exchange of vows in the presence of the couple’s families.</p>
            <strong>Listed in the programme below</strong>
          </article>
          <article className="detail-card detail-card--feature" data-reveal>
            <span className="detail-card__number">02</span>
            <p className="detail-card__label">The celebration</p>
            <h3>Celebrate With Us</h3>
            <p>Find the confirmed venue, time, colours and helpful information for the celebration.</p>
            <a className="button button--burgundy" href="#faq">
              View guest information
            </a>
          </article>
          <article className="detail-card detail-card--palette" data-reveal>
            <span className="detail-card__number">03</span>
            <p className="detail-card__label">Dress palette</p>
            <h3>Rich, Warm &amp; Elegant</h3>
            <div className="colour-dots" aria-label="Burgundy, beige and olive green">
              <i /><i /><i />
            </div>
            <strong>Burgundy · Beige · Olive Green</strong>
            <span className="detail-card__note">The official colours of the day.</span>
          </article>
        </div>
      </section>

      <section className="reception-editorial" data-reveal>
        <div className="reception-editorial__image">
          <img src="/images/iom26-reception.png" alt="An elegant burgundy and ivory wedding reception setting" />
          <span className="reception-editorial__lace" aria-hidden="true" />
        </div>
        <div className="reception-editorial__copy">
          <p className="section-eyebrow">The celebration</p>
          <h2>A room dressed for<br />joyful hearts</h2>
          <p>Join us at Emi’s Event Center, INEC Road, Yenagoa, Bayelsa State. The celebration begins at 1:00 PM.</p>
          <div className="reception-editorial__actions">
            <a className="button button--burgundy" href={MAP_URL} target="_blank" rel="noreferrer">Get directions</a>
            <a className="text-button" href={CALENDAR_URL} target="_blank" rel="noreferrer">Add to calendar <span aria-hidden="true">→</span></a>
          </div>
        </div>
      </section>

      <section className="programme" data-reveal>
        <div className="programme__heading">
          <p className="section-eyebrow">A celebration in chapters</p>
          <h2>The day unfolds</h2>
          <p>The order of events for our wedding celebration.</p>
        </div>
        <div className="programme__line" aria-hidden="true" />
        <div className="programme__items">
          <article><span>01</span><h3>White Wedding</h3><p><strong>Private</strong><br />An intimate ceremony for the couple’s families.</p></article>
          <article><span>02</span><h3>Guest Welcome</h3><p><strong>From 1:00 PM</strong><br />Arrival, warm greetings and beautiful reunions.</p></article>
          <article><span>03</span><h3>Reception</h3><p><strong>Celebration</strong><br />Good food, joyful hearts and a room filled with love.</p></article>
          <article><span>04</span><h3>Dance &amp; Merriment</h3><p><strong>Afterwards</strong><br />Music, laughter and memories we will carry forever.</p></article>
        </div>
      </section>

      <section className="promise-letter section" data-reveal>
        <div className="promise-letter__lace" aria-hidden="true" />
        <article className="promise-letter__paper">
          <span className="promise-letter__seal" aria-hidden="true">I&amp;O</span>
          <p className="section-eyebrow">A promise we carry</p>
          <h2>To choose one another,<br />in every season.</h2>
          <p>
            May the home we build be filled with grace, laughter and a love that keeps choosing.
            May friendship remain at the heart of our marriage, and may every chapter bring us
            closer to the life we have prayed for.
          </p>
          <strong>Omonzele &amp; Ikponmwenosa</strong>
        </article>
        <div className="promise-letter__pearls" aria-hidden="true">
          {Array.from({ length: 22 }).map((_, index) => <i key={index} />)}
        </div>
      </section>

      <section className="moments section" id="moments">
        <div className="section-heading" data-reveal>
          <p className="section-eyebrow">Before forever</p>
          <h2>Our moments</h2>
          <p>A few glimpses of the friendship, laughter and love that brought us here.</p>
        </div>
        <div className="moments__editorial">
          {galleryImages.slice(0, 5).map((image, index) => (
            <button
              className={`moments__photo moments__photo--${index + 1}`}
              type="button"
              key={image.src}
              onClick={() => setActivePhoto(image)}
              data-reveal
              aria-label={`Open photograph ${index + 1}`}
            >
              <img src={image.src} alt={image.alt} />
              <span>View</span>
            </button>
          ))}
          <blockquote className="moments__quote" data-reveal>
            <span aria-hidden="true">“</span>
            In every lifetime, I would still choose you.
          </blockquote>
        </div>
        <div className="moments__more" data-reveal>
          <button
            className="button button--burgundy"
            type="button"
            onClick={() => {
              setGalleryPage(1);
              setModal("gallery");
            }}
          >
            View full gallery
          </button>
          <span>{galleryImages.length} photographs</span>
        </div>
      </section>

      <section className="voices">
        <article className="voices__person voices__person--groom">
          <div className="voices__photo">
            <img
              src="/images/iom26-groom-quote.jpg"
              alt="An intimate portrait of Ikponmwenosa with Omonzele"
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = "/images/iom26-prewedding-03.jpg";
              }}
            />
          </div>
          <div className="voices__words" data-reveal>
            <p className="section-eyebrow">In his words</p>
            <blockquote>“In her, I found friendship, peace and a love that feels like home.”</blockquote>
            <p>Ikponmwenosa</p>
          </div>
        </article>
        <article className="voices__person voices__person--bride">
          <div className="voices__photo">
            <img
              src="/images/iom26-bride-quote.jpg"
              alt="An intimate portrait of Omonzele with Ikponmwenosa"
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = "/images/iom26-prewedding-04.jpg";
              }}
            />
          </div>
          <div className="voices__words" data-reveal>
            <p className="section-eyebrow">In her words</p>
            <blockquote>“With him, love feels gentle, joyful and full of possibility.”</blockquote>
            <p>Omonzele</p>
          </div>
        </article>
      </section>

      <section className="wishes section" id="wishes">
        <div className="wishes__heading" data-reveal>
          <div>
            <p className="section-eyebrow">From your heart to ours</p>
            <h2>Wedding wishes</h2>
            <p>Leave a prayer, memory or loving note for the couple as they begin forever.</p>
          </div>
          <button className="button button--burgundy" type="button" onClick={openWishModal}>
            Leave a wedding wish
          </button>
        </div>

        <div className="wishes__content" aria-live="polite">
          {wishesLoading ? (
            <div className="wishes__state"><span className="wishes__loader" /><p>Opening the book of wishes…</p></div>
          ) : wishes.length === 0 ? (
            <div className="wishes__state wishes__state--empty" data-reveal>
              <span className="wishes__heart" aria-hidden="true">♡</span>
              <h3>Their book of wishes is waiting for its first message</h3>
              <p>Your words could be the beautiful beginning.</p>
              <button className="text-button" type="button" onClick={openWishModal}>Write the first wish <span>→</span></button>
            </div>
          ) : (
            <div className="wishes__grid">
              {wishes.map((wish) => (
                <article className="wish-card" key={wish.id} data-reveal>
                  <span className="wish-card__quote" aria-hidden="true">“</span>
                  <p>{wish.message}</p>
                  <footer><strong>{wish.name}</strong><time dateTime={wish.created_at}>{formatWishDate(wish.created_at)}</time></footer>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="reservation-callout" data-reveal>
        <div>
          <p className="section-eyebrow">Plan your day</p>
          <h2>Everything you need, in one place</h2>
          <p>Find the venue, save the date and review helpful guest information before the celebration.</p>
        </div>
        <a className="button button--ivory" href="#faq">
          View guest information
        </a>
      </section>

      <section className="faq section" id="faq">
        <div className="faq__intro" data-reveal>
          <p className="section-eyebrow">Before the day</p>
          <h2>Everything you may wish to know</h2>
          <p>Helpful details for celebrating with Omonzele and Ikponmwenosa.</p>
          <div className="faq__quick-actions">
            <a className="button button--burgundy" href={MAP_URL} target="_blank" rel="noreferrer">Open directions</a>
            <a className="button button--outline-dark" href={CALENDAR_URL} target="_blank" rel="noreferrer">Add to calendar</a>
          </div>
        </div>
        <div className="faq__letter">
          <span className="faq__seal" aria-hidden="true">I&amp;O</span>
          <div className="faq__list">
            {faqItems.map((item, index) => {
              const isOpen = openFaq === index;

              return (
              <article className={`faq__item ${isOpen ? "is-open" : ""}`} key={item.question}>
                <button
                  className="faq__question"
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {item.question}
                  <i aria-hidden="true" />
                </button>
                <div
                  className="faq__answer"
                  id={`faq-answer-${index}`}
                  hidden={!isOpen}
                >
                  <p>{item.answer}</p>
                  {item.action === "map" && <a href={MAP_URL} target="_blank" rel="noreferrer">View on Google Maps →</a>}
                </div>
              </article>
              );
            })}
          </div>
          <div className="faq__contacts">
            <p className="section-eyebrow">RSVP contacts</p>
            <a href="tel:+2348028509311">Omorede · 0802 850 9311</a>
            <a href="tel:+2347039784348">Aijohi · 0703 978 4348</a>
            <a href="tel:+2347032462632">Isoken · 0703 246 2632</a>
          </div>
        </div>
      </section>

      <section className="memories section" id="memories">
        <div className="section-heading" data-reveal>
          <p className="section-eyebrow">After the celebration</p>
          <h2>Keep every beautiful moment</h2>
          <p>Two clear places to relive the day and share what you captured.</p>
        </div>
        <div className="memories__choices">
          <article className="memory-card memory-card--view" data-reveal>
            <span>01</span>
            <div><p className="section-eyebrow">For viewing</p><h3>Relive the celebration</h3><p>Find official photographs, videos and moments you may have missed.</p><a className="button button--ivory" href={MEMORIES_DRIVE_URL} target="_blank" rel="noreferrer">View wedding memories</a></div>
          </article>
          <article className="memory-card memory-card--upload" data-reveal>
            <span>02</span>
            <div><p className="section-eyebrow">For sharing</p><h3>Add what you captured</h3><p>Share your photographs and videos so everyone can enjoy the day through your eyes.</p><a className="button button--outline" href={MEMORIES_DRIVE_URL} target="_blank" rel="noreferrer">Upload photos &amp; videos</a><small>Google Drive access is required to upload files.</small></div>
          </article>
        </div>
      </section>

      <footer className="footer">
        <a className="footer__logo" href="#home">IOM<span>’26</span></a>
        <p>Two hearts. One promise. A lifetime of grace.</p>
        <small>Omonzele &amp; Ikponmwenosa · 12 December 2026</small>
      </footer>

      {modal === "story" && (
        <Modal
          label="Our story"
          title="The story that brought us here"
          onClose={() => setModal(null)}
          className="wedding-modal__card--story"
        >
          <div className="modal-story">
            <div className="modal-story__visual">
              <img src="/images/iom26-story.png" alt="An intimate moment between Omonzele and Ikponmwenosa" />
              <div>
                <span>IOM’26</span>
                <small>A friendship written with grace</small>
              </div>
            </div>
            <div className="modal-story__content">
              <p className="section-eyebrow">Our story</p>
              <h2>The story that brought us here</h2>
              <p className="modal-story__opening">Some stories begin quietly, and then become everything.</p>
              <p>What began with an easy conversation grew into a love rooted in friendship, faith, laughter and the quiet certainty that they had found home in one another.</p>
              <p>Through every season, they kept choosing each other. Patience became partnership, laughter became a language of its own, and their shared hope for the future became a life they could build together.</p>
              <p>On 12 December 2026, surrounded by God and the people they love, Omonzele and Ikponmwenosa will begin their favourite chapter yet.</p>
              <div className="modal-story__ending">
                <span>12 · 12 · 2026</span>
                <strong>Together, by grace, forever.</strong>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {modal === "gallery" && !activePhoto && (
        <Modal
          label="Before forever"
          title="Our pre-wedding gallery"
          onClose={() => setModal(null)}
          className="wedding-modal__card--gallery"
        >
          <div className="gallery-modal__grid">
            {visibleGalleryImages.map((image, index) => {
              const photoNumber = (galleryPage - 1) * GALLERY_PAGE_SIZE + index + 1;
              return (
                <article className="gallery-modal__item" key={image.src}>
                  <button type="button" onClick={() => setActivePhoto(image)} aria-label={`Open photograph ${photoNumber}`}>
                    <img src={image.src} alt={image.alt} />
                    <span>View photo</span>
                  </button>
                  <a href={image.src} download={`iom26-prewedding-${String(photoNumber).padStart(2, "0")}.jpg`}>
                    Download
                  </a>
                </article>
              );
            })}
          </div>
          <div className="gallery-modal__pagination" aria-label="Gallery pages">
            <button type="button" onClick={() => setGalleryPage((page) => Math.max(1, page - 1))} disabled={galleryPage === 1}>Previous</button>
            <span>Page {galleryPage} of {galleryPageCount}</span>
            <button type="button" onClick={() => setGalleryPage((page) => Math.min(galleryPageCount, page + 1))} disabled={galleryPage === galleryPageCount}>Next</button>
          </div>
        </Modal>
      )}

      {modal === "wish" && (
        <Modal label="Wedding wishes" title="Leave a note for the couple" onClose={() => setModal(null)} className="wedding-modal__card--wish">
          {wishStatus === "success" ? (
            <div className="form-success" aria-live="polite">
              <span aria-hidden="true">✓</span><h3>Your wish has been posted</h3><p>Thank you for adding your words to their story.</p><button className="button button--burgundy" type="button" onClick={() => setModal(null)}>View the wishes</button>
            </div>
          ) : (
            <form className="wish-form" onSubmit={submitWish} noValidate>
              <p className="wish-form__intro">A few sincere words can become a memory the couple keeps forever.</p>
              <label>Your name<input type="text" value={wishName} onChange={(event) => setWishName(event.target.value)} maxLength="50" autoComplete="name" required /></label>
              <label>Your message<textarea value={wishMessage} onChange={(event) => setWishMessage(event.target.value)} rows="6" required /></label>
              <div className={`wish-form__count ${wishWordCount > MAX_WISH_WORDS ? "is-over" : ""}`}>
                <span>Minimum {MIN_WISH_WORDS} words</span><strong>{wishWordCount} / {MAX_WISH_WORDS} words</strong>
              </div>
              {wishError && <p className="wish-form__error" role="alert">{wishError}</p>}
              <button className="button button--burgundy" type="submit" disabled={wishStatus === "posting"}>{wishStatus === "posting" ? "Posting…" : "Post wish"}</button>
            </form>
          )}
        </Modal>
      )}

      {activePhoto && (
        <Modal label="Our moments" title="A glimpse of our story" onClose={() => setActivePhoto(null)} className="wedding-modal__card--photo">
          <div className="lightbox">
            <button className="lightbox__arrow lightbox__arrow--previous" type="button" onClick={() => setActivePhoto(galleryImages[(activePhotoIndex - 1 + galleryImages.length) % galleryImages.length])} aria-label="Previous photograph">‹</button>
            <img className="lightbox-image" src={activePhoto.src} alt={activePhoto.alt} />
            <button className="lightbox__arrow lightbox__arrow--next" type="button" onClick={() => setActivePhoto(galleryImages[(activePhotoIndex + 1) % galleryImages.length])} aria-label="Next photograph">›</button>
            <div className="lightbox__footer">
              <span>{activePhotoIndex + 1} / {galleryImages.length}</span>
              <a className="button button--ivory" href={activePhoto.src} download={`iom26-prewedding-${String(activePhotoIndex + 1).padStart(2, "0")}.jpg`}>Download photograph</a>
            </div>
          </div>
        </Modal>
      )}
    </main>
  );
}

export default LandingPage;

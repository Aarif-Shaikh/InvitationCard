import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  CalendarDays,
  Clock3,
  MapPin,
  Heart,
  Sparkles,
  ArrowDown,
  Volume2,
  VolumeX
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { invitation } from "./data";
import "./styles.css";


/* =========================================================
   ANIMATION VARIANTS
   ========================================================= */

const fadeUp = {
  hidden: (direction = 1) => ({
    opacity: 0,
    y: direction > 0 ? 35 : -35
  }),

  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};


const fadeSoft = {
  hidden: (direction = 1) => ({
    opacity: 0,
    y: direction > 0 ? 20 : -20
  }),

  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

/* =========================================================
   EVENT DATE / TIME SHUFFLE ANIMATION
   ========================================================= */

const eventInfoVariant = {
  hidden: {
    opacity: 0,
    y: 12
  },

  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

const staggerContainer = {
  hidden: {},

  visible: {
    transition: {
      staggerChildren: 0.14,
      delayChildren: 0.15
    }
  }
};

const heroStaggerContainer = {
  hidden: {},

  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05
    }
  }
};


/* =========================================================
   APP
   ========================================================= */

function App() {

  const [opened, setOpened] = useState(false);
  const [opening, setOpening] = useState(false);
  const [muted, setMuted] = useState(false);
  const audioRef = useRef(null);
  const [showIntro, setShowIntro] = useState(true);

  /*
   * This stores the exact position where the transition
   * card should begin.
   */
  const [cardOrigin, setCardOrigin] = useState(null);


  /* =======================================================
     BODY SCROLL LOCK
     ======================================================= */

  useEffect(() => {

    document.body.style.overflow = opened
      ? "auto"
      : "hidden";

    return () => {
      document.body.style.overflow = "auto";
    };

  }, [opened]);


  /* =======================================================
     INITIALS
     ======================================================= */

  const initials = useMemo(
    () =>
      `${invitation.groom[5]} & ${invitation.bride[0]}`,
    []
  );


  /* =======================================================
     SCROLL DIRECTION
     ======================================================= */

  const [scrollDirection, setScrollDirection] = useState(1);

  useEffect(() => {

    let lastScrollY = window.scrollY;

    const handleScroll = () => {

      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY) {
        setScrollDirection(1);
      }

      if (currentScrollY < lastScrollY) {
        setScrollDirection(-1);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener(
      "scroll",
      handleScroll,
      { passive: true }
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );
    };

  }, []);


  /* =======================================================
     OPEN INVITATION
     ======================================================= */

  const openInvitation = (origin) => {
    if (opening || opened) return;

    // Start wedding music from the user's click
    if (audioRef.current) {
      audioRef.current.volume = 0.65;

      audioRef.current
        .play()
        .then(() => {
          setMuted(false);
        })
        .catch(() => {
          setMuted(true);
        });
    }

    setCardOrigin(origin);
    setOpening(true);

    setTimeout(() => {
      setOpened(true);
      setShowIntro(false);
    }, 650);

    setTimeout(() => {
      setOpening(false);
    }, 1100);

    setTimeout(() => {
      setCardOrigin(null);
    }, 2200);
  };


  return (
    <div className="app">

      <audio
        ref={audioRef}
        src="/public/music/InvitationCardMusic.mp3"
        loop
        preload="auto"
      />


      {/* =====================================================
          ENVELOPE
          ===================================================== */}

      <AnimatePresence mode="wait">

        {(!opened || opening) && (

          <EnvelopeScreen
            onOpen={openInvitation}
            opening={opening}
            cardOrigin={cardOrigin}
          />

        )}

      </AnimatePresence>


      {/* =====================================================
          REAL INVITATION
          ===================================================== */}

      <main
        className={
          opened
            ? "invitation visible"
            : "invitation"
        }
      >

        <Hero
          initials={initials}
          opened={opened}
        />

        <Names
          scrollDirection={scrollDirection}
        />

        <EventSection
          type="nikah"
          scrollDirection={scrollDirection}
        />

        <QuoteSection
          scrollDirection={scrollDirection}
        />

        <EventSection
          type="reception"
          scrollDirection={scrollDirection}
        />

        <Closing
          scrollDirection={scrollDirection}
        />

      </main>


      {/* =====================================================
          SOUND BUTTON + OPENING WASH
          ===================================================== */}

      {opened && (

        <>
          <button
            className="sound-btn"
            aria-label={
              muted
                ? "Unmute music"
                : "Mute music"
            }
            onClick={() => {
              if (!audioRef.current) return;

              if (muted) {
                audioRef.current
                  .play()
                  .then(() => {
                    setMuted(false);
                  })
                  .catch(() => { });
              } else {
                audioRef.current.pause();
                setMuted(true);
              }
            }}
          >

            {muted ? (
              <VolumeX size={17} />
            ) : (
              <Volume2 size={17} />
            )}

          </button>


          <AnimatePresence>

            {showIntro && (

              <motion.div
                className="opening-wash"

                initial={{
                  opacity: 1
                }}

                animate={{
                  opacity: 0
                }}

                transition={{
                  duration: 0.25,
                  ease: "easeOut"
                }}
              />

            )}

          </AnimatePresence>

        </>

      )}

    </div>
  );
}


/* =========================================================
   ENVELOPE SCREEN
   ========================================================= */

function EnvelopeScreen({
  onOpen,
  opening,
  cardOrigin
}) {

  const envelopeRef = useRef(null);


  /* =======================================================
     CLICK ENVELOPE
     ======================================================= */

  const handleOpen = () => {

    const envelope =
      envelopeRef.current;

    if (!envelope) {
      onOpen(null);
      return;
    }


    const rect =
      envelope.getBoundingClientRect();


    /*
     * Transition card dimensions.
     *
     * It begins as a smaller card inside the envelope.
     */
    const cardWidth =
      rect.width * 0.78;

    const cardHeight =
      rect.height * 0.72;


    /*
     * Start position:
     *
     * Slightly lower than the centre so that
     * the card visibly rises out of the envelope.
     */
    const startLeft =
      rect.left +
      (rect.width - cardWidth) / 2;

    const startTop =
      rect.top +
      rect.height * 0.34;


    /*
     * Centre position on the viewport.
     */
    const centerLeft =
      (window.innerWidth - cardWidth) / 2;

    const centerTop =
      (window.innerHeight - cardHeight) / 2;

    /*
     * Convert the starting position into a transform offset.
     * This allows the card to move using GPU-friendly transforms
     * instead of continuously changing left/top.
     */
    const startX = startLeft - centerLeft;
    const startY = startTop - centerTop;

    onOpen({
      startX,
      startY,
      cardWidth,
      cardHeight
    });

  };


  return (

    <motion.section
      className="envelope-screen"

      initial={{
        opacity: 1
      }}

      exit={{
        opacity: 0
      }}

      transition={{
        duration: 0.45,
        ease: [0.22, 1, 0.36, 1]
      }}
    >


      {/* =====================================================
          AMBIENT LIGHT
          ===================================================== */}

      <div className="ambient-orb orb-one" />

      <div className="ambient-orb orb-two" />


      {/* =====================================================
          INTRO COPY
          ===================================================== */}

      <motion.div
        className="intro-copy"

        animate={
          opening
            ? {
              opacity: 0,
              y: -20
            }
            : {
              opacity: 1,
              y: 0
            }
        }

        transition={{
          duration: 0.35,
          ease: [0.22, 1, 0.36, 1]
        }}
      >

        <span className="eyebrow">
          A WEDDING CELEBRATION
        </span>

        <h1>
          You are
          <br />
          <em>cordially invited</em>
        </h1>

        <p>
          Open this envelope to discover the celebration.
        </p>

      </motion.div>


      {/* =====================================================
          PHYSICAL ENVELOPE
          ===================================================== */}

      <motion.div
        ref={envelopeRef}

        className={
          `envelope-wrap ${opening ? "is-opening" : ""
          }`
        }

        role="button"
        tabIndex={0}

        aria-label="Open wedding invitation"

        onClick={handleOpen}

        onKeyDown={(event) => {

          if (
            event.key === "Enter" ||
            event.key === " "
          ) {

            event.preventDefault();

            handleOpen();

          }

        }}

        initial={{
          scale: 0.72,
          opacity: 0,
          y: 35
        }}

        animate={{
          scale: 1,
          opacity: 1,
          y: 0
        }}

        transition={{
          delay: 0.15,
          duration: 0.85,
          ease: [0.16, 1, 0.3, 1]
        }}

        whileHover={
          opening
            ? {}
            : {
              y: -6,
              scale: 1.015
            }
        }

        whileTap={
          opening
            ? {}
            : {
              scale: 0.98
            }
        }
      >

        <div className="envelope-shadow" />


        <div className="envelope">


          {/* BACK */}

          <div className="envelope-back" />


          {/* FLAP */}

          <div
            className={
              `envelope-flap ${opening
                ? "is-opening"
                : ""
              }`
            }
          />


          {/* FRONT */}

          <div className="envelope-front" />


          {/* =================================================
              NAMES
              ================================================= */}

          <motion.div
            className="envelope-monogram"

            animate={
              opening
                ? {
                  opacity: 0,
                  scale: 1.02
                }
                : {
                  opacity: 1,
                  scale: 1
                }
            }

            transition={{
              duration: 0.15
            }}
          >

            <motion.span
              className="envelope-name envelope-name-top"

              initial={{
                opacity: 0,
                y: 10
              }}

              animate={{
                opacity: 1,
                y: 0
              }}

              transition={{
                delay: 0.65,
                duration: 0.55,
                ease: [0.16, 1, 0.3, 1]
              }}
            >
              Faisal
            </motion.span>


            <motion.div
              className="envelope-name-divider"

              initial={{
                opacity: 0,
                scaleX: 0.7
              }}

              animate={{
                opacity: 1,
                scaleX: 1
              }}

              transition={{
                delay: 0.8,
                duration: 0.45
              }}
            >

              <i />

              <span>
                &amp;
              </span>

              <i />

            </motion.div>


            <motion.span
              className="envelope-name envelope-name-bottom"

              initial={{
                opacity: 0,
                y: -10
              }}

              animate={{
                opacity: 1,
                y: 0
              }}

              transition={{
                delay: 0.9,
                duration: 0.55,
                ease: [0.16, 1, 0.3, 1]
              }}
            >
              Zainab
            </motion.span>


            <motion.small
              className="envelope-date"

              initial={{
                opacity: 0
              }}

              animate={{
                opacity: 1
              }}

              transition={{
                delay: 1.05,
                duration: 0.5
              }}
            >
              EST. 2026
            </motion.small>


            <motion.div
              className="name-light-sweep"

              initial={{
                x: "-180%",
                opacity: 0
              }}

              animate={{
                x: "180%",
                opacity: [0, 0.45, 0]
              }}

              transition={{
                delay: 1.25,
                duration: 1.1,
                ease: "easeInOut"
              }}
            />

          </motion.div>


          {/* =================================================
              WAX SEAL
              ================================================= */}

          <motion.button
            type="button"

            className="wax-seal"

            onClick={(event) => {

              event.stopPropagation();

              handleOpen();

            }}

            aria-label="Open invitation"

            animate={
              opening
                ? {
                  x: "-50%",
                  scale: 0.2,
                  opacity: 0
                }
                : {
                  x: "-50%",
                  scale: 1,
                  opacity: 1
                }
            }

            whileHover={
              opening
                ? {}
                : {
                  x: "-50%",
                  scale: 1.08,
                  rotate: -2
                }
            }

            whileTap={
              opening
                ? {}
                : {
                  x: "-50%",
                  scale: 0.9
                }
            }

            transition={{
              duration: 0.3,
              ease: [0.22, 1, 0.36, 1]
            }}
          >
            ♥
          </motion.button>

        </div>

      </motion.div>


      {/* =====================================================
          TAP HINT
          ===================================================== */}

      <motion.div
        className="tap-hint"

        animate={
          opening
            ? {
              opacity: 0,
              y: 10
            }
            : {
              opacity: [0.5, 1, 0.5],
              y: [0, -3, 0]
            }
        }

        transition={{
          repeat: opening ? 0 : Infinity,
          duration: 2
        }}
      >

        <span>
          Tap to open
        </span>

        <ArrowDown size={15} />

      </motion.div>


      <motion.div
        className="corner-note"

        animate={{
          opacity: opening ? 0 : 1
        }}

        transition={{
          duration: 0.3
        }}
      >
        EST. 2026
      </motion.div>


      {/* =====================================================
          TRANSITION CARD
          ===================================================== */}

      <AnimatePresence>

        {opening && cardOrigin && (

          <motion.div
            className="envelope-transition-card"

            initial={{
              left: "50%",
              top: "50%",

              x: cardOrigin.startX,
              y: cardOrigin.startY,

              width: cardOrigin.cardWidth,
              height: cardOrigin.cardHeight,

              opacity: 0
            }}

            animate={{

              /*
               * MOVEMENT
               *
               * The card still starts from exactly the same
               * position inside the envelope.
               *
               * We are NOT changing the starting geometry.
               */
              x: [
                cardOrigin.startX,
                0,
                0,
                0,
                0,
                0
              ],

              y: [
                cardOrigin.startY,
                0,
                0,
                0,
                0,
                0
              ],


              /*
               * CONTINUOUS EXPANSION
               *
               * Unlike the old animation, the card begins
               * growing BEFORE it reaches the centre.
               *
               * This makes it feel like the physical card
               * itself is transforming into the invitation.
               */
              width: [
                cardOrigin.cardWidth,
                cardOrigin.cardWidth * 1.12,
                "75vw",
                "100vw",
                "100vw",
                "100vw"
              ],

              height: [
                cardOrigin.cardHeight,
                cardOrigin.cardHeight * 1.12,
                "75vh",
                "100vh",
                "100vh",
                "100vh"
              ],


              /*
               * Fade in immediately as the card comes out.
               */
              opacity: [
                0,
                1,
                1,
                1,
                0
              ]

            }}

            transformTemplate={(_, generatedTransform) =>
              `translate(-50%, -50%) ${generatedTransform}`
            }

            transition={{
              duration: 1.8,

              /*
               * 0 → 0.36
               * Card comes out and begins expanding.
               *
               * 0.36 → 0.62
               * Card is already expanding significantly.
               *
               * 0.62 → 1
               * Card rapidly grows to the full invitation.
               */
              times: [
                0,
                0.30,
                0.58,
                0.86,
                1
              ],

              ease: [
                [0.22, 1, 0.36, 1],
                [0.16, 1, 0.3, 1],
                [0.16, 1, 0.3, 1],
                [0.16, 1, 0.3, 1]
              ]
            }}
          >

            <div className="transition-card-inner">

              <p className="envelope-card-eyebrow">
                IN THE NAME OF ALLAH,
                THE MOST GRACIOUS,
                <br />
                THE MOST MERCIFUL
              </p>


              <div className="envelope-card-arabic">
                بِسْمِ اللَّهِ
              </div>


              <p className="envelope-card-family">
                TOGETHER WITH THEIR FAMILIES
              </p>


              <div className="envelope-card-monogram">
                {invitation.groom[5]}
                {" "}
                &amp;
                {" "}
                {invitation.bride[0]}
              </div>


              <p className="envelope-card-request">
                REQUEST THE HONOUR OF YOUR PRESENCE
              </p>

            </div>

          </motion.div>

        )}

      </AnimatePresence>

    </motion.section >
  );
}


/* =========================================================
   HERO
   ========================================================= */

function Hero({
  initials,
  opened
}) {

  return (

    <section className="hero section-shell">

      <motion.div
        className={
          `hero-frame ${opened
            ? "is-entering"
            : ""
          }`
        }

        initial="hidden"

        animate={
          opened
            ? "visible"
            : "hidden"
        }

        variants={heroStaggerContainer}
      >

        <div className="hero-deco deco-left">
          ✦
        </div>

        <div className="hero-deco deco-right">
          ✦
        </div>


        <motion.p
          className="eyebrow"
          variants={fadeSoft}
        >
          IN THE NAME OF ALLAH,
          THE MOST GRACIOUS,
          <br />
          THE MOST MERCIFUL
        </motion.p>


        <motion.div
          className="arabic-mark"
          variants={fadeSoft}
        >
          بِسْمِ اللهِ الرَّحْمَنِ الرَّحِيمِ
        </motion.div>


        <motion.p
          className="small-caps"
          variants={fadeSoft}
        >
          TOGETHER WITH THEIR FAMILIES
        </motion.p>


        <motion.div
          className="hero-monogram"
          variants={fadeUp}
        >
          {initials}
        </motion.div>


        <motion.p
          className="hero-kicker"
          variants={fadeSoft}
        >
          REQUEST THE HONOUR OF YOUR PRESENCE
        </motion.p>


        <motion.div
          className="scroll-cue"

          animate={{
            y: [0, 6, 0]
          }}

          transition={{
            repeat: Infinity,
            duration: 1.8
          }}
        >
          <ArrowDown size={18} />
        </motion.div>

      </motion.div>

    </section>
  );
}


/* =========================================================
   NAMES
   ========================================================= */

function Names({
  scrollDirection
}) {

  return (

    <motion.section
      className="names section-shell"

      initial="hidden"

      whileInView="visible"

      viewport={{
        once: false,
        amount: 0.35
      }}

      variants={staggerContainer}
    >

      <motion.span
        className="section-label"
        variants={fadeSoft}
        custom={scrollDirection}
      >
        THE HAPPY COUPLE
      </motion.span>


      <motion.h2
        variants={fadeUp}
        custom={scrollDirection}
      >

        <motion.span
          variants={fadeUp}
          custom={scrollDirection}
        >
          {invitation.groom}
        </motion.span>


        <motion.small
          variants={fadeSoft}
          custom={scrollDirection}
        >
          &amp;
        </motion.small>


        <motion.span
          variants={fadeUp}
          custom={scrollDirection}
        >
          {invitation.bride}
        </motion.span>

      </motion.h2>


      <motion.div
        className="gold-line"
        variants={fadeSoft}
        custom={scrollDirection}
      >

        <i />

        <Heart
          size={14}
          fill="currentColor"
        />

        <i />

      </motion.div>


      <motion.p
        className="lead"
        variants={fadeSoft}
        custom={scrollDirection}
      >
        With immense joy and gratitude,
        we invite you to be a part
        of our special day.
      </motion.p>

    </motion.section>
  );
}


/* =========================================================
   EVENTS
   ========================================================= */

function EventSection({
  type,
  scrollDirection
}) {
  const data =
    invitation[type];

  const isNikah =
    type === "nikah";

  const [shuffleKey, setShuffleKey] =
    useState(0);


  return (

    <motion.section
      className={`event section-shell ${isNikah ? "nikah" : "reception"
        }`}
      initial="hidden"
      whileInView="visible"
      viewport={{
        once: false,
        amount: 0.25
      }}
      variants={staggerContainer}
    >

      <motion.div
        className="event-card"
        variants={fadeUp}
        custom={scrollDirection}
      >


        <motion.div
          className="event-top"
          variants={fadeSoft}
          custom={scrollDirection}
        >

          <Sparkles size={17} />

          <span>
            {
              isNikah
                ? "THE NIKAH"
                : "THE RECEPTION"
            }
          </span>

          <Sparkles size={17} />

        </motion.div>


        <motion.h3
          variants={fadeUp}
          custom={scrollDirection}
        >
          {
            isNikah
              ? "A Sacred Beginning"
              : "An Evening of Celebration"
          }
        </motion.h3>


        <motion.div
          className="event-grid"
          variants={staggerContainer}
        >


          {/* DATE */}

          <motion.div
            className="event-info-animated"
            variants={eventInfoVariant}
            custom={scrollDirection}
            onViewportEnter={() => setShuffleKey((key) => key + 1)}
            viewport={{ once: false, amount: 0.8 }}
          >
            <Info
              icon={<CalendarDays />}
              title="DATE"
              value={
                <ShuffleText
                  text={data.date}
                  playKey={shuffleKey}
                />
              }
            />
          </motion.div>


          {/* TIME */}

          <motion.div
            className="event-info-animated"
            variants={eventInfoVariant}
            custom={scrollDirection}
          >
            <Info
              icon={<Clock3 />}
              title="TIME"
              value={
                <ShuffleText
                  text={data.time}
                  playKey={shuffleKey}
                  delay={180}
                />
              }
            />
          </motion.div>


          {/* VENUE */}

          <motion.div
            variants={fadeSoft}
            custom={scrollDirection}
          >

            <Info
              icon={<MapPin />}
              title="VENUE"
              value={data.venue}
              sub={data.address}
            />

          </motion.div>


        </motion.div>


        <motion.button
          className="map-button"

          variants={fadeSoft}

          custom={scrollDirection}

          onClick={() =>
            window.open(
              data.mapLink,
              "_blank"
            )
          }
        >
          VIEW LOCATION
        </motion.button>

      </motion.div>

    </motion.section>
  );
}


/* =========================================================
   INFO
   ========================================================= */

function Info({
  icon,
  title,
  value,
  sub
}) {

  return (

    <div className="info">

      <div className="info-icon">

        {
          React.cloneElement(
            icon,
            {
              size: 18,
              strokeWidth: 1.5
            }
          )
        }

      </div>


      <span>
        {title}
      </span>


      <strong>
        {value}
      </strong>


      {sub && (
        <small>
          {sub}
        </small>
      )}

    </div>
  );
}


/* =========================================================
   QUOTE
   ========================================================= */

function QuoteSection({
  scrollDirection
}) {

  return (

    <motion.section
      className="quote section-shell"

      initial="hidden"

      whileInView="visible"

      viewport={{
        once: false,
        amount: 0.4
      }}
    >

      <motion.div
        className="quote-inner"
        variants={staggerContainer}
      >

        <motion.div
          className="quote-mark"
          variants={fadeSoft}
          custom={scrollDirection}
        >
          “
        </motion.div>


        <motion.p
          variants={fadeUp}
          custom={scrollDirection}
        >
          {invitation.quote}
        </motion.p>


        <motion.span
          variants={fadeUp}
          custom={scrollDirection}
        >
          {invitation.quoteSource}
        </motion.span>

      </motion.div>

    </motion.section>
  );
}

/* =========================================================
   COUNTDOWN
   ========================================================= */

function Countdown() {

  const targetDate = useMemo(
    () => new Date("2026-11-06T19:00:00+05:30"),
    []
  );

  const calculateTime = () => {

    const now = new Date();

    const difference =
      targetDate.getTime() - now.getTime();

    if (difference <= 0) {
      return {
        days: 0,
        hours: 0,
        seconds: 0
      };
    }

    const totalSeconds =
      Math.floor(difference / 1000);

    const days =
      Math.floor(totalSeconds / 86400);

    const hours =
      Math.floor(
        (totalSeconds % 86400) / 3600
      );

    const seconds =
      totalSeconds % 60;

    return {
      days,
      hours,
      seconds
    };
  };


  const [time, setTime] =
    useState(calculateTime);


  useEffect(() => {

    const timer = setInterval(() => {
      setTime(calculateTime());
    }, 1000);

    return () => {
      clearInterval(timer);
    };

  }, [targetDate]);


  const items = [
    {
      value: time.days,
      label: "DAYS"
    },
    {
      value: time.hours,
      label: "HOURS"
    },
    {
      value: time.seconds,
      label: "SECONDS"
    }
  ];


  return (

    <motion.div
      className="countdown"
      variants={fadeUp}
    >

      <div className="countdown-row">

        {items.map((item, index) => (

          <React.Fragment key={item.label}>

            <motion.div
              className="countdown-item"
              key={`${item.label}-${item.value}`}
              initial={{
                opacity: 0.65,
                y: -4
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
              transition={{
                duration: 0.2
              }}
            >

              <span className="countdown-number">
                {String(item.value).padStart(2, "0")}
              </span>

              <span className="countdown-label">
                {item.label}
              </span>

            </motion.div>


            {index < items.length - 1 && (

              <span className="countdown-divider">
                │
              </span>

            )}

          </React.Fragment>

        ))}

      </div>


      <span className="countdown-caption">
        UNTIL THE NIKAH
      </span>

    </motion.div>

  );
}

function ShuffleText({ text, playKey = 0, delay = 0 }) {
  const [displayText, setDisplayText] = useState(text);

  useEffect(() => {
    let frame = 0;

    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    const totalFrames = 22;

    const startTimer = setTimeout(() => {
      const timer = setInterval(() => {
        frame++;

        const progress = frame / totalFrames;

        const shuffled = text
          .split("")
          .map((char, index) => {
            if (char === " ") return " ";

            // Characters settle from left to right
            const settlePoint =
              0.35 + index * 0.018;

            if (progress >= settlePoint) {
              return char;
            }

            return characters[
              Math.floor(
                Math.random() * characters.length
              )
            ];
          })
          .join("");

        setDisplayText(shuffled);

        if (frame >= totalFrames) {
          clearInterval(timer);
          setDisplayText(text);
        }
      }, 55);

      return () => clearInterval(timer);
    }, delay);

    return () => clearTimeout(startTimer);
  }, [text, playKey, delay]);

  return (
    <motion.span
      initial={{
        opacity: 0.65
      }}
      animate={{
        opacity: 1
      }}
      transition={{
        duration: 0.25
      }}
    >
      {displayText}
    </motion.span>
  );
}


/* =========================================================
   CLOSING
   ========================================================= */

function Closing({
  scrollDirection
}) {

  return (

    <motion.section
      className="closing section-shell"

      initial="hidden"

      whileInView="visible"

      viewport={{
        once: false,
        amount: 0.3
      }}
    >

      <motion.div
        className="closing-card"
        variants={staggerContainer}
      >

        <motion.div
          className="tiny-ornament"
          variants={fadeSoft}
          custom={scrollDirection}
        >
          ✦
        </motion.div>


        <motion.span
          className="section-label"
          variants={fadeSoft}
          custom={scrollDirection}
        >
          ONE LAST NOTE
        </motion.span>


        <motion.h2
          variants={fadeUp}
          custom={scrollDirection}
        >
          Come celebrate
          <br />
          <em>with us.</em>
        </motion.h2>


        <motion.p
          variants={fadeUp}
          custom={scrollDirection}
        >
          {invitation.closing}
        </motion.p>

        <Countdown />

        <motion.div
          className="gold-line"
          variants={fadeUp}
          custom={scrollDirection}
        >

          <i />

          <Heart
            size={14}
            fill="currentColor"
          />

          <i />

        </motion.div>


        <motion.strong
          variants={fadeUp}
          custom={scrollDirection}
        >
          {invitation.signature}
        </motion.strong>


        <motion.div
          className="footer-initials"
          variants={fadeUp}
          custom={scrollDirection}
        >
          {initialsFromInvitation()}
        </motion.div>


        <motion.small
          variants={fadeUp}
          custom={scrollDirection}
        >
          THANK YOU FOR BEING PART
          OF OUR STORY
        </motion.small>

      </motion.div>

    </motion.section>
  );
}


/* =========================================================
   FOOTER INITIALS
   ========================================================= */

function initialsFromInvitation() {

  return (
    `${invitation.groom[5]} & ${invitation.bride[0]}`
  );
}


/* =========================================================
   RENDER
   ========================================================= */

createRoot(
  document.getElementById("root")
).render(
  <App />
);
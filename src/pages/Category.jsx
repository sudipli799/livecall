import React, { useRef, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

/* images */
const IMAGES = [
  "https://st2.depositphotos.com/1275558/9129/i/950/depositphotos_91296490-stock-photo-portrait-of-a-beautiful-young.jpg",
  "https://w0.peakpx.com/wallpaper/323/12/HD-wallpaper-young-girl-sensual-female-models-sexy-people-beauty-face-lady-eyes.jpg",
  "https://img.goodfon.com/original/3840x2559/3/32/asian-sexy-girl-girls-thai-korea-china-cute-woman-model-p-22.jpg",
  "https://img.goodfon.com/original/4096x2730/6/40/asian-sexy-girl-girls-thai-korea-china-cute-woman-model--488.jpg",
  "https://c4.wallpaperflare.com/wallpaper/486/192/998/5bd06af42fb06-wallpaper-preview.jpg",
  "https://c4.wallpaperflare.com/wallpaper/922/917/77/5bd0fed5d346b-wallpaper-preview.jpg",
  "https://w0.peakpx.com/wallpaper/328/169/HD-wallpaper-asian-model-model-girl-women-asian.jpg",
  "https://wallpaperswide.com/download/asian_girl_smile-wallpaper-1280x720.jpg",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT_zrofO1RjjYn2Rtnq4rJq9_LWITITnSl7HQ&s",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRtiojOrYjMO_3mB0iYASIno-OQ7_2OazCtyg&s",
];


/* top filter sections */
const SECTIONS = [
  { id: "production", title: "Production", icon: "🎬" },
  { id: "actions", title: "Actions", icon: "🔥" },
  { id: "fetish", title: "Fetish", icon: "🖤" },
  { id: "orientation", title: "Orientation", icon: "🧭" },
  { id: "age", title: "Age", icon: "🎂" },
  { id: "ethnicity", title: "Ethnicity", icon: "🌍" },
  { id: "body", title: "Body", icon: "💪" },
  { id: "hair", title: "Hair", icon: "💇" },
  { id: "people", title: "Number of people", icon: "👥" },
  { id: "toys", title: "Sex Toys", icon: "🧸" },
  { id: "apparel", title: "Apparel", icon: "👙" },
  { id: "scenario", title: "Scenario", icon: "🎭" },
  { id: "location", title: "Location", icon: "📍" },
];

/* popular categories (12 items) */
const POPULAR_CATEGORIES = [
  "18 Year Old",
  "Desi",
  "Mom",
  "Russian",
  "American",
  "MILF",
  "Homemade",
  "Big Ass",
  "Village",
  "Big Cock",
  "First Time",
  "Amateur",
];

/* items inside every section */
const CATEGORY_ITEMS = [
  "3D",
  "Amateur",
  "Behind the Scenes",
  "Caption",
  "Cartoon",
  "Celebrity",
  "Close-up",
  "Compilation",
];

export default function Category() {
  const [active, setActive] = useState("production");
  const sectionRefs = useRef({});

  const handleScroll = (id) => {
    setActive(id);
    sectionRefs.current[id]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="container-fluid py-3 bg-light">

      {/* TOP FILTER TABS */}
      <div className="d-flex flex-wrap gap-2 sticky-top bg-light pb-2 z-3">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => handleScroll(s.id)}
            className={`btn btn-sm fw-semibold ${
              active === s.id ? "btn-dark text-white" : "btn-outline-secondary"
            }`}
          >
            {s.icon} {s.title}
          </button>
        ))}
      </div>

      {/* TITLE */}
      <h2 className="fs-4 fw-bold my-4">
        Popular Categories in India 🇮🇳
      </h2>

      {/* POPULAR CATEGORY GRID – NO SCROLL */}
      <div className="row g-3 mb-5">
        {POPULAR_CATEGORIES.map((name, i) => (
          <div key={i} className="col-6 col-sm-4 col-md-3 col-lg-2">
            <div
              className="position-relative rounded overflow-hidden"
              style={{ height: 140 }}
            >
              <img
                src={IMAGES[i % IMAGES.length]}
                alt={name}
                className="w-100 h-100"
                style={{ objectFit: "cover" }}
              />
              <div
                className="position-absolute bottom-0 start-0 end-0 p-2"
                style={{
                  background:
                    "linear-gradient(to top, rgba(0,0,0,.75), transparent)",
                }}
              >
                <span className="text-white fw-semibold small">
                  {name}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      

      {/* ALL CATEGORY SECTIONS */}
      {SECTIONS.map((section) => (
        <div
          key={section.id}
          ref={(el) => (sectionRefs.current[section.id] = el)}
          className="mb-5"
        >
          <h3 className="fs-5 fw-bold mb-3">
            {section.icon} {section.title}
          </h3>

          <div className="row g-3">
            {CATEGORY_ITEMS.map((name, i) => (
              <div key={i} className="col-6 col-sm-4 col-md-3 col-lg-2">
                <div className="position-relative rounded overflow-hidden">
                  <img
                    src={IMAGES[i % IMAGES.length]}
                    alt={name}
                    className="w-100"
                    style={{ height: 140, objectFit: "cover" }}
                  />
                  <div
                    className="position-absolute bottom-0 start-0 end-0 p-2"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(0,0,0,.7), transparent)",
                    }}
                  >
                    <span className="text-white fw-semibold small">
                      {name}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

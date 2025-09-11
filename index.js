import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getDatabase, ref, push } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC36Vnul2nr7BOfZyZXuMjDHA4a__yV4Mw",
  authDomain: "shape-the-drop.firebaseapp.com",
  databaseURL: "https://shape-the-drop-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "shape-the-drop",
  storageBucket: "shape-the-drop.firebasestorage.app",
  messagingSenderId: "169234610810",
  appId: "1:169234610810:web:16771842b653c30e3019c3",
  measurementId: "G-WQNJYR3W0W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth();
const provider = new GoogleAuthProvider();

let signedInUser = null;

// Data structures
const imageSets = {
  oldMoney: ["oldmoney1.jpg", "oldmoney2.jpg", "oldmoney3.jpg", "oldmoney4.jpg", "oldmoney5.jpg"],
  streetWear: ["streetwear1.jpg", "streetwear2.jpg", "streetwear3.jpg", "streetwear4.jpg", "streetwear5.jpg", "streetwear6.jpg", "streetwear7.jpg", "streetwear8.jpg"],
  casuals: ["casuals1.jpg", "casuals2.jpg", "casuals3.jpg", "casuals4.jpg", "casuals5.jpg"]
};

const Clothes = {
  Top1: "/assets/Top1.png",
  Top2: "/assets/Top2.png",
  Top3: "/assets/Top3.png",
  Top4: "/assets/Top4.png",
  Top5: "/assets/Top5.png",
  Top6: "/assets/Top6.png",
  Top7: "/assets/Top7.png",
  Top8: "/assets/Top8.png",
  Top9: "/assets/Top9.png",
  Top10: "/assets/Top10.png",
  Bottom1: "/assets/Bottom1.png",
  Bottom2: "/assets/Bottom2.png",
  Bottom3: "/assets/Bottom3.png",
  Bottom4: "/assets/Bottom4.png",
  Bottom5: "/assets/Bottom5.png",
  Bottom6: "/assets/Bottom6.png",
};

const perfectPairs = [
  { top: "Top3", bottom: "Bottom3" },
  { top: "Top1", bottom: "Bottom1" },
  { top: "Top7", bottom: "Bottom1" }
];

const worstPairs = [
  { top: "Top4", bottom: "Bottom4" },
  { top: "Top2", bottom: "Bottom4" },
  { top: "Top7", bottom: "Bottom4" },
  { top: "Top7", bottom: "Bottom5" }
];

// DOM elements
const elements = {
  buttons: {
    casualsBtn: document.getElementById("casualsBtn"),
    oldMoneyBtn: document.getElementById("oldMoneyBtn"),
    streetWearBtn: document.getElementById("streetWearBtn"),
    streetWearProceedBtn: document.getElementById("streetWearProceedBtn"),
    casualsProceedBtn: document.getElementById("casualsProceedBtn"),
    oldMoneyProceedBtn: document.getElementById("oldMoneyProceedBtn"),
    streetwearQuestionProceedBtn: document.getElementById("streetwearQuestionProceedBtn"),
    casualsQuestionProceedBtn: document.getElementById("casualsQuestionProceedBtn"),
    oldmoneyQuestionProceedBtn: document.getElementById("oldmoneyQuestionProceedBtn"),
    colourPaletteProceedBtn: document.getElementById("colourPaletteProceedBtn"),
    priceRangeProceedBtn: document.getElementById("priceRangeProceedBtn"),
    timePeriodProceedBtn: document.getElementById("timePeriodProceedBtn"),
    outfitProceedBtn: document.getElementById("outfit-proceedBtn"),
    shapeTheDropBtn: document.getElementById("shapeTheDropBtn"),
    brandIntroBtn: document.getElementById("brandIntroBtn"),
    googleLoginBtn: document.getElementById("googleLoginBtn"),
    manualFormSubmitBtn: document.getElementById("manualFormSubmitBtn"),
    copyBtn: document.getElementById("copyBtn"),
    generateCouponBtn: document.getElementById("generateCouponBtn")
  },
  sections: {
    activitySection: document.getElementById("activitySection"),
    categorySection: document.getElementById("categorySection"),
    streetwearQuestion: document.getElementById("streetwearQuestion"),
    casualsQuestion: document.getElementById("casualsQuestion"),
    oldmoneyQuestion: document.getElementById("oldmoneyQuestion"),
    streetWearSec: document.getElementById("streetWearGrid"),
    oldMoneySec: document.getElementById("oldMoneyGrid"),
    casualsSec: document.getElementById("casualsGrid"),
    colourPreferenceSec: document.getElementById("colourPreference"),
    priceRangeSec: document.getElementById("priceRangeSec"),
    timePeriodSec: document.getElementById("timePeriodSec"),
    complementSection: document.getElementById("complementSection"),
    introductionSection: document.getElementById("introductionSection"),
    signInSection: document.getElementById("signInSection"),
    couponContainer: document.getElementById("couponContainer")
  },
  inputs: {
    priceSlider: document.getElementById("priceRange"),
    priceDisplay: document.getElementById("priceValue"),
    timePeriodSelection: document.getElementById("timePeriodSelection"),
    userName: document.getElementById("userName"),
    userAge: document.getElementById("userAge"),
    userContact: document.getElementById("userContact"),
    userDOB: document.getElementById("userDOB")
  },
  displays: {
    upperBody: document.getElementById("upperBody"),
    lowerBody: document.getElementById("lowerBody"),
    stars: document.getElementById("stars"),
    tryAgain: document.getElementById("tryAgain"),
    dynamicComplement: document.getElementById("dynamic-complement"),
    couponCode: document.getElementById("couponCode"),
    discount: document.getElementById("discount")
  }
};

// State management
let state = {
  category: null,
  productSelections: [],
  selectedColour: null,
  finalPrice: null,
  selectedTimePeriod: null,
  selections: {
    oldMoney: [],
    casuals: [],
    streetWear: []
  },
  outfit: {
    top: null,
    bottom: null
  },
  rating: null,
  couponCode: null,
  discount: null
};

// Utility functions
function hideAllSections() {
  Object.values(elements.sections).forEach(section => {
    if (section) section.style.display = 'none';
  });
}

function showSection(section) {
  if (section) {
    hideAllSections();
    section.style.display = section === elements.sections.colourPreferenceSec ||
                          section === elements.sections.streetWearSec ||
                          section === elements.sections.oldMoneySec ||
                          section === elements.sections.casualsSec ? 'grid' : 'block';
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    console.error('Section not found:', section);
  }
}

function setupImageSelection(gridEl, selectionArray) {
  if (!gridEl) {
    console.error('Grid element is null');
    return;
  }
  const images = gridEl.querySelectorAll('img');
  images.forEach(img => {
    img.addEventListener('click', () => {
      const value = img.dataset.value;
      img.classList.toggle('selected');
      if (selectionArray.includes(value)) {
        selectionArray.splice(selectionArray.indexOf(value), 1);
      } else {
        selectionArray.push(value);
      }
      console.log(`${selectionArray.name || 'Images'} selected:`, selectionArray);
    });
  });
}

function changeClothes(body, cloth) {
  body.src = cloth;
}

function rateBuddy(selected) {
  let rating = 0;
  if (selected.top && selected.bottom) {
    const isPerfect = perfectPairs.some(
      pair => pair.top === selected.top && pair.bottom === selected.bottom
    );
    const isWorst = worstPairs.some(
      pair => pair.top === selected.top && pair.bottom === selected.bottom
    );

    if (isPerfect) {
      elements.displays.stars.innerText = "⭐ ⭐ ⭐ ⭐ ⭐";
      rating = 5;
      elements.displays.tryAgain.innerText = "";
    } else if (isWorst) {
      elements.displays.stars.innerText = "⭐ ⭐";
      rating = 2;
      elements.displays.tryAgain.innerText = "Try Again.";
    } else {
      rating = Math.floor(Math.random() * 2) + 3;
      elements.displays.stars.innerText = "⭐ ".repeat(rating);
      elements.displays.tryAgain.innerText = "";
    }
  }
  return rating;
}

function showComplement(rating) {
  let stars = "";
  for (let i = 1; i <= 5; i++) {
    stars += i <= rating ? "⭐ " : "☆ ";
  }
  elements.displays.dynamicComplement.innerText = `You Got ${stars}Rating, buddy loves your fashion sense ✨`;
  if (rating >= 3) {
    elements.sections.complementSection.style.display = "block";
    elements.buttons.outfitProceedBtn.disabled = true;
  } else {
    elements.sections.complementSection.style.display = "none";
  }
}

function storeUserData(isGoogle = false) {
  let userData = {
    category: state.category,
    productSelections: state.productSelections,
    styleSelections: state.selections[state.category || ''],
    colour: state.selectedColour,
    price: state.finalPrice,
    timePeriod: state.selectedTimePeriod,
    outfitTop: state.outfit.top,
    outfitBottom: state.outfit.bottom,
    rating: state.rating,
    couponCode: state.couponCode,
    discount: state.discount,
    timestamp: Date.now()
  };

  if (isGoogle && signedInUser) {
    userData.uid = signedInUser.uid;
    userData.name = signedInUser.displayName;
    userData.email = signedInUser.email;
  } else {
    userData.name = elements.inputs.userName.value;
    userData.age = elements.inputs.userAge.value;
    userData.contact = elements.inputs.userContact.value;
    userData.dob = elements.inputs.userDOB.value;
  }

  push(ref(db, 'users'), userData)
    .then(() => {
      console.log('Coupon code and discount stored successfully:', {
        couponCode: state.couponCode,
        discount: state.discount
      });
    })
    .catch(err => {
      console.error('Error storing coupon data:', err);
    });
}

let finalDiscount = 0;
let couponCode = "";

function generateCoupon() {
  const discountElement = elements.displays.discount;
  const codeElement = elements.displays.couponCode;
  const couponBox = document.getElementById("couponBox");
  elements.buttons.generateCouponBtn.disabled = true;

  // Generate final discount (5–15%)
  finalDiscount = Math.floor(Math.random() * (15 - 5 + 1)) + 5;
  state.discount = finalDiscount;
  couponCode = "CPN-" + Math.random().toString(36).substr(2, 6).toUpperCase();
  state.couponCode = couponCode;
  console.log(state.couponCode, state.discount);
  let flag = sessionStorage.getItem("isLoggedIn");
  if(flag){
    storeUserData(true);
  }else{
    storeUserData(false);
  }
  let interval;

  // Phase 1: fast spin (random numbers 0-99)
  let phase1 = setInterval(() => {
    discountElement.textContent = Math.floor(Math.random() * 100) + "%";
  }, 50);

  // After 1.5s move to phase 2
  setTimeout(() => {
    clearInterval(phase1);
    let phase2 = setInterval(() => {
      discountElement.textContent = (Math.floor(Math.random() * 26) + 25) + "%";
    }, 100);

    // After 1.5s move to final phase
    setTimeout(() => {
      clearInterval(phase2);
      let step = 0;
      interval = setInterval(() => {
        step++;
        let ease = Math.min(1, step / 20); // slow easing
        let value = Math.floor((25 + Math.random() * 25) * (1 - ease) + finalDiscount * ease);
        discountElement.textContent = value + "%";

        if (step >= 20) {
          clearInterval(interval);
          discountElement.textContent = finalDiscount + "%";
          codeElement.textContent = couponCode;
          couponBox.style.display = "flex";
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.4 }
          });
        }
      }, 150);
    }, 1500);
  }, 1500);
}

function copyCoupon() {
  navigator.clipboard.writeText(couponCode)
    .then(() => {
      elements.buttons.copyBtn.textContent = "Copied!";
      setTimeout(() => {
        elements.buttons.copyBtn.textContent = "Copy";
      }, 2000);
    })
    .catch(err => {
      console.error('Copy failed:', err);
    });
}

// Event handlers
function setupEventListeners() {
  // Google Sign-in
  elements.buttons.googleLoginBtn.addEventListener("click", () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        signedInUser = result.user;
        console.log("Signed in:", signedInUser.displayName);
       //signed up with google
        sessionStorage.setItem("withGoogle", "true");
        //show coupon section
        showSection(elements.sections.couponContainer);
      })
      .catch((error) => console.error(error));
  });

  // Manual Submit
  elements.buttons.manualFormSubmitBtn.addEventListener('click', () => {
    if (!elements.inputs.userName.value || !elements.inputs.userContact.value) {
      alert('Please fill in name and contact.');
      return;
    }
    //signed up manually
    sessionStorage.setItem("withGoogle", "false");
     //show coupon section
    showSection(elements.sections.couponContainer);
  });

  // Category buttons
  elements.buttons.casualsBtn?.addEventListener('click', () => {
    state.category = 'casuals';
    console.log("casuals button clicked");
    showSection(elements.sections.casualsQuestion);
  });

  elements.buttons.oldMoneyBtn?.addEventListener('click', () => {
    state.category = 'oldMoney';
    console.log("oldmoney button clicked");
    showSection(elements.sections.oldmoneyQuestion);
  });

  elements.buttons.streetWearBtn?.addEventListener('click', () => {
    state.category = 'streetWear';
    console.log("streetwear button clicked");
    showSection(elements.sections.streetwearQuestion);
  });

  // Product question proceed buttons
  elements.buttons.streetwearQuestionProceedBtn?.addEventListener('click', () => {
    const checkboxes = document.querySelectorAll('#streetwearQuestion input[name="streetwearOpt"]:checked');
    state.productSelections = Array.from(checkboxes).map(cb => cb.value);
    if (state.productSelections.length > 0) {
      console.log('Streetwear selections:', state.productSelections);
      showSection(elements.sections.streetWearSec);
    } else {
      alert('Please select at least one streetwear option.');
    }
  });

  elements.buttons.casualsQuestionProceedBtn?.addEventListener('click', () => {
    const checkboxes = document.querySelectorAll('#casualsQuestion input[name="casualsOpt"]:checked');
    state.productSelections = Array.from(checkboxes).map(cb => cb.value);
    if (state.productSelections.length > 0) {
      console.log('Casuals selections:', state.productSelections);
      showSection(elements.sections.casualsSec);
    } else {
      alert('Please select at least one casuals option.');
    }
  });

  elements.buttons.oldmoneyQuestionProceedBtn?.addEventListener('click', () => {
    const checkboxes = document.querySelectorAll('#oldmoneyQuestion input[name="oldmoneyOpt"]:checked');
    state.productSelections = Array.from(checkboxes).map(cb => cb.value);
    if (state.productSelections.length > 0) {
      console.log('Old Money selections:', state.productSelections);
      showSection(elements.sections.oldMoneySec);
    } else {
      alert('Please select at least one old money option.');
    }
  });

  // Style grid proceed buttons
  elements.buttons.oldMoneyProceedBtn?.addEventListener('click', () => {
    if (state.selections.oldMoney.length > 0) {
      console.log('Old Money selected:', state.selections.oldMoney);
      showSection(elements.sections.colourPreferenceSec);
    } else {
      alert('Please select at least one Old Money style.');
    }
  });

  elements.buttons.casualsProceedBtn?.addEventListener('click', () => {
    if (state.selections.casuals.length > 0) {
      console.log('Casuals selected:', state.selections.casuals);
      showSection(elements.sections.colourPreferenceSec);
    } else {
      alert('Please select at least one Casuals style.');
    }
  });

  elements.buttons.streetWearProceedBtn?.addEventListener('click', () => {
    if (state.selections.streetWear.length > 0) {
      console.log('Street Wear selected:', state.selections.streetWear);
      showSection(elements.sections.colourPreferenceSec);
    } else {
      alert('Please select at least one Street Wear style.');
    }
  });

  // Colour selection
  const colourSection = elements.sections.colourPreferenceSec;
  if (colourSection) {
    const colourImages = colourSection.querySelectorAll('img');
    let tempSelectedColour = null;
    colourImages.forEach(img => {
      img.addEventListener('click', () => {
        colourImages.forEach(i => i.classList.remove('selected'));
        img.classList.add('selected');
        tempSelectedColour = img.dataset.value;
        console.log('Temporary selected colour:', tempSelectedColour);
      });
    });

    elements.buttons.colourPaletteProceedBtn?.addEventListener('click', () => {
      if (tempSelectedColour) {
        state.selectedColour = tempSelectedColour;
        console.log('Final selected colour:', state.selectedColour);
        showSection(elements.sections.priceRangeSec);
      } else {
        alert('Please select a colour before proceeding!');
      }
    });
  }

  // Price range
  elements.inputs.priceSlider?.addEventListener('input', () => {
    elements.inputs.priceDisplay.textContent = elements.inputs.priceSlider.value;
  });

  elements.buttons.priceRangeProceedBtn?.addEventListener('click', () => {
    state.finalPrice = elements.inputs.priceSlider.value;
    console.log('Selected price:', state.finalPrice);
    showSection(elements.sections.timePeriodSec);
  });

  // Time period
  elements.buttons.timePeriodProceedBtn?.addEventListener('click', () => {
    state.selectedTimePeriod = elements.inputs.timePeriodSelection.value;
    if (!state.selectedTimePeriod) {
      alert('Please select a time period!');
      return;
    }
    console.log('Selected time period:', state.selectedTimePeriod);
    showSection(elements.sections.signInSection);
  });

  // Outfit selection
  document.querySelectorAll("img[data-category]").forEach(img => {
    img.addEventListener("click", () => {
      const category = img.dataset.category;
      const key = img.dataset.key;
      console.log(`${key} clicked`);
      state.outfit[category === "upperbody" ? "top" : "bottom"] = key;
      changeClothes(elements.displays[category === "upperbody" ? "upperBody" : "lowerBody"], Clothes[key]);
    });
  });

  // Outfit proceed
  elements.buttons.outfitProceedBtn.addEventListener('click', () => {
    if (!state.outfit.top || !state.outfit.bottom) {
      alert('Please select both a top and bottom outfit.');
      return;
    }
    const rating = rateBuddy(state.outfit);
    state.rating = rating;
    showComplement(rating);
    console.log("Proceed btn clicked", state.outfit);
  });

  // Brand intro
  elements.buttons.brandIntroBtn.addEventListener('click', () => {
    showSection(elements.sections.introductionSection);
  });

  // Shape the drop
  elements.buttons.shapeTheDropBtn.addEventListener('click', () => {
    console.log("Let's shape the drop button clicked");
    showSection(elements.sections.categorySection);
  });

  // Coupon buttons
  elements.buttons.generateCouponBtn?.addEventListener('click', () => {
    console.log("Generating coupon");
    generateCoupon();
  });

  elements.buttons.copyBtn?.addEventListener('click', () => {
    console.log("Copying code");
    copyCoupon();
  });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  showSection(elements.sections.activitySection);
  setupImageSelection(elements.sections.oldMoneySec, state.selections.oldMoney);
  setupImageSelection(elements.sections.casualsSec, state.selections.casuals);
  setupImageSelection(elements.sections.streetWearSec, state.selections.streetWear);
  setupEventListeners();
});
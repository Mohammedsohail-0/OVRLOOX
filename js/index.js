import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getDatabase, ref, push, get, update } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

export { elements, state, storeUserData,signedInUser };

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
  Top1: "assets/Top1.png",
  Top2: "assets/Top2.png",
  Top3: "assets/Top3.png",
  Top4: "assets/Top4.png",
  Top5: "assets/Top5.png",
  Top6: "assets/Top6.png",
  Top7: "assets/Top7.png",
  Top8: "assets/Top8.png",
  Top9: "assets/Top9.png",
  Top10: "assets/Top10.png",
  Bottom1: "assets/Bottom1.png",
  Bottom2: "assets/Bottom2.png",
  Bottom3: "assets/Bottom3.png",
  Bottom4: "assets/Bottom4.png",
  Bottom5: "assets/Bottom5.png",
  Bottom6: "assets/Bottom6.png",
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
    userContact: document.getElementById("userContact"),
    userEmail: document.getElementById("userEmail")
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
  discount: null,
  referralCode: null,
  referredUsers: []
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
// Add user to Firebase
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
    referralCode: state.referralCode,
    referredUsers: state.referredUsers,
    timestamp: Date.now()
  };

  if (isGoogle && signedInUser) {
    userData.uid = signedInUser.uid;
    userData.name = signedInUser.displayName;
    userData.email = signedInUser.email;
  } else {
    // Check if DOM inputs are available (they aren't on discount.html)
    if (!elements.inputs.userName || !elements.inputs.userContact || !elements.inputs.userEmail) {
      // Fall back to sessionStorage (populated during sign-in)
      const storedState = sessionStorage.getItem("userState");
      if (storedState) {
        try {
          const parsedState = JSON.parse(storedState);
          userData.name = parsedState.name || "Anonymous";
          userData.email = parsedState.email || "";
          userData.contact = parsedState.contact || "";
        } catch (error) {
          console.error("Failed to parse userState from sessionStorage:", error);
          userData.name = "Anonymous";
          userData.email = "";
          userData.contact = "";
        }
      } else {
        console.warn("No user data in sessionStorage; using defaults");
        userData.name = "Anonymous";
        userData.email = "";
        userData.contact = "";
      }
    } else {
      // Use DOM inputs (only on index.html)
      if (!elements.inputs.userName.value || !elements.inputs.userContact.value || !elements.inputs.userEmail.value) {
        throw new Error("Required input fields are empty");
      }
      userData.name = elements.inputs.userName.value;
      userData.contact = elements.inputs.userContact.value;
      userData.email = elements.inputs.userEmail.value;
    }
  }

  // Store in Firebase (with error handling for async issues like invalid data)
  return push(ref(db, 'users'), userData)
    .then((snapshot) => {
      console.log('User data stored successfully with ID:', snapshot.key);
      // Update sessionStorage with full state for consistency
      sessionStorage.setItem("userState", JSON.stringify({
        ...state,
        name: userData.name,
        email: userData.email,
        contact: userData.contact
      }));
      return snapshot.key;
    })
    .catch(err => {
      console.error('Error storing user data in Firebase:', err);
      // Still update sessionStorage for UI continuity
      sessionStorage.setItem("userState", JSON.stringify({
        ...state,
        name: userData.name,
        email: userData.email,
        contact: userData.contact
      }));
      throw err; // Re-throw if needed, but don't block UI
    });
}

// Handle referral tracking
function handleReferral() {
  const urlParams = new URLSearchParams(window.location.search);
  const refCode = urlParams.get('ref');
  if (refCode) {
    sessionStorage.setItem('referralCode', refCode); // Store referral code for use on sign-in
  }
}

// Event handlers
function setupEventListeners() {
  // Google Sign-in
  // Google Sign-in
if (elements.buttons.googleLoginBtn) {
  elements.buttons.googleLoginBtn.addEventListener("click", () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        signedInUser = result.user;
        console.log("Signed in:", signedInUser.displayName);
        // Store user data after sign-in
        storeUserData(true).then(userId => {
          // Check for referral code and update referrer
          const refCode = sessionStorage.getItem('referralCode');
          if (refCode) {
            updateReferrer(refCode, userId, signedInUser.email);
          }
          // Set logged in flag and full state (including user details)
          sessionStorage.setItem("isLoggedIn", "true");
          sessionStorage.setItem("userState", JSON.stringify({
            ...state,
            name: signedInUser.displayName,
            email: signedInUser.email,
            contact: ""  // Google doesn't provide phone; leave empty
          }));
          window.location.href = "discount.html";
        });
      })
      .catch((error) => console.error(error));
  });
}

// Manual Submit
if (elements.buttons.manualFormSubmitBtn) {
  elements.buttons.manualFormSubmitBtn.addEventListener('click', () => {
    if (!elements.inputs.userName.value || !elements.inputs.userContact.value || !elements.inputs.userEmail.value) {
      alert('Please fill in name, contact, and email.');
      return;
    }
    // Store user data after manual submit
    storeUserData(false).then(userId => {
      // Check for referral code and update referrer
      const refCode = sessionStorage.getItem('referralCode');
      if (refCode) {
        updateReferrer(refCode, userId, elements.inputs.userEmail.value);
      }
      // Set logged in flag and full state (including user details)
      sessionStorage.setItem("isLoggedIn", "false");
      sessionStorage.setItem("userState", JSON.stringify({
        ...state,
        name: elements.inputs.userName.value,
        email: elements.inputs.userEmail.value,
        contact: elements.inputs.userContact.value
      }));
      window.location.href = "discount.html";
    });
  });
}
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
}

// Update referrer's data in Firebase
function updateReferrer(refCode, referredUserId, referredUserEmail) {
  get(ref(db, 'users')).then((snapshot) => {
    if (snapshot.exists()) {
      const users = snapshot.val();
      let referrerId = null;
      for (const userId in users) {
        if (users[userId].referralCode === refCode) {
          referrerId = userId;
          break;
        }
      }
      if (referrerId) {
        const referrerRef = ref(db, `users/${referrerId}`);
        update(referrerRef, {
          referredUsers: [...(users[referrerId].referredUsers || []), referredUserId],
          referralFlag: true
        }).then(() => {
          console.log(`Updated referrer ${referrerId} with referred user ${referredUserId}`);
          // Send email to referrer
          sendReferralEmail(users[referrerId].email, referredUserEmail);
        }).catch(err => {
          console.error('Error updating referrer:', err);
        });
      } else {
        console.warn(`No user found with referral code ${refCode}`);
      }
    } else {
      console.warn('No users found in database');
    }
  }).catch(err => {
    console.error('Error fetching users:', err);
  });
}

// Send referral email using EmailJS
function sendReferralEmail(referrerEmail, referredUserEmail) {
  emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', {
    to_email: referrerEmail,
    referred_user: referredUserEmail,
    message: `Great news! ${referredUserEmail} signed up using your referral link! Your discount may increase up to 25%.`
  }).then(() => {
    console.log('Referral email sent to', referrerEmail);
  }).catch(err => {
    console.error('Error sending referral email:', err);
  });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  handleReferral(); // Check for referral code on page load
  showSection(elements.sections.activitySection);
  setupImageSelection(elements.sections.oldMoneySec, state.selections.oldMoney);
  setupImageSelection(elements.sections.casualsSec, state.selections.casuals);
  setupImageSelection(elements.sections.streetWearSec, state.selections.streetWear);
  setupEventListeners();
});
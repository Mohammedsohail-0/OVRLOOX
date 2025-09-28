import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";
import { state, storeUserData, signedInUser } from "./index.js";

const generateCouponBtn = document.getElementById("generateCouponBtn");
const copyBtn = document.getElementById("copyBtn");
const shareBtn = document.getElementById("shareBtn");
const refLinkElement = document.getElementById("refLink");

let finalDiscount = 0;
let couponCode = "";
let referralCode = "";

// Prevent back navigation by replacing history state
document.addEventListener("DOMContentLoaded", () => {
  // Replace the current history entry with discount.html
  history.replaceState(null, "", "/discount.html");
  console.log("History state replaced to prevent going back");
});

// Retrieve state from sessionStorage
const storedState = sessionStorage.getItem("userState");
if (storedState) {
  try {
    Object.assign(state, JSON.parse(storedState));
    console.log("Restored state:", state);
  } catch (error) {
    console.error("Failed to parse userState from sessionStorage:", error);
  }
} else {
  console.warn("No stored state found in sessionStorage");
}

// Fetch latest user data from Firebase for referrals
async function fetchUserDataFromFirebase() {
  const isGoogle = sessionStorage.getItem("isLoggedIn") === "true";
  if (isGoogle && typeof signedInUser !== "undefined" && signedInUser && signedInUser.uid) {
    try {
      const userRef = ref(getDatabase(), `users/${signedInUser.uid}`);
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        const userData = snapshot.val();
        state.referredUsers = userData.referredUsers || [];
        console.log("Fetched latest user data with referrals:", state.referredUsers.length);
      }
    } catch (err) {
      console.error("Error fetching user data from Firebase:", err);
    }
  } else {
    console.log("Skipping Firebase fetch for non-Google user or missing signedInUser");
  }
}

async function generateCoupon() {
  const discountElement = document.getElementById("discount");
  const codeElement = document.getElementById("couponCode");
  const couponBox = document.getElementById("couponBox");

  if (!discountElement || !codeElement || !couponBox || !generateCouponBtn || !refLinkElement) {
    console.error("Required DOM elements not found");
    return;
  }

  // Check if a coupon already exists
  if (state.couponCode && state.discount && state.referralCode) {
    console.log("Coupon already generated:", state.couponCode, state.discount, state.referralCode);
    discountElement.textContent = state.discount + "%";
    codeElement.textContent = state.couponCode;
    refLinkElement.textContent = `${window.location.origin}/index.html?ref=${state.referralCode}`;
    couponBox.style.display = "flex";
    generateCouponBtn.disabled = true;
    if (typeof confetti !== "undefined") {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.4 },
      });
    } else {
      console.warn("Confetti library not loaded");
    }
    return;
  }

  generateCouponBtn.disabled = true;

  // Fetch latest referral data
  await fetchUserDataFromFirebase();

  // Generate base discount (5–15%) and adjust for referrals
  finalDiscount = Math.floor(Math.random() * (15 - 5 + 1)) + 5;
  const referralBonus = Math.min((state.referredUsers?.length || 0) * 5, 20);
  finalDiscount = Math.min(25, finalDiscount + referralBonus);
  state.discount = finalDiscount;
  couponCode = "CPN-" + Math.random().toString(36).substr(2, 6).toUpperCase();
  state.couponCode = couponCode;
  referralCode = "REF-" + Math.random().toString(36).substr(2, 8).toUpperCase();
  state.referralCode = referralCode;
  state.referredUsers = state.referredUsers || [];
  console.log("Coupon generated:", state.couponCode, state.discount, state.referralCode, "Referrals:", state.referredUsers.length);

  // Update referral link display
  const baseUrl = window.location.origin;
  refLinkElement.textContent = `${baseUrl}/index.html?ref=${referralCode}`;

  // Store user data with coupon and referral info
  const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true";
  try {
    await storeUserData(isLoggedIn);
  } catch (err) {
    console.error("Failed to store user data, proceeding with display:", err);
  }

  // Phase 1: fast spin (random numbers 0-99)
  const phase1 = setInterval(() => {
    discountElement.textContent = Math.floor(Math.random() * 100) + "%";
  }, 50);

  // After 1.5s move to phase 2
  setTimeout(() => {
    clearInterval(phase1);
    const phase2 = setInterval(() => {
      discountElement.textContent = Math.floor(Math.random() * (26 - 25 + 1)) + 25 + "%";
    }, 100);

    // After 1.5s move to final phase
    setTimeout(() => {
      clearInterval(phase2);
      let step = 0;
      const interval = setInterval(() => {
        step++;
        const ease = Math.min(1, step / 20);
        const value = Math.floor((25 + Math.random() * 25) * (1 - ease) + finalDiscount * ease);
        discountElement.textContent = value + "%";

        if (step >= 20) {
          clearInterval(interval);
          discountElement.textContent = finalDiscount + "%";
          codeElement.textContent = couponCode;
          couponBox.style.display = "flex";
          if (typeof confetti !== "undefined") {
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.4 },
            });
          } else {
            console.warn("Confetti library not loaded");
          }
        }
      }, 150);
    }, 1500);
  }, 1500);
}

// Event listeners
document.addEventListener("DOMContentLoaded", () => {
  if (generateCouponBtn) {
    generateCouponBtn.addEventListener("click", async () => {
      console.log("Generating coupon");
      await generateCoupon();
    });
  } else {
    console.error("generateCouponBtn not found in DOM");
  }

  if (copyBtn) {
    copyBtn.addEventListener("click", () => {
      console.log("Copying code");
      navigator.clipboard
        .writeText(couponCode)
        .then(() => {
          copyBtn.textContent = "Copied!";
          setTimeout(() => {
            copyBtn.textContent = "Copy";
          }, 2000);
        })
        .catch((err) => {
          console.error("Copy failed:", err);
        });
    });
  } else {
    console.error("copyBtn not found in DOM");
  }

  if (shareBtn) {
    shareBtn.addEventListener("click", () => {
      console.log("Copying referral link");
      navigator.clipboard
        .writeText(refLinkElement.textContent)
        .then(() => {
          shareBtn.textContent = "Copied!";
          setTimeout(() => {
            shareBtn.textContent = "Share";
          }, 2000);
        })
        .catch((err) => {
          console.error("Copy referral link failed:", err);
        });
    });
  } else {
    console.error("shareBtn not found in DOM");
  }
});
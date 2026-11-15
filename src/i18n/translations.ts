import type { Language } from '../types/i18n';
import type { ComplaintCategory, ComplaintStatus } from '../types/complaint';

export interface TranslationStrings {
  brandName: string;
  tagline: string;
  nav: {
    home: string;
    report: string;
    track: string;
    engineer: string;
    awareness: string;
    about: string;
    login: string;
    account: string;
  };
  hero: {
    panchayatLabel: string;
    heading: string;
    description: string;
    reportBtn: string;
    trackBtn: string;
  };
  disclaimer: {
    heading: string;
    body: string;
  };
  home: {
    howItWorksTitle: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
    statsTitle: string;
    statsDemoNote: string;
    awarenessTitle: string;
    viewAllAwareness: string;
    objectivesTitle: string;
  };
  report: {
    title: string;
    subtitle: string;
    signInPromptTitle: string;
    signInPromptDesc: string;
    signInBtn: string;
    citizenSection: string;
    nameLabel: string;
    mobileLabel: string;
    wardLabel: string;
    localityLabel: string;
    observationSection: string;
    categoryLabel: string;
    dateLabel: string;
    continuingLabel: string;
    descriptionLabel: string;
    locationSection: string;
    landmarkLabel: string;
    gpsBtn: string;
    gpsLoading: string;
    manualCoordsHint: string;
    latLabel: string;
    lngLabel: string;
    photosSection: string;
    photosHint: string;
    submitBtn: string;
    submittingBtn: string;
    successTitle: string;
    successSubtitle: string;
    complaintIdLabel: string;
    verifyHintLabel: string;
    trackNowBtn: string;
    reportAnotherBtn: string;
  };
  track: {
    title: string;
    subtitle: string;
    complaintIdLabel: string;
    mobileLast4Label: string;
    searchBtn: string;
    searchingBtn: string;
    notFound: string;
    myReportsTitle: string;
    detailsTitle: string;
    timelineTitle: string;
    remarksLabel: string;
    correctiveActionLabel: string;
    assignedEngineerLabel: string;
  };
  categories: Record<ComplaintCategory, string>;
  statuses: Record<ComplaintStatus, string>;
}

export const TRANSLATIONS: Record<Language, TranslationStrings> = {
  en: {
    brandName: 'Aqua Connect',
    tagline: 'Report. Track. Protect Every Drop.',
    nav: {
      home: 'Home',
      report: 'Report an Issue',
      track: 'Track Complaint',
      engineer: 'Engineer Dashboard',
      awareness: 'Water Awareness',
      about: 'About Us',
      login: 'Login',
      account: 'Account',
    },
    hero: {
      panchayatLabel: 'Mahatma Gandhi Herooru Grama Panchayat · Tumakuru District · Pilot Wards 2 & 4',
      heading: 'Safe Drinking Water Starts With Your Voice.',
      description:
        'Report water-related issues, track complaint progress and learn safe-water practices through one connected community platform.',
      reportBtn: 'Report Water Issue',
      trackBtn: 'Track Complaint',
    },
    disclaimer: {
      heading: 'Scientific Limitation & Platform Scope',
      body: 'Aqua Connect records citizen observations such as water colour, smell, taste and visible impurities. These observations are not laboratory test results and cannot determine whether water is safe for drinking. Formal water-quality testing must be conducted through an authorized water-testing laboratory.',
    },
    home: {
      howItWorksTitle: 'How Aqua Connect Works',
      step1Title: '01. Citizen Observation Report',
      step1Desc:
        'Residents submit structured observations with ward, landmark, GPS pin (optional), and photographs instead of unrecorded calls or chat messages.',
      step2Title: '02. Engineer Action & Investigation',
      step2Desc:
        'Authorized Grama Panchayat and PHED engineers acknowledge the report, inspect the site, record corrective actions, or refer samples to a certified lab.',
      step3Title: '03. Transparent Resolution',
      step3Desc:
        'Every status update is logged with timestamps and engineer remarks so citizens can track progress publicly using their unique Complaint ID.',
      statsTitle: 'Community Reporting Snapshot',
      statsDemoNote:
        'Demo Pilot Baseline — Representative pilot figures shown until live field reports accumulate in Firestore.',
      awarenessTitle: 'Safe-Water Awareness Highlights',
      viewAllAwareness: 'Open Awareness Centre',
      objectivesTitle: 'Project Objectives & Civic Impact',
    },
    report: {
      title: 'Report a Drinking-Water Issue',
      subtitle:
        'Submit structured citizen observations for Mahatma Gandhi Herooru Grama Panchayat (Pilot Wards 2 & 4).',
      signInPromptTitle: 'Verify Your Identity Before Submitting',
      signInPromptDesc:
        'Sign in with Google so your complaint is linked securely to your citizen account and protected against unauthorized tampering.',
      signInBtn: 'Sign in with Google',
      citizenSection: '1. Citizen Details',
      nameLabel: 'Full Name',
      mobileLabel: 'Mobile Number (10 digits)',
      wardLabel: 'Ward Number',
      localityLabel: 'Village / Locality',
      observationSection: '2. Water Observation Details',
      categoryLabel: 'Primary Observation Category',
      dateLabel: 'Observation Date & Time',
      continuingLabel: 'This issue is still continuing right now',
      descriptionLabel: 'Detailed Observation Description',
      locationSection: '3. Location & Landmark',
      landmarkLabel: 'Nearest Landmark / Street / Standpost',
      gpsBtn: 'Use Current GPS Location',
      gpsLoading: 'Locating...',
      manualCoordsHint:
        'Click anywhere on the map to adjust the pin, or enter landmark details manually if GPS permission is unavailable.',
      latLabel: 'Latitude (optional)',
      lngLabel: 'Longitude (optional)',
      photosSection: '4. Supporting Photographs (Optional)',
      photosHint: 'Upload up to 3 JPEG, PNG, or WebP photos (max 5 MB each).',
      submitBtn: 'Submit Water Issue Report',
      submittingBtn: 'Submitting Report...',
      successTitle: 'Complaint Registered Successfully',
      successSubtitle:
        'Your water observation has been recorded in the Herooru Grama Panchayat registry. Save your Complaint ID below to track engineer action.',
      complaintIdLabel: 'Unique Complaint ID',
      verifyHintLabel: 'Verification Digits (Last 4 of Mobile)',
      trackNowBtn: 'Track This Complaint',
      reportAnotherBtn: 'Submit Another Report',
    },
    track: {
      title: 'Track Complaint Status',
      subtitle:
        'Enter your Complaint ID and the last 4 digits of the registered mobile number to verify and view live progress.',
      complaintIdLabel: 'Complaint ID',
      mobileLast4Label: 'Last 4 Digits of Mobile',
      searchBtn: 'Check Status',
      searchingBtn: 'Verifying...',
      notFound: 'No complaint record matched that Complaint ID. Please double-check the ID and try again.',
      myReportsTitle: 'Your Submitted Complaints',
      detailsTitle: 'Verified Complaint Record',
      timelineTitle: 'Complaint History Timeline',
      remarksLabel: 'Engineer Remarks',
      correctiveActionLabel: 'Corrective Action Taken',
      assignedEngineerLabel: 'Assigned Engineer / Official',
    },
    categories: {
      'Muddy or cloudy water': 'Muddy or cloudy water',
      'Unusual colour': 'Unusual colour',
      'Unusual smell': 'Unusual smell',
      'Unusual taste': 'Unusual taste',
      'Visible particles': 'Visible particles',
      'Pipeline leakage': 'Pipeline leakage',
      'Irregular water supply': 'Irregular water supply',
      'Low water pressure': 'Low water pressure',
      Other: 'Other',
    },
    statuses: {
      Submitted: 'Submitted',
      Acknowledged: 'Acknowledged',
      'In Progress': 'In Progress',
      'Referred for Laboratory Testing': 'Referred for Laboratory Testing',
      Resolved: 'Resolved',
      Closed: 'Closed',
    },
  },
  kn: {
    brandName: 'ಅಕ್ವಾ ಕನೆಕ್ಟ್',
    tagline: 'ವರದಿ ಮಾಡಿ. ಟ್ರ್ಯಾಕ್ ಮಾಡಿ. ಪ್ರತಿ ಹನಿ ನೀರನ್ನು ರಕ್ಷಿಸಿ.',
    nav: {
      home: 'ಮುಖಪುಟ',
      report: 'ದೂರು ದಾಖಲಿಸಿ',
      track: 'ದೂರು ಸ್ಥಿತಿ',
      engineer: 'ಇಂಜಿನಿಯರ್ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
      awareness: 'ನೀರಿನ ಅರಿವು',
      about: 'ನಮ್ಮ ಬಗ್ಗೆ',
      login: 'ಲಾಗಿನ್',
      account: 'ಖಾತೆ',
    },
    hero: {
      panchayatLabel: 'ಮಹಾತ್ಮ ಗಾಂಧಿ ಹೆರೂರು ಗ್ರಾಮ ಪಂಚಾಯತಿ · ತುಮಕೂರು ಜಿಲ್ಲೆ · ಪ್ರಾಯೋಗಿಕ ವಾರ್ಡ್ 2 ಮತ್ತು 4',
      heading: 'ಸುರಕ್ಷಿತ ಕುಡಿಯುವ ನೀರು ನಿಮ್ಮ ಧ್ವನಿಯಿಂದ ಪ್ರಾರಂಭವಾಗುತ್ತದೆ.',
      description:
        'ಒಂದೇ ಸಮುದಾಯ ವೇದಿಕೆಯ ಮೂಲಕ ಕುಡಿಯುವ ನೀರಿನ ಸಮಸ್ಯೆಗಳನ್ನು ವರದಿ ಮಾಡಿ, ದೂರುಗಳ ಪ್ರಗತಿಯನ್ನು ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಸುರಕ್ಷಿತ ನೀರಿನ ಅಭ್ಯಾಸಗಳನ್ನು ತಿಳಿಯಿರಿ.',
      reportBtn: 'ನೀರಿನ ಸಮಸ್ಯೆ ವರದಿ ಮಾಡಿ',
      trackBtn: 'ದೂರು ಪರಿಶೀಲಿಸಿ',
    },
    disclaimer: {
      heading: 'ವೈಜ್ಞಾನಿಕ ಮಿತಿ ಮತ್ತು ವೇದಿಕೆಯ ವ್ಯಾಪ್ತಿ',
      body: 'ಅಕ್ವಾ ಕನೆಕ್ಟ್ ನೀರಿನ ಬಣ್ಣ, ವಾಸನೆ, ರುಚಿ ಮತ್ತು ಕಣ್ಣಿಗೆ ಕಾಣುವ ಕಲ್ಮಶಗಳಂತಹ ನಾಗರಿಕರ ಅವಲೋಕನಗಳನ್ನು ಮಾತ್ರ ದಾಖಲಿಸುತ್ತದೆ. ಈ ಅವಲೋಕನಗಳು ಪ್ರಯೋಗಾಲಯದ ಪರೀಕ್ಷಾ ಫಲಿತಾಂಶಗಳಲ್ಲ ಮತ್ತು ನೀರು ಕುಡಿಯಲು ಸುರಕ್ಷಿತವೇ ಎಂಬುದನ್ನು ನಿರ್ಧರಿಸಲು ಸಾಧ್ಯವಿಲ್ಲ. ಅಧಿಕೃತ ನೀರು ಪರೀಕ್ಷಾ ಪ್ರಯೋಗಾಲಯದ ಮೂಲಕವೇ ನಿಯಮಿತ ಗುಣಮಟ್ಟ ಪರೀಕ್ಷೆ ನಡೆಸಬೇಕು.',
    },
    home: {
      howItWorksTitle: 'ಅಕ್ವಾ ಕನೆಕ್ಟ್ ಹೇಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ',
      step1Title: '01. ನಾಗರಿಕರ ವರದಿ ಸಲ್ಲಿಕೆ',
      step1Desc:
        'ದಾಖಲಾಗದ ಫೋನ್ ಕರೆಗಳು ಅಥವಾ ಸಂದೇಶಗಳ ಬದಲಿಗೆ, ನಾಗರಿಕರು ವಾರ್ಡ್, ಗುರುತು, ಜಿಪಿಎಸ್ ಸ್ಥಳ ಮತ್ತು ಫೋಟೋದೊಂದಿಗೆ ದೂರನ್ನು ದಾಖಲಿಸುತ್ತಾರೆ.',
      step2Title: '02. ಇಂಜಿನಿಯರ್ ಪರಿಶೀಲನೆ ಮತ್ತು ಕ್ರಮ',
      step2Desc:
        'ಅಧಿಕೃತ ಗ್ರಾಮ ಪಂಚಾಯತಿ ಮತ್ತು ಪಿಹೆಚ್‌ಇಡಿ ಇಂಜಿನಿಯರ್‌ಗಳು ದೂರನ್ನು ಸ್ವೀಕರಿಸಿ, ಸ್ಥಳ ಪರಿಶೀಲನೆ ನಡೆಸಿ, ದುರಸ್ತಿ ಅಥವಾ ಪ್ರಯೋಗಾಲಯ ಪರೀಕ್ಷೆಗೆ ಕಳುಹಿಸುತ್ತಾರೆ.',
      step3Title: '03. ಪಾರದರ್ಶಕ ಪರಿಹಾರ',
      step3Desc:
        'ಪ್ರತಿ ಹಂತದ ಪ್ರಗತಿಯನ್ನು ಸಮಯ ಮತ್ತು ಷರಾದೊಂದಿಗೆ ದಾಖಲಿಸಲಾಗುತ್ತದೆ. ನಾಗರಿಕರು ತಮ್ಮ ದೂರು ಸಂಖ್ಯೆಯಿಂದ ಸ್ಥಿತಿಯನ್ನು ಪರಿಶೀಲಿಸಬಹುದು.',
      statsTitle: 'ಸಮುದಾಯ ವರದಿ ಸಾರಾಂಶ',
      statsDemoNote:
        'ಪ್ರಾಯೋಗಿಕ ಮಾದರಿ ಅಂಕಿಅಂಶ — ಡೇಟಾಬೇಸ್‌ನಲ್ಲಿ ನೈಜ ದೂರುಗಳು ಸಂಗ್ರಹವಾಗುವವರೆಗೆ ಪ್ರಾಯೋಗಿಕ ಮಾದರಿ ಮಾಹಿತಿ ತೋರಿಸಲಾಗುತ್ತಿದೆ.',
      awarenessTitle: 'ಸುರಕ್ಷಿತ ನೀರಿನ ಅರಿವು ಮುಖ್ಯಾಂಶಗಳು',
      viewAllAwareness: 'ಅರಿವು ಕೇಂದ್ರ ತೆರೆಯಿರಿ',
      objectivesTitle: 'ಯೋಜನೆಯ ಉದ್ದೇಶಗಳು ಮತ್ತು ಸಾಮಾಜಿಕ ಪರಿಣಾಮ',
    },
    report: {
      title: 'ಕುಡಿಯುವ ನೀರಿನ ಸಮಸ್ಯೆ ವರದಿ ಮಾಡಿ',
      subtitle:
        'ಮಹಾತ್ಮ ಗಾಂಧಿ ಹೆರೂರು ಗ್ರಾಮ ಪಂಚಾಯತಿ (ಪ್ರಾಯೋಗಿಕ ವಾರ್ಡ್ 2 ಮತ್ತು 4) ನಾಗರಿಕ ಅವಲೋಕನ ಫಾರ್ಮ್.',
      signInPromptTitle: 'ದೂರು ಸಲ್ಲಿಸುವ ಮೊದಲು ಗುರುತನ್ನು ದೃಢೀಕರಿಸಿ',
      signInPromptDesc:
        'ನಿಮ್ಮ ದೂರನ್ನು ಸುರಕ್ಷಿತವಾಗಿ ದಾಖಲಿಸಲು ಮತ್ತು ಅನಧಿಕೃತ ಬದಲಾವಣೆಗಳನ್ನು ತಡೆಯಲು ಗೂಗಲ್ ಮೂಲಕ ಸೈನ್ ಇನ್ ಮಾಡಿ.',
      signInBtn: 'Google ಮೂಲಕ ಸೈನ್ ಇನ್ ಮಾಡಿ',
      citizenSection: '1. ನಾಗರಿಕರ ವಿವರಗಳು',
      nameLabel: 'ಪೂರ್ಣ ಹೆಸರು',
      mobileLabel: 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ (10 ಅಂಕಿಗಳು)',
      wardLabel: 'ವಾರ್ಡ್ ಸಂಖ್ಯೆ',
      localityLabel: 'ಗ್ರಾಮ / ಬಡಾವಣೆ',
      observationSection: '2. ನೀರಿನ ಅವಲೋಕನ ವಿವರಗಳು',
      categoryLabel: 'ಮುಖ್ಯ ಸಮಸ್ಯೆಯ ವರ್ಗ',
      dateLabel: 'ಅವಲೋಕಿಸಿದ ದಿನಾಂಕ ಮತ್ತು ಸಮಯ',
      continuingLabel: 'ಈ ಸಮಸ್ಯೆ ಈಗಲೂ ಮುಂದುವರಿಯುತ್ತಿದೆ',
      descriptionLabel: 'ವಿವರವಾದ ಅವಲೋಕನ',
      locationSection: '3. ಸ್ಥಳ ಮತ್ತು ಹತ್ತಿರದ ಗುರುತು',
      landmarkLabel: 'ಹತ್ತಿರದ ಗುರುತು / ಬೀದಿ / ನಳದ ಸ್ಥಳ',
      gpsBtn: 'ಪ್ರಸ್ತುತ GPS ಸ್ಥಳ ಬಳಸಿ',
      gpsLoading: 'ಸ್ಥಳ ಪಡೆಯಲಾಗುತ್ತಿದೆ...',
      manualCoordsHint:
        'ನಕ್ಷೆಯ ಮೇಲೆ ಕ್ಲಿಕ್ ಮಾಡಿ ಪಿನ್ ಇರಿಸಿ, ಅಥವಾ GPS ಅನುಮತಿ ಇಲ್ಲದಿದ್ದರೆ ಗುರುತನ್ನು ಕೈಯಾರೆ ನಮೂದಿಸಿ.',
      latLabel: 'ಅಕ್ಷಾಂಶ (ಐಚ್ಛಿಕ)',
      lngLabel: 'ರೇಖಾಂಶ (ಐಚ್ಛಿಕ)',
      photosSection: '4. ಪೂರಕ ಫೋಟೋಗಳು (ಐಚ್ಛಿಕ)',
      photosHint: 'ಗರಿಷ್ಠ 3 JPEG, PNG, ಅಥವಾ WebP ಫೋಟೋಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ (ಪ್ರತಿ ಫೋಟೋ ಗರಿಷ್ಠ 5 MB).',
      submitBtn: 'ನೀರಿನ ದೂರು ಸಲ್ಲಿಸಿ',
      submittingBtn: 'ಸಲ್ಲಿಸಲಾಗುತ್ತಿದೆ...',
      successTitle: 'ದೂರು ಯಶಸ್ವಿಯಾಗಿ ದಾಖಲಾಗಿದೆ',
      successSubtitle:
        'ನಿಮ್ಮ ನೀರಿನ ಅವಲೋಕನವು ಹೆರೂರು ಗ್ರಾಮ ಪಂಚಾಯತಿ ದಾಖಲೆಯಲ್ಲಿ ಸೇರ್ಪಡೆಯಾಗಿದೆ. ಸ್ಥಿತಿ ಪರಿಶೀಲಿಸಲು ಕೆಳಗಿನ ದೂರು ಸಂಖ್ಯೆಯನ್ನು ಉಳಿಸಿ.',
      complaintIdLabel: 'ವಿಶಿಷ್ಟ ದೂರು ಸಂಖ್ಯೆ',
      verifyHintLabel: 'ಪರಿಶೀಲನಾ ಅಂಕಿಗಳು (ಮೊಬೈಲ್ ಕೊನೆಯ 4)',
      trackNowBtn: 'ಈ ದೂರನ್ನು ಪರಿಶೀಲಿಸಿ',
      reportAnotherBtn: 'ಮತ್ತೊಂದು ದೂರು ಸಲ್ಲಿಸಿ',
    },
    track: {
      title: 'ದೂರಿನ ಸ್ಥಿತಿ ಪರಿಶೀಲಿಸಿ',
      subtitle:
        'ಪ್ರಗತಿಯನ್ನು ನೋಡಲು ನಿಮ್ಮ ದೂರು ಸಂಖ್ಯೆ ಮತ್ತು ನೋಂದಾಯಿತ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯ ಕೊನೆಯ 4 ಅಂಕಿಗಳನ್ನು ನಮೂದಿಸಿ.',
      complaintIdLabel: 'ದೂರು ಸಂಖ್ಯೆ',
      mobileLast4Label: 'ಮೊಬೈಲ್ ಕೊನೆಯ 4 ಅಂಕಿಗಳು',
      searchBtn: 'ಸ್ಥಿತಿ ಪರಿಶೀಲಿಸಿ',
      searchingBtn: 'ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...',
      notFound: 'ಈ ದೂರು ಸಂಖ್ಯೆಗೆ ಯಾವುದೇ ದಾಖಲೆ ಕಂಡುಬಂದಿಲ್ಲ. ದಯವಿಟ್ಟು ಸಂಖ್ಯೆಯನ್ನು ಪರಿಶೀಲಿಸಿ.',
      myReportsTitle: 'ನೀವು ಸಲ್ಲಿಸಿದ ದೂರುಗಳು',
      detailsTitle: 'ದೃಢೀಕೃತ ದೂರು ವಿವರಗಳು',
      timelineTitle: 'ದೂರು ಪ್ರಗತಿ ಇತಿಹಾಸ',
      remarksLabel: 'ಇಂಜಿನಿಯರ್ ಷರಾ',
      correctiveActionLabel: 'ಕೈಗೊಂಡ ಸರಿಪಡಿಸುವ ಕ್ರಮ',
      assignedEngineerLabel: 'ನಿಯೋಜಿತ ಇಂಜಿನಿಯರ್ / ಅಧಿಕಾರಿ',
    },
    categories: {
      'Muddy or cloudy water': 'ಮಣ್ಣು ಮಿಶ್ರಿತ ಅಥವಾ ಮಸುಕಾದ ನೀರು',
      'Unusual colour': 'ಅಸಹಜ ಬಣ್ಣ',
      'Unusual smell': 'ಅಸಹಜ ವಾಸನೆ',
      'Unusual taste': 'ಅಸಹಜ ರುಚಿ',
      'Visible particles': 'ಕಣ್ಣಿಗೆ ಕಾಣುವ ಕಣಗಳು',
      'Pipeline leakage': 'ಪೈಪ್‌ಲೈನ್ ಸೋರಿಕೆ',
      'Irregular water supply': 'ಅನಿಯಮಿತ ನೀರು ಸರಬರಾಜು',
      'Low water pressure': 'ಕಡಿಮೆ ನೀರಿನ ಒತ್ತಡ',
      Other: 'ಇತರೆ',
    },
    statuses: {
      Submitted: 'ಸಲ್ಲಿಸಲಾಗಿದೆ',
      Acknowledged: 'ಸ್ವೀಕರಿಸಲಾಗಿದೆ',
      'In Progress': 'ಪ್ರಗತಿಯಲ್ಲಿದೆ',
      'Referred for Laboratory Testing': 'ಪ್ರಯೋಗಾಲಯ ಪರೀಕ್ಷೆಗೆ ಕಳುಹಿಸಲಾಗಿದೆ',
      Resolved: 'ಪರಿಹರಿಸಲಾಗಿದೆ',
      Closed: 'ಮುಕ್ತಾಯಗೊಂಡಿದೆ',
    },
  },
};

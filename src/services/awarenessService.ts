import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../config/firebase';
import type { AwarenessArticle, AwarenessCategory } from '../types/awareness';

export const AWARENESS_CATEGORIES: AwarenessCategory[] = [
  'Safe drinking-water storage',
  'Proper boiling practices',
  'Household purification guidance',
  'Tap and pipeline hygiene',
  'Warning signs of potentially unsafe water',
  'Water-borne illness awareness',
  'Appropriate health precautions',
];

export const CURATED_AWARENESS_ARTICLES: AwarenessArticle[] = [
  {
    articleId: 'art-safe-storage-01',
    title: 'Safe Household Drinking-Water Storage & Handling',
    titleKn: 'ಮನೆಯಲ್ಲಿ ಕುಡಿಯುವ ನೀರಿನ ಸುರಕ್ಷಿತ ಸಂಗ್ರಹಣೆ ಮತ್ತು ಬಳಕೆ',
    category: 'Safe drinking-water storage',
    content:
      'Store drinking water in clean, narrow-necked vessels or covered stainless steel / food-grade containers with tight-fitting lids. Always keep storage vessels elevated off the floor away from pets and dust. Use a dedicated long-handled clean ladle or tap spigot to draw water—never dip hands, cups, or mugs directly into stored drinking water. Scrub and rinse storage vessels thoroughly with clean water at least once a week.',
    contentKn:
      'ಕುಡಿಯುವ ನೀರನ್ನು ಸ್ವಚ್ಛವಾದ, ಬಿಗಿಯಾದ ಮುಚ್ಚಳವಿರುವ ಸ್ಟೇನ್‌ಲೆಸ್ ಸ್ಟೀಲ್ ಅಥವಾ ಆಹಾರ-ದರ್ಜೆಯ ಪಾತ್ರೆಗಳಲ್ಲಿ ಸಂಗ್ರಹಿಸಿ. ನೀರಿನ ಪಾತ್ರೆಗಳನ್ನು ನೆಲದಿಂದ ಎತ್ತರದಲ್ಲಿ ಮತ್ತು ಧೂಳಿನಿಂದ ದೂರವಿಡಿ. ನೀರನ್ನು ತೆಗೆಯಲು ಪ್ರತ್ಯೇಕವಾದ ಉದ್ದ ಹಿಡಿಯ ಚಮಚ ಅಥವಾ ಟ್ಯಾಪ್ ಬಳಸಿ; ಕೈ ಅಥವಾ ಲೋಟವನ್ನು ನೇರವಾಗಿ ನೀರಿನೊಳಗೆ ಅದ್ದಬೇಡಿ. ವಾರಕ್ಕೊಮ್ಮೆಯಾದರೂ ಪಾತ್ರೆಗಳನ್ನು ಸ್ವಚ್ಛವಾಗಿ ತೊಳೆಯಿರಿ.',
    sourceName: 'World Health Organization (WHO) — Household Water Treatment & Safe Storage',
    sourceUrl: 'https://www.who.int/teams/environment-climate-change-and-health/water-sanitation-and-health/water-safety-and-quality/household-water-treatment-and-safe-storage',
    lastReviewedAt: '2026-09-15',
    approvedByPhed: true,
  },
  {
    articleId: 'art-boiling-practices-02',
    title: 'Proper Boiling Practices for Microbiological Safety',
    titleKn: 'ಸೂಕ್ಷ್ಮಜೀವಿಗಳ ನಿವಾರಣೆಗೆ ಸರಿಯಾದ ನೀರು ಕುದಿಸುವ ವಿಧಾನ',
    category: 'Proper boiling practices',
    content:
      'When supply water appears cloudy or a pipeline repair has occurred nearby, let suspended silt settle or filter through a clean cloth first, then bring clear water to a rolling boil for at least 1 full minute (or 3 minutes at higher elevations). Allow the boiled water to cool naturally in the same covered pot without adding ice from untreated sources. Transfer to a clean, covered container once cooled.',
    contentKn:
      'ನೀರು ಮಸುಕಾಗಿದ್ದರೆ ಅಥವಾ ಪೈಪ್‌ಲೈನ್ ದುರಸ್ತಿ ನಡೆದಿದ್ದರೆ, ಮೊದಲು ಸ್ವಚ್ಛ ಬಟ್ಟೆಯಿಂದ ಶೋಧಿಸಿ, ನಂತರ ನೀರನ್ನು ಕನಿಷ್ಠ 1 ನಿಮಿಷ ಚೆನ್ನಾಗಿ ಕುದಿಸಿ (ಕುದಿಯುವ ಗುಳ್ಳೆಗಳು ಬರುವವರೆಗೆ). ಅದೇ ಮುಚ್ಚಿದ ಪಾತ್ರೆಯಲ್ಲಿ ತಣ್ಣಗಾಗಲು ಬಿಡಿ ಮತ್ತು ಸಂಸ್ಕರಿಸದ ಮಂಜುಗಡ್ಡೆ ಸೇರಿಸಬೇಡಿ. ತಣ್ಣಗಾದ ನಂತರ ಸ್ವಚ್ಛ, ಮುಚ್ಚಿದ ಪಾತ್ರೆಯಲ್ಲಿ ಸಂಗ್ರಹಿಸಿ.',
    sourceName: 'Centers for Disease Control and Prevention (CDC) — Making Water Safe',
    sourceUrl: 'https://www.cdc.gov/water-emergency/about/how-to-make-water-safe.html',
    lastReviewedAt: '2026-09-15',
    approvedByPhed: true,
  },
  {
    articleId: 'art-household-purification-03',
    title: 'Household Filtration & Chlorination Guidance',
    titleKn: 'ಮನೆಬಳಕೆಯ ನೀರು ಶೋಧನೆ ಮತ್ತು ಕ್ಲೋರಿನೀಕರಣ ಮಾರ್ಗದರ್ಶಿ',
    category: 'Household purification guidance',
    content:
      'Clean cotton cloth filtration removes visible sediment and larger suspended particles, while ceramic candle filters or BIS-compliant UV/RO purifiers provide additional household barriers when properly maintained. If using chlorine tablets or liquid bleach for emergency disinfection, follow exact dosage instructions on the package label, stir well, and wait 30 minutes before drinking. Maintain purifier cartridges according to manufacturer intervals.',
    contentKn:
      'ಸ್ವಚ್ಛ ಹತ್ತಿ ಬಟ್ಟೆಯ ಶೋಧನೆಯು ಕಣ್ಣಿಗೆ ಕಾಣುವ ಕಸ ಮತ್ತು ಮಣ್ಣಿನ ಕಣಗಳನ್ನು ತೆಗೆಯುತ್ತದೆ. ಸೆರಾಮಿಕ್ ಫಿಲ್ಟರ್ ಅಥವಾ ಬಿಐಎಸ್ ಪ್ರಮಾಣೀಕೃತ ಯುವಿ/ಆರ್‌ಒ ಶುದ್ಧೀಕರಣ ಯಂತ್ರಗಳನ್ನು ನಿಯಮಿತವಾಗಿ ನಿರ್ವಹಿಸಿ. ತುರ್ತು ಸಂದರ್ಭದಲ್ಲಿ ಕ್ಲೋರಿನ್ ಮಾತ್ರೆಗಳನ್ನು ಬಳಸುವಾಗ ಪ್ಯಾಕೆಟ್ ಮೇಲಿನ ಪ್ರಮಾಣವನ್ನು ನಿಖರವಾಗಿ ಅನುಸರಿಸಿ ಮತ್ತು ಕುಡಿಯುವ ಮೊದಲು 30 ನಿಮಿಷ ಕಾಯಿರಿ.',
    sourceName: 'Jal Jeevan Mission — Water Quality & Treatment Guidelines',
    sourceUrl: 'https://jaljeevanmission.gov.in/',
    lastReviewedAt: '2026-09-20',
    approvedByPhed: true,
  },
  {
    articleId: 'art-tap-pipeline-hygiene-04',
    title: 'Community Tap Stand & Distribution Pipeline Hygiene',
    titleKn: 'ಸಾರ್ವಜನಿಕ ನಳ ಮತ್ತು ಪೈಪ್‌ಲೈನ್ ಸ್ವಚ್ಛತೆ',
    category: 'Tap and pipeline hygiene',
    content:
      'Keep the concrete apron and drainage channel around public standposts free from stagnant water, animal waste, and washing runoff. Avoid attaching unauthorized rubber hoses or submersible suction pumps directly to distribution pipes, as negative pressure can draw groundwater or sewage into the drinking-water line. Report leaking joints, broken valves, or submerged pipe sections immediately on Aqua Connect.',
    contentKn:
      'ಸಾರ್ವಜನಿಕ ನಳಗಳ ಸುತ್ತಲಿನ ಜಾಗ ಮತ್ತು ಚರಂಡಿಯಲ್ಲಿ ನೀರು ನಿಲ್ಲದಂತೆ ಸ್ವಚ್ಛವಾಗಿಡಿ. ಪೈಪ್‌ಲೈನ್‌ಗೆ ನೇರವಾಗಿ ರಬ್ಬರ್ ಪೈಪ್ ಅಥವಾ ಮೋಟಾರ್ ಪಂಪ್ ಜೋಡಿಸಬೇಡಿ; ಇದು ಕಲುಷಿತ ನೀರನ್ನು ಒಳಕ್ಕೆ ಎಳೆಯಬಹುದು. ಸೋರುವ ಜಾಯಿಂಟ್‌ಗಳು ಅಥವಾ ಒಡೆದ ಕವಾಟಗಳನ್ನು ತಕ್ಷಣ ಅಕ್ವಾ ಕನೆಕ್ಟ್‌ನಲ್ಲಿ ವರದಿ ಮಾಡಿ.',
    sourceName: 'BIS IS 10500:2012 Drinking Water Specification & Panchayat O&M Standards',
    sourceUrl: 'https://www.bis.gov.in/',
    lastReviewedAt: '2026-09-22',
    approvedByPhed: true,
  },
  {
    articleId: 'art-warning-signs-05',
    title: 'Recognizing Warning Signs of Potentially Unsafe Water',
    titleKn: 'ಅಸುರಕ್ಷಿತ ನೀರಿನ ಎಚ್ಚರಿಕೆ ಲಕ್ಷಣಗಳನ್ನು ಗುರುತಿಸುವುದು',
    category: 'Warning signs of potentially unsafe water',
    content:
      'Visual and sensory changes—such as muddy turbidity, yellowish/brownish discolouration, metallic or rotten-egg odour, soapy foam, oil sheen, or sudden salty/bitter taste—are early warning signs that warrant reporting and laboratory testing. Note that clear, odourless water can still contain invisible microbial or chemical contaminants; formal BIS IS 10500 laboratory testing by authorized PHED/RDWSD labs is required to verify potability.',
    contentKn:
      'ಮಣ್ಣಿನಂತೆ ಮಸುಕಾದ ನೀರು, ಹಳದಿ/ಕಂದು ಬಣ್ಣ, ದುರ್ವಾಸನೆ, ನೊರೆ, ಎಣ್ಣೆಯಂಶ ಅಥವಾ ಅಸಹಜ ರುಚಿ ಕಂಡುಬಂದರೆ ಅದು ಎಚ್ಚರಿಕೆಯ ಸಂಕೇತವಾಗಿದೆ. ಆದರೆ ಶುದ್ಧವಾಗಿ ಕಾಣುವ ಮತ್ತು ವಾಸನೆಯಿಲ್ಲದ ನೀರಿನಲ್ಲೂ ಕಣ್ಣಿಗೆ ಕಾಣದ ಸೂಕ್ಷ್ಮಜೀವಿಗಳು ಅಥವಾ ರಾಸಾಯನಿಕಗಳು ಇರಬಹುದು. ನೀರಿನ ಸುರಕ್ಷತೆಯನ್ನು ದೃಢಪಡಿಸಲು ಅಧಿಕೃತ ಪ್ರಯೋಗಾಲಯದ ಪರೀಕ್ಷೆಯೇ ಅಗತ್ಯ.',
    sourceName: 'Bureau of Indian Standards (BIS) — IS 10500:2012 Drinking Water Standard',
    sourceUrl: 'https://www.bis.gov.in/',
    lastReviewedAt: '2026-09-25',
    approvedByPhed: true,
  },
  {
    articleId: 'art-waterborne-illness-06',
    title: 'Water-Borne Illness Awareness & Early Symptoms',
    titleKn: 'ನೀರಿನಿಂದ ಹರಡುವ ರೋಗಗಳ ಅರಿವು ಮತ್ತು ಲಕ್ಷಣಗಳು',
    category: 'Water-borne illness awareness',
    content:
      'Contaminated drinking water can transmit diarrhoeal diseases, cholera, typhoid fever, hepatitis A, and dysentery. Seek prompt medical attention at the nearest Primary Health Centre (PHC) if household members experience watery diarrhoea, persistent vomiting, abdominal cramps, fever, or jaundice. Early Oral Rehydration Solution (ORS) prevents severe dehydration, especially in infants and elderly residents.',
    contentKn:
      'ಕಲುಷಿತ ಕುಡಿಯುವ ನೀರಿನಿಂದ ಅತಿಸಾರ, ಕಾಲರಾ, ಟೈಫಾಯಿಡ್, ಹೆಪಟೈಟಿಸ್ ಎ ಮತ್ತು ಆಮಶಂಕೆ ಮುಂತಾದ ರೋಗಗಳು ಹರಡಬಹುದು. ಕುಟುಂಬದವರಿಗೆ ಭೇದಿ, ವಾಂತಿ, ಹೊಟ್ಟೆ ನೋವು, ಜ್ವರ ಅಥವಾ ಕಾಮಾಲೆ ಲಕ್ಷಣಗಳು ಕಂಡುಬಂದರೆ ತಕ್ಷಣ ಹತ್ತಿರದ ಪ್ರಾಥಮಿಕ ಆರೋಗ್ಯ ಕೇಂದ್ರವನ್ನು ಸಂಪರ್ಕಿಸಿ. ನಿರ್ಜಲೀಕರಣ ತಡೆಯಲು ಓಆರ್‌ಎಸ್ (ORS) ದ್ರಾವಣವನ್ನು ತಕ್ಷಣ ನೀಡಿ.',
    sourceName: 'World Health Organization (WHO) — Drinking-Water Fact Sheet',
    sourceUrl: 'https://www.who.int/news-room/fact-sheets/detail/drinking-water',
    lastReviewedAt: '2026-10-01',
    approvedByPhed: true,
  },
  {
    articleId: 'art-health-precautions-07',
    title: 'Community Health Precautions During Supply Disruptions',
    titleKn: 'ನೀರು ಸರಬರಾಜು ವ್ಯತ್ಯಯದ ಸಮಯದಲ್ಲಿ ಆರೋಗ್ಯ ಮುನ್ನೆಚ್ಚರಿಕೆಗಳು',
    category: 'Appropriate health precautions',
    content:
      'After heavy rainfall, pipeline repairs, or intermittent low-pressure events, flush household taps for 1–2 minutes until water runs clear before collecting for drinking, and boil water as a precaution until PHED engineers confirm line flushing is complete. Wash hands thoroughly with soap before handling water vessels, preparing food, and after using sanitation facilities.',
    contentKn:
      'ಭಾರಿ ಮಳೆ, ಪೈಪ್‌ಲೈನ್ ದುರಸ್ತಿ ಅಥವಾ ಕಡಿಮೆ ಒತ್ತಡದ ನಂತರ, ಕುಡಿಯುವ ನೀರು ಹಿಡಿಯುವ ಮೊದಲು 1–2 ನಿಮಿಷಗಳ ಕಾಲ ನಳವನ್ನು ಬಿಟ್ಟು ಪೈಪ್‌ನಲ್ಲಿರುವ ಕಲುಷಿತ ನೀರನ್ನು ಹರಿಸಿಬಿಡಿ. ಇಂಜಿನಿಯರ್‌ಗಳು ಪೈಪ್ ಸ್ವಚ್ಛತೆಯನ್ನು ದೃಢಪಡಿಸುವವರೆಗೆ ಕುದಿಸಿದ ನೀರನ್ನೇ ಬಳಸಿ. ನೀರಿನ ಪಾತ್ರೆಗಳನ್ನು ಮುಟ್ಟುವ ಮೊದಲು ಕೈಗಳನ್ನು ಸಾಬೂನಿನಿಂದ ತೊಳೆಯಿರಿ.',
    sourceName: 'CDC & Jal Jeevan Mission — Safe Water Hygiene Precautions',
    sourceUrl: 'https://www.cdc.gov/hygiene/about/when-and-how-to-wash-your-hands.html',
    lastReviewedAt: '2026-10-05',
    approvedByPhed: true,
  },
];

export async function fetchAwarenessArticles(includeDrafts = false): Promise<AwarenessArticle[]> {
  const path = 'awareness_articles';
  try {
    const q = includeDrafts
      ? query(collection(db, 'awareness_articles'))
      : query(collection(db, 'awareness_articles'), where('approvedByPhed', '==', true));
    const snap = await getDocs(q);
    const firestoreArticles = snap.docs.map((d) => d.data() as AwarenessArticle);

    if (firestoreArticles.length === 0) {
      return CURATED_AWARENESS_ARTICLES;
    }

    // Merge curated articles not yet overwritten in Firestore
    const existingIds = new Set(firestoreArticles.map((a) => a.articleId));
    const combined = [
      ...firestoreArticles,
      ...CURATED_AWARENESS_ARTICLES.filter((a) => !existingIds.has(a.articleId)),
    ];
    return combined;
  } catch (error) {
    // Public fallback to curated articles if Firestore read fails offline
    if (error instanceof Error && error.message.includes('offline')) {
      return CURATED_AWARENESS_ARTICLES;
    }
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function saveAwarenessArticle(article: AwarenessArticle): Promise<void> {
  const articleId = article.articleId.trim();
  const path = `awareness_articles/${articleId}`;
  const docRef = doc(db, 'awareness_articles', articleId);

  const payload = {
    articleId,
    title: article.title.trim().slice(0, 200),
    titleKn: (article.titleKn || '').trim().slice(0, 250),
    category: article.category,
    content: article.content.trim().slice(0, 8000),
    contentKn: (article.contentKn || '').trim().slice(0, 8000),
    sourceName: article.sourceName.trim().slice(0, 120),
    sourceUrl: article.sourceUrl.trim().slice(0, 500),
    lastReviewedAt: article.lastReviewedAt.trim().slice(0, 40),
    approvedByPhed: Boolean(article.approvedByPhed),
    createdAt: article.createdAt || serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(docRef, payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

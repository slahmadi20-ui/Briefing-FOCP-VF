import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_PROMPT } from "../constants";
import { BriefingData, GroundingSource, ExpandedHeritageInfo, CountryFocusData, BriefingSection } from "../types";

// --- CLIENT INITIALIZATION ---
let ai: GoogleGenAI;

function getClient(): GoogleGenAI {
    if (!ai) {
        if (!process.env.API_KEY) {
            throw new Error("API_KEY environment variable not set. Please configure it.");
        }
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
    return ai;
}

// --- RATE LIMITER ---
class SmartRateLimiter {
    private queue: Array<() => Promise<any>> = [];
    private isProcessing = false;
    private minIntervalMs = 2500; // 2.5s interval to be safe against strict rate limits

    enqueue<T>(task: () => Promise<T>): Promise<T> {
        return new Promise((resolve, reject) => {
            this.queue.push(async () => {
                try {
                    const result = await task();
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            });
            this.processQueue();
        });
    }

    private async processQueue() {
        if (this.isProcessing) return;
        this.isProcessing = true;

        while (this.queue.length > 0) {
            const task = this.queue.shift();
            if (task) {
                try {
                    await task();
                } catch (e) {
                    // Task error already handled in enqueue wrapper, but we catch here to ensure loop continues
                }
                // Wait interval before next request starts
                await new Promise(resolve => setTimeout(resolve, this.minIntervalMs));
            }
        }

        this.isProcessing = false;
    }
}

// Global limiter instance to coordinate all heavy calls
const apiLimiter = new SmartRateLimiter();


// --- COMMON SCHEMAS ---
const articleReferenceSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING },
        source: { type: Type.STRING },
        url: { type: Type.STRING, description: "L'URL complète et directe de l'article source, pas la page d'accueil du site." },
    },
    required: ['title', 'source', 'url'],
};

// --- BRIEFING GENERATION SCHEMAS ---
const briefingPointSchema = {
  type: Type.OBJECT,
  properties: {
    subTitle: { type: Type.STRING },
    details: { type: Type.STRING },
    references: { type: Type.ARRAY, items: articleReferenceSchema },
    verificationNeeded: { type: Type.STRING, description: "Mentionne ici tout point qui nécessite une vérification croisée ou qui est basé sur une source unique/moins fiable." },
  },
  required: ['subTitle', 'details', 'references'],
};

export const briefingSectionSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING },
        content: { type: Type.ARRAY, items: briefingPointSchema },
    },
    required: ['title', 'content'],
};

const commodityPriceSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING },
        price: { type: Type.STRING },
        unit: { type: Type.STRING, description: "Unité de mesure (ex: $/tonne, c/bu)." },
        change: { type: Type.STRING },
        lastYearPrice: { type: Type.STRING, description: "Prix il y a un an (N-1)." },
        evolution: { type: Type.STRING, description: "Évolution sur un an (ex: +12%)." },
        trend: { type: Type.STRING, enum: ['up', 'down', 'stable'] },
        analysis: { type: Type.STRING, description: "Variation récente, facteurs explicatifs et corrélation avec le marché agricole." },
    },
    required: ['name', 'price', 'unit', 'change', 'lastYearPrice', 'evolution', 'trend'],
};

const highlightSchema = {
    type: Type.OBJECT,
    properties: {
        type: { type: Type.STRING, enum: ['coeur', 'gueule'] },
        country: { type: Type.STRING },
        title: { type: Type.STRING },
        details: { type: Type.STRING },
    },
    required: ['type', 'country', 'title', 'details'],
};

const internationalEventSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING },
        date: { type: Type.STRING },
        location: { type: Type.STRING },
        description: { type: Type.STRING },
    },
    required: ['name', 'date', 'location', 'description'],
};

const annualEventSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING },
        dateRange: { type: Type.STRING, description: "Date précise ou mois (ex: '12-15 Novembre 2024')" },
        location: { type: Type.STRING },
        theme: { type: Type.STRING, description: "Thématique principale : Agriculture, Sol, Climat, Mangrove, Fertilisation, Afrique, Eau, Biodiversité." },
        description: { type: Type.STRING },
        url: { type: Type.STRING, description: "Site officiel de l'événement." },
    },
    required: ['name', 'dateRange', 'location', 'theme', 'description'],
};

const imageOfTheDaySchema = {
    type: Type.OBJECT,
    properties: {
        imageUrl: { type: Type.STRING },
        commentary: { type: Type.STRING },
        reference: articleReferenceSchema,
    },
    required: ['imageUrl', 'commentary', 'reference'],
};

const videoOfTheDaySchema = {
    type: Type.OBJECT,
    properties: {
        videoUrl: { type: Type.STRING },
        title: { type: Type.STRING },
        commentary: { type: Type.STRING },
        reference: articleReferenceSchema,
        posterImagePrompt: { type: Type.STRING, description: "Prompt détaillé pour générer une image d'affiche cinématique représentant le sujet de la vidéo." },
    },
    required: ['videoUrl', 'title', 'commentary', 'reference', 'posterImagePrompt'],
};

// ... (keep other schemas)

export const refreshBriefingSection = async (sectionKey: 'softPowerInfluence' | 'strategicMoves' | 'strategicMoves-OCP' | 'strategicMoves-International' | 'internationalEvents' | 'annualStrategicEvents'): Promise<any> => {
    return apiLimiter.enqueue(async () => {
        const ai = getClient();
        let prompt = "";
        let schema = null;

        if (sectionKey === 'softPowerInfluence') {
            prompt = `Génère une NOUVELLE et DIFFÉRENTE proposition pour la section "Influence & Soft Power". 
            Ne propose PAS la même personne que précédemment si possible. 
            Concentre-toi sur une personnalité africaine influente (Business, Culture, Tech, Politique) avec un impact international.`;
            schema = softPowerInfluenceSchema;
        } else if (sectionKey === 'strategicMoves') {
            // Legacy/Fallback
            prompt = `Génère une NOUVELLE liste de "Mouvements Stratégiques" (Nominations C-Suite).
            Concentre-toi sur des nominations RÉCENTES (moins de 3 mois) dans l'écosystème OCP ou chez ses concurrents majeurs.
            Fournis AU MOINS 3 nominations distinctes.`;
            schema = { type: Type.ARRAY, items: strategicMoveSchema };
        } else if (sectionKey === 'strategicMoves-OCP') {
            prompt = `Génère une NOUVELLE liste de "Mouvements Stratégiques" (Nominations C-Suite) UNIQUEMENT pour l'Écosystème OCP (OCP SA, UM6P, JESA, OCP Africa, InnovX, etc.).
            Concentre-toi sur des nominations RÉCENTES (moins de 3 mois).
            Fournis AU MOINS 2 nominations distinctes si possible.`;
            schema = { type: Type.ARRAY, items: strategicMoveSchema };
        } else if (sectionKey === 'strategicMoves-International') {
            prompt = `Génère une NOUVELLE liste de "Mouvements Stratégiques" (Nominations C-Suite) UNIQUEMENT pour les concurrents internationaux et partenaires majeurs (Mosaic, Nutrien, Yara, Ma'aden, PhosAgro, etc.).
            Concentre-toi sur des nominations RÉCENTES (moins de 3 mois).
            Fournis AU MOINS 2 nominations distinctes.`;
            schema = { type: Type.ARRAY, items: strategicMoveSchema };
        } else if (sectionKey === 'internationalEvents') {
            prompt = `Génère une NOUVELLE liste d'événements internationaux pour "Cette Semaine" ou les semaines à venir.
            Concentre-toi sur : Agriculture, Climat, Diplomatie Africaine, Fertilisants.
            Fournis AU MOINS 3 événements distincts et pertinents.`;
            schema = { type: Type.ARRAY, items: internationalEventSchema };
        } else if (sectionKey === 'annualStrategicEvents') {
            prompt = `Génère une NOUVELLE liste d'événements stratégiques majeurs pour l'année ("Agenda Stratégique Annuel").
            Concentre-toi sur les grands sommets (COP, UA, Davos, Sommets Agri-Business, etc.).
            Fournis AU MOINS 3 événements distincts.`;
            schema = { type: Type.ARRAY, items: annualEventSchema };
        }

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: {
                systemInstruction: SYSTEM_PROMPT,
                responseMimeType: 'application/json',
                responseSchema: schema,
                tools: [{ googleSearch: {} }],
            },
        });

        const jsonText = response.text.trim();
        try {
            return JSON.parse(jsonText);
        } catch (e) {
            console.error(`Failed to parse refresh JSON for ${sectionKey}:`, e);
            throw new Error(`Invalid JSON response from AI for ${sectionKey}.`);
        }
    });
};

const globalSouthTrendSchema = {
    type: Type.OBJECT,
    properties: {
        country: { type: Type.STRING },
        flagImageUrl: { type: Type.STRING },
        trends: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    category: { type: Type.STRING, enum: ['Politique', 'Économie', 'Social', 'Technologie', 'Environnement', 'Autre'] },
                    title: { type: Type.STRING },
                    points: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Liste de points clés clairs et concis." },
                    reference: articleReferenceSchema,
                },
                required: ['category', 'title', 'points', 'reference'],
            }
        }
    },
    required: ['country', 'flagImageUrl', 'trends'],
};

const africanHeritageSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING },
        description: { type: Type.STRING },
        source: { type: Type.STRING },
        sourceUrl: { type: Type.STRING },
        imagePrompt: { type: Type.STRING },
    },
    required: ['title', 'description', 'source', 'sourceUrl', 'imagePrompt'],
};

const softPowerInfluenceSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING },
        field: { type: Type.STRING },
        country: { type: Type.STRING },
        presentation: { type: Type.STRING },
        impact: { type: Type.STRING },
        reasonForTrending: { type: Type.STRING },
        imageUrl: { type: Type.STRING, description: "OBLIGATOIRE : Utilise Google Search pour trouver l'URL directe d'une photo réelle et récente de cette personne (jpg/png). Ne génère pas d'URL fictive." },
        reference: articleReferenceSchema,
        ocpLink: { type: Type.STRING },
    },
    required: ['name', 'field', 'country', 'presentation', 'impact', 'reasonForTrending', 'imageUrl', 'reference'],
};

const strategicMoveSchema = {
    type: Type.OBJECT,
    properties: {
        personName: { type: Type.STRING },
        newRole: { type: Type.STRING },
        company: { type: Type.STRING },
        country: { type: Type.STRING },
        appointmentDate: { type: Type.STRING },
        background: { type: Type.STRING },
        imageUrl: { type: Type.STRING, description: "OBLIGATOIRE : Utilise Google Search pour trouver l'URL directe d'une photo professionnelle (LinkedIn/Corporate) de cette personne. Priorité absolue à une image réelle." },
        linkedinUrl: { type: Type.STRING, description: "URL du profil LinkedIn de la personne (si disponible)." },
        reference: articleReferenceSchema,
    },
    required: ['personName', 'newRole', 'company', 'country', 'appointmentDate', 'background', 'reference'],
};

const weakSignalSchema = {
    type: Type.OBJECT,
    properties: {
        signal: { type: Type.STRING },
        potentialImpact: { type: Type.STRING },
        timescale: { type: Type.STRING },
        confidenceLevel: { type: Type.STRING, enum: ['low', 'medium', 'high'] },
        reference: articleReferenceSchema,
    },
    required: ['signal', 'potentialImpact', 'timescale', 'confidenceLevel', 'reference'],
};

const ocpNewsItemSchema = {
    type: Type.OBJECT,
    properties: {
        entityName: { type: Type.STRING },
        category: { type: Type.STRING, enum: ['Sites Industriels', 'Filiales', 'Écosystème UM6P', 'Gouvernance', 'Projets & Initiatives'] },
        title: { type: Type.STRING },
        summary: { type: Type.STRING },
        reference: articleReferenceSchema,
    },
    required: ['entityName', 'category', 'title', 'summary', 'reference'],
};

const strategicArticleSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING },
        analysis: { type: Type.STRING },
        reference: articleReferenceSchema,
    },
    required: ['title', 'analysis', 'reference'],
};

const ocpKeyFiguresSchema = {
    type: Type.OBJECT,
    properties: {
        turnover: { type: Type.STRING, description: "Chiffre d'affaires récent (ex: 2023/2024) en Mrd MAD/USD." },
        ebitda: { type: Type.STRING, description: "EBITDA récent." },
        investment: { type: Type.STRING, description: "Montant des investissements récents." },
        employees: { type: Type.STRING, description: "Nombre total de collaborateurs." },
        productionCapacity: { type: Type.STRING, description: "Capacité de production (ex: 12 Mt Engrais)." },
        confirmedNews: { 
            type: Type.ARRAY, 
            items: {
                type: Type.OBJECT,
                properties: {
                    date: { type: Type.STRING },
                    title: { type: Type.STRING },
                    source: { type: Type.STRING },
                    url: { type: Type.STRING },
                },
                required: ['date', 'title', 'source']
            },
            description: "3 actualités récentes et confirmées sur le Groupe OCP." 
        },
    },
    required: ['turnover', 'ebitda', 'investment', 'employees', 'productionCapacity', 'confirmedNews'],
};

const competitorNewsSchema = {
    type: Type.OBJECT,
    properties: {
        companyName: { type: Type.STRING },
        headquarters: { type: Type.STRING },
        newsTitle: { type: Type.STRING },
        newsSummary: { type: Type.STRING },
        strategicImpact: { type: Type.STRING, description: "Impact potentiel sur le marché ou le Groupe OCP." },
        sourceQuality: { type: Type.STRING, description: "Évaluation de la fiabilité de la source (ex: Haute - Rapport Annuel, Moyenne - Presse)." },
        reference: articleReferenceSchema,
    },
    required: ['companyName', 'headquarters', 'newsTitle', 'newsSummary', 'strategicImpact', 'reference'],
};

// Schema for the lightweight initial dashboard load
const briefingDataCoreSchema = {
  type: Type.OBJECT,
  properties: {
    date: { type: Type.STRING },
    alerts: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          sector: { type: Type.STRING },
          event: { type: Type.STRING },
          impact: { type: Type.STRING },
          severity: { type: Type.STRING, enum: ['high', 'medium', 'low'] },
          references: { type: Type.ARRAY, items: articleReferenceSchema },
        },
        required: ['sector', 'event', 'impact', 'severity'],
      },
    },
    commodityPrices: { type: Type.ARRAY, items: commodityPriceSchema },
    marketAnalysis: { type: Type.STRING, description: "Analyse globale des tendances des marchés des fertilisants et commodities agricoles." },
    ocpKeyFigures: ocpKeyFiguresSchema,
    highlights: { type: Type.ARRAY, items: highlightSchema },
    strategicArticle: strategicArticleSchema,
    internationalEvents: { type: Type.ARRAY, items: internationalEventSchema },
    annualStrategicEvents: { type: Type.ARRAY, items: annualEventSchema },
    imageOfTheDay: imageOfTheDaySchema,
    videoOfTheDay: videoOfTheDaySchema,
    globalSouthTrends: { type: Type.ARRAY, items: globalSouthTrendSchema },
    africanHeritage: africanHeritageSchema,
    softPowerInfluence: softPowerInfluenceSchema,
    strategicMoves: { type: Type.ARRAY, items: strategicMoveSchema },
    weakSignals: { type: Type.ARRAY, items: weakSignalSchema, description: "Identifie au moins 3 signaux faibles émergents et pertinents." },
    ocpGroupNews: { type: Type.ARRAY, items: ocpNewsItemSchema },
    competitorNews: { type: Type.ARRAY, items: competitorNewsSchema, description: "Analyse des principaux concurrents mondiaux (Mosaic, Nutrien, PhosAgro, Ma'aden, Yara, etc.) avec leurs actualités récentes. Fournis au moins 3 actualités distinctes." },
  },
  required: [
      'date', 'alerts', 'commodityPrices', 'marketAnalysis', 'ocpKeyFigures', 'highlights', 'strategicArticle', 'internationalEvents', 'annualStrategicEvents',
      'imageOfTheDay', 'videoOfTheDay', 'globalSouthTrends', 'africanHeritage',
      'softPowerInfluence', 'strategicMoves', 'weakSignals', 'ocpGroupNews', 'competitorNews'
  ],
};


export const generateDashboardCore = async (date: Date): Promise<Partial<BriefingData>> => {
    // We do NOT use the rate limiter for the CORE request because it's the first one and shouldn't be delayed.
    const ai = getClient();
    const formattedDate = date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
    
    const prompt = `Génère les données principales du tableau de bord pour la date : ${formattedDate}. 
    
    IMPORTANT POUR LES NOMINATIONS (StrategicMoves) :
    - Cherche spécifiquement sur LinkedIn et les sites corporate.
    - Trouve l'URL du profil LinkedIn des personnes nommées si possible.
    - Concentre-toi sur l'écosystème OCP (UM6P, JESA, OCP Africa...) et les concurrents majeurs.

    IMPORTANT POUR LES ÉVÉNEMENTS (InternationalEvents & AnnualStrategicEvents) :
    - Cherche des événements futurs liés à : Agriculture, Santé des Sols, Climat, Mangrove, Fertilisation, Afrique, Eau.
    - Inclus le lien vers le site officiel de l'événement si disponible.

    IMPORTANT POUR LA VEILLE CONCURRENTIELLE ET SIGNAUX FAIBLES :
    - Fournis AU MOINS 3 actualités distinctes sur les concurrents (Mosaic, Nutrien, etc.) avec une mention sur la qualité des sources.
    - Fournis AU MOINS 3 signaux faibles pertinents.
    
    IMPORTANT POUR LE DASHBOARD OCP :
    - Remplis les chiffres clés (CA, EBITDA, Employés...) avec les dernières données annuelles/semestrielles disponibles.
    - Ajoute 3 news confirmées récentes.

    IMPORTANT POUR LES MATIÈRES PREMIÈRES :
    - Inclus le prix de l'année dernière (N-1) et l'évolution en %.

    EXCLURE les sections d'analyse détaillées (marocNews, ocpEcosystem, etc.). Fournis uniquement les éléments rapides : alertes, prix, highlights, événements, etc.`;

    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview', // Use a faster model for the core data
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
            systemInstruction: SYSTEM_PROMPT,
            responseMimeType: 'application/json',
            responseSchema: briefingDataCoreSchema,
            tools: [{ googleSearch: {} }],
        },
    });

    const jsonText = response.text.trim();
    try {
        const data = JSON.parse(jsonText);
        
        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        const sources: GroundingSource[] = [];
        if (groundingChunks) {
            for (const chunk of groundingChunks) {
                if (chunk.web) {
                    sources.push({ url: chunk.web.uri, title: chunk.web.title });
                }
            }
        }
        
        return { ...data, groundingSources: sources };
    } catch (e) {
        console.error("Failed to parse core briefing JSON:", e);
        console.error("Received text:", jsonText);
        throw new Error("Invalid JSON response from AI for core briefing.");
    }
};

export const generateBriefingSection = async (sectionType: string): Promise<BriefingSection> => {
    // Rate limit specific sections
    return apiLimiter.enqueue(async () => {
        const ai = getClient();
        const prompt = `Génère UNIQUEMENT la section de briefing détaillée pour "${sectionType}". Fournis le titre et le contenu sourcé.`;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview', // Switch to FLASH for speed and higher quotas
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: {
                systemInstruction: SYSTEM_PROMPT,
                responseMimeType: 'application/json',
                responseSchema: briefingSectionSchema,
                tools: [{ googleSearch: {} }],
            },
        });

        const jsonText = response.text.trim();
        try {
            return JSON.parse(jsonText);
        } catch (e) {
            console.error(`Failed to parse section JSON for ${sectionType}:`, e);
            console.error("Received text:", jsonText);
            throw new Error(`Invalid JSON response from AI for section ${sectionType}.`);
        }
    });
};


// --- IMAGE GENERATION ---
export const generateImageFromPrompt = async (prompt: string): Promise<string> => {
    // Rate limit image generation too, as multiple images (strategic moves) load at once
    return apiLimiter.enqueue(async () => {
        const ai = getClient();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: prompt }] },
            config: {
                imageConfig: { aspectRatio: "16:9" },
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64EncodeString: string = part.inlineData.data;
                return `data:image/png;base64,${base64EncodeString}`;
            }
        }
        
        throw new Error("No image was generated.");
    });
};


// --- AFRICAN HERITAGE EXPANSION ---
const bookRecommendationSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING },
        author: { type: Type.STRING },
    },
    required: ['title', 'author'],
};

const expandedHeritageInfoSchema = {
    type: Type.OBJECT,
    properties: {
        detailedDescription: { type: Type.STRING, description: "Fournis une analyse approfondie du sujet, en 3 à 5 paragraphes, en utilisant un langage académique mais accessible. Cite des faits, des dates et des personnalités clés." },
        bookRecommendations: {
            type: Type.ARRAY,
            items: bookRecommendationSchema,
            description: "Suggère 2 à 3 livres de référence sur le sujet, écrits par des historiens ou des experts reconnus."
        },
    },
    required: ['detailedDescription', 'bookRecommendations'],
};

export const expandHeritageInfo = async (title: string, description: string): Promise<ExpandedHeritageInfo> => {
    // User triggered, but good to limit
    return apiLimiter.enqueue(async () => {
        const ai = getClient();
        const prompt = `Développe les informations sur le sujet suivant : "${title}", dont la description initiale est : "${description}". Fournis une analyse détaillée et des suggestions de lecture.`;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: {
                responseMimeType: 'application/json',
                responseSchema: expandedHeritageInfoSchema,
            },
        });

        const jsonText = response.text.trim();
        try {
            return JSON.parse(jsonText);
        } catch (e) {
            console.error("Failed to parse expanded heritage info JSON:", e);
            console.error("Received text:", jsonText);
            throw new Error("Invalid JSON response from AI for heritage info.");
        }
    });
};


// --- COUNTRY FOCUS GENERATION ---
const countryFocusDataSchema = {
    type: Type.OBJECT,
    properties: {
        countryName: { type: Type.STRING },
        flagUrl: { type: Type.STRING, description: "URL directe et publiquement accessible de l'image du drapeau du pays." },
        identity: {
            type: Type.OBJECT,
            properties: {
                officialName: { type: Type.STRING },
                capital: { type: Type.STRING },
                region: { type: Type.STRING },
                population: { type: Type.STRING, description: "Dernière donnée officielle avec année." },
                gdp: { type: Type.STRING, description: "PIB avec année et source." },
                agGdpPercent: { type: Type.STRING, description: "Part de l'agriculture dans le PIB (%)." },
                officialLanguages: { type: Type.STRING },
                currency: { type: Type.STRING },
                politicalRegime: { type: Type.STRING },
                politicalStabilityIndex: { type: Type.STRING, description: "Source fiable type Banque Mondiale." },
                corruptionIndex: { type: Type.STRING, description: "Indice de perception de la corruption (Transparency International)." },
            },
            required: ['officialName', 'capital', 'region', 'population', 'gdp', 'agGdpPercent', 'officialLanguages', 'currency', 'politicalRegime', 'politicalStabilityIndex', 'corruptionIndex']
        },
        agriculturalProfile: {
            type: Type.OBJECT,
            properties: {
                activePopulationInAg: { type: Type.STRING, description: "% population active en agriculture." },
                ruralPopulation: { type: Type.STRING, description: "% population rurale." },
                mainCrops: { type: Type.STRING },
                arableLand: { type: Type.STRING },
                irrigationLevel: { type: Type.STRING, description: "% terres irriguées ou potentiel." },
                mechanizationLevel: { type: Type.STRING },
                foodImportDependency: { type: Type.STRING },
                climateVulnerability: { type: Type.STRING, description: "Sécheresse, inondations, etc." },
            },
            required: ['activePopulationInAg', 'ruralPopulation', 'mainCrops', 'arableLand', 'irrigationLevel', 'mechanizationLevel', 'foodImportDependency', 'climateVulnerability']
        },
        fertilizerMarket: {
            type: Type.OBJECT,
            properties: {
                annualConsumption: { type: Type.STRING },
                imports: { type: Type.STRING, description: "Volume et principaux fournisseurs." },
                localProduction: { type: Type.STRING, description: "Oui/Non et détails." },
                subsidies: { type: Type.STRING, description: "Subventions gouvernementales." },
                dominantPlayers: { type: Type.STRING, description: "Public/Privé." },
                priceSensitivity: { type: Type.STRING },
                recentTrend: { type: Type.STRING, description: "Hausse/Baisse (source presse)." },
                ocpPresence: { type: Type.STRING, description: "Projets actifs, partenariats, programmes, accords. Mentionner 'Aucune présence identifiée' si vide." },
            },
            required: ['annualConsumption', 'imports', 'localProduction', 'subsidies', 'dominantPlayers', 'priceSensitivity', 'recentTrend', 'ocpPresence']
        },
        agriculturalPolicy: {
            type: Type.OBJECT,
            properties: {
                strategyName: { type: Type.STRING },
                launchYear: { type: Type.STRING },
                objectives: { type: Type.STRING, description: "Objectifs chiffrés." },
                recentReforms: { type: Type.STRING },
                subsidiesPrograms: { type: Type.STRING },
                accessToFinance: { type: Type.STRING, description: "Accès au crédit agricole." },
                tradeOrientation: { type: Type.STRING, description: "Export/Import." },
            },
            required: ['strategyName', 'launchYear', 'objectives', 'recentReforms', 'subsidiesPrograms', 'accessToFinance', 'tradeOrientation']
        },
        climateAndEnv: {
            type: Type.OBJECT,
            properties: {
                dominantClimate: { type: Type.STRING },
                rainfallTrend: { type: Type.STRING },
                waterStress: { type: Type.STRING },
                droughtRisk: { type: Type.STRING },
                recentExtremeEvents: { type: Type.STRING },
                agImpact: { type: Type.STRING },
            },
            required: ['dominantClimate', 'rainfallTrend', 'waterStress', 'droughtRisk', 'recentExtremeEvents', 'agImpact']
        },
        securityAndGeopolitics: {
            type: Type.OBJECT,
            properties: {
                stabilityLevel: { type: Type.STRING },
                conflicts: { type: Type.STRING, description: "Internes ou régionaux." },
                logisticsRisks: { type: Type.STRING, description: "Risques logistiques agricoles." },
                energyDependency: { type: Type.STRING, description: "Impact sur les fertilisants." },
                regionalPosition: { type: Type.STRING },
            },
            required: ['stabilityLevel', 'conflicts', 'logisticsRisks', 'energyDependency', 'regionalPosition']
        },
        agriculturalGovernance: {
            type: Type.OBJECT,
            properties: {
                ministerAg: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        nominationDate: { type: Type.STRING },
                        bio: { type: Type.STRING, description: "Parcours synthétique." },
                    },
                    required: ['name', 'nominationDate', 'bio']
                },
                ministerEnv: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        nominationDate: { type: Type.STRING },
                        bio: { type: Type.STRING, description: "Parcours synthétique." },
                    },
                    required: ['name', 'nominationDate', 'bio']
                },
            },
            required: ['ministerAg', 'ministerEnv']
        },
        politicalCalendar: {
            type: Type.OBJECT,
            properties: {
                nextElection: { type: Type.STRING, description: "Nationale." },
                localElections: { type: Type.STRING, description: "Importantes." },
                recentElections: { type: Type.STRING },
                impactOnAg: { type: Type.STRING, description: "Factuel uniquement." },
            },
            required: ['nextElection', 'localElections', 'recentElections', 'impactOnAg']
        },
        focpIndicators: {
            type: Type.OBJECT,
            properties: {
                importDependency: { type: Type.STRING },
                growthPotential: { type: Type.STRING },
                climateRisk: { type: Type.STRING, description: "Élevé/Modéré/Faible (sourcé)." },
                fertilizerSensitivity: { type: Type.STRING },
                coopOpportunities: { type: Type.STRING, description: "Sans spéculation." },
            },
            required: ['importDependency', 'growthPotential', 'climateRisk', 'fertilizerSensitivity', 'coopOpportunities']
        },
        executiveSummary: {
            type: Type.OBJECT,
            properties: {
                priorityLevel: { type: Type.STRING },
                majorRisks: { type: Type.STRING },
                opportunities: { type: Type.STRING },
                watchPoints: { type: Type.STRING },
            },
            required: ['priorityLevel', 'majorRisks', 'opportunities', 'watchPoints']
        },
        latestNews: { type: Type.ARRAY, items: articleReferenceSchema, description: "Trouve 2-3 articles d'actualité très récents (dernières 48h) sur le pays." },
    },
    required: ['countryName', 'flagUrl', 'identity', 'agriculturalProfile', 'fertilizerMarket', 'agriculturalPolicy', 'climateAndEnv', 'securityAndGeopolitics', 'agriculturalGovernance', 'politicalCalendar', 'focpIndicators', 'executiveSummary', 'latestNews']
};

export const generateCountryFocus = async (countryName: string): Promise<CountryFocusData> => {
    // User triggered, good to limit
    return apiLimiter.enqueue(async () => {
        const ai = getClient();
        const prompt = `Génère une FICHE PAYS (OUTIL DE VEILLE FOCP) structurée et détaillée pour : ${countryName}.
        
        Respecte scrupuleusement la structure demandée :
        1. IDENTITÉ & DONNÉES STRUCTURELLES (Sources obligatoires)
        2. PROFIL AGRICOLE STRATÉGIQUE
        3. MARCHÉ DES ENGRAIS (Cœur du sujet : importations, production, OCP)
        4. POLITIQUE AGRICOLE & STRATÉGIE NATIONALE
        5. CLIMAT & RISQUES ENVIRONNEMENTAUX
        6. CONTEXTE SÉCURITAIRE & GÉOPOLITIQUE (Impact logistique/énergie)
        7. GOUVERNANCE AGRICOLE (Ministres clés avec bio courte)
        8. ÉLECTIONS & CALENDRIER POLITIQUE
        9. INDICATEURS STRATÉGIQUES FOCP (Analyse factuelle)
        10. SYNTHÈSE EXÉCUTIVE (Neutre et directe)

        IMPORTANT :
        - Chaque information doit répondre à : "En quoi cela impacte l'agriculture, les engrais ou la stratégie FOCP ?"
        - Si une info n'a pas d'impact, ne l'inclus pas.
        - Cite les sources (Banque Mondiale, FAO, Presse locale) quand c'est possible.
        - Sois précis sur les chiffres (années, montants).
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: {
                responseMimeType: 'application/json',
                responseSchema: countryFocusDataSchema,
                tools: [{ googleSearch: {} }],
            },
        });

        const jsonText = response.text.trim();
        try {
            return JSON.parse(jsonText);
        } catch (e) {
            console.error(`Failed to parse country focus JSON for ${countryName}:`, e);
            console.error("Received text:", jsonText);
            throw new Error(`Invalid JSON response from AI for country focus: ${countryName}.`);
        }
    });
};

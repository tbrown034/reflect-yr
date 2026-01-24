// library/api/providers/sportsDb.js
// TheSportsDB provider - athletes and sporting events

const LOG_PREFIX = "[SportsDBProvider]";
const BASE_URL = "https://www.thesportsdb.com/api/v1/json/3"; // Free API key

/**
 * Normalize TheSportsDB player to unified item shape
 */
function normalizeAthlete(raw) {
  return {
    id: `sportsdb_athlete_${raw.idPlayer}`,
    externalId: raw.idPlayer,
    category: "athlete",
    provider: "sportsDb",
    name: raw.strPlayer,
    image: raw.strThumb || raw.strCutout || null,
    year: raw.dateBorn ? parseInt(raw.dateBorn.split("-")[0]) : null,
    subtitle: [raw.strPosition, raw.strTeam].filter(Boolean).join(" - ") || null,
    metadata: {
      team: raw.strTeam,
      teamId: raw.idTeam,
      sport: raw.strSport,
      position: raw.strPosition,
      nationality: raw.strNationality,
      birthDate: raw.dateBorn,
      gender: raw.strGender,
      status: raw.strStatus,
      thumbUrl: raw.strThumb,
      cutoutUrl: raw.strCutout,
      fanart: [raw.strFanart1, raw.strFanart2, raw.strFanart3, raw.strFanart4].filter(Boolean),
    },
    rank: null,
    userRating: null,
    comment: "",
  };
}

/**
 * Normalize TheSportsDB event to unified item shape
 */
function normalizeEvent(raw) {
  const dateStr = raw.dateEvent;
  const year = dateStr ? parseInt(dateStr.split("-")[0]) : null;

  return {
    id: `sportsdb_event_${raw.idEvent}`,
    externalId: raw.idEvent,
    category: "sportingEvent",
    provider: "sportsDb",
    name: raw.strEvent,
    image: raw.strThumb || raw.strPoster || raw.strBanner || null,
    year,
    subtitle: raw.strLeague || null,
    metadata: {
      homeTeam: raw.strHomeTeam,
      awayTeam: raw.strAwayTeam,
      homeScore: raw.intHomeScore,
      awayScore: raw.intAwayScore,
      date: raw.dateEvent,
      time: raw.strTime,
      venue: raw.strVenue,
      city: raw.strCity,
      country: raw.strCountry,
      league: raw.strLeague,
      leagueId: raw.idLeague,
      season: raw.strSeason,
      round: raw.intRound,
      spectators: raw.intSpectators,
      sport: raw.strSport,
      status: raw.strStatus,
    },
    rank: null,
    userRating: null,
    comment: "",
  };
}

/**
 * Search for athletes
 */
export async function searchAthletes(query, options = {}) {
  const { limit = 10 } = options;
  console.log(`${LOG_PREFIX} Searching athletes: "${query}"`);

  try {
    const response = await fetch(
      `${BASE_URL}/searchplayers.php?p=${encodeURIComponent(query)}`,
      { next: { revalidate: 86400 } }
    );

    if (!response.ok) {
      throw new Error(`SportsDB search failed: ${response.statusText}`);
    }

    const data = await response.json();
    const players = data.player || [];

    console.log(`${LOG_PREFIX} Found ${players.length} athletes`);
    return players.slice(0, limit).map(normalizeAthlete);
  } catch (error) {
    console.error(`${LOG_PREFIX} Athlete search error:`, error);
    return [];
  }
}

/**
 * Search for sporting events
 */
export async function searchEvents(query, options = {}) {
  const { limit = 10 } = options;
  console.log(`${LOG_PREFIX} Searching events: "${query}"`);

  try {
    const response = await fetch(
      `${BASE_URL}/searchevents.php?e=${encodeURIComponent(query)}`,
      { next: { revalidate: 86400 } }
    );

    if (!response.ok) {
      throw new Error(`SportsDB event search failed: ${response.statusText}`);
    }

    const data = await response.json();
    const events = data.event || [];

    console.log(`${LOG_PREFIX} Found ${events.length} events`);
    return events.slice(0, limit).map(normalizeEvent);
  } catch (error) {
    console.error(`${LOG_PREFIX} Event search error:`, error);
    return [];
  }
}

/**
 * Unified search - routes to athlete or event search based on category
 */
export async function search(query, options = {}) {
  const { category = "athlete" } = options;

  if (category === "sportingEvent") {
    return searchEvents(query, options);
  }
  return searchAthletes(query, options);
}

/**
 * Get athlete by ID
 */
export async function getAthleteById(id) {
  const playerId = String(id).replace(/^sportsdb_athlete_/, "");
  console.log(`${LOG_PREFIX} Getting athlete: ${playerId}`);

  try {
    const response = await fetch(
      `${BASE_URL}/lookupplayer.php?id=${playerId}`,
      { next: { revalidate: 86400 } }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch athlete: ${response.statusText}`);
    }

    const data = await response.json();
    const player = data.players?.[0];

    return player ? normalizeAthlete(player) : null;
  } catch (error) {
    console.error(`${LOG_PREFIX} GetAthleteById error:`, error);
    return null;
  }
}

/**
 * Get event by ID
 */
export async function getEventById(id) {
  const eventId = String(id).replace(/^sportsdb_event_/, "");
  console.log(`${LOG_PREFIX} Getting event: ${eventId}`);

  try {
    const response = await fetch(
      `${BASE_URL}/lookupevent.php?id=${eventId}`,
      { next: { revalidate: 86400 } }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch event: ${response.statusText}`);
    }

    const data = await response.json();
    const event = data.events?.[0];

    return event ? normalizeEvent(event) : null;
  } catch (error) {
    console.error(`${LOG_PREFIX} GetEventById error:`, error);
    return null;
  }
}

/**
 * Unified getById - routes based on category
 */
export async function getById(id, options = {}) {
  const { category = "athlete" } = options;

  if (category === "sportingEvent") {
    return getEventById(id);
  }
  return getAthleteById(id);
}

/**
 * Discover popular athletes
 * SportsDB free tier doesn't have a trending endpoint,
 * so we search for some popular athlete names
 */
export async function discover(options = {}) {
  const { category = "athlete", limit = 20 } = options;
  console.log(`${LOG_PREFIX} Discovering ${category}`);

  if (category === "sportingEvent") {
    // No good discover for events
    return [];
  }

  // Search for popular athletes from various sports
  const popularSearches = ["LeBron", "Messi", "Mahomes", "Ohtani"];
  const searchTerm = popularSearches[Math.floor(Math.random() * popularSearches.length)];

  try {
    const results = await searchAthletes(searchTerm, { limit });
    return results;
  } catch (error) {
    console.error(`${LOG_PREFIX} Discover error:`, error);
    return [];
  }
}

/**
 * Provider metadata
 */
export const providerInfo = {
  id: "sportsDb",
  name: "TheSportsDB",
  categories: ["athlete", "sportingEvent"],
  requiresAuth: false, // Free API key is "3"
  rateLimit: "30 requests per minute",
};


export const pointOfInterest = [
    "groceries",
    "supermarket",
    "discount supermarket",
    "bakery",
    "butcher",
    "convenience store",
    "greengrocer",

    "shopping mall",

    "pizza",
    "food",
    "restaurant",
    "bar",
    "cafe",

    "hospital",
    "health center",
    "pharmacy",
    "dentist",
    "doctor",
    "veterinarian",
    "clinic",

    "school",
    "primary school",
    "high school",
    "kindergarten",
    "college",

    "bus stop",
    "tram stop",
    "train station",
    "airport",

    "park",
    "gym",
    "cinema",
    "museum",
    "theatre",
    "library",

    "landmark",

    "szkoła podstawowa",
    "ośrodek zdrowia",
    "przedszkole",
] as const;

export type PointOfInterest = (typeof pointOfInterest)[number];
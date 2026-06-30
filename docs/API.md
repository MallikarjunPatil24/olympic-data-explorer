# API Specifications

This catalog documents the REST API endpoints exposed by the FastAPI server, detailing query parameters, response structures, and HTTP statuses.

---

## 1. Global Filter Parameters

Many endpoints accept a common set of query filters. These filters are parsed into the `CommonFilters` model:

| Parameter | Type | Required | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| `year` | `integer` | No | Filter by Olympic year | `2020` |
| `season` | `string` | No | Filter by season (`Summer` / `Winter`) | `Summer` |
| `country` | `string` | No | Filter by NOC code (3-letter abbreviation) | `USA` |
| `sport` | `string` | No | Filter by sport discipline | `Swimming` |
| `gender` | `string` | No | Filter by competitor gender (`M` / `F`) | `F` |
| `medal` | `string` | No | Filter by medal won (`Gold` / `Silver` / `Bronze`) | `Gold` |

---

## 2. API Endpoints Catalog

### 📌 Filter Options
* **Endpoint**: `GET /api/filters`
* **Description**: Returns all unique metadata lists from the dataset, used to populate frontend filter dropdown select options.
* **Response Shape**:
```json
{
  "years": [1896, 1900, 1904, 2020, 2022],
  "seasons": ["Summer", "Winter"],
  "countries": [
    { "noc": "USA", "country_name": "United States" },
    { "noc": "IND", "country_name": "India" }
  ],
  "sports": ["Athletics", "Swimming", "Gymnastics"],
  "genders": ["M", "F"],
  "medals": ["Gold", "Silver", "Bronze"]
}
```

---

### 📌 Dashboard Overview Stats
* **Endpoint**: `GET /api/dashboard`
* **Description**: Computes high-level aggregated counts for the dashboard KPI cards, respecting active filters.
* **Response Shape**:
```json
{
  "total_athletes": 10543,
  "total_countries": 204,
  "total_sports": 33,
  "total_events": 339,
  "total_medals": 1080,
  "total_games": 1
}
```

---

### 📌 Athlete Age Distribution
* **Endpoint**: `GET /api/dashboard/age-distribution`
* **Description**: Groups competitor ages into standard distribution buckets for the dashboard bar chart.
* **Response Shape**:
```json
[
  { "range": "Under 15", "count": 12 },
  { "range": "15-19", "count": 894 },
  { "range": "20-24", "count": 3412 },
  { "range": "25-29", "count": 4120 },
  { "range": "30-34", "count": 1402 },
  { "range": "35-39", "count": 340 },
  { "range": "40-44", "count": 94 },
  { "range": "45-49", "count": 21 },
  { "range": "50+", "count": 8 }
]
```

---

### 📌 Country Performance Directory
* **Endpoint**: `GET /api/countries`
* **Description**: Returns a sorted summary list of all participating countries, total unique athletes sent, and medal distributions.
* **Response Shape**:
```json
[
  {
    "noc": "USA",
    "country_name": "United States",
    "athlete_count": 12053,
    "gold_count": 1135,
    "silver_count": 958,
    "bronze_count": 876,
    "total_medals": 2969
  }
]
```

---

### 📌 Country Profile Details
* **Endpoint**: `GET /api/countries/{country_code}`
* **Description**: Fetches individual Country Profile details: overall medal summaries, chronological medal trend charts, and top sports.
* **Response Shape**:
```json
{
  "noc": "USA",
  "country_name": "United States",
  "gold_count": 1135,
  "silver_count": 958,
  "bronze_count": 876,
  "total_medals": 2969,
  "total_athletes_sent": 12053,
  "medal_trend": [
    { "year": 1896, "gold": 11, "silver": 7, "bronze": 2, "total": 20 }
  ],
  "top_sports": [
    { "sport": "Athletics", "gold": 343, "silver": 270, "bronze": 214, "total": 827 }
  ]
}
```

---

### 📌 Sports Directory
* **Endpoint**: `GET /api/sports`
* **Description**: Returns a sorted summary list of all Olympic sports disciplines, unique athlete headcounts, event counts, and medals awarded.
* **Response Shape**:
```json
[
  {
    "sport": "Swimming",
    "athlete_count": 8954,
    "event_count": 37,
    "medal_count": 1543
  }
]
```

---

### 📌 Sport Profile Details
* **Endpoint**: `GET /api/sports/{sport_name}`
* **Description**: Returns detailed gender representations, historical participation trends, and lists all-time top medalists for a sport.
* **Response Shape**:
```json
{
  "sport": "Swimming",
  "participating_countries_count": 194,
  "gender_split": {
    "male_count": 5120,
    "female_count": 3834,
    "male_pct": 57.18,
    "female_pct": 42.82
  },
  "historical_trend": [
    { "year": 1896, "gold": 4, "silver": 4, "bronze": 4, "total": 12 }
  ],
  "top_athletes": [
    {
      "name": "Michael Fred Phelps II",
      "noc": "USA",
      "gold_count": 23,
      "silver_count": 3,
      "bronze_count": 2,
      "total_medals": 28
    }
  ]
}
```

---

### 📌 Athlete Explorer
* **Endpoint**: `GET /api/athletes`
* **Query Parameters**:
  - `search` (string): Debounced search term matching names.
* **Response Shape**:
```json
{
  "results": [
    {
      "name": "Michael Fred Phelps II",
      "sex": "M",
      "noc": "USA",
      "team": "United States",
      "sport": "Swimming",
      "total_appearances": 5,
      "total_medals": 28
    }
  ]
}
```

---

### 📌 Athlete Biography Profile
* **Endpoint**: `GET /api/athletes/{athlete_name}`
* **Description**: Returns biological information, height/weight ratios, medal type groupings, and chronologies of past games.
* **Response Shape**:
```json
{
  "name": "Michael Fred Phelps II",
  "sex": "M",
  "height": 193.0,
  "weight": 91.0,
  "gold_count": 23,
  "silver_count": 3,
  "bronze_count": 2,
  "total_medals": 28,
  "appearances": [
    {
      "year": 2004,
      "season": "Summer",
      "city": "Athina",
      "sport": "Swimming",
      "event": "100 metres Butterfly, Men",
      "medal": "Gold"
    }
  ]
}
```

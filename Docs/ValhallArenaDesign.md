# Valhall Arena

Design a dark-mode design system and key screens for a Warhammer 40k league management app called **"Valhall Arena"**. This is a cross-platform app (iOS, Android, Web) using bottom tab navigation.

---

## Color Palette (dark mode is the default and only actively used theme)

| Token      | Hex       | Usage                                                        |
| ---------- | --------- | ------------------------------------------------------------ |
| Dark Navy  | `#0D1B2A` | Page/screen backgrounds                                      |
| Navy       | `#1B263B` | Cards, containers, input fields, secondary surfaces          |
| Steel      | `#415A77` | Borders, dividers, inactive icons, medium-emphasis accents   |
| Slate      | `#778DA9` | Secondary/muted text, icons                                  |
| Silver     | `#E0E1DD` | Primary text, CTA button text                                |
| Orange     | `#E59500` | Primary accent — active tabs, buttons, highlights, links     |

**Semantic colors:**

- Success: `#10B981` (green) — wins, positive actions, confirmations
- Error: `#EF4444` (red) — losses, destructive actions, errors
- Warning: `#F59E0B` (amber) — draws, caution states
- Info: `#3B82F6` (blue) — informational badges, draw indicators in some views


---

## App Structure & Navigation

Bottom tab bar with tabs: **Home, Profile, Team, Ladder, Events**. Profile and Team tabs are only visible when logged in. A full-screen **Pairing Game** mode hides the tab bar entirely.

On web (desktop, >900px), tabs are replaced by a persistent sidebar/drawer.

### Navigation Flow

```
Tab Bar / Sidebar
├── Home — Welcome/landing screen
├── Profile (auth required) → /user/[userId]
│   └── Stats Detail → /user/[userId]/stats
├── Team (auth required) → /team/[teamId]
│   └── Create Team → /team/create (if user has no team)
├── Ladder — Global season leaderboard
└── Events — Event list
    └── Event Detail (multi-tab view) → /events/[eventId]
        ├── Overview tab
        ├── Player Details tab (army list management)
        ├── Roster tab (registered teams)
        ├── My Team tab (manage players/coaches)
        ├── Pairings tab (round-by-round matches)
        ├── Placings tab (standings table)
        └── Admin tab (organizer-only)
```

---

## Screens & Data Fields

### 1. Home

Simple welcome screen. Static content:

- App title: "Welcome to Warhammer 40k League"
- Tagline: "Track your battles, achievements, and glory!"

---

### 2. Ladder (Leaderboard)

**Purpose:** Global team rankings for a selected season.

**Components & data:**

- **Season selector** (dropdown/modal) showing all seasons:
  - `season.name`, `season.startDate`, `season.endDate`
- **Season info card** displaying the selected season's date range
- **Ranked team list** — each row is a card containing:
  - **Rank badge** (circular, numbered `index + 1`)
  - **Team logo** (`team.logoUrl`, circular avatar)
  - **Team name** (`team.name`, tappable → navigates to `/team/{teamId}`)
  - **Sportsmanship level** (`team.sportsmanshipLvl`, 1–5, shown with star icon)
  - **Stats inline:** `gamesWon` W / `gamesDrawn` D / `gamesLost` L
  - **Score** (`score`)
- Top 3 rows get gold / silver / bronze accent highlight

---

### 3. Events List

**Purpose:** Browse upcoming events and create new ones.

**Components & data:**

- **"Create Event" button** (visible only when `authUser.isOrganizer === true`), opens a modal form with fields:
  - `title` (text), `description` (text), `eventTypeId` (picker from event types list — each type has `id`, `name`, `playersPerTeam`), `numberOfRounds` (number), `startDate` / `endDate` (date pickers), `location` (text), `maxParticipants` (number), `seasonId` (optional picker), `pairingStrategy` (picker: Dutch Swiss / Round Robin / Manual), `hideLists` (toggle), `playerPack` (URL text)

- **Event cards** in a scrollable list, each showing:
  - `title` (bold)
  - `eventType.name` (tag/badge)
  - `description` (if present, truncated)
  - `location` with map-pin icon
  - `startDate` – `endDate` (formatted)
  - `rounds` with number icon
  - `numberOfRegisteredPlayers` with people icon
  - `numberOfRegisteredTeams` / `maxParticipants` (e.g. "5/8 teams")
  - `playerPack` indicator icon (if URL present)
  - **Winner badge** (if `winningTeamName` is set): "Winner: {winningTeamName}"
  - Tapping card → navigates to `/events/{eventId}`

---

### 4. Event Detail (Multi-Tab Screen)

**Header:** `event.title` + `eventType.name` tag badge.
**Join button** visible unless: event full (`numberOfRegisteredTeams >= maxParticipants`), user already registered, team already registered, or event is past.

Uses a **horizontal tab switcher** (scrollable, with left/right chevron overflow indicators) containing these sub-views:

#### 4a. Overview Tab

- **Event info card:**
  - `title`, `seasonId` (resolved to season name), `location`, `startDate` (formatted), `endDate` (formatted), `pairingStrategy` (mapped to human label), `numberOfRegisteredTeams` / `maxParticipants`, `description`
- **FIDE Rating info** (conditional, only if values set):
  - `initialTar`, `kFactor`, `weighting`
- **Player Pack** button (links to `playerPack` URL)
- **Round Configuration** — collapsible cards per round:
  - `config.roundNumber`, `config.primaryMission.name`, `config.deployment` (mapped to label)
  - `config.layouts[]` — grid of layout images: `layout.name`, `layout.imageUrl`

#### 4b. Player Details Tab

- Title: "Your Army List"
- Auth gate: shows message if not logged in or not registered for this event
- **Faction picker** dropdown (items: `faction.id`, `faction.name`)
- **Detachment picker** (appears after faction selected, items: `detachment.id`, `detachment.name`, `detachment.active`)
- **Army list textarea** (monospace font, shows `armyList.list`)
- **Submit button** ("Upload" if new, "Update" if existing)
- Displays current: `armyList.factionName`, `armyList.detachmentName`

#### 4c. Roster Tab

- Title: "Registered Teams ({`event.numberOfRegisteredTeams`})"
- **Team list** — each team card:
  - `teamName`, `logoUrl` (circular), `sportsmanshipLvl`
  - `eventTeamStatus` (e.g. "dropped" shown visually)
  - Expandable member list per team:
    - `username`, `profilePictureUrl`, `sportsmanshipLevel`
    - `armyList.factionName`, `armyList.detachmentName` (if loaded via eventId)
    - `eventRole` ("player" or "coach" badge)

#### 4d. My Team Tab

- **Players card** — list of registered players:
  - `member.username`, `member.profilePictureUrl`
  - Badges: `member.isCaptain` (captain badge), `member.isAdmin` (admin badge)
  - `member.armyList.factionName` (faction indicator)
  - `member.eventRole` label
  - "Add Player" button (if under `eventType.playersPerTeam` limit)
- **Coaches card** — same pattern, max 2 coaches
- **Pending invites section** (semi-transparent styling):
  - `invite.user.username`, `invite.user.profilePictureUrl`, `invite.eventRole`
  - Revoke button per invite
- **Action buttons:**
  - "Leave Event" — removes current user
  - "Drop Team from Event" — removes entire team (admin/captain only)
- **Dropped banner** — shown if `eventTeamStatus` indicates dropped
- **Modals:** SearchUsersModal (search & invite), AlertModal (confirmations)

#### 4e. Pairings Tab

- **Round selector** — row of buttons, one per round (`round.roundNumber`), highlighting rounds with `round.hasPairings === true`. Shows `round.status`.
- **Match cards list** (FlatList) for selected round, each card showing:
  - **Team 1:** `team1Name` with logo, `team1Score`
  - **Team 2:** `team2Name` with logo, `team2Score` (or "BYE" if `isBye`)
  - **Match status:** `status` (pending / pairing / in_progress / completed)
  - `isDraw`, `winnerId` indicators
  - Confirmation indicators: `team1ConfirmedById`, `team2ConfirmedById`
  - **Expandable game details** — each game row:
    - `player1Name` vs `player2Name`
    - `player1Faction`, `player2Faction` (with faction icon/color)
    - `player1Score` / `player1DifferentialScore`, `player2Score` / `player2DifferentialScore`
    - `game.mission.name` (mission label)
    - `game.layout.name`, `game.layout.deployment` (deployment type)
    - `game.layout.imageUrl` (layout thumbnail)
    - Army list buttons (`player1ArmyListId`, `player2ArmyListId` → opens ArmyListModal)
    - `winnerId` highlight
- **Action buttons (contextual):**
  - "Start Pairings" — for admins, when no games yet
  - "Reconnect to Pairing" — if `pairingState.status` is active
  - "Confirm Result" — if all games completed but not confirmed
  - "Spectate Pairings" — for non-participants when match is in_progress
- **Modals:**
  - **ArmyListModal** — displays `armyList.list` (full text)
  - **GameDetailsModal** — score reporting form:
    - Player names, factions, current scores
    - Score input fields (player1Score, player2Score)
    - Mission name, deployment type, layout image
    - Submit button (enabled if `canReportScore`)
  - **SportsmanshipRatingModal** — 5-star rating for opponent:
    - "How was your game with {opponentName}?"
    - Star selector (1–5)
  - **ConfirmModal** — confirm result submission

#### 4f. Placings Tab

- **Horizontally scrollable standings table** with columns:
  - **#** — `entry.currentRank`
  - **Team** — `entry.team.name` with `entry.team.logoUrl` (circular)
  - **Round result columns** (R1, R2, R3…) — per `entry.roundResults[]`:
    - Shows `differentialScore` or "BYE" (`isBye`) or "–" (not `isCompleted`)
    - Color-coded: green if `isWinner`, red if loss, blue/amber if `isDraw`
  - **W** — `entry.matchesWon`
  - **D** — `entry.matchesDrawn`
  - **L** — `entry.matchesLost`
  - **Score** — `entry.accumulatedScore`
  - **Pts** — `entry.matchPoints`
- **Row styling:**
  - Gold / Silver / Bronze accent for top 3 ranks
  - User's own team row highlighted with orange border
  - Dropped teams (`entry.status === 'dropped'`) shown at reduced opacity with "Dropped" badge

#### 4g. Admin Tab

- **Event Details section:**
  - Edit Event button (opens EditEventModal with all event fields)
  - Toggle `hideLists` (show/hide army lists)
  - Delete Event button (with confirmation)
- **Event Lifecycle section:**
  - Status badge: `event.status` (Draft → Registration Open → Closed → In Progress → Completed)
  - Action buttons: Open Registration, Close Registration, Start Event, Complete Event (disabled when not applicable based on current status)
- **Round Management section:**
  - Total rounds: `event.rounds`, current: `event.currentRoundNumber`
  - Per-round cards: `round.roundNumber`, `round.status`, `round.hasPairings`
  - Buttons per round: Start Round, Complete Round, Re-pair
  - "Generate Next Round Pairings" button (enabled when `canGenerateNextRound`)
- **Attendee Management section:**
  - Count: `event.numberOfRegisteredTeams` teams, `event.numberOfRegisteredPlayers` players
  - Team cards: `team.teamName`, `team.logoUrl`, `team.users.length` player count
  - Drop Team button per team (with confirmation)

---

### 5. User Profile

**Route:** `/user/[userId]`

- **Hero image** (`heroImageUrl`, full-width banner, 200px height)
- **Profile picture** (`profilePictureUrl`, 80×80 circular, overlaid on hero bottom edge)
- **Username** (`username`, bold 24px)
- **Title** (user title/role, 16px)
- **Team name** (`team.name` if user has a team, 14px, tappable → team page)
- **Sportsmanship display:**
  - Level indicator: `sportsmanshipLevel` (1–5) with star icon
  - Progress bar: `sportsmanshipProgress` (0–100% toward next level)
- **Team info card** (if team exists):
  - `team.logoUrl` (circular), `team.name`, `team.sportsmanshipLvl`
- **Stats overview card** (tappable → `/user/{userId}/stats`):
  - `gamesPlayed` (labeled "Battles")
  - `winRatio` (displayed as percentage, labeled "Win Rate")
  - `averageScore` (labeled "Avg Points")
- **Game info:**
  - `mostPlayedRole` (preferred role)
  - `mostPlayedArmies[]` — list of `army.name` + `army.gamesPlayed`
- **Edit button** (only on own profile): triggers image upload for avatar and hero

---

### 6. User Stats Detail

**Route:** `/user/[userId]/stats`

- **Battle statistics section:**
  - Total Battles, Wins, Losses, Win Rate
- **Army performance section** — per army:
  - Army name, battle count, win rate %, points

*(Currently stub/placeholder — will be populated with real `UserStatistics` data)*

---

### 7. Team Detail

**Route:** `/team/[teamId]`

- **Banner image** (`bannerUrl`, full-width)
- **Team logo** (`logoUrl`, circular, overlaid at bottom-left of banner)
- **Team name** (`name`, bold)
- **Sportsmanship level** (`sportsmanshipLvl`, 1–5 with star icon)
- **Team stats:** Win Rate, Average Victory Points (currently placeholder values)
- **Team members preview list:**
  - Per member: `username`, `profilePictureUrl`, `sportsmanshipLevel`
  - Pending invites section: `invite.user.username`, `invite.user.profilePictureUrl`
- **Quick action:** "Match History" link button
- **Edit button** (for team members): opens modal to update `logoUrl` and `bannerUrl`

---

### 8. Create Team

**Route:** `/team/create` (redirects to team page if user already has a team)

- **Team name** text input (`teamName`)
- **Team logo** image upload zone (1:1 aspect ratio, 150×150px target)
- **Team banner** image upload zone (16:9 aspect ratio, full width)
- **Create button** (disabled while `isCreating`)

---

### 9. Join Event Modal

Triggered from Event Detail screen.

- **Event info header:** `eventData.title`, `eventData.type`
- **Team name** (`team.name`)
- **Player selector** — checkboxes for team members (`team.users[]`):
  - `username` per member
  - Role toggle per selected user: "player" or "coach"
  - Player count indicator: "Players: X/{`playersPerTeam`}"
  - Coach count: "Coaches: X"
- **Captain selector** — dropdown from selected players
- **Join button** (enabled when `canJoinEvent()` validates)

---

### 10. Notifications (System-Level)

- **Team invite notification:**
  - `senderName`, `team.name`, `team.logoUrl`
  - Accept / Reject buttons
- **Event invite notification:**
  - `senderName`, `event.title`, `eventRole` (player/coach), `team.name`, `team.logoUrl`
  - Accept / Reject buttons

---

## UI Components Needed

- **Tab bar** — bottom navigation with orange active / steel inactive icons
- **Sidebar/drawer** — desktop web alternative to tab bar
- **Tab switcher** — horizontal scrollable sub-navigation with chevron overflow indicators
- **Cards** — navy background (`#1B263B`), steel borders, multiple content patterns
- **Match cards** — two teams with logos and scores, expandable game detail rows
- **Buttons** — primary (orange fill), secondary/ghost (steel border), destructive (red), disabled (reduced opacity)
- **Status badges/tags** — event type, lifecycle status, win/draw/loss pills, role badges (captain, admin, coach)
- **Form inputs** — text fields, textareas (monospace for army lists), number inputs on dark backgrounds
- **Dropdowns/pickers** — modal-based selection lists for season, faction, detachment, event type
- **Toggle switches** — for boolean settings (hideLists, etc.)
- **Modals** — forms, confirmations, search/select, image viewers, army list display
- **Standings table** — horizontally scrollable, fixed first columns, color-coded result cells
- **Profile/team headers** — hero banner image + circular avatar overlay pattern
- **Rank badges** — circular numbered badges with gold/silver/bronze for top 3
- **Progress bars** — sportsmanship level display (segmented 1–5)
- **Star ratings** — 5-star selector for sportsmanship ratings
- **Image upload zones** — drag-and-drop with aspect ratio constraints (1:1, 16:9)
- **Toast notifications** — floating success/error messages
- **Expandable/collapsible sections** — for round configs, game details, team members
- **Search input** — with results list for user invite flows
- **Faction icons** — small colored indicators per Warhammer faction
- **Date pickers** — for event start/end dates
- **Alert/confirmation dialogs** — destructive action confirmations

---

## Tone

Nordic mythology, asgard, valhall inspired, clean, modern dark UI. Structured and serious — fitting for competitive tabletop wargaming — but not cluttered. The orange accent provides warmth against the cool navy/steel backdrop and draws attention to interactive elements and key data points.

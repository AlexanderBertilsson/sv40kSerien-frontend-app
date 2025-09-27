

**Warhammer 40k League and Tournament App**

**Summary**

This application is a platform designed to facilitate professional Warhammer 40k league and tournament play. It is built using the React Native Expo library. The app will feature different interfaces:

* **Public Interface:** Accessible to anyone visiting the app.  
* **Logged-In Interface:** Includes both administrative and user-specific interfaces.  
  * **Administrative Interface:** For managing leagues and tournaments.  
  * **User Interface:** For players, coaches, or other team/staff members.

**Technical Details**

1. **Authorization and Authentication:** Provided by Amazon Cognito. Using Cognito's hosted UI for login and signup.  
2. **Frontend App:** Built with Expo SDK 52\.  
3. **Backend:** A Dotnet REST API hosted on an Amazon Lambda.

**Frontend Features**

**Profile Page:**

A user will have a profile page consisting of multiple sections and screens. If you are logged in and it's your own profile, you can edit parts of your profile.

**List of Profile Components:**

**Index screen:**

* A profile picture  
* A hero image  
* A section for personal information and sportsmanship rating  
* A section for team information  
  * Team name  
  * Role in team: player, coach, staff, etc.  
* A section for game information  
  * Most played armies  
  * Role: Defender, Attacker, etc.  
  * Match history  
* A section for game stats  
  * Win rate  
  * Average game victory points  
  * Other stats?  
* A section for achievements

**Stats screen:**

* Breakdown of stats  
* Match history

**Achievements screen:**

* Completed achievements  
* Incomplete achievements

**Team Page:**

A team will have a profile page consisting of multiple sections and components. If you are logged in and it's your own team, and you have editorial rights, you can edit parts of your team profile and manage the team.

**List of Team Page Components:**

* Team Logo  
* Team Hero image/Banner  
* Team name  
* Team sportsmanship score  
* A section of team members, their roles, and an expandable section for every member containing brief information about the member  
* Section of game stats, rank, and match history  
* A calendar with upcoming events, and if you are a managing member of the team, you can sign up for events here.

**Ladder/Ranking:**

A page for viewing the current standings of teams, events/matches played, and win/loss ratio.

**Events:**

A page for events, where you can see all the info about the event as well as sign your team up for it. If you have administrative rights, you can create new events.

**Events Properties:**

* Rounds  
* Description  
* Location  
* Dates  
* Max teams  
* Rules/player packs  
* Roster of teams that signed up  
* Roster of players on the teams


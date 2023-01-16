# ThoughtWeb
The world is observed though our mind's eyes, often making thoughts and revelations critical impactors of our daily and overall lives. A simple pen and notebook are often picked up to keep track of or realize thoughts in a journal, typically only organized by date, but the ideas that shape our worlds don't always occur so linearly. Therefore, this website allows thoughts and journal entries to additionally be organized by idea through freely adding connections to any number of other entries. The site then presents each entry chronologically with the notes connected around them, and further sorts using notebooks and 'Main' or 'Sticky' note types. This site can also excel at brainstorming, or providing an overview of thoughts to figure out problems. It uses a React.js-Bootstrap frontend with a Java Spring Boot and MySQL database backend, and runs the React generated static build on the Spring server. 

## Data Structure And Algorithm Efficiency
The frontend loads notes and note connections data from the RESTful API into a graph data structure, the backbone structure for the data in the app. </br>
</br>
The efficiency relies primarily on binary insertion and search to, of course, typically hit O(log n) time complexity, though the Editor component has a case which must determine a connected note's live data among a list that also includes multiple new notes unsaved to the backend. It determines unsaved notes in O(1), new saved notes in O(m), where m is the number of all newly created notes, and O(log loaded-n), where n is the initial loaded list size, found in [Editor.js](react-frontend/src/components/Editor/Editor.js) around line 330. Another algorithm, which determines a note's added and removed connections in O(n) time is also found in [Editor.js](react-frontend/src/components/Editor/Editor.js) around line 268.

### Links
Live site: https://correlation-journal-production.up.railway.app/</br>
Easy access account - Username: <b>admin</b>, Password: <b>password</b></br></br>
Trello board: https://trello.com/b/IUqaznxv/correlate-thoughts
# Torre Profile Search Engine

React + Node.js application to search Torre profiles using skill filters and display professional connections.

## Description

This project allows customized searches of Torre users through the Torre API. The interface is built with React and communicates with a Node.js backend to process requests and display filtered results.

---

## Regarding LLM/AI usage

All prompts used to build this project are listed below.
Each entry specifies the model and tools used.

### Prompts

**Model:** GPT-4o  
**Tool:** ChatGPT Web (chat.openai.com)  
**Date Range:** July–August 2025

1. *"I'm working on the Torre technical test (version 2.1), developing a people search engine with skill filters and work connection visualization. React is used for the frontend and Node.js for the backend."*

2. *"Send me the base code for a profile search engine in Torre using React and Node.js."*

3. *"Add the user's picture next to their name in each profile selected."*

4. *"Sort the profiles alphabetically by name."*

5. *"Make the search button display a loading state while searching."*

6. *"Optimize the frontend to load the profile list instantly while typing(limit>=3 , debounce=200ms)."*

7. *"When clicking on a profile, display a loading icon overlay while it loads the details."*

---

## Installation

Clone the repository and run:

```bash
terminal 1:
cd backend
npm install
node server.js

terminal 2:
cd frontend
npm install
npm start

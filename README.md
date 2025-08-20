# PERTSOLVER
# Project Name: PERT/CPM Activity Scheduler

A web-based tool to create, visualize, and analyze project activities using **PERT (Program Evaluation and Review Technique)** and **CPM (Critical Path Method)**. It allows users to input activities, predecessors, and duration estimates to calculate the earliest start, latest start, slack, and critical path of a project.

---

## Features

- Add, edit, or remove project activities dynamically.
- Input activity durations using **optimistic**, **most likely**, and **pessimistic** estimates.
- Automatically calculates **mean duration** for each activity using PERT formula.
- Computes **earliest start/end** and **latest start/end** times.
- Calculates **slack** for each activity.
- Identifies and displays the **critical path**.
- Visualizes the project as a **network graph** with critical activities highlighted.
- Supports decimals and integer durations.
- Clear all functionality for resetting the project.

---

## Technology Stack

- **Frontend**: HTML, CSS (Bootstrap), JavaScript (jQuery, Vis.js)
- **Visualization**: [Vis.js](https://visjs.org/) for dynamic network diagrams.
- **Data Storage**: In-browser memory (`dataTable` array)
- **Optional**: GitHub Pages for deployment

---

## Installation

1. Clone the repository:

```bash
git clone https://github.com/<your-username>/<repository-name>.git

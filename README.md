# Climbing Route Explorer

## Overview
The **Climbing Route Explorer** is an interactive web application that allows users to explore climbing routes around the world by continent and country. The project includes animations for smooth transitions and dynamic data visualization using charts.

## Features
- **Interactive Map:** View climbing routes by continent and country.
- **Dynamic Animations:** Smooth section transitions powered by GSAP and ScrollMagic.
- **Charts Visualization:** Analyze climber statistics by country, including height, weight, and age distributions.
- **Daltonic Mode:** Toggle a colorblind-friendly mode for the map visualizations.

## File Structure
```
VD-Practica/
├── index.html           # Main HTML file
├── css/
│   └── styles.css       # Stylesheet for the project
├── js/
│   ├── map.js           # Logic for the interactive map
│   ├── scrollmagic.js   # Animations and ScrollMagic integration
└── assets/
    └── images/          # Image assets (e.g., icons, backgrounds)
```

## Requirements
- A **live server** is required to execute this project properly, as it dynamically loads external files such as GeoJSON and CSV files.
- Recommended browsers: Latest versions of Chrome, Firefox, or Edge.

## Installation
1. Clone or download the repository to your local machine:
   ```bash
   git clone https://github.com/clms-uoc/VD-Practica.git
   ```

2. Navigate to the project directory:
   ```bash
   cd VD-Practica
   ```

3. Open the project using a live server:
   - If using VS Code, install the **Live Server** extension.
   - Right-click on `index.html` and select **Open with Live Server**.

4. Open your browser and navigate to the live server URL (e.g., `http://127.0.0.1:5500`).

## Usage
- Use the interactive map to select a continent.
- Explore climbing routes and statistics for each region.
- Analyze climber statistics in the **Climber Statistics by Country** section.
- Toggle the Daltonic Mode using the button in the top-left corner.

## Libraries and Technologies
- **D3.js**: Data-driven documents for visualizations.
- **TopoJSON**: Topology-based geospatial data.
- **GSAP**: Animation library for smooth transitions.
- **ScrollMagic**: Scroll-based animations.
- **HTML/CSS/JavaScript**: Core web technologies.

## License
This project is licensed under the MIT License. See the LICENSE file for details.

## Acknowledgements
- Geographical data provided by [Cartography Vectors](https://cartographyvectors.com).
- Climbing datasets sourced from [Kaggle](https://www.kaggle.com).
- Icons from [Flaticon](https://flaticon.com).
# 

let isDaltonicMode = false;



const width = 800; 
const height = 600; 

const projection = d3.geoMercator()
    .scale(100) 
    .center([10, 50]) 
    .translate([width / 2, height / 2]); 

const path = d3.geoPath().projection(projection);

const gradeState = new Map(); 

document.querySelectorAll(".continent-section").forEach(section => {
    section.addEventListener("scroll", () => {
        const continent = section.id.replace("-section", ""); 
        const grade = gradeState.get(continent) || "all"; 
        loadData(continent, grade); 
    });
});



loadWorldGeoJSON();

function createLegend(gradesData) {
    const maxRoutes = d3.max(gradesData, d => d.route_count) || 1;
    console.log("Max routes:", maxRoutes);

    const legend = d3.select("#legend")
        .html("") // Clear existing legend
        .append("svg")
        .attr("width", 200)
        .attr("height", 40);

    const legendScale = d3.scaleLinear()
        .domain([0, maxRoutes])
        .range([0, 200]);

    const legendAxis = d3.axisBottom(legendScale)
        .ticks(5)
        .tickFormat(d3.format("d"));

    legend.append("g")
        .attr("transform", "translate(0, 20)")
        .call(legendAxis);
}



function updateMapSize(continent) {
    const mapId = `#${continent.replace("-", "_")}-map`;
    const svg = d3.select(mapId);

    svg
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", `0 0 ${width} ${height}`);
}

function updateProjection(geojson, continent) {
    const bounds = d3.geoPath().bounds(geojson); 
    const dx = bounds[1][0] - bounds[0][0]; 
    const dy = bounds[1][1] - bounds[0][1]; 
    const xCenter = (bounds[0][0] + bounds[1][0]) / 2; 
    const yCenter = (bounds[0][1] + bounds[1][1]) / 2; 

    
    const baseScale = Math.min(width / dx, height / dy) * 0.8; 
    const baseTranslate = [
        width / 2 - baseScale * xCenter,
        height / 2 - baseScale * yCenter,
    ];

    // Continent-specific adjustments
    const continentAdjustments = {
        europe: { scale: 200, translateX: 350, translateY: 125 }, 
        asia: { scale: 55, translateX: 80, translateY: 0 }, // 
        africa: { scale: 50, translateX: 125, translateY: -300 }, 
        north_america: { scale: 45, translateX: -35, translateY: 250 }, 
        south_america: { scale: 50, translateX: 25, translateY: -600 },
        oceania: { scale: 45, translateX: 450, translateY: -850 },
    };

    const adjustment = continentAdjustments[continent] || { scale: 1, translateX: 0, translateY: 0 };

 
    const scale = baseScale * adjustment.scale;
    const translate = [
        baseTranslate[0] + adjustment.translateX,
        baseTranslate[1] + adjustment.translateY,
    ];


    projection
        .scale(scale)
        .translate(translate);
}

function loadData(continent, grade = "all") {
    const formattedContinent = continent.replace("-", "_");

    Promise.all([
        d3.json(`data/geometria/${formattedContinent}.geojson`),
        d3.csv(`data/grades/${formattedContinent}_routes_grades.csv`),
        d3.csv(`data/info/${formattedContinent}_routes_info.csv`)
    ])
    .then(([geojson, gradesData, routeInfoData]) => {
        console.log(`GeoJSON loaded for ${continent}:`, geojson);
        console.log(`Grades data loaded for ${continent}:`, gradesData);
        console.log(`Route info data loaded for ${continent}:`, routeInfoData);

        gradeState.set(continent, grade);

        createLegend(gradesData); 
        populateGrades(continent, gradesData);
        updateMap(continent, geojson, gradesData, routeInfoData, grade, daltonic=isDaltonicMode); 
    })
    .catch(error => {
        console.error(`Error loading data for ${continent}:`, error);
    });
}

function populateGrades(continent, gradesData) {
    const filter = document.querySelector(`.grade-filter[data-continent="${continent}"]`);

    const savedGrade = gradeState.get(continent) || "all";

    const uniqueGrades = Array.from(new Set(gradesData.map(d => d.grade_fra))).sort();

    
    filter.innerHTML = '<option value="all">All Grades</option>';
    uniqueGrades.forEach(grade => {
        const option = document.createElement("option");
        option.value = grade;
        option.textContent = grade;
        filter.appendChild(option);
    });

    
    if (uniqueGrades.includes(savedGrade) || savedGrade === "all") {
        filter.value = savedGrade;
    }

    
    filter.addEventListener("change", event => {
        const selectedGrade = event.target.value;
        gradeState.set(continent, selectedGrade); 
        loadData(continent, selectedGrade); 
    });
}


function updateMap(continent, geojson, gradesData, routeInfoData, grade, daltonic) {
    console.log(`Updating map for ${continent}, Daltonic mode: ${daltonic}`);

    console.log(`Updating map for ${continent}...`);

    const mapId = `#${continent.replace("-", "_")}-map`;
    const tooltipId = `#${continent.replace("-", "_")}-tooltip`;
    
    const svg = d3.select(mapId);
    const tooltip = d3.select(tooltipId);
    
    const selectedCountryDisplay = document.getElementById(`selected-country-display-${continent}`);
    const selectedCountryName = document.getElementById(`selected-country-name-${continent}`);
    const selectedGrade = document.getElementById(`selected-grade-info-${continent}`);
    const selectedRouteNumber = document.getElementById(`selected-route-number-${continent}`);
    const routesListContainer = document.getElementById(`routes-list-container-${continent}`);
    const closeSelectionBtn = document.getElementById(`close-selection-btn-${continent}`);

    let selectedCountry = null; 

    
    updateProjection(geojson, continent);
    svg.selectAll("*").remove(); 
    const paths = svg.selectAll("path").data(geojson.features);
 
    console.log(`GeoJSON bounds for ${continent}:`, d3.geoPath().bounds(geojson));
    console.log(`Projection scale: ${projection.scale()}, translate: ${projection.translate()}`);
    svg.selectAll("path").each(function (d) {
        console.log(`Path rendered for ${continent}:`, d.properties.name);
 
       })
    console.log("GeoJSON Features:", geojson.features);

    console.log(`Binding ${paths.size()} features to map for ${continent}`); 

    paths.join("path")
        .attr("d", d3.geoPath().projection(projection))
        .attr("fill", "lightgray") 
        .attr("stroke", "black")
   

    updateMapSize(continent); 
    
    gradesData.forEach(d => {
        d.grade_fra = d.grade_fra.trim().toLowerCase();
    });
    

    const filteredGrades = grade === "all"
        ? gradesData
        : gradesData.filter(d => d.grade_fra === grade.trim().toLowerCase());

    const routeCounts = d3.rollups(
        filteredGrades,
        v => d3.sum(v, d => d.route_count),
        d => d.Country.trim().toLowerCase()
    );

    const colormap = daltonic ? d3.interpolateViridis : d3.interpolateYlOrRd;

    const maxRoutes = d3.max(routeCounts, d => d[1]) || 1;
    const colorScale = d3.scaleSequential(colormap).domain([0, maxRoutes]);

    // Draw countries
    svg.selectAll("path")
        .data(geojson.features)
        .join("path")
        .attr("d", d3.geoPath().projection(projection))
        .attr("fill", d => {
            const countryName = d.properties.name?.trim().toLowerCase() || "";
            const count = routeCounts.find(c => c[0] === countryName)?.[1] || 0;
            return count === 0 ? "#d3d3d3" : colorScale(count);
        })
        .attr("stroke", "#000")
        .attr("stroke-width", 0.75)
        .attr("opacity", 0.8)
        .on("mouseover", function (event, d) {
            tooltip.style("display", "block").text(d.properties.name || "Unknown Country");
        })
        .on("mousemove", function (event) {
            const [x, y] = d3.pointer(event);
            tooltip.style("left", `${x + 10}px`).style("top", `${y + 10}px`);
        })
        .on("mouseout", function () {
            tooltip.style("display", "none");
        })
        
        .on("click", function (event, d) {
            
            tooltip.style("display", "none");
            
            
            const countryName = d.properties.name || "Unknown Country";
            selectedCountryName.textContent = countryName;
            selectedGrade.textContent = grade + ' |'
            selectedCountryDisplay.style.display = "flex";
            
                
            
            const routeFile = `data/info/${continent}_routes_info.csv`;
            d3.csv(routeFile).then(routeInfoData => {
                
                const filteredRoutes = routeInfoData.filter(route => {
                    return (
                        route.Country.trim().toLowerCase() === countryName.trim().toLowerCase() &&
                        (grade === "all" || route.grade_fra === grade)
                    );
                });
                selectedRouteNumber.textContent = filteredRoutes.length + ' routes'
                
                console.log('filtered_routes', filteredRoutes)
                
                
                const routesHTML = filteredRoutes.map(route => `
                    <div class="routes-list-item">
                        <strong>Crag:</strong> ${route.crag || "Unknown"}<br>
                        <strong>Sector:</strong> ${route.sector || "Unknown"}<br>
                        <strong>Name:</strong> ${route.name || "Unknown"}
                    </div>
                `).join("");
        
                
                routesListContainer.innerHTML = routesHTML || "<p>No routes found for this grade in this country.</p>";
            }).catch(error => {
                console.error("Error loading route data:", error);
                routesListContainer.innerHTML = "<p>Error loading routes information.</p>";
            });
        });

selectedCountryDisplay.style.display = "none";


closeSelectionBtn.addEventListener("click", () => {
    selectedCountryDisplay.style.display = "none";
});
}

document.querySelectorAll(".grade-filter").forEach(filter => {
    filter.addEventListener("change", event => {
        const continent = filter.dataset.continent; 
        const grade = event.target.value; 
        console.log(`Grade selected: ${grade} for ${continent}`); 
        loadData(continent, grade); 
    });
})

function loadWorldGeoJSON(daltonic = false) {
    console.log("Daltonic mode in loadWorldGeoJSON:", daltonic);
    const continents = ["europe", "asia", "africa", "north_america", "south_america", "oceania"];

    Promise.all(
        continents.map(continent =>
            d3.json(`data/geometria/${continent}.geojson`).then(geojson => ({ continent, geojson }))
        )
    )
    .then(geojsonData => {
        console.log("Passing daltonic to renderWorldMap:", daltonic);
        renderWorldMap(geojsonData, "all", daltonic);
    })
    .catch(error => console.error("Error loading world map data:", error));
}
function getWorldProjection() {
    return d3.geoMercator()
        .scale(230) 
        .translate([860, 560]); 
}



function renderWorldMap(geojsonData, grade = "all", daltonic=false) {
    let gradesData = null;


    d3.csv(`data/grades/world_routes_grades.csv`).then(data => {
        gradesData = data;

        
        gradesData.forEach(d => {
            d.route_count = +d.route_count || 0; 
            d.grade_fra = d.grade_fra.trim().toLowerCase(); 
        });

        
        const filteredGrades = grade === "all"
            ? gradesData
            : gradesData.filter(d => d.grade_fra === grade.trim().toLowerCase());

        
        const routeCounts = d3.rollups(
            filteredGrades,
            v => d3.sum(v, d => d.route_count),
            d => d.Country.trim().toLowerCase()
        );

        const colormap = daltonic ? d3.interpolateViridis : d3.interpolateYlOrRd;

        
        const maxRoutes = d3.max(routeCounts, d => d[1]) || 1;
        const colorScale = d3.scaleSequential(colormap).domain([0, maxRoutes]);

        const tooltip = d3.select("#tooltip")

        
        const svg = d3.select("#world-map")
            .attr("width", 1000)
            .attr("height", 800);
        
            svg.selectAll("*").remove(); 

        
        const worldProjection = getWorldProjection();
        const worldPath = d3.geoPath().projection(worldProjection);

    
        geojsonData.forEach(({ continent, geojson }) => {
            svg.selectAll(`.continent-${continent}`)
                .data(geojson.features)
                .enter()
                .append("path")
                .attr("class", `continent-${continent}`)
                .attr("d", worldPath)
                .attr("fill", d => {
                    const countryName = d.properties.name?.trim().toLowerCase() || "";
                    const count = routeCounts.find(c => c[0] === countryName)?.[1] || 0;
                    return count === 0 ? "#d3d3d3" : colorScale(count);
                })
                .attr("stroke", "#333")
                .on("mouseover", function (event, d) {
                    tooltip.style("display", "block").text(d.properties.name || "Unknown Country");
                })
                .on("mousemove", function (event) {
                    const [x, y] = d3.pointer(event);
                    tooltip.style("left", `${x + 10}px`).style("top", `${y + 10}px`);
                })
                .on("mouseout", function () {
                    tooltip.style("display", "none");
                })
                // Persisten
                .on("click", () => {
                    document.querySelector(`#${continent}-section`).scrollIntoView({ behavior: "smooth" });
                });
        });
    }).catch(error => {
        console.error("Error loading grades data:", error);
    });
}


document.getElementById("daltonic-mode-button").addEventListener("click", () => {
    isDaltonicMode = !isDaltonicMode;
    const buttonText = isDaltonicMode ? "Original Mode" : "I'm Daltonic";
    document.getElementById("daltonic-mode-button").textContent = buttonText;

    const legendGradient = document.getElementById("legend-gradient");
    if (isDaltonicMode) {
        legendGradient.style.background = "linear-gradient(to right, #440154, #21908d, #fde725)"; 
    } else {
        legendGradient.style.background = "linear-gradient(to right, #888888, #ffe7a2, #901d1d)"; 
    }
    const continents = ["europe", "asia", "africa", "north_america", "south_america", "oceania"];
    
    continents.forEach(continent => {
        Promise.all([
            d3.json(`data/geometria/${continent}.geojson`),
            d3.csv(`data/grades/${continent}_routes_grades.csv`),
            d3.csv(`data/info/${continent}_routes_info.csv`)
        ])
        .then(([geojson, gradesData, routeInfoData]) => {
            updateMap(continent, geojson, gradesData, routeInfoData, "all", isDaltonicMode);
        })
        .catch(error => console.error(`Error updating map for ${continent}:`, error));
    });
    console.log("Daltonic mode toggled:", isDaltonicMode);
    loadWorldGeoJSON(isDaltonicMode); 
});

d3.csv("data/charts/processed_climber_df.csv").then(data => {
    const containerWidth = 480; 
    const containerHeight = 300; 
    const gradeChartWidth = 1555; 
    const gradeChartHeight = 300; 

    
    const globalAverages = {
        male: {
            height: d3.mean(data.filter(d => +d.sex === 0), d => +d.height),
            weight: d3.mean(data.filter(d => +d.sex === 0), d => +d.weight),
            age: d3.mean(data.filter(d => +d.sex === 0), d => +d.age),
        },
        female: {
            height: d3.mean(data.filter(d => +d.sex === 1), d => +d.height),
            weight: d3.mean(data.filter(d => +d.sex === 1), d => +d.weight),
            age: d3.mean(data.filter(d => +d.sex === 1), d => +d.age),
        }
    };

    
    const countries = Array.from(new Set(data.map(d => d.country)));
    const countrySelector = d3.select("#country-selector");
    countries.forEach(country => {
        countrySelector.append("option").attr("value", country).text(country);
    });


    
    countrySelector.on("change", function () {
        const selectedCountry = this.value;
        const countryData = data.filter(d => d.country === selectedCountry);

        
        displayCountryCharts(countryData);
    });

    function displayCountryCharts(countryData) {
        const metrics = ["height", "weight", "age"];
        const metricLabels = {
            height: "Height (cm)",
            weight: "Weight (kg)",
            age: "Age (years)"
        };

        
        d3.select("#top-row").html("");
        d3.select("#bottom-row").html("");

        metrics.forEach(metric => {
            const maleAverage = d3.mean(countryData.filter(d => +d.sex === 0), d => +d[metric]);
            const femaleAverage = d3.mean(countryData.filter(d => +d.sex === 1), d => +d[metric]);
        
            
            const globalMaleAverage = globalAverages.male[metric];
            const globalFemaleAverage = globalAverages.female[metric];
        
            const chartContainer = d3.select("#top-row").append("div")
                .attr("class", "chart-container");
        
            chartContainer.append("h3")
                .style("color", "white")
                .style("text-align", "center")
                .style("margin-bottom", "10px")
                .text(metricLabels[metric]);
        
            const svg = chartContainer.append("svg");
        
            const margin = { top: 20, right: 30, bottom: 40, left: 50 };
            const width = containerWidth - margin.left - margin.right;
            const height = containerHeight - margin.top - margin.bottom;
        
            const chartGroup = svg.append("g")
                .attr("transform", `translate(${margin.left}, ${margin.top})`);
        
            svg.attr("width", containerWidth).attr("height", containerHeight);
        
            
            const maleData = countryData.filter(d => +d.sex === 0);
            const femaleData = countryData.filter(d => +d.sex === 1);
        
            
            const xScale = d3.scaleLinear()
                .domain(d3.extent(countryData, d => +d[metric]))
                .range([0, width]);
        
            
            const histogram = d3.histogram()
                .domain(xScale.domain())
                .thresholds(xScale.ticks(10))
                .value(d => +d[metric]);
        
            const maleBins = histogram(maleData);
            const femaleBins = histogram(femaleData);
        
            const yScale = d3.scaleLinear()
                .domain([0, d3.max([...maleBins, ...femaleBins], d => d.length)])
                .range([height, 0]);
        
            
            chartGroup.selectAll(".bar-male")
                .data(maleBins)
                .enter()
                .append("rect")
                .attr("x", d => xScale(d.x0))
                .attr("y", d => yScale(d.length))
                .attr("width", d => xScale(d.x1) - xScale(d.x0) - 1)
                .attr("height", d => height - yScale(d.length))
                .attr("fill", "purple")
                .attr("opacity", 0.8);
        
            
            chartGroup.selectAll(".bar-female")
                .data(femaleBins)
                .enter()
                .append("rect")
                .attr("x", d => xScale(d.x0))
                .attr("y", d => yScale(d.length))
                .attr("width", d => xScale(d.x1) - xScale(d.x0) - 1)
                .attr("height", d => height - yScale(d.length))
                .attr("fill", "yellow")
                .attr("opacity", 0.8);
        
            
            addGenderMarkers(chartGroup, xScale, yScale, maleAverage, femaleAverage, metricLabels[metric]);
        
            
            chartGroup.append("g")
                .attr("transform", `translate(0, ${height})`)
                .call(d3.axisBottom(xScale).ticks(5));
        
            chartGroup.append("g")
                .call(d3.axisLeft(yScale).ticks(5));
        
            
            chartGroup.append("text")
                .attr("transform", `translate(${width / 2}, ${height + 35})`)
                .style("text-anchor", "middle")
                .style("fill", "white")
                .text(metricLabels[metric]);
        
            chartGroup.append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", -40)
                .attr("x", -height / 2)
                .style("text-anchor", "middle")
                .style("fill", "white")
        
            
            chartGroup.append("line")
                .attr("x1", xScale(globalMaleAverage))
                .attr("x2", xScale(globalMaleAverage))
                .attr("y1", 0)
                .attr("y2", height)
                .attr("stroke", "red")
                .attr("stroke-width", 2)
                .style("stroke-dasharray", "4,2")
                .append("title")
                .text(`M: ${globalMaleAverage.toFixed(1)}`);
        
            chartGroup.append("text")
                .attr("x", xScale(globalMaleAverage))
                .attr("y", -5)
                .attr("fill", "red")
                .attr("font-size", "12px")
                .text(`M: ${globalMaleAverage.toFixed(1)}`);
        
            
            chartGroup.append("line")
                .attr("x1", xScale(globalFemaleAverage))
                .attr("x2", xScale(globalFemaleAverage))
                .attr("y1", 0)
                .attr("y2", height)
                .attr("stroke", "red")
                .attr("stroke-width", 2)
                .style("stroke-dasharray", "4,2")
                .append("title")
                .text(`F: ${globalFemaleAverage.toFixed(1)}`);
        
            chartGroup.append("text")
                .attr("x", xScale(globalFemaleAverage) - 45)
                .attr("y", -5)
                .attr("fill", "red")
                .attr("font-size", "12px")
                .text(`F: ${globalFemaleAverage.toFixed(1)}`);
        });
        
        
        const gradeMeanDiv = d3.select("#bottom-row").append("div")
            .attr("class", "chart-container")
            .style("margin", "0 auto")
            .style("width", `${gradeChartWidth}px`);

        gradeMeanDiv.append("h3")
            .style("color", "white")
            .style("text-align", "center")
            .text(`Climbers in ${countryData[0].country} climb...`);

            
        const gradeSvg = gradeMeanDiv.append("svg")
            .attr("width", gradeChartWidth)
            .attr("height", gradeChartHeight);

        const gradeGroup = gradeSvg.append("g")
            .attr("transform", `translate(50, 50)`);
        

        const gradeCounts = d3.rollup(countryData, v => v.length, d => d.grade_mean_fra);

        const grades = Array.from(gradeCounts.keys()).sort();
        const maxCount = d3.max(Array.from(gradeCounts.values()));

        const xScale = d3.scaleBand().domain(grades).range([0, gradeChartWidth - 100]).padding(0.2);
        const yScale = d3.scaleLinear().domain([0, maxCount]).range([gradeChartHeight - 100, 0]);

        gradeGroup.selectAll(".bar-grade")
            .data(grades)
            .enter()
            .append("rect")
            .attr("x", d => xScale(d))
            .attr("y", d => yScale(gradeCounts.get(d)))
            .attr("width", xScale.bandwidth())
            .attr("height", d => gradeChartHeight - 100 - yScale(gradeCounts.get(d)))
            .attr("fill", "mediumseagreen");

        gradeGroup.append("g")
            .attr("transform", `translate(0, ${gradeChartHeight - 100})`)
            .call(d3.axisBottom(xScale));
        gradeGroup.append("g").call(d3.axisLeft(yScale));

        gradeGroup.append("line")
        .attr("x1", 730)
        .attr("x2", 735)
        .attr("y1", -35)
        .attr("y2", 200)
        .attr("stroke", "red")
        .attr("stroke-width", 2)
        .style("stroke-dasharray", "4,2")
        .append("title")
        .text(`${globalGradeAverage.toFixed(1)}`);
    }

    function addGenderMarkers(chartGroup, xScale, yScale, maleAvg, femaleAvg, metric) {
        
        chartGroup.append("line")
            .attr("x1", xScale(maleAvg))
            .attr("x2", xScale(maleAvg))
            .attr("y1", 0)
            .attr("y2", yScale(0))
            .attr("stroke", "white")
            .attr("stroke-dasharray", "4")
            .attr("stroke-width", 2);

        chartGroup.append("text")
            .attr("x", xScale(maleAvg) + 5)
            .attr("y", 15)
            .attr("fill", "white")
            .attr("font-size", "12px")
            .text(`M: ${maleAvg.toFixed(1)}`);

        chartGroup.append("line")
            .attr("x1", xScale(femaleAvg))
            .attr("x2", xScale(femaleAvg))
            .attr("y1", 0)
            .attr("y2", yScale(0))
            .attr("stroke", "white")
            .attr("stroke-dasharray", "4")
            .attr("stroke-width", 2);

        chartGroup.append("text")
            .attr("x", xScale(femaleAvg) -55)
            .attr("y", 30)
            .attr("fill", "white")
            .attr("font-size", "12px")
            .text(`F: ${femaleAvg.toFixed(1)}`);
    }
});

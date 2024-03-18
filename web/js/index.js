import { fetchBasicUserData, fetchXpData, fetchGradeData, fetchRatioData, fetchSkillsData, fetchProject } from './fetcher.js';


function displayBasicUserData(userData) {
    if (userData && userData.length > 0) {
        const {
            firstName,
            lastName,
            githubLogin,
            email,
            attrs: { phone, age, nationality1: nation },
        } = userData[0];

        document.getElementById("FirstName").textContent = `Prénom: ${firstName}`;
        document.getElementById("LastName").textContent = `Nom: ${lastName}`;
        document.getElementById("githubLogin").textContent = `GitHub: ${githubLogin}`;
        document.getElementById("email").textContent = `Email: ${email}`;
        document.getElementById("age").textContent = `Age: ${age}`;
        document.getElementById("phone").textContent = `Phone: ${phone}`;
        document.getElementById("nationality").textContent = `Nationality: ${nation}`;
        // Ajoutez cette ligne pour mettre à jour le prénom dans le volet de droite
        document.querySelector('.right-section .info p').textContent = `Hey, ${firstName}`;
    } else {
        console.error("Aucune donnée d'utilisateur n'est disponible.");
    }
}

function updateXpAmount(xpAmount) {
    const xpAmountDiv = document.querySelector('.xp-amount .xp-score p');
    xpAmountDiv.textContent = `${xpAmount}`;
}

function updateGrades(div01Level) {
    const gradesDiv = document.querySelector('.grades-score p');
    gradesDiv.textContent = `${div01Level}`;
}

function updateAudits(auditRatio) {
    const auditRatioDiv = document.querySelector('.audits-score p');
    const auditDoneDiv = document.querySelector('.audit-done p');
    const auditReceivedDiv = document.querySelector('.audit-received p');

    auditRatioDiv.textContent = auditRatio;
    // auditDoneDiv.textContent = auditDone;
    // auditReceivedDiv.textContent = auditReceived;
}

async function updateProjects(jwt) {
    try {
        const projects = await fetchProject(jwt);
        const projectCountDiv = document.querySelector('.project-score p');
        projectCountDiv.textContent = projects.length;
    } catch (error) {
        console.error("Error fetching project data:", error.message);
    }
}

function createSkillsRadarChart(skillLabels, skillData) {
    const ctx = document.getElementById('skillsRadarChart').getContext('2d');
    const skillsRadarChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: skillLabels,
            datasets: [{
                label: 'Skills',
                data: skillData,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scale: {
                ticks: {
                    suggestedMin: 0,
                    suggestedMax: 10
                }
            }
        }
    });
}

function createProjectBars(projects) {
    const svg = d3.select('#bar-graph').append('svg')
        .attr('width', 700)
        .attr('height', 500);

    const xScale = d3.scaleBand()
        .domain(projects.map(project => project.path))
        .range([0, 800])
        .padding(0.2);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(projects, project => project.amount)])
        .range([500, 0]);

    const tooltip = d3.select('#bar-graph')
        .append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0);

    svg.selectAll('rect')
        .data(projects)
        .enter()
        .append('rect')
        .attr('x', project => xScale(project.path))
        .attr('y', project => yScale(project.amount))
        .attr('width', xScale.bandwidth())
        .attr('height', project => 500 - yScale(project.amount))
        .attr('fill', 'steelblue')
        .on('mouseover', function (event, project) {
            tooltip.transition()
                .duration(200)
                .style('opacity', 0.9);
            tooltip.html(`<p>${project.path}: ${project.amount} XP</p>`)
                .style('left', (event.pageX + 20) + 'px')
                .style('top', (event.pageY - 30) + 'px');
        })
        .on('mouseout', function () {
            tooltip.transition()
                .duration(500)
                .style('opacity', 0);
        });

    svg.append('g')
        .attr('transform', 'translate(0, 500)')
        .call(d3.axisBottom(xScale))
        .selectAll('text')
        .attr('transform', 'translate(-10, 0)rotate(-45)')
        .style('text-anchor', 'end');

    svg.append('g')
        .call(d3.axisLeft(yScale)
            .tickFormat(d => `${d} XP`)
            .ticks(5));
}
function createPieChart(auditFails, auditPasses) {
    const data = [
        { name: 'Audits Failed', value: auditFails },
        { name: 'Audits Passed', value: auditPasses }
    ];

    const svg = d3.select('.round-graph').append('svg')
        .attr('width', 400)
        .attr('height', 400)
        .append('g')
        .attr('transform', 'translate(200, 200)');

    const color = d3.scaleOrdinal()
        .domain(data.map(d => d.name))
        .range(['#9b59b6', '#34495e']);

    const arc = d3.arc()
        .outerRadius(150)
        .innerRadius(0);

    const pie = d3.pie()
        .value(d => d.value);

    const g = svg.selectAll('.arc')
        .data(pie(data))
        .enter().append('g')
        .attr('class', 'arc')
        .on('mouseover', function (event, d) {
            if (d.data && d.data.name) {
                const total = auditFails + auditPasses;
                const percentage = ((d.data.value / total) * 100).toFixed(1);
                d3.select('.legend-text')
                    .text(`${d.data.name}: ${percentage}%`);
            }
        })
        .on('mouseout', function () {
            d3.select('.legend-text').text('');
        });

    g.append('path')
        .attr('d', arc)
        .style('fill', d => color(d.data.name));

    g.append('text')
        .attr('transform', d => `translate(${arc.centroid(d)})`)
        .attr('dy', '.35em')
        .style('text-anchor', 'middle')
        .text(d => d.data.name);

    svg.append('text')
        .attr('class', 'legend-text')
        .attr('x', 0)
        .attr('y', -180)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .style('font-weight', 'bold')
        .text('');
}

document.addEventListener("DOMContentLoaded", async function () {
    const jwt = localStorage.getItem("jwt");

    if (!jwt) {
        window.location.href = "login.html";
    }

    try {
        const [userData, xpAmount, div01Level, { auditRatio, auditDone, auditReceived, auditFails, auditPasses }, { skillLabels, skillData }, projects] = await Promise.all([
            fetchBasicUserData(jwt),
            fetchXpData(jwt),
            fetchGradeData(jwt),
            fetchRatioData(jwt),
            fetchSkillsData(jwt),
            fetchProject(jwt),
        ]);
        //desactivation temporaire
        displayBasicUserData(userData);
        updateXpAmount(xpAmount);
        updateGrades(div01Level);
        updateAudits(auditRatio);
        updateProjects(jwt);
        createSkillsRadarChart(skillLabels, skillData);
        createProjectBars(projects);
        createPieChart(auditFails, auditPasses);
    } catch (error) {
        console.error("Error fetching data:", error.message);
    }

    const profilePhoto = document.getElementById('profile-photo');
    const apiUrl = 'https://api.dicebear.com/8.x/bottts/svg';
    const seed = Math.floor(Math.random() * 10000); // Génère un seed aléatoire
  
    profilePhoto.src = `${apiUrl}?seed=${seed}?scale=150`;
});

/*******************Comportement ui*************/
const sideMenu = document.querySelector('aside');
const menuBtn = document.getElementById('menu-btn');
const closeBtn = document.getElementById('close-btn');
menuBtn.addEventListener('click', () => {
    sideMenu.style.display = 'block';
    closeBtn.style.display = 'block'
});

closeBtn.addEventListener('click', () => {
    sideMenu.style.display = 'none';
});

document.querySelector('.Btn').addEventListener('click', () => {
    localStorage.removeItem("jwt");
    window.location.href = "login.html";
});
/***************Comportement ui End**************/

/**********Function checking localSTorage***********************/
function checkJwt() {
    const jwt = localStorage.getItem("jwt");
    if (!jwt) {
        window.location.href = "login.html";
    }
}

// Vérifier le JWT immédiatement au chargement de la page
checkJwt();

// Vérifier le JWT toutes les 5 minutes
setInterval(checkJwt, 1000);
/**********Function checking localSTorage End***********************/

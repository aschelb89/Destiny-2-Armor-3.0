// script.js

function runBuildSuggestionEngine() {
  const desiredStats = {
    Weapons: parseInt(document.getElementById("desired-weapons").value) || 0,
    Class: parseInt(document.getElementById("desired-class").value) || 0,
    Super: parseInt(document.getElementById("desired-super").value) || 0,
    Melee: parseInt(document.getElementById("desired-melee").value) || 0,
    Grenade: parseInt(document.getElementById("desired-grenade").value) || 0,
    Health: parseInt(document.getElementById("desired-health").value) || 0,
  };

  const buildClass = document.getElementById("build-class").value;
  const tertiaryStat = document.getElementById("tertiary-stat").value;
  const includeMasterwork = document.getElementById("masterwork-toggle").checked;

  const builds = [];
  for (let i = 0; i < 10; i++) {
    const build = generateRandomBuild(desiredStats, includeMasterwork, tertiaryStat);
    builds.push(build);
  }

  displayBuildSuggestions(builds);
}

function generateRandomBuild(desiredStats, includeMasterwork, tertiaryStat) {
  const stats = ["Weapons", "Class", "Super", "Melee", "Grenade", "Health"];
  const build = {};
  let totalDesired = 0;

  for (const stat of stats) {
    totalDesired += desiredStats[stat];
  }

  for (const stat of stats) {
    const weight = totalDesired > 0 ? desiredStats[stat] / totalDesired : 1 / stats.length;
    const tier = Math.floor(weight * 10 + Math.random() * 2); // Tiers from 0–10 with variation
    build[stat] = tier * 10;
  }

  if (includeMasterwork) {
    const nonTertiary = stats.filter(stat => stat !== tertiaryStat);
    const bonusStats = pickRandom(nonTertiary, 3);
    for (const stat of bonusStats) {
      build[stat] += 5;
    }
  }

  build.Tiers = Object.fromEntries(
    stats.map(stat => [stat, Math.floor(build[stat] / 10)])
  );

  build.Total = stats.reduce((sum, stat) => sum + build[stat], 0);

  return build;
}

function pickRandom(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function displayBuildSuggestions(builds) {
  const output = document.getElementById("build-suggestions-output");
  output.innerHTML = "";

  builds.forEach((build, index) => {
    const div = document.createElement("div");
    div.className = "build-suggestion";
    div.innerHTML = `<strong>Build ${index + 1}</strong><ul>` +
      Object.entries(build).filter(([key]) => key !== 'Tiers' && key !== 'Total').map(([stat, val]) => `<li>${stat}: ${val}</li>`).join("") +
      `</ul><strong>Tiers:</strong> <ul>` +
      Object.entries(build.Tiers).map(([stat, tier]) => `<li>${stat}: ${tier}</li>`).join("") +
      `</ul><strong>Total Stat Budget:</strong> ${build.Total}`;
    output.appendChild(div);
  });
}

function addArchetype() {
  const name = document.getElementById("archetype-name").value;
  const primary = document.getElementById("archetype-primary").value;
  const secondary = document.getElementById("archetype-secondary").value;
  const description = document.getElementById("archetype-description").value;
  alert(`New Archetype Added:\nName: ${name}\nPrimary: ${primary}\nSecondary: ${secondary}\nDescription: ${description}`);
}

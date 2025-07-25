// build-suggestion-engine.js

const STAT_NAMES = ["Weapons", "Class", "Super", "Melee", "Grenade", "Health"];

const archetypes = {
  Paragon: { Super: 'primary', Melee: 'secondary' },
  Gunner: { Weapons: 'primary', Grenade: 'secondary' },
  Brawler: { Melee: 'primary', Health: 'secondary' },
  Bulwark: { Health: 'primary', Class: 'secondary' },
  Grenadier: { Grenade: 'primary', Super: 'secondary' },
  Specialist: { Class: 'primary', Weapons: 'secondary' },
};

const tierStats = {
  T1: { base: 50, primary: 16, secondary: 12, tertiary: 7 },
  T2: { base: 58, primary: 20, secondary: 15, tertiary: 10 },
  T3: { base: 63, primary: 24, secondary: 18, tertiary: 13 },
  T4: { base: 73, primary: 30, secondary: 25, tertiary: 18 },
  T5: { base: 78, primary: 32, secondary: 27, tertiary: 21 },
};

function calculateBuildStats(buildConfig, masterworkEnabled, tertiaryStat) {
  const result = {
    Weapons: 0,
    Class: 0,
    Super: 0,
    Melee: 0,
    Grenade: 0,
    Health: 0
  };

  buildConfig.forEach(({ tier, archetype }) => {
    const stats = tierStats[tier];
    const primary = archetypes[archetype].primary;
    const secondary = archetypes[archetype].secondary;

    result[primary] += stats.primary;
    result[secondary] += stats.secondary;

    // Allocate tertiary pool evenly to remaining 4 stats
    const tertiaryTargets = STAT_NAMES.filter(s => s !== primary && s !== secondary && s !== tertiaryStat);
    const perStat = Math.floor(stats.tertiary / tertiaryTargets.length);
    tertiaryTargets.forEach(stat => {
      result[stat] += perStat;
    });
  });

  if (masterworkEnabled) {
    // Add +5 to the 3 stats NOT in primary/secondary/tertiary
    const excluded = buildConfig.reduce((acc, cur) => {
      acc.add(archetypes[cur.archetype].primary);
      acc.add(archetypes[cur.archetype].secondary);
      return acc;
    }, new Set([tertiaryStat]));

    const bonusTargets = STAT_NAMES.filter(stat => !excluded.has(stat));
    bonusTargets.forEach(stat => {
      result[stat] += 5;
    });
  }

  return result;
}

function generateBuildSuggestions(desiredStats, masterworkEnabled, className, tertiaryStat) {
  const tiers = ["T1", "T2", "T3", "T4", "T5"];
  const archetypeList = Object.keys(archetypes);
  const buildSuggestions = [];

  // Generate all possible 5-slot combinations
  function recurseBuild(currentBuild) {
    if (currentBuild.length === 5) {
      const stats = calculateBuildStats(currentBuild, masterworkEnabled, tertiaryStat);

      const matches = STAT_NAMES.every(stat => stats[stat] >= (desiredStats[stat] || 0));
      if (matches) {
        buildSuggestions.push({
          config: [...currentBuild],
          totalStats: stats
        });
      }

      return;
    }

    for (const tier of tiers) {
      for (const archetype of archetypeList) {
        recurseBuild([...currentBuild, { tier, archetype }]);
        if (buildSuggestions.length >= 100) return; // cap at 100
      }
    }
  }

  recurseBuild([]);

  return buildSuggestions;
}

// UI Integration Trigger
function runBuildSuggestionEngine() {
  const desiredStats = {};
  STAT_NAMES.forEach(stat => {
    const input = document.getElementById(`desired-${stat.toLowerCase()}`);
    desiredStats[stat] = parseInt(input.value) || 0;
  });

  const className = document.getElementById("build-class").value;
  const tertiaryStat = document.getElementById("tertiary-stat").value;
  const masterworkEnabled = document.getElementById("masterwork-toggle").checked;

  const suggestions = generateBuildSuggestions(desiredStats, masterworkEnabled, className, tertiaryStat);

  const outputDiv = document.getElementById("build-suggestions-output");
  outputDiv.innerHTML = "";

  if (suggestions.length === 0) {
    outputDiv.innerHTML = `<p>No matching builds found.</p>`;
    return;
  }

  suggestions.forEach(({ config, totalStats }, index) => {
    const buildText = config.map(c => `${c.tier} ${c.archetype}`).join(", ");
    const statText = STAT_NAMES.map(stat => `${stat}: ${totalStats[stat]}`).join(" | ");

    const div = document.createElement("div");
    div.className = "build-suggestion";
    div.innerHTML = `<strong>Build ${index + 1}:</strong><br>${buildText}<br><em>${statText}</em><hr>`;
    outputDiv.appendChild(div);
  });
}

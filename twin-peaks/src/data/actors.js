/* Postavy: jen popis vzhledu (placeholder) a barva replik.
   Až budou sprity, stačí doplnit `sprite` / `portraitImg` z manifestu. */
(function () {
  const TP = (window.TP = window.TP || {});
  TP.data = TP.data || {};

  TP.data.actors = {
    natalie: {
      name: 'Natálie', color: '#e8dcc0', height: 52, longHair: true,
      apron: true, apronColor: '#efe7d8',
      colors: { skin: '#e2b38d', hair: '#4a2c1b', top: '#7a3f46', bottom: '#2b2f38' },
      sprite: 'natalie', portraitImg: 'natalie_portrait',
    },
    cooper: {
      name: 'Dale Cooper', color: '#cfd8dc', height: 54, tie: '#a81c22',
      colors: { skin: '#dcb08a', hair: '#241a12', top: '#22252b', bottom: '#191c21' },
      sprite: 'cooper', portraitImg: 'cooper_portrait',
    },
    norma: {
      name: 'Norma Jennings', color: '#f0c060', height: 52, longHair: true,
      apron: true, apronColor: '#e4dfd2',
      colors: { skin: '#e0b48e', hair: '#5a3a22', top: '#8c4a52', bottom: '#33353c' },
    },
    ben: {
      name: 'Ben Horne', color: '#f0c060', height: 53, tie: '#2f5d3a',
      colors: { skin: '#dcae86', hair: '#3a2a1c', top: '#4a4433', bottom: '#33302a' },
    },
    jerry: {
      name: 'Jerry Horne', color: '#e0a06a', height: 50, hat: '#3b2e24',
      colors: { skin: '#d8a880', hair: '#3a2a1c', top: '#b0813f', bottom: '#33302b' },
    },
    lucy: {
      name: 'Lucy Moran', color: '#f0a8c0', height: 51, longHair: true,
      colors: { skin: '#e6bb94', hair: '#c9a04a', top: '#c66f92', bottom: '#4a4a63' },
    },
    andy: {
      name: 'Andy Brennan', color: '#c8b48a', height: 53, hat: '#4a3f2a',
      colors: { skin: '#e0b48e', hair: '#5a4630', top: '#6b6045', bottom: '#4a4335' },
    },
    harry: {
      name: 'šerif Harry Truman', color: '#c8b48a', height: 54, hat: '#4a3f2a',
      colors: { skin: '#dcae86', hair: '#2e2419', top: '#6b6045', bottom: '#4a4335' },
    },
    hawk: {
      name: 'Hawk', color: '#c8b48a', height: 54, longHair: true,
      colors: { skin: '#c99468', hair: '#181410', top: '#6b6045', bottom: '#4a4335' },
    },
    logLady: {
      name: 'Log Lady', color: '#cbbfa6', height: 50, glasses: true, longHair: true,
      colors: { skin: '#dcb896', hair: '#8a7a63', top: '#5c5243', bottom: '#3c372d' },
    },
    lyra: {
      name: 'Lyra', color: '#d8b98a', height: 26, shape: 'dog',
      colors: { top: '#8a5f33', hair: '#5a3c1f' },
    },
    pokojska: {
      name: 'pokojská', color: '#d8dcd8', height: 51, longHair: true,
      apron: true, apronColor: '#dfe4e2',
      colors: { skin: '#d8a880', hair: '#3a2a1c', top: '#55606b', bottom: '#3a4048' },
    },
    hostA: { name: 'řidič náklaďáku', color: '#c8bba0', height: 52, hat: '#5a4a33', colors: { skin: '#d8a880', hair: '#4a3a28', top: '#4a5a4a', bottom: '#33383a' } },
    hostB: { name: 'žena s kloboukem', color: '#c8bba0', height: 50, longHair: true, colors: { skin: '#e2b894', hair: '#7a6a58', top: '#7a5a72', bottom: '#3a3540' } },
    hostC: { name: 'pán s novinami', color: '#c8bba0', height: 51, colors: { skin: '#d8ac82', hair: '#8d9aa0', top: '#55606b', bottom: '#3a3f44' } },
    vypravec: { name: '', color: '#8d9aa0', height: 0 },
  };
})();

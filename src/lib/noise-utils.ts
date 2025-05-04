// Perlin Noise implementation extracted from animation-utils.ts

export const noise = (() => {
  const p = new Uint8Array(512);
  // Large permutation array (ensure it's included)
  const permutation = [
    151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,
    23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,
    174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,
    133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,
    89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,
    5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,
    248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,
    232,178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,
    249,14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,
    236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180
  ];
  
  for (let i = 0; i < 256; i++) p[i] = p[i + 256] = permutation[i];

  // Helper functions (internal to this module)
  function fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }
  
  function lerp(t: number, a: number, b: number): number {
    return a + t * (b - a);
  }
  
  function grad(hash: number, x: number, y: number): number {
    const h = hash & 15;
    const u = h < 8 ? x : y, v = h < 4 ? y : h === 12 || h === 14 ? x : 0;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  // Exported noise function
  return {
    noise2D: function(x: number, y: number): number {
      const X = Math.floor(x) & 255, Y = Math.floor(y) & 255;
      x -= Math.floor(x);
      y -= Math.floor(y);
      const fx = fade(x), fy = fade(y);
      // Hash coordinates of the 4 corners
      const gi00 = p[X + p[Y]] % 12;
      const gi01 = p[X + p[Y + 1]] % 12;
      const gi10 = p[X + 1 + p[Y]] % 12;
      const gi11 = p[X + 1 + p[Y + 1]] % 12;
      // Compute noise contributions from each corner
      const n00 = grad(gi00, x, y);
      const n10 = grad(gi10, x - 1, y);
      const n01 = grad(gi01, x, y - 1);
      const n11 = grad(gi11, x - 1, y - 1);
      // Interpolate contributions
      const nx0 = lerp(fx, n00, n10);
      const nx1 = lerp(fx, n01, n11);
      return lerp(fy, nx0, nx1);
    }
  };
})();

export const GRADIENT_OPTIONS: Record<string, { colors: [string, string]; backgroundColor: string }> = {
    blue: { colors: ['#0079BF', '#005A9C'], backgroundColor: '#0079BF' },
    green: { colors: ['#61BD4F', '#36A82B'], backgroundColor: '#61BD4F' },
    orange: { colors: ['#FF9F1A', '#E67E22'], backgroundColor: '#FF9F1A' },
    red: { colors: ['#EB5A46', '#CF513D'], backgroundColor: '#EB5A46' },
    purple: { colors: ['#C377E0', '#8E44AD'], backgroundColor: '#C377E0' },
    pink: { colors: ['#FF78CB', '#FF2D92'], backgroundColor: '#FF78CB' },
    lime: { colors: ['#51E898', '#00C16E'], backgroundColor: '#51E898' },
    sky: { colors: ['#00C2E0', '#0098B7'], backgroundColor: '#00C2E0' },
    grey: { colors: ['#B6BBBF', '#6B8086'], backgroundColor: '#B6BBBF' },
  };
  
  function adjustColor(color: string, amount: number): string {
    color = color.replace('#', '');
    let r = parseInt(color.substring(0, 2), 16);
    let g = parseInt(color.substring(2, 4), 16);
    let b = parseInt(color.substring(4, 6), 16);
    
    r = Math.max(0, Math.min(255, r + amount));
    g = Math.max(0, Math.min(255, g + amount));
    b = Math.max(0, Math.min(255, b + amount));
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
  
  export function getBoardGradientColors(prefs: any): [string, string] {
    if (prefs?.background && GRADIENT_OPTIONS[prefs.background]) {
      return GRADIENT_OPTIONS[prefs.background].colors;
    } else if (prefs?.backgroundColor) {
      const baseColor = prefs.backgroundColor;
      return [baseColor, adjustColor(baseColor, -20)];
    }
    // Valeur par défaut
    return GRADIENT_OPTIONS.blue.colors;
  }
  
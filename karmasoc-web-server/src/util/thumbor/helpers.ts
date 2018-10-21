import { FiltersState } from './filter.model';


export function getOverlayColor(overlayType: string): string {
  const solidBackground = {
    a: 0.5,
    b: 253,
    g: 162,
    r: 62
  };
  const linearBackground = {
    a: 0.5,
    b: 253,
    g: 162,
    r: 62,
    stop: 10,
    direction: 'to bottom'
  };
  const radialBackground = {
    a: 0.04,
    b: 70,
    g: 70,
    r: 70,
    stop: 100,
    position: 'center center',
    size: 'closest-corner'
  };

  const stop1 = linearBackground.stop;
  const stop2 = radialBackground.stop;
  const color1 = `rgba(${linearBackground.r}, ${linearBackground.g}, ${linearBackground.b}, ${linearBackground.a})`;
  const color2 = `rgba(${radialBackground.r}, ${radialBackground.g}, ${radialBackground.b}, ${radialBackground.a})`;

  switch (overlayType) {
    case 'solid_background':
      return `rgba(${solidBackground.r}, ${solidBackground.g}, ${solidBackground.b}, ${solidBackground.a})`;
    case 'linear_gradient':
      const direction = linearBackground.direction;
      return `linear-gradient(${direction}, ${color1} ${stop1}%, ${color2} ${stop2}%)`;
    case 'radial_gradient':
      const position = radialBackground.position;
      const size = radialBackground.size;
      return `-webkit-radial-gradient(${position}, circle ${size}, ${color1} ${stop1}%, ${color2} ${stop2}%)`;
    case 'none':
      return null;
  }
}
//@ts-ignore
import Animation from './../../styles/settings/animation.scss';

const cssTime = (s:string) => {
  if(!s) return -1;
  if(s.indexOf('ms') !== -1) {
    return parseInt(s);
  } else if(s.indexOf('s') !== -1) {
    return parseFloat(s) * 1000;
  }
  return -1;
}

export const short = cssTime(Animation.short);
export const medium = cssTime(Animation.med);
export const slow = cssTime(Animation.slow);

export const easeIn = Animation.easeIn as string;
export const easeOut = Animation.easeOut as string;
export const easeInOut = Animation.easeInOut as string;
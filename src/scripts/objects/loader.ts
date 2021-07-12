export type GenerateLoaderParams = {
  container?:boolean|null;
  clazz?:string|null;
  attributes?:string|null;
  size?:number;
}

export const generateLoader = (params:GenerateLoaderParams) => {
  let { container, clazz, attributes, size } = params;

  let x = '';

  size = size || 48;

  if(container) x += `<div class="o-loader__container ${clazz?clazz:''}" ${attributes?attributes:''}>`;

  x += `
    <span class="o-loader ${!container && clazz?clazz:''}">
      <svg width="${size}" height="${size}" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">
        <circle cx="50" cy="50" fill="none" stroke="currentColor" stroke-width="4" r="19" stroke-dasharray="89.5353906273091 31.845130209103033" transform="matrix(1,0,0,1,0,0)"></circle>
      </svg>
    </span>
  `;

  if(container) x += `</div>`;
  return x;
};

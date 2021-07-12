type VideoType = 'vimeo' | 'youtube';
export const videoDetermineType = (url:string):VideoType|null => {
  if(videoGetYoutubeId(url)) return 'youtube';
  if(videoGetVimeoId(url)) return 'vimeo';
  return null;
}

type VideoEmbedParams = {
  autoplay?:boolean;
}
export const videoGetEmbed = (url:string, params:VideoEmbedParams):string|null => {
  let type = videoDetermineType(url);
  if(!type) return null;
  let id:string|null;
  switch(type) {
    case 'youtube':
      id = videoGetYoutubeId(url);
      if(!id) return null;
      return videoGetYoutubeEmbed({ ...params, id });

    case 'vimeo':
      id = videoGetVimeoId(url);
      if(!id) return null;
      return videoGetVimeoEmbed({ ...params, id });

    default:
      return null;
  }
}


/** Youtube */
export const videoGetYoutubeId = (url:string) => {
  const regex = /(youtube(-nocookie)?\.com|youtu\.be)\/(watch\?v=|v\/|u\/|embed\/?)?([\w-]{11})(.*)?/i;
  const matches = regex.exec(url);
  if(!matches||!matches[4]||!matches[4].length) return null;
  return matches[4];
}

type YoutubeEmbedParams = VideoEmbedParams & {
  id:string;
}
export const videoGetYoutubeEmbed = (params:YoutubeEmbedParams) => {
  if(!params.id.length) return null;
  const qsp:string[] = [];
  if(params.autoplay) qsp.push(`autoplay=1`);
  return `https://www.youtube.com/embed/${params.id}?${qsp.join('&')}`;
}


/** Vimeo */
export const videoGetVimeoId = (url:string) => {
  const regex = /(vimeo(pro)?\.com)\/(?:[^\d]+)?(\d+)\??(.*)?$/i;
  const matches = regex.exec(url);
  if(!matches||!matches[3]||!matches[3].length) return null;
  return matches[3];
}

type VimeoEmbedParams = VideoEmbedParams & {
  id:string;
}
export const videoGetVimeoEmbed = (params:VimeoEmbedParams) => {
  if(!params.id.length) return null;
  const qsp:string[] = [];
  if(params.autoplay) qsp.push('autoplay=1');
  return `https://player.vimeo.com/video/${params.id}?${qsp.join('&')}`;
}
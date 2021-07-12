export const isInView = (params:{rect:DOMRect}) => (
  (params.rect.top < window.innerHeight) && (params.rect.bottom > 0)
);
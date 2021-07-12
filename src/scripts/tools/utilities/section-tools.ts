export const getSettings = <T>(section:HTMLElement) => {
  return JSON.parse(section.getAttribute('data-settings') || '{}') as T;
}
import { CLASS_SCROLL_DISABLED } from "../constants/classes";

export const documentDisableScroll = () => {
  document.documentElement.classList.add(CLASS_SCROLL_DISABLED);
}

export const documentEnableScroll = () => {
  document.documentElement.classList.remove(CLASS_SCROLL_DISABLED);
}
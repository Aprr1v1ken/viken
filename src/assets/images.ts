/**
 * Seluruh gambar situs diimpor dari sini agar Vite menyalinnya ke folder
 * hasil build (dist/assets). Jangan menautkan berkas dengan path mentah
 * seperti "/src/assets/..." karena path tersebut tidak tersedia di produksi.
 */
import churchCrest from './images/gmit_church_crest_1792129266798.jpg';
import churchExterior from './images/church_sanctuary_exterior_1792129267960.jpg';
import pastorPortrait from './images/pastor_portrait_1792129267812.jpg';

export const IMAGES = {
  crest: churchCrest,
  churchExterior,
  pastor: pastorPortrait,
} as const;

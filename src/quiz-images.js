// New illustrations replace legacy imports. Resolve old filenames too, so saved
// browser history can resume a quiz using the current artwork.
const RENEWED_IMAGES = {
  "hayabusa.jpg": "renewed-hayabusa.webp",
  "komachi.jpg": "renewed-komachi.webp",
  "kagayaki.jpg": "renewed-kagayaki.webp",
  "n700s_nozomi.png": "renewed-n700s_nozomi.webp",
  "e8_tsubasa.png": "renewed-e8_tsubasa.webp",
  "yamanote.jpg": "renewed-yamanote.webp",
  "shonan-shinjuku.png": "renewed-shonan-shinjuku.webp",
  "enoden.png": "renewed-enoden.webp",
  "kyushu_800_tsubame.png": "renewed-kyushu_800_tsubame.webp",
  "odoriko.webp": "renewed-odoriko.webp",
  "kuroshio.webp": "renewed-kuroshio.webp",
  "skyliner.webp": "renewed-skyliner.webp",
  "seibu.webp": "renewed-seibu.webp",
  "chuo.webp": "renewed-chuo.webp",
  "momotaro.webp": "renewed-momotaro.webp",
  "romancecar.webp": "renewed-romancecar.webp",
  "extra-oimachi.webp": "renewed-extra-oimachi.webp",
  "extra-kaiji.webp": "renewed-extra-kaiji.webp",
  "extra-sunrise.webp": "renewed-extra-sunrise.webp",
  "extra-shimakaze.webp": "renewed-extra-shimakaze.webp",
  "extra-spacia-x.webp": "renewed-extra-spacia-x.webp",
  "extra-chiyoda.webp": "renewed-extra-chiyoda.webp",
  "extra-toyoko.webp": "renewed-extra-toyoko.webp",
  "extra-hanzomon.webp": "renewed-extra-hanzomon.webp",
  "extra-fukutoshin.webp": "renewed-extra-fukutoshin.webp",
  "extra-laview.webp": "renewed-extra-laview.webp",
  "variant-seibu.webp": "renewed-variant-seibu.webp",
  "variant-yokosuka.webp": "renewed-variant-yokosuka.webp"
};

export const quizImageFile = image => RENEWED_IMAGES[image] || image;

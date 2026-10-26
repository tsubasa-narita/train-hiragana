// Metropolitan additions researched against operator sources; see docs/capital-train-additions-20261026.md.
export const CAPITAL_TRAINS = [
  {
    "id": "toei-asakusa-5500",
    "name": "とえいあさくさせん",
    "model": "都営浅草線5500形",
    "detail": "とうきょうのしたをはしり、けいきゅうやけいせいのせんへつながるよ",
    "sources": [
      "https://www.kotsu.metro.tokyo.jp/about/koukai/vehicle_outline/model_diagram/",
      "https://www.kotsu.metro.tokyo.jp/about/service/subway.html",
      "https://www.kotsu.metro.tokyo.jp/special/asakusa_renewal/index.html"
    ],
    "image": "capital-toei-asakusa-5500.webp",
    "color": "#aa4a68"
  },
  {
    "id": "toei-mita-6500",
    "name": "とえいみたせん",
    "model": "都営三田線6500形",
    "detail": "みたせんをはしり、とうきゅうめぐろせんへちょくつうするよ",
    "sources": [
      "https://www.kotsu.metro.tokyo.jp/about/koukai/vehicle_outline/model_diagram/",
      "https://www.kotsu.metro.tokyo.jp/about/service/subway.html",
      "https://www.kotsu.metro.tokyo.jp/pickup_information/news/subway/2022/sub_i_2022051110460_h.html"
    ],
    "image": "capital-toei-mita-6500.webp",
    "color": "#3c6fa2"
  },
  {
    "id": "toei-shinjuku-10-300",
    "name": "とえいしんじゅくせん",
    "model": "都営新宿線10-300形",
    "detail": "しんじゅくからちばけんへむかう、とえいのちかてつだよ",
    "sources": [
      "https://www.kotsu.metro.tokyo.jp/about/koukai/vehicle_outline/model_diagram/",
      "https://www.kotsu.metro.tokyo.jp/about/service/subway.html",
      "https://www.kotsu.metro.tokyo.jp/pickup_information/gallery/subway.html"
    ],
    "image": "capital-toei-shinjuku-10-300.webp",
    "color": "#87a848"
  },
  {
    "id": "tx-3000",
    "name": "つくばえくすぷれす",
    "model": "つくばエクスプレスTX-3000系",
    "detail": "あきはばらからつくばまでをむすぶこうそくでんしゃ",
    "sources": [
      "https://www.mir.co.jp/feature/tx-3000/",
      "https://www.mir.co.jp/feature/about_tx/index.html"
    ],
    "image": "capital-tx-3000.webp",
    "color": "#4f70a3"
  },
  {
    "id": "keio-inokashira-1000",
    "name": "いのかしらせん",
    "model": "京王井の頭線1000系",
    "detail": "しぶやときちじょうじをむすぶ、いのかしらせんのでんしゃ",
    "sources": [
      "https://www.keio.co.jp/keiofan/museum/",
      "https://www.keio.co.jp/global/routes/",
      "https://www.keio.co.jp/news/update/news_release/news_release2025/pdf/nr20260210_inokasirasenibento.pdf"
    ],
    "image": "capital-keio-inokashira-1000.webp",
    "color": "#79b7cd"
  },
  {
    "id": "keisei-3000",
    "name": "けいせいほんせん",
    "model": "京成電鉄3000形",
    "detail": "けいせいせんのまちをむすぶ、かずのおおいかよいでんしゃ",
    "sources": [
      "https://www.keisei.co.jp/keisei/keisei_museum/pictbook/",
      "https://www.keisei.co.jp/keisei/tetudou/accessj/sharyou.htm",
      "https://www.keisei.co.jp/cms/files/keisei/MASTER/0110/Y6GBPH35.pdf"
    ],
    "image": "capital-keisei-3000.webp",
    "color": "#436aab"
  },
  {
    "id": "tokyu-meguro-3020",
    "name": "とうきゅうめぐろせん",
    "model": "東急目黒線3020系",
    "detail": "めぐろせんとしんよこはませんをはしるとうきゅうのでんしゃ",
    "sources": [
      "https://www.tokyu.co.jp/railway/trains/01/",
      "https://www.tokyu.co.jp/railway/train-history/mg/",
      "https://www.tokyu.co.jp/company/news/pdf/20190326-3.pdf"
    ],
    "image": "capital-tokyu-meguro-3020.webp",
    "color": "#579ec2"
  },
  {
    "id": "jr-sagami-e131-500",
    "name": "さがみせん",
    "model": "JR東日本E131系500番台",
    "detail": "ちがさきとはしもとをむすぶ、さがみせんのでんしゃ",
    "sources": [
      "https://www.jreast.co.jp/press/2021/yokohama/20210917_y1.pdf",
      "https://www.jreast.co.jp/press/2021/yokohama/20210617_y1.pdf",
      "https://www.jreast.co.jp/en/train/local/e131.html"
    ],
    "image": "capital-jr-sagami-e131-500.webp",
    "color": "#4c94b4"
  }
];

export const CAPITAL_TRAIN_FACTS = {
  "toei-asakusa-5500": [
    {
      "text": "にしまごめから おしあげまで、とうきょうの まちを むすぶ ちかてつだよ。",
      "places": [
        "にしまごめ",
        "おしあげ",
        "とうきょう"
      ],
      "source": "https://www.kotsu.metro.tokyo.jp/about/service/subway.html"
    },
    {
      "text": "しながわを こえて けいきゅうせんへ、よこはまや みさきぐちまで ちょくつうするよ。",
      "places": [
        "しながわ",
        "よこはま",
        "みさきぐち"
      ],
      "source": "https://www.kotsu.metro.tokyo.jp/about/service/subway.html"
    }
  ],
  "toei-mita-6500": [
    {
      "text": "めぐろから にしたかしまだいらまで、みたせんが はしるよ。",
      "places": [
        "めぐろ",
        "にしたかしまだいら"
      ],
      "source": "https://www.kotsu.metro.tokyo.jp/about/service/subway.html"
    },
    {
      "text": "めぐろを こえると とうきゅうめぐろせんに つながり、ひよしまで はしるよ。",
      "places": [
        "めぐろ",
        "ひよし"
      ],
      "source": "https://www.kotsu.metro.tokyo.jp/pickup_information/news/subway/2022/sub_i_2022051110460_h.html"
    }
  ],
  "toei-shinjuku-10-300": [
    {
      "text": "しんじゅくから もとやわたまで、とえいしんじゅくせんが むすぶよ。",
      "places": [
        "しんじゅく",
        "もとやわた"
      ],
      "source": "https://www.kotsu.metro.tokyo.jp/about/service/subway.html"
    },
    {
      "text": "とうきょうの ふなぼりを とおって、ちばの もとやわたへ むかうよ。",
      "places": [
        "とうきょう",
        "ふなぼり",
        "ちば",
        "もとやわた"
      ],
      "source": "https://www.kotsu.metro.tokyo.jp/about/service/subway.html"
    }
  ],
  "tx-3000": [
    {
      "text": "あきはばらから つくばまで、つくばえくすぷれすが はしるよ。",
      "places": [
        "あきはばら",
        "つくば"
      ],
      "source": "https://www.mir.co.jp/feature/about_tx/index.html"
    },
    {
      "text": "あさくさや きたせんじゅを とおり、ながれやまや もりやへ むかうよ。",
      "places": [
        "あさくさ",
        "きたせんじゅ",
        "ながれやま",
        "もりや"
      ],
      "source": "https://www.mir.co.jp/feature/about_tx/index.html"
    }
  ],
  "keio-inokashira-1000": [
    {
      "text": "しぶやから きちじょうじまで、いのかしらせんが まちを むすぶよ。",
      "places": [
        "しぶや",
        "きちじょうじ"
      ],
      "source": "https://www.keio.co.jp/global/routes/"
    },
    {
      "text": "しもきたざわで おだきゅうせん、めいだいまえで けいおうせんに のりかえられるよ。",
      "places": [
        "しもきたざわ",
        "めいだいまえ"
      ],
      "source": "https://www.keio.co.jp/global/routes/"
    }
  ],
  "keisei-3000": [
    {
      "text": "けいせいうえのから なりたくうこうまで、けいせいほんせんが つながるよ。",
      "places": [
        "けいせいうえの",
        "なりたくうこう"
      ],
      "source": "https://www.keisei.co.jp/cms/files/keisei/MASTER/0110/Y6GBPH35.pdf"
    },
    {
      "text": "あおとや けいせいふなばしを とおって、ちばけんの さくらへ むかうよ。",
      "places": [
        "あおと",
        "けいせいふなばし",
        "ちばけん",
        "さくら"
      ],
      "source": "https://www.keisei.co.jp/keisei/tetudou/accessj/sharyou.htm"
    }
  ],
  "tokyu-meguro-3020": [
    {
      "text": "めぐろから ひよしまで、とうきゅうめぐろせんが つながるよ。",
      "places": [
        "めぐろ",
        "ひよし"
      ],
      "source": "https://www.tokyu.co.jp/railway/train-history/mg/"
    },
    {
      "text": "ひよしから しんよこはまを こえて、そうてつせんへ のりいれるよ。",
      "places": [
        "ひよし",
        "しんよこはま"
      ],
      "source": "https://www.tokyu.co.jp/railway/train-history/mg/"
    }
  ],
  "jr-sagami-e131-500": [
    {
      "text": "ちがさきから はしもとまで、さがみせんを はしるでんしゃだよ。",
      "places": [
        "ちがさき",
        "はしもと"
      ],
      "source": "https://www.jreast.co.jp/press/2021/yokohama/20210617_y1.pdf"
    },
    {
      "text": "あつぎや えびなを とおり、さがみはらの はしもとまで はしるよ。",
      "places": [
        "あつぎ",
        "えびな",
        "さがみはら",
        "はしもと"
      ],
      "source": "https://www.jreast.co.jp/press/2021/yokohama/20210617_y1.pdf"
    }
  ]
};

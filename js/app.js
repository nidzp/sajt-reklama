(() => {
  const root = document.documentElement;
  const header = document.querySelector('[data-header]');
  const nav = document.querySelector('[data-nav]');
  const hamburger = document.querySelector('[data-hamburger]');
  const langToggle = document.querySelector('[data-lang-toggle]');
  const heroSection = document.querySelector('.hero');
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  const sequenceElements = document.querySelectorAll('.reveal-sequence');
  const lightbox = document.querySelector('[data-lightbox-modal]');
  const lightboxImage = document.querySelector('[data-lightbox-image]');
  const lightboxCaption = document.querySelector('[data-lightbox-caption]');
  const lightboxTriggers = document.querySelectorAll('[data-lightbox]');
  const closeLightboxButtons = document.querySelectorAll('[data-close-lightbox]');
  const contactForm = document.getElementById('contact-form');
  const catalogFiltersContainer = document.querySelector('[data-catalog-filters]');
  const catalogListContainer = document.querySelector('[data-catalog-list]');
  const catalogCountElement = document.querySelector('[data-catalog-count]');
  const blogListContainer = document.querySelector('[data-blog-list]');
  const blogEmptyState = document.querySelector('[data-blog-empty]');
  const blogSearchForm = document.querySelector('[data-blog-search-form]');
  const blogSearchInput = document.querySelector('[data-blog-search-input]');
  const blogSearchReset = document.querySelector('[data-blog-search-reset]');
  const modalRoot = document.querySelector('[data-modal-root]');
  const modalTitle = modalRoot?.querySelector('[data-modal-title]');
  const modalBody = modalRoot?.querySelector('[data-modal-body]');
  const modalFooter = modalRoot?.querySelector('[data-modal-footer]');
  const toastElement = document.querySelector('[data-toast]');
  const toastMessage = toastElement?.querySelector('[data-toast-message]');
  const orderForm = document.querySelector('[data-order-form]');
  const orderItemsContainer = document.querySelector('[data-order-items]');
  const cartItemsContainer = document.querySelector('[data-cart-items]');
  const cartEmptyElement = document.querySelector('[data-cart-empty]');
  const cartTotalElement = document.querySelector('[data-cart-total]');
  const orderResetButton = document.querySelector('[data-order-reset]');

  const STORAGE_KEY = 'vespera-preferred-language';
  const DEFAULT_LANGUAGE = 'en';

  let currentLanguage = DEFAULT_LANGUAGE;
  let lastFocusedElement = null;
  let heroSequenceInitialized = false;
  let heroSequenceActivated = false;
  const heroSequenceTimeouts = [];
  let revealObserver = null;
  const motionPreference = typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : null;
  let reduceMotion = motionPreference?.matches ?? false;

  const LOCALE_MAP = {
    en: 'en-GB',
    sr: 'sr-RS',
  };

  // UI copy and button labels for dynamically generated sections.
  const uiText = {
    en: {
      catalog: {
        filters: {
          all: 'All',
          breads: 'Breads',
          pastries: 'Pastries',
          cakes: 'Cakes',
          other: 'Other',
        },
        moreInfo: 'More Info',
        openDetails: 'Open details for',
        priceLabel: 'Price',
        ingredientsLabel: 'Ingredients',
        allergensLabel: 'Allergens',
        servingLabel: 'Serving notes',
        addToOrder: 'Add to order list',
        inCart: 'In order list',
        modalClose: 'Close details',
      },
      blog: {
        readMore: 'Read more',
        publishedOn: 'Published on',
        tags: 'Tags',
        like: 'Like',
        share: 'Share',
        shareOn: 'Share on',
        noResults: 'No stories match your search yet. Try a different phrase.',
        searchPlaceholder: 'Search stories',
        resetLabel: 'Clear',
        likeCta: 'Appreciate story',
        tagsMap: {
          recipes: 'Recipes',
          community: 'Community',
          history: 'Heritage',
          events: 'Events',
        },
      },
      shareNetworks: {
        facebook: 'Facebook',
        instagram: 'Instagram',
        twitter: 'X',
      },
      order: {
        quantity: 'Quantity',
        quantityShort: 'Qty',
        increment: 'Increase quantity',
        decrement: 'Decrease quantity',
        remove: 'Remove item',
        cartEmpty: 'No items yet. Choose favorites to build your night basket.',
        subtotal: 'Subtotal',
        validation: {
          name: 'Please tell us who the order is for.',
          email: 'Enter a valid email so we can confirm.',
          phone: 'Share a phone number we can reach.',
          date: 'Select a pickup date.',
          time: 'Choose a pickup time.',
          items: 'Add at least one item to your order.',
        },
        confirmationTitle: 'Order summary',
        confirmationSubtitle: 'Here is what we will start preparing for you:',
        confirmationThanks: 'We will reach out shortly to confirm the pickup.',
        confirmationButton: 'Close summary',
      },
      toast: {
        close: 'Close notification',
      },
    },
    sr: {
      catalog: {
        filters: {
          all: 'Sve',
          breads: 'Hlebovi',
          pastries: 'Poslastice',
          cakes: 'Torte',
          other: 'Ostalo',
        },
        moreInfo: 'Vise informacija',
        openDetails: 'Otvori detalje za',
        priceLabel: 'Cena',
        ingredientsLabel: 'Sastojci',
        allergensLabel: 'Alergeni',
        servingLabel: 'Saveti za serviranje',
        addToOrder: 'Dodaj u porudzbinu',
        inCart: 'Vec u porudzbini',
        modalClose: 'Zatvori detalje',
      },
      blog: {
        readMore: 'Procitaj vise',
        publishedOn: 'Objavljeno',
        tags: 'Tagovi',
        like: 'Svidja mi se',
        share: 'Podeli',
        shareOn: 'Podeli na',
        noResults: 'Nijedna prica trenutno ne odgovara pretrazi. Pokusajte drugu rec.',
        searchPlaceholder: 'Pretrazi price',
        resetLabel: 'Ocisti',
        likeCta: 'Podrzi pricu',
        tagsMap: {
          recipes: 'Recepti',
          community: 'Zajednica',
          history: 'Nasledje',
          events: 'Dogadjaji',
        },
      },
      shareNetworks: {
        facebook: 'Facebook',
        instagram: 'Instagram',
        twitter: 'X',
      },
      order: {
        quantity: 'Kolicina',
        quantityShort: 'Kol',
        increment: 'Povecaj kolicinu',
        decrement: 'Smanji kolicinu',
        remove: 'Ukloni stavku',
        cartEmpty: 'Nema stavki. Odaberite omiljene kako biste napunili nocnu korpu.',
        subtotal: 'Meduzbir',
        validation: {
          name: 'Recite nam na koga se porudzbina odnosi.',
          email: 'Unesite vazecu e-mail adresu kako bismo potvrdili.',
          phone: 'Podelite broj telefona za kontakt.',
          date: 'Izaberite datum preuzimanja.',
          time: 'Izaberite vreme preuzimanja.',
          items: 'Dodajte bar jednu stavku u porudzbinu.',
        },
        confirmationTitle: 'Rezime porudzbine',
        confirmationSubtitle: 'Pocinjemo da pripremamo sledece za vas:',
        confirmationThanks: 'Ubrzo cemo vas kontaktirati radi potvrde.',
        confirmationButton: 'Zatvori rezime',
      },
      toast: {
        close: 'Zatvori obavestenje',
      },
    },
  };

  // Catalog data drives the dynamic menu rendering in both languages.
  const catalogItems = [
    {
      id: 'luna-levain',
      category: 'breads',
      price: 5.4,
      image: 'assets/img/specialty-1.svg',
      width: 640,
      height: 480,
      priority: true,
      translations: {
        en: {
          name: 'Luna Levain',
          alt: 'Illustration of the Luna Levain loaf',
          summary: 'Stone-ground wheat fermented with blackberry starter.',
          story: 'Ferments for forty eight hours under low light to build gentle acidity.',
          ingredients: [
            'Stone-ground wheat flour',
            'Blackberry wild starter',
            'Spring water',
            'Sea salt flakes',
          ],
          serving: 'Slice thick and toast beside midnight cheeses.',
          allergens: 'Contains gluten.',
        },
        sr: {
          name: 'Luna levain',
          alt: 'Ilustracija hleba Luna levain',
          summary: 'Psenicno brasno fermentisano starterom od kupine.',
          story: 'Fermentise cetrdeset osam sati pod blagim svetlom za meku kiselost.',
          ingredients: [
            'Brasno od psenice',
            'Divlji starter od kupine',
            'Izvorska voda',
            'Morska so',
          ],
          serving: 'Secite deblje i tostirajte uz nocne sireve.',
          allergens: 'Sadrzi gluten.',
        },
      },
    },
    {
      id: 'ember-rye',
      category: 'breads',
      price: 4.9,
      image: 'assets/img/gallery-6.svg',
      width: 640,
      height: 480,
      priority: true,
      translations: {
        en: {
          name: 'Ember Rye',
          alt: 'Illustration of ember rye loaf with ash dust',
          summary: 'Charcoal rye with ember salt and smoked sunflower seeds.',
          story: 'Proofed overnight beside the hearth stones for deep rye sweetness.',
          ingredients: [
            'Dark rye flour',
            'Charcoal starter',
            'Smoked sunflower seeds',
            'Ember sea salt',
          ],
          serving: 'Serve with ash butter or savory jams.',
          allergens: 'Contains gluten and seeds.',
        },
        sr: {
          name: 'Ember raz',
          alt: 'Ilustracija razenog hleba sa pepelom',
          summary: 'Ugljenisani raz sa solju iz zara i dimljenim semenima suncokreta.',
          story: 'Odmara celu noc pored ognjista da razvije duboku slast.',
          ingredients: [
            'Brasno od razi',
            'Ugljenisani starter',
            'Dimljena semena suncokreta',
            'So iz zara',
          ],
          serving: 'Posluzite uz puter sa pepelom ili slane dzemove.',
          allergens: 'Sadrzi gluten i semenke.',
        },
      },
    },
    {
      id: 'starlit-baguette',
      category: 'breads',
      price: 3.9,
      image: 'assets/img/gallery-3.svg',
      width: 640,
      height: 480,
      translations: {
        en: {
          name: 'Starlit Baguette',
          alt: 'Illustration of golden baguettes on a board',
          summary: 'Crisp baguette brushed with starflower oil and midnight herbs.',
          story: 'Hand rolled at dusk and finished with a sprinkle of lunar salt.',
          ingredients: [
            'Bread flour',
            'Levain starter',
            'Starflower infused oil',
            'Lunar herb salt',
          ],
          serving: 'Tear and share with olive tapenade or ember olive oil.',
          allergens: 'Contains gluten.',
        },
        sr: {
          name: 'Starlit baget',
          alt: 'Ilustracija zlatnih bageta na dasci',
          summary: 'Hrskav baget premazan uljem od zvezdane biljke i nocnim biljem.',
          story: 'Rucno valjan u sumrak i zavrsen prstohvatom lunarne soli.',
          ingredients: [
            'Brasno za hleb',
            'Levain starter',
            'Ulja sa zvezdanom biljkom',
            'So sa nocnim biljem',
          ],
          serving: 'Kidajte i delite uz tapenadu ili ulje iz zara.',
          allergens: 'Sadrzi gluten.',
        },
      },
    },
    {
      id: 'violet-brioche',
      category: 'pastries',
      price: 3.6,
      image: 'assets/img/specialty-2.svg',
      width: 640,
      height: 480,
      translations: {
        en: {
          name: 'Violet Nebula Brioche',
          alt: 'Illustration of brioche knots with violet glaze',
          summary: 'Feather light knots brushed with cassis syrup and pearl sugar.',
          story: 'Butter laminated in chilled moonlight keeps the crumb tender.',
          ingredients: [
            'Enriched wheat dough',
            'Farm butter',
            'Cassis syrup',
            'Pearl sugar',
          ],
          serving: 'Warm gently and finish with lavender honey.',
          allergens: 'Contains gluten, eggs, and dairy.',
        },
        sr: {
          name: 'Violet nebula brios',
          alt: 'Ilustracija brios cvorova sa ljubicastom glazurom',
          summary: 'Lagani cvorovi premazani sirupom od kasisa i bisernim secerom.',
          story: 'Maslac laminiran pod mesecom ostavlja meku i bogatu mrvice.',
          ingredients: [
            'Obogaceno testo od psenice',
            'Domaci maslac',
            'Sirup od kasisa',
            'Biserni secer',
          ],
          serving: 'Ugrejte kratko i prelijte lavandinim medom.',
          allergens: 'Sadrzi gluten, jaja i mleko.',
        },
      },
    },
    {
      id: 'lavender-croissant',
      category: 'pastries',
      price: 2.8,
      image: 'assets/img/gallery-2.svg',
      width: 640,
      height: 480,
      translations: {
        en: {
          name: 'Lavender Crescent',
          alt: 'Illustration of croissants with lavender glaze',
          summary: 'Flaky crescent layered with lavender cream and moon sugar.',
          story: 'Each fold rests for nine minutes to keep the layers airy.',
          ingredients: [
            'Laminated dough',
            'Lavender cream',
            'Moon sugar dust',
            'Sea salt butter',
          ],
          serving: 'Pair with cold brew infused with vanilla bean.',
          allergens: 'Contains gluten, eggs, and dairy.',
        },
        sr: {
          name: 'Lavanda kroasan',
          alt: 'Ilustracija kroasana sa lavandom',
          summary: 'Lisnati kroasan punjen kremom od lavande i nocnim secerom.',
          story: 'Svaki preklop odmara devet minuta da slojevi ostanu vazdusni.',
          ingredients: [
            'Laminirano testo',
            'Krem od lavande',
            'Nocni secer',
            'Maslac sa morskom soli',
          ],
          serving: 'Uparite sa hladnim napitkom od vanile.',
          allergens: 'Sadrzi gluten, jaja i mleko.',
        },
      },
    },
    {
      id: 'aurora-mille-feuille',
      category: 'pastries',
      price: 4.6,
      image: 'assets/img/specialty-4.svg',
      width: 640,
      height: 480,
      translations: {
        en: {
          name: 'Aurora Mille-Feuille',
          alt: 'Illustration of mille-feuille slices with pastel glaze',
          summary: 'Puff pastry layered with vanilla custard and candied petals.',
          story: 'Sheets bake between chilled stones to lock in the shimmer.',
          ingredients: [
            'Puff pastry',
            'Vanilla bean custard',
            'Candied flower petals',
            'Midnight sugar glaze',
          ],
          serving: 'Slice with a chilled knife for clean aurora layers.',
          allergens: 'Contains gluten, eggs, and dairy.',
        },
        sr: {
          name: 'Aurora mille-feuille',
          alt: 'Ilustracija mille-feuille kocki',
          summary: 'Lisnato testo sa kremom od vanile i kandiranim laticama.',
          story: 'Listovi se peku izmedju hladnih ploca da bi zadrzali sjaj.',
          ingredients: [
            'Lisnato testo',
            'Krem od vanile',
            'Kandirane latice',
            'Glazura nocnog secera',
          ],
          serving: 'Secite hladnim nozem da slojevi ostanu uredni.',
          allergens: 'Sadrzi gluten, jaja i mleko.',
        },
      },
    },
    {
      id: 'prismatic-torte',
      category: 'cakes',
      price: 6.8,
      image: 'assets/img/specialty-3.svg',
      width: 640,
      height: 480,
      translations: {
        en: {
          name: 'Prismatic Torte',
          alt: 'Illustration of a prismatic chocolate torte',
          summary: 'Velvet sponge layered with star anise ganache and mirror glaze.',
          story: 'Glaze is poured at six degrees to capture the twilight reflections.',
          ingredients: [
            'Cocoa sponge',
            'Star anise ganache',
            'Mirror glaze',
            'Night berry compote',
          ],
          serving: 'Serve chilled with midnight berry coulis.',
          allergens: 'Contains gluten, eggs, and dairy.',
        },
        sr: {
          name: 'Prismaticna torta',
          alt: 'Ilustracija prismaticne cokoladne torte',
          summary: 'Barsunasta kora sa ganasom od zvezdanog anisa i ogledalskom glazurom.',
          story: 'Glazura se preliva na sest stepeni da zadrzi odsjaj sumraka.',
          ingredients: [
            'Kora sa kakaom',
            'Ganas od zvezdanog anisa',
            'Ogledalska glazura',
            'Kompot od nocnih bobica',
          ],
          serving: 'Posluzite hladno uz preliv od sumracnih bobica.',
          allergens: 'Sadrzi gluten, jaja i mleko.',
        },
      },
    },
    {
      id: 'solstice-mooncake',
      category: 'cakes',
      price: 5.9,
      image: 'assets/img/specialty-6.svg',
      width: 640,
      height: 480,
      translations: {
        en: {
          name: 'Solstice Mooncake',
          alt: 'Illustration of a mooncake with constellation pattern',
          summary: 'Golden lotus paste, blackberry compote, and glitter sesame crust.',
          story: 'Stamped by hand with constellations honoring the river skyline.',
          ingredients: [
            'Lotus seed paste',
            'Blackberry compote',
            'Sesame crust',
            'Golden syrup',
          ],
          serving: 'Warm gently and share under candlelight.',
          allergens: 'Contains gluten and sesame.',
        },
        sr: {
          name: 'Solsticijski kolac',
          alt: 'Ilustracija kolaca sa sazvezdjima',
          summary: 'Zlatni lotus nadev, kompot od kupine i sjajna susamova kora.',
          story: 'Rucno se utiskuju sazvezdja koja slave reku i obalu.',
          ingredients: [
            'Pasta od lotus semena',
            'Kompot od kupine',
            'Kora od susama',
            'Zlatni sirup',
          ],
          serving: 'Lagano ugrejte i delite pod svecama.',
          allergens: 'Sadrzi gluten i susam.',
        },
      },
    },
    {
      id: 'nebula-macaron',
      category: 'other',
      price: 1.2,
      image: 'assets/img/gallery-1.svg',
      width: 640,
      height: 480,
      translations: {
        en: {
          name: 'Nebula Macaron',
          alt: 'Illustration of shimmering macarons',
          summary: 'Almond meringue with blueberry stardust buttercream.',
          story: 'Shells rest for thirty minutes to set the nebula swirl.',
          ingredients: [
            'Almond flour',
            'Sugar meringue',
            'Blueberry buttercream',
            'Edible stardust',
          ],
          serving: 'Serve chilled for a snappy bite.',
          allergens: 'Contains nuts, eggs, and dairy.',
        },
        sr: {
          name: 'Nebula makarun',
          alt: 'Ilustracija svetlucavih makarona',
          summary: 'Badamov puslic sa puter kremom od borovnice i zvezdane prasine.',
          story: 'Ljuske odmaraju trideset minuta da se vrtlog ucvrsti.',
          ingredients: [
            'Brasno od badema',
            'Secerna puslica',
            'Puter krem od borovnice',
            'Jestiva zvezdana prasina',
          ],
          serving: 'Posluzite hladno za hrskav zalogaj.',
          allergens: 'Sadrzi orahe, jaja i mleko.',
        },
      },
    },
    {
      id: 'ember-savory-roll',
      category: 'other',
      price: 2.1,
      image: 'assets/img/gallery-5.svg',
      width: 640,
      height: 480,
      translations: {
        en: {
          name: 'Ember Savory Roll',
          alt: 'Illustration of savory rolls with vegetables',
          summary: 'Savory roll filled with coal roasted vegetables and herb cheese.',
          story: 'Baked in cast iron to keep the ember char on each fold.',
          ingredients: [
            'Wheat dough',
            'Coal roasted peppers',
            'Herb cheese',
            'Charred scallions',
          ],
          serving: 'Pair with smoked tomato soup or late night salads.',
          allergens: 'Contains gluten and dairy.',
        },
        sr: {
          name: 'Slani ember rolat',
          alt: 'Ilustracija slanog rolata sa povrcem',
          summary: 'Slani rolat punjen povrcem pecenim na zaru i sirom sa biljem.',
          story: 'Pecen u livenom gvozdju kako bi svaki preklop imao trag zara.',
          ingredients: [
            'Testo od psenice',
            'Paprike pecene na zaru',
            'Sir sa biljem',
            'Peceni mladi luk',
          ],
          serving: 'Uparite sa dimljenom supom od paradajza ili kasnim salatama.',
          allergens: 'Sadrzi gluten i mleko.',
        },
      },
    },
  ];

  // Blog stories highlight events and history with localized copy.
  const blogPosts = [
    {
      id: 'lavender-rolls-return',
      image: 'assets/img/gallery-4.svg',
      tags: ['recipes', 'history'],
      likes: 54,
      translations: {
        en: {
          title: 'Lavender Orchard Rolls Return',
          summary: 'Grandmother Mara passed down the dusk roll that melts every autumn.',
          content: [
            'We revisited the original notebook from 1952 where Mara wrote that lavender should be steeped at sunset. The steeping keeps the oils gentle and aromatics bright.',
            'This season we blend orchard honey from Banovo brdo and dusk picked lavender to fill each roll. Guests who join tastings can braid their own glaze lines.',
          ],
          date: 'September 22, 2025',
        },
        sr: {
          title: 'Lavanda rolne se vracaju',
          summary: 'Baka Mara ostavila je sumracni rolat koji se topi svake jeseni.',
          content: [
            'Ponovo smo otvorili svesku iz 1952. godine u kojoj je Mara zapisala da lavanda treba da se natapa u zalazak. Tako etarska ulja ostaju blaga a miris svetao.',
            'Ove sezone mesamo med iz Banovog brda i lavandu ubranu u sumrak da napunimo svaki rolat. Gosti na degustacijama mogu sami da iscrtaju linije glazure.',
          ],
          date: '22. septembar 2025',
        },
      },
    },
    {
      id: 'midnight-market',
      image: 'assets/img/gallery-7.svg',
      tags: ['community', 'events'],
      likes: 61,
      translations: {
        en: {
          title: 'Midnight Market on the Promenade',
          summary: 'Neighbors gathered under lanterns for bread pairings and live music.',
          content: [
            'We transformed the river promenade into a glowing alley of baskets, local cheese makers, and our own moonlit pastry booth. Children painted constellation bread bags while the jazz duo played midnight standards.',
            'The crowd favorite was the ember rye topped with plum jam and smoked salt butter. We plan to repeat the market each new moon so vendors can share seasonal night treats.',
          ],
          date: 'October 5, 2025',
        },
        sr: {
          title: 'Ponocni market na promenadi',
          summary: 'Komšije su se okupile pod lampionima uz hleb i muziku uzivo.',
          content: [
            'Pretvorili smo rečnu promenadu u osvetljenu ulicu korpi, lokalnih sirara i naseg nocnog stenda sa poslasticama. Deca su oslikavala papirne kese sazvezdjima dok je dzez duo svirao ponocne standarde.',
            'Omiljena kombinacija bila je ember raz sa pekmezom od sljive i puterom sa dimljenom soli. Planiramo da ponovimo market svakog mladog meseca kako bismo predstavili sezonske nocne zalogaje.',
          ],
          date: '5. oktobar 2025',
        },
      },
    },
    {
      id: 'family-oven-notes',
      image: 'assets/img/story-hearth.svg',
      tags: ['history', 'community'],
      likes: 43,
      translations: {
        en: {
          title: 'Notes from the Family Oven',
          summary: 'Livia found her grandfather’s margin sketches for the first hearth.',
          content: [
            'While reorganising the archive we discovered pencil sketches of the original oven vents. Grandfather Rade marked the airflow channels that still guide how we position every loaf today.',
            'We framed the pages in the cafe corner so guests can see how the oven breathes. If you visit on Thursdays, Livia demonstrates the same scoring pattern shown in the notes.',
          ],
          date: 'August 18, 2025',
        },
        sr: {
          title: 'Beleške iz porodičnog ognjista',
          summary: 'Livia je pronasla skice svog dede za prvi oganj u pekari.',
          content: [
            'Dok smo sredjivali arhivu otkrili smo skice olovkom sa oznacenim ventilima peci. Deda Rade je crtao kanale vazduha koji i danas odredjuju gde postavljamo svaki hleb.',
            'Stranice smo uramili u cosku kafica kako bi gosti videli kako pec dise. Ako navratite cetvrtkom, Livia pokazuje isti obrazac zasecanja koji je zapisan u svesci.',
          ],
          date: '18. avgust 2025',
        },
      },
    },
    {
      id: 'river-tasting-flight',
      image: 'assets/img/gallery-8.svg',
      tags: ['events', 'recipes'],
      likes: 38,
      translations: {
        en: {
          title: 'River Tasting Flight Debuts',
          summary: 'A four course bread flight paired with infusions inspired by the Sava.',
          content: [
            'Guests begin with starlit baguette and spruce tea to echo river pine. The second course pairs nebula macarons with blackberry mist to mirror the evening fog.',
            'We finish with solstice mooncake and smoked fig tonic. The tasting is limited to twelve seats so we can guide each course and share the stories that inspired them.',
          ],
          date: 'July 30, 2025',
        },
        sr: {
          title: 'Predstavljamo river tasting flight',
          summary: 'Cetiri toka hleba i napitaka nadahnuta rekom Savom.',
          content: [
            'Degustacija pocinje starlit bagetom uz caj od smrce koji podseca na rebraste borove. Drugi tok spaja nebula makarone sa maglom od kupine da dozove vecernju izmaglicu.',
            'Zavrsavamo solsticijskim kolacem i tonikom od dimljene smokve. Degustacija je ogranicena na dvanaest mesta kako bismo vodili svaki tok i ispricali price koje su ih nadahnule.',
          ],
          date: '30. jul 2025',
        },
      },
    },
  ];

  let activeCatalogCategory = 'all';
  let blogSearchTerm = '';
  const likeState = new Map();
  const cartState = new Map();
  let modalTrapHandler = null;
  let activeModalContext = null;
  let toastTimeoutId = null;

  const getLangSuffix = (lang) => (lang === 'en' ? 'En' : 'Sr');

  const setHamburgerLabel = () => {
    if (!hamburger) return;
    const isOpen = nav?.classList.contains('open');
    const langSuffix = getLangSuffix(currentLanguage);
    const key = isOpen ? `ariaClose${langSuffix}` : `ariaOpen${langSuffix}`;
    const label = hamburger.dataset[key];
    if (label) {
      hamburger.setAttribute('aria-label', label);
    }
  };

  const throttle = (fn, wait) => {
    let inThrottle = false;
    let savedArgs = null;
    let savedThis = null;

    return function throttledFn(...args) {
      if (inThrottle) {
        savedArgs = args;
        savedThis = this;
        return;
      }

      fn.apply(this, args);
      inThrottle = true;

      window.setTimeout(() => {
        inThrottle = false;
        if (savedArgs) {
          throttledFn.apply(savedThis, savedArgs);
          savedArgs = savedThis = null;
        }
      }, wait);
    };
  };

  const updateHeaderState = () => {
    if (!header || !heroSection) {
      return;
    }
    const heroHeight = heroSection.offsetHeight;
    const threshold = Math.max(60, heroHeight * 0.3);
    if (window.scrollY > threshold) {
      header.classList.add('scrolled');
      header.classList.remove('transparent');
    } else {
      header.classList.remove('scrolled');
      header.classList.add('transparent');
    }
  };

  const closeMobileNav = () => {
    if (!nav || !hamburger) return;
    nav.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.classList.remove('is-active');
    document.body.classList.remove('menu-open');
    setHamburgerLabel();
  };

  const toggleMobileNav = () => {
    if (!nav || !hamburger) return;
    const isOpen = nav.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', String(isOpen));
    hamburger.classList.toggle('is-active', isOpen);
    document.body.classList.toggle('menu-open', isOpen);
    setHamburgerLabel();
  };

  const syncLanguageToggleState = (lang) => {
    if (langToggle) {
      langToggle.setAttribute('aria-pressed', lang === 'sr' ? 'true' : 'false');
    }
  };

  const updateOpenLightboxContent = (langSuffix) => {
    if (!lightbox || lightbox.hasAttribute('hidden')) {
      return;
    }
    const activeTriggerId = lightbox.dataset.activeTrigger;
    if (!activeTriggerId) {
      return;
    }
    const trigger = document.querySelector(`[data-lightbox][data-trigger-id="${activeTriggerId}"]`);
    if (!trigger) {
      return;
    }
    const caption = trigger.dataset[`caption${langSuffix}`];
    if (caption) {
      lightboxCaption.textContent = caption;
    }
    const triggerImage = trigger.querySelector('img');
    if (triggerImage) {
      const altTranslation = triggerImage.dataset[`i18nAlt${langSuffix}`];
      if (altTranslation) {
        lightboxImage.setAttribute('alt', altTranslation);
      }
    }
  };

  const applyLanguage = (lang) => {
    currentLanguage = lang;
    const langSuffix = getLangSuffix(lang);

    document.querySelectorAll('[data-i18n-en]').forEach((el) => {
      if (el.hasAttribute('data-lightbox-caption')) {
        return;
      }
      const translation = el.dataset[`i18n${langSuffix}`];
      if (typeof translation === 'string') {
        el.textContent = translation;
      }
    });

    document.querySelectorAll('[data-i18n-alt-en]').forEach((el) => {
      const translation = el.dataset[`i18nAlt${langSuffix}`];
      if (typeof translation === 'string') {
        el.setAttribute('alt', translation);
      }
    });

    document.querySelectorAll('[data-i18n-placeholder-en]').forEach((el) => {
      const translation = el.dataset[`i18nPlaceholder${langSuffix}`];
      if (typeof translation === 'string') {
        el.setAttribute('placeholder', translation);
      }
    });

    document.querySelectorAll('[data-i18n-aria-en]').forEach((el) => {
      const translation = el.dataset[`i18nAria${langSuffix}`];
      if (typeof translation === 'string') {
        el.setAttribute('aria-label', translation);
      }
    });

    document.querySelectorAll('[data-i18n-content-en]').forEach((el) => {
      const translation = el.dataset[`i18nContent${langSuffix}`];
      if (typeof translation === 'string') {
        el.setAttribute('content', translation);
      }
    });

    const titleElement = document.querySelector('title[data-i18n-title-en]');
    if (titleElement) {
      const translation = titleElement.dataset[`i18nTitle${langSuffix}`];
      if (typeof translation === 'string') {
        document.title = translation;
        titleElement.textContent = translation;
      }
    }

    root.setAttribute('lang', lang === 'sr' ? 'sr' : 'en');
    root.dataset.lang = lang;
    root.dataset.currentLang = lang;

    syncLanguageToggleState(lang);
    updateOpenLightboxContent(langSuffix);
    setHamburgerLabel();

    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch (error) {
      // Ignore storage errors (e.g., privacy mode)
    }
  };

  const cycleLanguage = () => {
    const nextLang = currentLanguage === 'en' ? 'sr' : 'en';
    applyLanguage(nextLang);
  };

  const showSequenceImmediately = () => {
    heroSequenceTimeouts.forEach((timeoutId) => window.clearTimeout(timeoutId));
    heroSequenceTimeouts.length = 0;
    sequenceElements.forEach((element) => element.classList.add('is-visible'));
    heroSequenceActivated = true;
  };

  const initSequences = () => {
    if (!sequenceElements.length) {
      return;
    }
    if (reduceMotion) {
      showSequenceImmediately();
      return;
    }
    if (heroSequenceActivated) {
      return;
    }
    heroSequenceActivated = true;
    sequenceElements.forEach((element, index) => {
      const delay = 200 + index * 200;
      const timeoutId = window.setTimeout(() => {
        element.classList.add('is-visible');
      }, delay);
      heroSequenceTimeouts.push(timeoutId);
    });
  };

  const initHeroSequence = () => {
    if (reduceMotion) {
      showSequenceImmediately();
      heroSequenceInitialized = true;
      return;
    }
    if (heroSequenceInitialized) {
      if (!heroSequenceActivated) {
        initSequences();
      }
      return;
    }
    heroSequenceInitialized = true;
    if (document.readyState === 'complete') {
      initSequences();
    } else {
      window.addEventListener('load', initSequences, { once: true });
    }
  };

  const createRevealObserver = () =>
    new IntersectionObserver(
      (entries, observerInstance) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observerInstance.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.18,
        rootMargin: '40px',
      }
    );

  const initializeReveals = () => {
    if (!revealElements.length) {
      return;
    }
    if (reduceMotion) {
      revealObserver?.disconnect();
      revealElements.forEach((element) => element.classList.add('is-visible'));
      return;
    }
    revealObserver?.disconnect();
    revealObserver = createRevealObserver();
    revealElements.forEach((element) => {
      if (!element.classList.contains('is-visible')) {
        revealObserver.observe(element);
      }
    });
  };

  const handleMotionPreferenceChange = (event) => {
    reduceMotion = event.matches;
    heroSequenceTimeouts.forEach((timeoutId) => window.clearTimeout(timeoutId));
    heroSequenceTimeouts.length = 0;
    heroSequenceActivated = false;

    if (reduceMotion) {
      showSequenceImmediately();
      revealObserver?.disconnect();
      revealElements.forEach((element) => element.classList.add('is-visible'));
      return;
    }

    sequenceElements.forEach((element) => element.classList.remove('is-visible'));
    revealElements.forEach((element) => element.classList.remove('is-visible'));
    initializeReveals();
    initSequences();
  };

  if (motionPreference) {
    const motionListener = (event) => handleMotionPreferenceChange(event);
    if (typeof motionPreference.addEventListener === 'function') {
      motionPreference.addEventListener('change', motionListener);
    } else if (typeof motionPreference.addListener === 'function') {
      motionPreference.addListener(motionListener);
    }
  }

  const focusableSelectors = [
    'a[href]',
    'area[href]',
    'button:not([disabled])',
    'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ];

  const trapFocus = (event) => {
    if (!lightbox || lightbox.hasAttribute('hidden')) {
      return;
    }
    if (event.key !== 'Tab') {
      return;
    }
    const focusableElements = lightbox.querySelectorAll(focusableSelectors.join(','));
    const focusArray = Array.from(focusableElements);
    if (!focusArray.length) {
      event.preventDefault();
      return;
    }
    const first = focusArray[0];
    const last = focusArray[focusArray.length - 1];
    if (event.shiftKey) {
      if (document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
    } else if (document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const closeLightbox = () => {
    if (!lightbox) return;
    lightbox.setAttribute('hidden', '');
    lightbox.setAttribute('aria-hidden', 'true');
    lightboxImage.setAttribute('src', '');
    lightboxImage.setAttribute('alt', '');
    lightboxCaption.textContent = '';
    document.body.classList.remove('lightbox-open');
    lightbox.dataset.activeTrigger = '';
    if (lastFocusedElement) {
      lastFocusedElement.focus();
      lastFocusedElement = null;
    }
    lightbox.removeEventListener('keydown', trapFocus);
  };

  const openLightbox = (trigger) => {
    if (!lightbox || !lightboxImage || !lightboxCaption) {
      return;
    }
    const langSuffix = getLangSuffix(currentLanguage);
    const src = trigger.dataset.image;
    const caption = trigger.dataset[`caption${langSuffix}`] || '';
    const triggerImg = trigger.querySelector('img');
    const altText = triggerImg ? triggerImg.dataset[`i18nAlt${langSuffix}`] : '';

    lightboxImage.setAttribute('src', src);
    lightboxImage.setAttribute('alt', altText || '');
    lightboxCaption.textContent = caption;
    lightbox.removeAttribute('hidden');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-open');
    lastFocusedElement = document.activeElement;
    if (!trigger.dataset.triggerId) {
      trigger.dataset.triggerId = `lightbox-trigger-${Math.floor(Math.random() * 1e6)}`;
    }
    lightbox.dataset.activeTrigger = trigger.dataset.triggerId || '';
    const closeButton = lightbox.querySelector('.lightbox-close');
    if (closeButton) {
      closeButton.focus();
    }
    lightbox.addEventListener('keydown', trapFocus);
  };

  const initializeLightbox = () => {
    lightboxTriggers.forEach((trigger, index) => {
      if (!trigger.dataset.triggerId) {
        trigger.dataset.triggerId = `lightbox-trigger-${index + 1}`;
      }
      trigger.addEventListener('click', () => openLightbox(trigger));
    });

    closeLightboxButtons.forEach((button) => {
      button.addEventListener('click', closeLightbox);
    });

    if (lightbox) {
      lightbox.addEventListener('click', (event) => {
        if (event.target === lightbox) {
          closeLightbox();
        }
      });

      lightbox.addEventListener('keyup', (event) => {
        if (event.key === 'Escape') {
          closeLightbox();
        }
      });
    }
  };

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const toggleFieldError = (field, hasError) => {
    const fieldWrapper = field.closest('.form-field');
    if (!fieldWrapper) return;
    const error = fieldWrapper.querySelector('.input-error');
    if (!error) return;
    field.setAttribute('aria-invalid', hasError ? 'true' : 'false');
    error.hidden = !hasError;
  };

  const validateField = (field) => {
    if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement)) {
      return true;
    }
    const value = field.value.trim();
    let isValid = true;

    switch (field.name) {
      case 'name':
        isValid = value.length >= 2;
        break;
      case 'email':
        isValid = emailPattern.test(value);
        break;
      case 'message':
        isValid = value.length >= 10;
        break;
      default:
        isValid = true;
    }

    toggleFieldError(field, !isValid);
    return isValid;
  };

  const initializeContactForm = () => {
    if (!contactForm) return;
    const feedback = contactForm.querySelector('.form-feedback');
    const nameField = contactForm.elements.namedItem('name');
    const emailField = contactForm.elements.namedItem('email');
    const messageField = contactForm.elements.namedItem('message');

    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const fields = [nameField, emailField, messageField];
      let isValid = true;

      fields.forEach((field) => {
        if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) {
          const fieldValid = validateField(field);
          if (!fieldValid) {
            isValid = false;
          }
        }
      });

      if (!isValid) {
        if (feedback) {
          feedback.hidden = true;
          feedback.classList.remove('is-visible');
        }
        return;
      }

      if (feedback) {
        feedback.hidden = false;
        feedback.classList.add('is-visible');
        window.setTimeout(() => {
          feedback.hidden = true;
          feedback.classList.remove('is-visible');
        }, 4000);
      }

      contactForm.reset();
      fields.forEach((field) => {
        if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) {
          toggleFieldError(field, false);
        }
      });
    });

    contactForm.addEventListener('input', (event) => {
      const target = event.target;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
        if (['name', 'email', 'message'].includes(target.name)) {
          validateField(target);
        }
      }
    });
  };

  const getInitialLanguage = () => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === 'sr' || stored === 'en') {
        return stored;
      }
    } catch (error) {
      // Ignore storage errors
    }
    const browserLanguage = navigator.language || (Array.isArray(navigator.languages) ? navigator.languages[0] : null);
    if (typeof browserLanguage === 'string' && browserLanguage.toLowerCase().startsWith('sr')) {
      return 'sr';
    }
    return DEFAULT_LANGUAGE;
  };

  const initLanguageToggle = () => {
    if (!langToggle) return;
    langToggle.addEventListener('click', () => {
      cycleLanguage();
    });
  };

  const initNavigation = () => {
    if (hamburger) {
      hamburger.addEventListener('click', toggleMobileNav);
    }

    if (nav) {
      nav.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => closeMobileNav());
      });
    }

    window.addEventListener(
      'resize',
      throttle(() => {
        if (window.innerWidth > 992) {
          closeMobileNav();
        }
      }, 200)
    );
  };

  const initScrollWatcher = () => {
    updateHeaderState();
    window.addEventListener('scroll', throttle(updateHeaderState, 100));
    window.addEventListener('resize', throttle(updateHeaderState, 200));
  };

  const init = () => {
    currentLanguage = getInitialLanguage();
    applyLanguage(currentLanguage);
    initNavigation();
    initLanguageToggle();
    initHeroSequence();
    initializeReveals();
    initScrollWatcher();
    initializeLightbox();
    initializeContactForm();

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        if (nav?.classList.contains('open')) {
          closeMobileNav();
        }
        if (lightbox && !lightbox.hasAttribute('hidden')) {
          closeLightbox();
        }
      }
    });
  };

  init();
})();


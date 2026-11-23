// =====================================================================
// Basement Club preview mode.
// A stand-in for the backend and the music services, so the whole site
// can be clicked through with sample friends, listening, cards, trades and
// messages. Everything is kept in this browser only. Set DEMO_MODE to
// false in config.js to use the real backend; this file is then never loaded.
// =====================================================================

const KEY = "basement-club-preview-v7";
const ALBUMS = [{"key":"bb-uvst","id":"pjw6vjnw9rNj74bXol5eKR","title":"Un Verano Sin Ti","artist":"Bad Bunny","year":2022,"genre":"Reggaeton","description":"A sprawling summer record that runs through reggaeton, dembow, indie pop and Caribbean rhythms."},{"key":"weeknd-ah","id":"WNslLZ6k4Y2Dvdm7g7FltF","title":"After Hours","artist":"The Weeknd","year":2020,"genre":"R&B","description":"A neon, retro-synth night drive that produced one of the most-streamed singles ever."},{"key":"billie-wwafa","id":"cWIWtrIVFaWXm8EbBdn7gQ","title":"When We All Fall Asleep, Where Do We Go?","artist":"Billie Eilish","year":2019,"genre":"Pop","description":"Whispered vocals over bass-heavy bedroom production made with her brother Finneas."},{"key":"am-am","id":"y5Qvbsuu4HOPLHren7iRyO","title":"AM","artist":"Arctic Monkeys","year":2013,"genre":"Rock","description":"Swaggering rock with hip-hop-inflected drums, slinky riffs and late-night lyrics."},{"key":"ts-1989","id":"UeEMBwB4AbfDhl2RJFYlVp","title":"1989","artist":"Taylor Swift","year":2014,"genre":"Pop","description":"Swift's full pivot from country to big-hook synth-pop with an '80s sheen."},{"key":"kdot-gkmc","id":"aREZSjz11zMm0XyRFWFkAv","title":"good kid, m.A.A.d city","artist":"Kendrick Lamar","year":2012,"genre":"Hip-hop","description":"A concept album tracing one day of a teenager's life in Compton, told like a short film."},{"key":"frank-blonde","id":"0vmJ6jfUgDWNW4gV4a4upj","title":"Blonde","artist":"Frank Ocean","year":2016,"genre":"R&B","description":"Minimal, impressionistic songs about memory and love, with sparse guitar and pitch-shifted vocals."},{"key":"fm-rumours","id":"OjVaiHTDVZaqMPYCouAcPK","title":"Rumours","artist":"Fleetwood Mac","year":1977,"genre":"Rock","description":"Polished soft rock written while the band's relationships were coming apart."},{"key":"tame-currents","id":"n2hIMi98wquLZPbrTexaJe","title":"Currents","artist":"Tame Impala","year":2015,"genre":"Psychedelic","description":"Kevin Parker swaps fuzzy guitars for glossy synths and disco-tinged grooves."},{"key":"mj-thriller","id":"yr7KBPtpa4yZMJhB0RKLVf","title":"Thriller","artist":"Michael Jackson","year":1982,"genre":"Pop","description":"The best-selling album of all time, fusing pop, funk, rock and disco."},{"key":"nirvana-nm","id":"9My3f2bhYWXaWTQO1bJTLT","title":"Nevermind","artist":"Nirvana","year":1991,"genre":"Rock","description":"The record that dragged grunge out of Seattle and into the mainstream."},{"key":"amy-btb","id":"9Zc36mE7cGBixTdH8FRw5t","title":"Back to Black","artist":"Amy Winehouse","year":2006,"genre":"Soul","description":"Sixties girl-group soul with a raw modern voice and unflinching lyrics."},{"key":"pf-dsotm","id":"vqILfmK6nxfVokVxvztsqI","title":"The Dark Side of the Moon","artist":"Pink Floyd","year":1973,"genre":"Progressive rock","description":"A seamless suite about time, money and madness, famous for its studio experimentation."},{"key":"dp-ram","id":"DkMzFMZXWAhBx8xOzzPj7j","title":"Random Access Memories","artist":"Daft Punk","year":2013,"genre":"Electronic","description":"The robots go analog, recording with session legends for a love letter to '70s disco."},{"key":"rh-okc","id":"M5xluObRiLmY9IaRSUqOMN","title":"OK Computer","artist":"Radiohead","year":1997,"genre":"Alternative","description":"Anxious, cinematic rock about technology and alienation at the turn of the millennium."},{"key":"kb-hol","id":"FujhlfI9kj3tcIt5cTdgTT","title":"Hounds of Love","artist":"Kate Bush","year":1985,"genre":"Art pop","description":"Half pop singles, half dreamlike suite; its opening track found a new generation decades later."},{"key":"lh-mis","id":"bRShKHCA0kq1rMJFwmGl6d","title":"The Miseducation of Lauryn Hill","artist":"Lauryn Hill","year":1998,"genre":"Neo-soul","description":"Her only solo studio album, blending soul, hip-hop and reggae with sharp, personal writing."},{"key":"rosalia-emq","id":"gWsi0ZojAPT5dB226AxfgY","title":"El Mal Querer","artist":"Rosalía","year":2018,"genre":"Flamenco pop","description":"A concept album that rebuilds flamenco with trap beats, samples and choral harmonies."},{"key":"boniver-fefa","id":"Cg5WIXvdAbO4trdCacDEsj","title":"For Emma, Forever Ago","artist":"Bon Iver","year":2007,"genre":"Folk","description":"Recorded alone in a Wisconsin cabin over a winter: falsetto, acoustic guitar and heartbreak."},{"key":"ma-mezz","id":"eX2cC5YKoVnyhSGcatJKAE","title":"Mezzanine","artist":"Massive Attack","year":1998,"genre":"Trip-hop","description":"Darker and heavier than their earlier work, with brooding bass lines and guitar."},{"key":"ph-dummy","id":"i2vzlj6DRJaS3mMTKEx94D","title":"Dummy","artist":"Portishead","year":1994,"genre":"Trip-hop","description":"Smoky, noir-ish breakbeats and Beth Gibbons' aching voice; a Bristol landmark."},{"key":"mv-madvillainy","id":"MXzQUdyOtclkwSKC62YFuA","title":"Madvillainy","artist":"Madvillain","year":2004,"genre":"Hip-hop","description":"MF DOOM's dense rhymes over Madlib's dusty, short-burst beats."},{"key":"th-ril","id":"IA7iKhLiJua4TdCkyUddsq","title":"Remain in Light","artist":"Talking Heads","year":1980,"genre":"New wave","description":"Layered polyrhythms inspired by Afrobeat, produced with Brian Eno."},{"key":"sufjan-cl","id":"5ZaOA5oZpwHmZvnaj9f1Ed","title":"Carrie & Lowell","artist":"Sufjan Stevens","year":2015,"genre":"Folk","description":"Hushed songs about grief and his late mother, mostly voice and fingerpicked guitar."},{"key":"mbv-loveless","id":"5Y4buMGcsM1EgBbEDh24f1","title":"Loveless","artist":"My Bloody Valentine","year":1991,"genre":"Shoegaze","description":"Walls of warped, bending guitar that came to define shoegaze."},{"key":"kh-ctem","id":"xXLevgDtcCgmg6hYb942qI","title":"Con Todo El Mundo","artist":"Khruangbin","year":2018,"genre":"Psychedelic","description":"A Texas trio mixing surf guitar and funk with echoes of Middle Eastern music."},{"key":"aphex-saw","id":"cwFqQM57L8S8cF7h2Ibs2Y","title":"Selected Ambient Works 85–92","artist":"Aphex Twin","year":1992,"genre":"Electronic","description":"Early ambient techno, warm and hazy, much of it made as a teenager."},{"key":"ct-hovl","id":"ef9oOgyLRKY5mRdYi05ru6","title":"Heaven or Las Vegas","artist":"Cocteau Twins","year":1990,"genre":"Dream pop","description":"Elizabeth Fraser's wordless, swooping vocals floating over shimmering guitars."},{"key":"nd-pinkmoon","id":"3cGESRfaX5g9P78N1QdlwX","title":"Pink Moon","artist":"Nick Drake","year":1972,"genre":"Folk","description":"Under half an hour of voice, guitar and a little piano; overlooked in his lifetime."},{"key":"boc-mhtrtc","id":"PqLK1hJlBfkJIHDkImZBqX","title":"Music Has the Right to Children","artist":"Boards of Canada","year":1998,"genre":"Electronic","description":"Warped, nostalgic synths that sound like half-remembered educational films."},{"key":"duster-strat","id":"cs6QIQdExUZM9TnITbvWta","title":"Stratosphere","artist":"Duster","year":1998,"genre":"Slowcore","description":"Lo-fi, spacey slowcore that found a huge young audience online decades after release."},{"key":"bjork-homo","id":"K9Z9OkeQ6Pt5Kj7a1uAcJ8","title":"Homogenic","artist":"Björk","year":1997,"genre":"Art pop","description":"Strings and crunchy beats meant to evoke Iceland's volcanic landscape."},{"key":"grouper-ddd","id":"VSh24DTo6dZ9NwuAtamdUI","title":"Dragging a Dead Deer Up a Hill","artist":"Grouper","year":2008,"genre":"Ambient folk","description":"Voice and guitar dissolved in reverb, like songs heard through fog."},{"key":"fela-zombie","id":"LR6ZSYWdtcacc5adk5HicV","title":"Zombie","artist":"Fela Kuti & Afrika 70","year":1976,"genre":"Afrobeat","description":"Fierce Afrobeat mocking Nigeria's soldiers; the backlash ended in a raid on Fela's compound."},{"key":"hanl-dc","id":"gYz3P1k1xesVt9uS24VS7u","title":"Deathconsciousness","artist":"Have a Nice Life","year":2008,"genre":"Post-punk","description":"A bleak, sprawling double album built from drone, shoegaze and post-punk."},{"key":"yoshimura-mfnpc","id":"04y8JsbmUew6xihngWiM8j","title":"Music for Nine Post Cards","artist":"Hiroshi Yoshimura","year":1982,"genre":"Ambient","description":"Gentle Japanese ambient piano, originally made to play in a gallery space."},{"key":"baier-cg","id":"BCOU3g1sPBWddZd8agmWTJ","title":"Colour Green","artist":"Sibylle Baier","year":2006,"genre":"Folk","description":"Home recordings from the early '70s, released decades later after her son shared them."},{"key":"garson-plantasia","id":"B8bbeskJzJOYelG580qvID","title":"Mother Earth's Plantasia","artist":"Mort Garson","year":1976,"genre":"Electronic","description":"Warm Moog melodies written to be played for houseplants."},{"key":"coltrane-jis","id":"ZD0V0rMtklWLcXUkDLEyyJ","title":"Journey in Satchidananda","artist":"Alice Coltrane","year":1971,"genre":"Spiritual jazz","description":"Harp, tanpura and Pharoah Sanders' saxophone in a meditative spiritual jazz classic."},{"key":"fukui-scenery","id":"rbhuAM6pBUVDeF163vjk86","title":"Scenery","artist":"Ryo Fukui","year":1976,"genre":"Jazz","description":"Lyrical piano-trio jazz from Sapporo that became an internet favorite."},{"key":"broadcast-tnmbp","id":"g0HJ1xN12LvsVovviOYUIw","title":"The Noise Made by People","artist":"Broadcast","year":2000,"genre":"Psych pop","description":"Retro-futurist psych pop with vintage synths and Trish Keenan's cool vocals."},{"key":"bunyan-jadd","id":"IWnM3aA8rQD3jd7gfVuDhA","title":"Just Another Diamond Day","artist":"Vashti Bunyan","year":1970,"genre":"Folk","description":"Pastoral folk written on a horse-and-cart trip to Scotland; ignored then, revered now."},{"key":"pratt-oyloa","id":"GhHMRNO6ZEJRgrnzyAYH1o","title":"On Your Own Love Again","artist":"Jessica Pratt","year":2015,"genre":"Folk","description":"Hazy, close-miked folk with a voice that sounds borrowed from another decade."},{"key":"triana-patio","id":"NhXAMcXakt9j22fnMFtxqG","title":"El Patio","artist":"Triana","year":1975,"genre":"Flamenco rock","description":"Seville band fusing flamenco with progressive rock and Mellotron; a pillar of rock andaluz."},{"key":"russell-woe","id":"Q73PqKQDUQzx2Xd4Ln6GhI","title":"World of Echo","artist":"Arthur Russell","year":1986,"genre":"Experimental","description":"Cello, voice and echo; intimate, strange and quietly influential."},{"key":"takada-ttlg","id":"o826y9WnlnRwUGa2Dttip4","title":"Through the Looking Glass","artist":"Midori Takada","year":1983,"genre":"Ambient","description":"Marimba and percussion in slowly shifting minimalist patterns; rediscovered via a 2017 reissue."},{"key":"guebrou-e21","id":"E9nTvR5UHyeLbd0AvKsgxo","title":"Éthiopiques Vol. 21: Piano Solo","artist":"Emahoy Tsegué-Maryam Guèbrou","year":2006,"genre":"Solo piano","description":"Solo piano from an Ethiopian nun, blending Western classical with Ethiopian modes."},{"key":"onyeabor-wiwo","id":"vg7uDlc8YsYR6dVCLGeQda","title":"Who Is William Onyeabor?","artist":"William Onyeabor","year":2013,"genre":"Afro-funk","description":"A compilation of homemade Nigerian synth funk from an enigmatic artist."},{"key":"bgc-kf","id":"bUD1HZo025T7Np8lqdZ13g","title":"Keyboard Fantasies","artist":"Beverly Glenn-Copeland","year":1986,"genre":"New age","description":"A self-released cassette of synths and voice, rediscovered when a collector in Japan found it."},{"key":"atakak-os","id":"lofLodxwpa7uZK0GhTsGov","title":"Obaa Sima","artist":"Ata Kak","year":1994,"genre":"Highlife","description":"Ghanaian rap over home-recorded synth highlife, revived after a blogger found the cassette."},{"key":"perhacs-para","id":"7bLzjjlRn4iFCtnkEJW9vd","title":"Parallelograms","artist":"Linda Perhacs","year":1970,"genre":"Psych folk","description":"Shimmering psych folk from a one-album artist who went quiet for decades."},{"key":"yokota-sakura","id":"lLq8jwzsa7W3dBH4eGdZpL","title":"Sakura","artist":"Susumu Yokota","year":2000,"genre":"Ambient","description":"Delicate looped textures from a prolific Japanese producer."},{"key":"masin-wind","id":"bwIV8jZPoUoR4QWKv9Ywup","title":"Wind","artist":"Gigi Masin","year":1986,"genre":"Ambient","description":"Sparse Italian ambient piano and synth pieces, first released as a tiny private pressing."},{"key":"platonos-gallop","id":"eHYpXUPfwk0C4H4bDpkufA","title":"Gallop","artist":"Lena Platonos","year":1985,"genre":"Synth-pop","description":"Greek electronic pop full of odd synth loops and spoken poetry."},{"key":"mergia-hci","id":"s2vdYpsS7spKCMh1ZxZSVK","title":"Hailu Mergia & His Classical Instrument","artist":"Hailu Mergia","year":1985,"genre":"Ethio-jazz","description":"Accordion, Moog and drum machine reimagining Ethiopian songs; first sold on cassette."},{"key":"hassell-fw1","id":"qSTbxhS7SohaCo9jSquqdy","title":"Fourth World, Vol. 1: Possible Musics","artist":"Jon Hassell & Brian Eno","year":1980,"genre":"Ambient","description":"Processed trumpet drifting over global rhythms in a meeting of minds with Eno."},{"key":"peacock-ito","id":"fkVJnHemfXlvvixDTuSn26","title":"I'm the One","artist":"Annette Peacock","year":1972,"genre":"Avant-garde","description":"Early synthesizer-processed vocals on a bold mix of jazz, rock and soul."},{"key":"roxanne-tilde","id":"CcE4hcm7pBVCEgw1WrfOhv","title":"~~~","artist":"Ana Roxanne","year":2019,"genre":"Ambient","description":"Weightless ambient pieces built around voice, drones and reverb."},{"key":"singh-ragas","id":"nEr4Fqp0zQDpDgiiXD7I0z","title":"Synthesizing: Ten Ragas to a Disco Beat","artist":"Charanjit Singh","year":1982,"genre":"Electronic","description":"Indian ragas played on a TB-303 and TR-808, years before acid house existed."},{"key":"strom-tmc","id":"K5C8TGudD0RgfWQPJVAMdD","title":"Trans-Millenia Consort","artist":"Pauline Anna Strom","year":1982,"genre":"Ambient","description":"Shimmering synth soundscapes from a blind San Francisco composer."},{"key":"ribeiro-paix","id":"G24zTIXnwJs2zhZUb0hxDx","title":"Paix","artist":"Catherine Ribeiro + Alpes","year":1972,"genre":"Avant-garde","description":"French avant-rock with homemade instruments and intense, incantatory vocals."},{"key":"haack-lucifer","id":"5ieMl8GwA8cJQ70IjbehzD","title":"The Electric Lucifer","artist":"Bruce Haack","year":1970,"genre":"Electronic","description":"Homemade electronics and vocoders telling a psychedelic battle between heaven and hell."}];
const BY_KEY = Object.fromEntries(ALBUMS.map(a => [a.key, a]));
const UNDERGROUND = new Set(["yoshimura-mfnpc", "grouper-ddd", "hanl-dc", "baier-cg", "fukui-scenery", "atakak-os", "guebrou-e21", "onyeabor-wiwo", "bgc-kf",
  "perhacs-para", "yokota-sakura", "masin-wind", "platonos-gallop", "mergia-hci", "roxanne-tilde", "singh-ragas", "strom-tmc", "ribeiro-paix", "haack-lucifer",
  "takada-ttlg", "duster-strat", "russell-woe", "garson-plantasia", "broadcast-tnmbp", "pratt-oyloa"]);

// Real song titles for profile songs and "recent songs".
const SONGS = {
  "weeknd-ah": "Blinding Lights", "billie-wwafa": "bad guy", "am-am": "Do I Wanna Know?", "ts-1989": "Style",
  "kdot-gkmc": "Money Trees", "frank-blonde": "Ivy", "fm-rumours": "Dreams", "tame-currents": "Let It Happen",
  "mj-thriller": "Billie Jean", "nirvana-nm": "Come as You Are", "amy-btb": "Back to Black", "pf-dsotm": "Time",
  "dp-ram": "Instant Crush", "rh-okc": "Karma Police", "kb-hol": "Running Up That Hill (A Deal with God)",
  "lh-mis": "Ex-Factor", "rosalia-emq": "Malamente", "boniver-fefa": "Skinny Love", "ma-mezz": "Teardrop",
  "ph-dummy": "Glory Box", "mv-madvillainy": "Accordion", "th-ril": "Once in a Lifetime", "sufjan-cl": "Fourth of July",
  "mbv-loveless": "Only Shallow", "ct-hovl": "Heaven or Las Vegas", "nd-pinkmoon": "Pink Moon", "boc-mhtrtc": "Roygbiv",
  "duster-strat": "Inside Out", "bb-uvst": "Tití Me Preguntó", "garson-plantasia": "Plantasia",
  "coltrane-jis": "Journey in Satchidananda", "bunyan-jadd": "Diamond Day", "bgc-kf": "Ever New"
};

/* ---------- small helpers ---------- */
const CH = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
function hash(s) { let x = 2166136261; for (let i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 16777619); } return x >>> 0; }
function rng(seed) { let a = hash(seed); return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function sid(seed) { const r = rng(seed); let s = ""; for (let i = 0; i < 22; i++) s += CH[Math.floor(r() * 62)]; return s; }
const trackId = key => sid("track:" + key);
const clone = o => JSON.parse(JSON.stringify(o));
const ago = mins => new Date(Date.now() - mins * 60000).toISOString();
const now = () => new Date().toISOString();
const svgUrl = svg => "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
const fail = message => ({ data: null, error: { code: "P0001", message } });
const ok = data => ({ data, error: null });
const albumRow = a => ({ id: a.id, title: a.title, artist: a.artist, year: a.year, genre: a.genre, description: a.description, image_url: null, spotify_url: null, underground: UNDERGROUND.has(a.key) });

const EXTRA = `Kid A|Radiohead|2000|Alternative
In Rainbows|Radiohead|2007|Alternative
The Bends|Radiohead|1995|Alternative
Abbey Road|The Beatles|1969|Rock
Revolver|The Beatles|1966|Rock
Sgt. Pepper's Lonely Hearts Club Band|The Beatles|1967|Rock
Pet Sounds|The Beach Boys|1966|Pop
What's Going On|Marvin Gaye|1971|Soul
Songs in the Key of Life|Stevie Wonder|1976|Soul
Purple Rain|Prince|1984|Pop
The Rise and Fall of Ziggy Stardust and the Spiders from Mars|David Bowie|1972|Rock
Low|David Bowie|1977|Art rock
Blackstar|David Bowie|2016|Art rock
Blue|Joni Mitchell|1971|Folk
Highway 61 Revisited|Bob Dylan|1965|Folk rock
Blonde on Blonde|Bob Dylan|1966|Folk rock
The Velvet Underground & Nico|The Velvet Underground|1967|Rock
Led Zeppelin IV|Led Zeppelin|1971|Rock
London Calling|The Clash|1979|Punk
Unknown Pleasures|Joy Division|1979|Post-punk
The Queen Is Dead|The Smiths|1986|Indie rock
Disintegration|The Cure|1989|Post-punk
Doolittle|Pixies|1989|Alternative
Daydream Nation|Sonic Youth|1988|Alternative
Automatic for the People|R.E.M.|1992|Alternative
In Utero|Nirvana|1993|Rock
Ten|Pearl Jam|1991|Rock
Grace|Jeff Buckley|1994|Rock
(What's the Story) Morning Glory?|Oasis|1995|Britpop
Parklife|Blur|1994|Britpop
Different Class|Pulp|1995|Britpop
In the Aeroplane Over the Sea|Neutral Milk Hotel|1998|Indie folk
Either/Or|Elliott Smith|1997|Indie folk
Fetch the Bolt Cutters|Fiona Apple|2020|Art pop
Is This It|The Strokes|2001|Indie rock
Funeral|Arcade Fire|2004|Indie rock
Sound of Silver|LCD Soundsystem|2007|Electronic
Boxer|The National|2007|Indie rock
Vampire Weekend|Vampire Weekend|2008|Indie rock
Fleet Foxes|Fleet Foxes|2008|Indie folk
Bloom|Beach House|2012|Dream pop
Teen Dream|Beach House|2010|Dream pop
Be the Cowboy|Mitski|2018|Indie rock
Punisher|Phoebe Bridgers|2020|Indie folk
the record|boygenius|2023|Indie rock
Dragon New Warm Mountain I Believe in You|Big Thief|2022|Indie folk
Jubilee|Japanese Breakfast|2021|Indie pop
Born to Die|Lana Del Rey|2012|Pop
Melodrama|Lorde|2017|Pop
folklore|Taylor Swift|2020|Indie folk
Midnights|Taylor Swift|2022|Pop
HIT ME HARD AND SOFT|Billie Eilish|2024|Pop
SOUR|Olivia Rodrigo|2021|Pop
BRAT|Charli XCX|2024|Pop
Short n' Sweet|Sabrina Carpenter|2024|Pop
The Rise and Fall of a Midwest Princess|Chappell Roan|2023|Pop
Future Nostalgia|Dua Lipa|2020|Pop
Harry's House|Harry Styles|2022|Pop
21|Adele|2011|Pop
Lemonade|Beyoncé|2016|R&B
RENAISSANCE|Beyoncé|2022|Dance
ANTI|Rihanna|2016|R&B
SOS|SZA|2022|R&B
Ctrl|SZA|2017|R&B
Channel Orange|Frank Ocean|2012|R&B
A Seat at the Table|Solange|2016|R&B
Voodoo|D'Angelo|2000|Neo-soul
Baduizm|Erykah Badu|1997|Neo-soul
To Pimp a Butterfly|Kendrick Lamar|2015|Hip-hop
DAMN.|Kendrick Lamar|2017|Hip-hop
GNX|Kendrick Lamar|2024|Hip-hop
My Beautiful Dark Twisted Fantasy|Kanye West|2010|Hip-hop
IGOR|Tyler, The Creator|2019|Hip-hop
Flower Boy|Tyler, The Creator|2017|Hip-hop
Aquemini|Outkast|1998|Hip-hop
Stankonia|Outkast|2000|Hip-hop
The Low End Theory|A Tribe Called Quest|1991|Hip-hop
Illmatic|Nas|1994|Hip-hop
Ready to Die|The Notorious B.I.G.|1994|Hip-hop
Enter the Wu-Tang (36 Chambers)|Wu-Tang Clan|1993|Hip-hop
Astroworld|Travis Scott|2018|Hip-hop
Take Care|Drake|2011|Hip-hop
Donuts|J Dilla|2006|Hip-hop
Discovery|Daft Punk|2001|Electronic
Homework|Daft Punk|1997|Electronic
Syro|Aphex Twin|2014|Electronic
Untrue|Burial|2007|Electronic
Blue Lines|Massive Attack|1991|Trip-hop
Third|Portishead|2008|Trip-hop
Vespertine|Björk|2001|Art pop
Post|Björk|1995|Art pop
Trans-Europe Express|Kraftwerk|1977|Electronic
Ambient 1: Music for Airports|Brian Eno|1978|Ambient
There Is Love in You|Four Tet|2010|Electronic
In Colour|Jamie xx|2015|Electronic
Swim|Caribou|2010|Electronic
James Blake|James Blake|2011|Electronic
Kind of Blue|Miles Davis|1959|Jazz
Bitches Brew|Miles Davis|1970|Jazz
A Love Supreme|John Coltrane|1965|Jazz
Giant Steps|John Coltrane|1960|Jazz
Time Out|The Dave Brubeck Quartet|1959|Jazz
The Black Saint and the Sinner Lady|Charles Mingus|1963|Jazz
Head Hunters|Herbie Hancock|1973|Jazz funk
Pastel Blues|Nina Simone|1965|Jazz
I Never Loved a Man the Way I Love You|Aretha Franklin|1967|Soul
Let's Stay Together|Al Green|1972|Soul
Just As I Am|Bill Withers|1971|Soul
Super Fly|Curtis Mayfield|1972|Soul
Diamond Life|Sade|1984|R&B
Like a Prayer|Madonna|1989|Pop
Arrival|ABBA|1976|Pop
A Night at the Opera|Queen|1975|Rock
Wish You Were Here|Pink Floyd|1975|Progressive rock
The Wall|Pink Floyd|1979|Progressive rock
Exile on Main St.|The Rolling Stones|1972|Rock
Born to Run|Bruce Springsteen|1975|Rock
Tusk|Fleetwood Mac|1979|Rock
Fear of Music|Talking Heads|1979|New wave
The Kick Inside|Kate Bush|1978|Art pop
Bridge over Troubled Water|Simon & Garfunkel|1970|Folk
Bryter Layter|Nick Drake|1971|Folk
Songs of Leonard Cohen|Leonard Cohen|1967|Folk
Lonerism|Tame Impala|2012|Psychedelic
Salad Days|Mac DeMarco|2014|Indie rock
Nonagon Infinity|King Gizzard & the Lizard Wizard|2016|Psychedelic
Souvlaki|Slowdive|1993|Shoegaze
So Tonight That I Might See|Mazzy Star|1993|Dream pop
Treasure|Cocteau Twins|1984|Dream pop
White Pony|Deftones|2000|Alternative metal
Master of Puppets|Metallica|1986|Metal
Paranoid|Black Sabbath|1970|Metal
Toxicity|System of a Down|2001|Metal
Hybrid Theory|Linkin Park|2000|Nu metal
American Idiot|Green Day|2004|Punk rock
The Black Parade|My Chemical Romance|2006|Emo
After Laughter|Paramore|2017|Pop rock
Whatever People Say I Am, That's What I'm Not|Arctic Monkeys|2006|Indie rock
Demon Days|Gorillaz|2005|Alternative
DeBÍ TiRAR MáS FOToS|Bad Bunny|2025|Reggaeton
YHLQMDLG|Bad Bunny|2020|Reggaeton
MOTOMAMI|Rosalía|2022|Latin pop
Mañana Será Bonito|Karol G|2023|Reggaeton
Buena Vista Social Club|Buena Vista Social Club|1997|Son cubano
Os Mutantes|Os Mutantes|1968|Tropicália
Getz/Gilberto|Stan Getz & João Gilberto|1964|Bossa nova
África Brasil|Jorge Ben Jor|1976|MPB
Expensive Shit|Fela Kuti|1975|Afrobeat
African Giant|Burna Boy|2019|Afrobeats
Mulatu of Ethiopia|Mulatu Astatke|1972|Ethio-jazz
In the Heart of the Moon|Ali Farka Touré & Toumani Diabaté|2005|Malian blues
Tassili|Tinariwen|2011|Desert blues
async|Ryuichi Sakamoto|2017|Ambient
Solid State Survivor|Yellow Magic Orchestra|1979|Synth-pop
Variety|Mariya Takeuchi|1984|City pop
For You|Tatsuro Yamashita|1982|City pop
Hosono House|Haruomi Hosono|1973|Folk
Fantasma|Cornelius|1997|Shibuya-kei
Illinois|Sufjan Stevens|2005|Indie folk
Bon Iver, Bon Iver|Bon Iver|2011|Indie folk
22, A Million|Bon Iver|2016|Indie folk
Titanic Rising|Weyes Blood|2019|Art pop
Blue Rev|Alvvays|2022|Indie pop
Charm|Clairo|2024|Indie pop
Bewitched|Laufey|2023|Jazz pop
Gemini Rights|Steve Lacy|2022|R&B
Freudian|Daniel Caesar|2017|R&B
House of Balloons|The Weeknd|2011|R&B
"Awaken, My Love!"|Childish Gambino|2016|Funk
Isolation|Kali Uchis|2018|R&B
LP1|FKA twigs|2014|Art pop`.split("\n").map(line => {
  const [title, artist, year, genre] = line.split("|");
  const key = (artist + "-" + title).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return { key, id: sid("album:" + key), title, artist, year: +year, genre, description: "" };
});
// Everything album search can find in the preview.
const CATALOG = ALBUMS.concat(EXTRA.filter(e => !ALBUMS.some(a => a.title === e.title && a.artist === e.artist)));

/* ---------- generated sample pictures ---------- */
function avatarPic(hue, seed) {
  const r = rng(seed), h2 = (hue + 40) % 360, h3 = (hue + 190) % 360;
  const hill = (y, amp) => { let d = `M0 ${y}`; for (let x = 0; x <= 600; x += 60) d += ` Q${x + 30} ${(y - amp * (0.5 + r())).toFixed(0)} ${x + 60} ${y}`; return d + " L600 600 L0 600Z"; };
  return svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(${hue} 70% 62%)"/><stop offset="1" stop-color="hsl(${h2} 80% 82%)"/></linearGradient></defs><rect width="600" height="600" fill="url(#g)"/><circle cx="${(180 + r() * 240).toFixed(0)}" cy="${(170 + r() * 80).toFixed(0)}" r="${(70 + r() * 40).toFixed(0)}" fill="hsl(${h3} 90% 70%)"/><path d="${hill(400, 60)}" fill="hsl(${hue} 45% 38%)"/><path d="${hill(470, 50)}" fill="hsl(${hue} 50% 24%)"/><path d="${hill(540, 30)}" fill="hsl(${hue} 55% 14%)"/></svg>`);
}
function bannerPic(hue) {
  let waves = "";
  for (let i = 0; i < 7; i++) { let d = `M0 ${120 + i * 50}`; for (let x = 0; x <= 1500; x += 50) d += ` L${x} ${(120 + i * 50 + Math.sin(x / 140 + i) * 26).toFixed(1)}`; waves += `<path d="${d} L1500 500 L0 500Z" fill="hsl(${(hue + i * 12) % 360} 70% ${62 - i * 6}%)" opacity=".85"/>`; }
  return svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1500 500"><rect width="1500" height="500" fill="hsl(${hue} 60% 80%)"/>${waves}</svg>`);
}
function nightSky() {
  const r = rng("sky"); let stars = "";
  for (let i = 0; i < 140; i++) stars += `<circle cx="${(r() * 1600).toFixed(0)}" cy="${(r() * 1000).toFixed(0)}" r="${(0.6 + r() * 1.8).toFixed(1)}" fill="#fff" opacity="${(0.35 + r() * 0.65).toFixed(2)}"/>`;
  return svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000" viewBox="0 0 1600 1000"><defs><radialGradient id="n" cx=".7" cy=".1" r="1.1"><stop offset="0" stop-color="#5B2A86"/><stop offset=".55" stop-color="#1D1145"/><stop offset="1" stop-color="#07051A"/></radialGradient></defs><rect width="1600" height="1000" fill="url(#n)"/>${stars}<circle cx="1220" cy="190" r="70" fill="#FFE9F5" opacity=".9"/></svg>`);
}
function leafTile() {
  return svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><rect width="120" height="120" fill="#0F7F5B"/><path d="M30 20c18 4 26 18 22 36C34 52 26 38 30 20z" fill="#3FD6A4" opacity=".7"/><path d="M90 64c-16 6-22 20-16 36 16-6 22-20 16-36z" fill="#B8F2DA" opacity=".55"/><circle cx="92" cy="26" r="7" fill="#F7A9C6" opacity=".9"/><circle cx="24" cy="92" r="4" fill="#F7A9C6" opacity=".7"/></svg>`);
}
function cherryTile() {
  return svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="90" height="90" viewBox="0 0 90 90"><rect width="90" height="90" fill="#FFD6E5"/><path d="M45 18c-2 12-10 20-18 26M45 18c4 12 10 18 18 22" stroke="#0A7D5A" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="26" cy="50" r="10" fill="#E0457B"/><circle cx="63" cy="46" r="10" fill="#E0457B"/><circle cx="23" cy="47" r="3" fill="#fff" opacity=".7"/><circle cx="60" cy="43" r="3" fill="#fff" opacity=".7"/></svg>`);
}

/* ---------- sample drawings on a few cards ---------- */
// Ratings are half stars stored as 10-100.
const snap = v => Math.max(10, Math.min(100, Math.round(v / 10) * 10));
const DOODLES = { "u-you:broadcast-tnmbp": "bolt", "u-you:boc-mhtrtc": "sun", "u-you:ct-hovl": "heart", "u-lena:takada-ttlg": "spiral", "u-marco:mv-madvillainy": "mask", "u-sofi:rosalia-emq": "flower" };
function doodle(seed, kind) {
  const r = rng("doodle:" + seed), j = n => (n + (r() - .5) * 6).toFixed(1);
  const stroke = (d, c, w = 5) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  let s = "";
  if (kind === "sun") {
    s += stroke(`M${j(40)} ${j(250)} Q 90 ${j(200)} 140 250 T 240 250 T 340 250`, "#2D66A8", 6) + stroke(`M${j(30)} ${j(290)} Q 80 ${j(240)} 130 290 T 230 290 T 330 290`, "#13805C", 6);
    s += `<circle cx="${j(180)}" cy="${j(130)}" r="54" fill="#F2B705"/>`;
    for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; s += stroke(`M${(180 + Math.cos(a) * 70).toFixed(1)} ${(130 + Math.sin(a) * 70).toFixed(1)} L${j(180 + Math.cos(a) * 100)} ${j(130 + Math.sin(a) * 100)}`, "#FF7A1A", 5); }
  } else if (kind === "heart") {
    s += stroke(`M180 ${j(300)} C ${j(40)} 200 ${j(70)} 70 180 ${j(140)} C ${j(290)} 70 ${j(320)} 200 180 300`, "#E0457B", 10);
    s += stroke(`M${j(60)} 60 L${j(80)} 90 M${j(300)} 70 L${j(280)} 100 M${j(70)} 320 L${j(95)} 300`, "#8A4FD1", 4);
  } else if (kind === "spiral") {
    let d = "M180 180"; for (let i = 1; i < 90; i++) { const a = i * .28, rr = i * 1.7; d += ` L${(180 + Math.cos(a) * rr).toFixed(1)} ${(180 + Math.sin(a) * rr).toFixed(1)}`; }
    s += stroke(d, "#1A1A1A", 4);
  } else if (kind === "mask") {
    s += stroke(`M${j(90)} 110 Q 180 ${j(60)} 270 110 L ${j(260)} 230 Q 180 ${j(320)} 100 230 Z`, "#1A1A1A", 7);
    s += stroke(`M120 150 L160 150 M200 150 L240 150 M150 230 L210 230`, "#1A1A1A", 9);
  } else if (kind === "bolt") {
    s += `<polygon points="${j(200)},40 ${j(110)},200 ${j(175)},200 ${j(140)},330 ${j(260)},150 ${j(190)},150 ${j(230)},40" fill="#F2B705" stroke="#1A1A1A" stroke-width="5" stroke-linejoin="round"/>`;
  } else {
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; s += `<ellipse cx="${(180 + Math.cos(a) * 50).toFixed(1)}" cy="${(160 + Math.sin(a) * 50).toFixed(1)}" rx="38" ry="22" transform="rotate(${(a * 180 / Math.PI).toFixed(0)} ${(180 + Math.cos(a) * 50).toFixed(1)} ${(160 + Math.sin(a) * 50).toFixed(1)})" fill="#E0457B" opacity=".85"/>`; }
    s += `<circle cx="180" cy="160" r="22" fill="#F2B705"/>` + stroke(`M180 210 Q ${j(170)} 270 180 330`, "#13805C", 7);
  }
  return svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="360" height="360" viewBox="0 0 360 360"><rect width="360" height="360" fill="#fff"/>${s}</svg>`);
}

/* ---------- the sample world ---------- */
const PROFILE_DEFAULTS = { bio: "", service: "spotify", wall: "dots", wall_color: "#F7A9C6", avatar_url: null, banner_url: null, song_track_id: null,
  wall_image_url: null, wall_image_mode: "cover", wall_image_size: 240, wall_image_repeat: "repeat", wall_image_position: "center", wall_image_fixed: true,
  panel_color: null, text_color: null, highlight_color: null };

function seed() {
  const d = { session: null, users: [], profiles: [], albums: ALBUMS.map(albumRow), cards: [], card_likes: [], drawing_history: [], friendships: [], trades: [], trade_items: [], messages: [], files: {}, seq: 100 };
  // joined: days ago (number) or a date. Card tuples: [album key, taste rating, note, made by, days ago].
  const person = (id, identity, p, cards, joined, forTrade = []) => {
    const joinedAt = typeof joined === "number" ? new Date(Date.now() - joined * 864e5) : new Date(joined);
    d.users.push({ id, identity });
    d.profiles.push(Object.assign({ id, username: "" }, clone(PROFILE_DEFAULTS), { created_at: joinedAt.toISOString(), updated_at: now() }, p));
    const trade = new Set(forTrade);
    cards.forEach(([k, pts, note = "", madeBy = id, daysAgo = null], i) => {
      const r = rng(id + ":" + k), near = v => snap(v + (r() - .5) * 36);
      const made = daysAgo != null ? new Date(Date.now() - daysAgo * 864e5) : new Date(Math.min(Date.now() - 36e5, joinedAt.getTime() + (i + 1) * 5 * 36e5));
      d.cards.push({ id: `c-${id}-${i}`, owner: id, album_id: BY_KEY[k].id, points: snap(pts), genre_score: near(pts), artist_score: near(pts + 4), decade_score: near(pts - 6),
        note, note_at: note ? made.toISOString() : null, made_by: madeBy, for_trade: trade.has(k), locked_by: null, created_at: made.toISOString(), acquired_at: null, listened_at: null,
        drawing_url: DOODLES[id + ":" + k] ? doodle(id + ":" + k, DOODLES[id + ":" + k]) : null, drawn_by: DOODLES[id + ":" + k] ? id : null });
    });
  };
  person("u-you", "sample", { username: "crate_digger", service: "spotify", bio: "Mostly electronic and dream pop lately. Looking for anything Cocteau Twins adjacent.", avatar_url: avatarPic(330, "you"),
    wall_color: "#F7A9C6", wall_image_url: cherryTile(), wall_image_mode: "tile", wall_image_size: 90, wall_image_repeat: "repeat", song_track_id: trackId("boc-mhtrtc") },
    [["boc-mhtrtc", 96, "The first record that made me want to make music."], ["ct-hovl", 92, "Elizabeth Fraser's voice on the title track, every time."], ["mbv-loveless", 88],
     ["yoshimura-mfnpc", 77, "My studying record."], ["frank-blonde", 84], ["broadcast-tnmbp", 66], ["dp-ram", 57, "Fun, but I mostly just play Instant Crush."], ["am-am", 44, "Two good songs and a lot of leather jacket."],
     ["sufjan-cl", 71, "Fourth of July wrecks me every single time.", "u-you", 4], ["kb-hol", 82, "Hounds of Love side two is a whole film.", "u-you", 1]], 40, ["dp-ram", "am-am"]);
  person("u-lena", "lena", { username: "lena.vinyl", service: "apple", bio: "Ambient, Japanese environmental music, anything that came out on cassette. Always up for a trade if you bring something weird.",
    avatar_url: avatarPic(300, "lena"), banner_url: bannerPic(290), wall: "stars", wall_color: "#0D0920", wall_image_url: nightSky(), wall_image_mode: "cover", wall_image_fixed: true,
    panel_color: "#1B1430", text_color: "#F3EAFE", highlight_color: "#FF7AC6", song_track_id: trackId("ct-hovl") },
    [["takada-ttlg", 99, "Put this on and the room changes."], ["masin-wind", 90], ["yokota-sakura", 85], ["grouper-ddd", 82], ["roxanne-tilde", 74], ["strom-tmc", 71],
     ["aphex-saw", 88], ["kb-hol", 63], ["bjork-homo", 80], ["hassell-fw1", 58], ["garson-plantasia", 61, "For the plants."]], 35, ["garson-plantasia", "hassell-fw1", "kb-hol"]);
  person("u-marco", "marco", { username: "marco_b", service: "spotify", bio: "Hip-hop head, trip-hop on Sundays. Message me before you trade away anything by MF DOOM.",
    avatar_url: avatarPic(28, "marco"), wall: "checker", wall_color: "#0A7D5A", highlight_color: "#B4233C", song_track_id: trackId("mv-madvillainy") },
    [["mv-madvillainy", 100, "Perfect record. Not trading it, don't ask."], ["kdot-gkmc", 93], ["ph-dummy", 81], ["atakak-os", 68], ["fela-zombie", 86], ["onyeabor-wiwo", 72], ["weeknd-ah", 22, "Came in a trade years ago. Tried again. Still can't."],
     ["ma-mezz", 79, "Teardrop at 2am with headphones. That's the whole review."], ["boc-mhtrtc", 74, "petra got me into this. Sounds like a hazy memory of a TV show.", "u-marco", 2]], 30, ["weeknd-ah", "atakak-os"]);
  person("u-sofi", "sofi", { username: "sofi.wav", service: "soundcloud", bio: "Folk, flamenco and whatever my dad played in the car.",
    avatar_url: avatarPic(150, "sofi"), banner_url: bannerPic(140), wall_color: "#0F7F5B", wall_image_url: leafTile(), wall_image_mode: "tile", wall_image_size: 120, wall_image_repeat: "repeat",
    panel_color: "#EAF7F1", text_color: "#0B3B2C", highlight_color: "#0A7D5A", song_track_id: trackId("rosalia-emq") },
    [["rosalia-emq", 95], ["triana-patio", 89, "Andalusian prog rock. Trust me."], ["bunyan-jadd", 78], ["nd-pinkmoon", 91], ["baier-cg", 83, "Recorded in her kitchen in the '70s and it sounds like it. In the best way."], ["pratt-oyloa", 70], ["boniver-fefa", 55], ["sufjan-cl", 87], ["perhacs-para", 64, "A bit too much for me, but I can see why people love it."], ["fm-rumours", 49], ["ct-hovl", 81, "", "u-sofi", 1]],
    21, ["fm-rumours", "boniver-fefa", "perhacs-para"]);
  person("u-jules", "jules", { username: "jules", service: "spotify" },
    [["ts-1989", 90], ["billie-wwafa", 76], ["bb-uvst", 82], ["tame-currents", 69], ["rh-okc", 88], ["nirvana-nm", 51], ["duster-strat", 73], ["hanl-dc", 6, "Two hours of misery and I do NOT mean that as a compliment."]], 6, ["nirvana-nm", "tame-currents"]);
  person("u-noor", "noor", { username: "noor.fm", service: "apple", bio: "Radio host in training. Soul, jazz and anything with a good horn section.", avatar_url: avatarPic(190, "noor"), highlight_color: "#8A4FD1" },
    [["coltrane-jis", 97], ["amy-btb", 84], ["fukui-scenery", 80, "Piano trio jazz for rainy afternoons."], ["mergia-hci", 76], ["peacock-ito", 62], ["russell-woe", 77, "dev put me on to this. Cello and echo, nothing else needed.", "u-noor", 2]], 9, ["peacock-ito"]);

  // Members you don't know yet, to browse in the Marketplace.
  person("u-milo", "milo", { username: "milo.ruins", service: "spotify", bio: "Shoegaze, slowcore and long drives.", avatar_url: avatarPic(220, "milo"), highlight_color: "#3B6FD4" },
    [["mbv-loveless", 97, "Listen loud or don't bother."], ["duster-strat", 92], ["hanl-dc", 88, "Two hours of misery and I mean that as a compliment."], ["ct-hovl", 80], ["sufjan-cl", 61], ["am-am", 12, "Unlistenable. Sorry, Alex."]], "2025-03-14T18:20:00Z", ["am-am", "sufjan-cl"]);
  person("u-ayumi", "ayumi", { username: "ayumi_k", service: "apple", bio: "Japanese ambient and city pop. Happy to trade for anything that came out on cassette.", avatar_url: avatarPic(10, "ayumi") },
    [["yoshimura-mfnpc", 99, "The sound of a quiet museum on a Tuesday morning."], ["takada-ttlg", 94], ["fukui-scenery", 86], ["yokota-sakura", 80], ["dp-ram", 55], ["billie-wwafa", 31], ["roxanne-tilde", 79, "", "u-ayumi", 1]], "2025-06-02T09:00:00Z", ["billie-wwafa", "dp-ram", "fukui-scenery"]);
  person("u-kwame", "kwame", { username: "kwame.sounds", service: "spotify", bio: "Afrobeat, highlife and Ethio-jazz. Ask me about Fela.", avatar_url: avatarPic(45, "kwame"), highlight_color: "#C77700" },
    [["fela-zombie", 98, "Twelve minutes of the tightest band on earth."], ["atakak-os", 90, "Found on a cassette in a market in Toronto. The story is wild, the songs are better."], ["onyeabor-wiwo", 88], ["mergia-hci", 85], ["guebrou-e21", 83], ["lh-mis", 70], ["mj-thriller", 52], ["coltrane-jis", 88, "", "u-kwame", 3]], "2025-11-20T15:30:00Z", ["mj-thriller", "lh-mis", "onyeabor-wiwo"]);
  person("u-ines", "ines", { username: "ines_m", service: "soundcloud", bio: "Flamenco and Spanish rock. Trading for anything Rosalía-adjacent." },
    [["triana-patio", 96], ["rosalia-emq", 93], ["bb-uvst", 77], ["amy-btb", 70], ["ts-1989", 52]], "2026-01-08T20:10:00Z", ["ts-1989", "amy-btb"]);
  person("u-petra", "petra", { username: "petra.loops", service: "spotify", bio: "I make beats. Mostly listening to old electronic records right now.", avatar_url: avatarPic(265, "petra"), highlight_color: "#0A7D5A" },
    [["aphex-saw", 95], ["boc-mhtrtc", 93], ["singh-ragas", 91, "Acid house, five years early, by accident."], ["haack-lucifer", 86], ["garson-plantasia", 72], ["dp-ram", 64], ["tame-currents", 58], ["yoshimura-mfnpc", 83, "Sampled a bit of this. Don't tell anyone.", "u-petra", 2]], "2026-02-14T12:00:00Z", ["tame-currents", "dp-ram", "garson-plantasia", "haack-lucifer"]);
  person("u-omar", "omar", { username: "omar_tapes", service: "apple", avatar_url: avatarPic(355, "omar") },
    [["ma-mezz", 94], ["ph-dummy", 91], ["mv-madvillainy", 89], ["kdot-gkmc", 85], ["frank-blonde", 78], ["weeknd-ah", 50], ["boc-mhtrtc", 70, "", "u-omar", 5]], "2026-05-30T22:45:00Z", ["weeknd-ah", "frank-blonde"]);
  person("u-luca", "luca", { username: "luca.b", service: "spotify", bio: "Classic rock dad energy at 23.", highlight_color: "#B4233C" },
    [["pf-dsotm", 99], ["fm-rumours", 92], ["th-ril", 88], ["nirvana-nm", 85], ["rh-okc", 82], ["mj-thriller", 66], ["kb-hol", 76, "", "u-luca", 3]], "2026-08-21T08:15:00Z", ["mj-thriller", "nirvana-nm", "th-ril"]);
  person("u-hana", "hana", { username: "hana.folk", service: "soundcloud", bio: "Folk singer. Looking for quiet records.", avatar_url: avatarPic(120, "hana") },
    [["nd-pinkmoon", 97], ["bunyan-jadd", 93], ["baier-cg", 90], ["pratt-oyloa", 86], ["boniver-fefa", 80], ["kb-hol", 74], ["duster-strat", 71, "Didn't think I liked slowcore. I was wrong.", "u-hana", 1]], "2026-10-03T17:00:00Z", ["kb-hol"]);
  person("u-dev", "dev", { username: "dev.jazz", service: "apple", bio: "Spiritual jazz and soul." },
    [["coltrane-jis", 96, "Pharoah Sanders and a harp. Nothing else needs to happen."], ["russell-woe", 84], ["peacock-ito", 80], ["amy-btb", 79]], 4);

  const fr = (a, b, status, mins) => d.friendships.push({ id: "f-" + (++d.seq), requester: a, addressee: b, status, created_at: ago(mins), responded_at: status === "accepted" ? ago(mins - 30) : null });
  fr("u-you", "u-lena", "accepted", 50000); fr("u-marco", "u-you", "accepted", 45000); fr("u-you", "u-sofi", "accepted", 25000);
  fr("u-lena", "u-sofi", "accepted", 24000); fr("u-marco", "u-lena", "accepted", 20000); fr("u-kwame", "u-marco", "accepted", 15000);
  fr("u-noor", "u-you", "pending", 90);

  const card = (owner, key) => d.cards.find(c => c.owner === owner && c.album_id === BY_KEY[key].id).id;
  // Finished trades. Traded cards lose their review and its likes, and are new to their owner for a few days.
  const swap = (tid, from, to, giveKey, getKey, mins, note, listened) => {
    const give = cardById(card(from, giveKey), d), get = cardById(card(to, getKey), d);
    d.trades.push({ id: tid, from_user: from, to_user: to, status: "completed", note, created_at: ago(mins + 90), updated_at: ago(mins) });
    d.trade_items.push({ trade_id: tid, card_id: give.id, side: "give" }, { trade_id: tid, card_id: get.id, side: "get" });
    give.owner = to; get.owner = from;
    for (const c of [give, get]) {
      if (c.drawing_url) d.drawing_history.push({ id: "dh-" + (++d.seq), user_id: c.drawn_by, album_id: c.album_id, card_id: c.id, drawing_url: c.drawing_url, reason: "traded", traded_to: c.owner, created_at: c.created_at, archived_at: ago(mins) });
      Object.assign(c, { note: "", note_at: null, for_trade: false, acquired_at: ago(mins), listened_at: null, drawing_url: null, drawn_by: null });
    }
    if (listened) get.listened_at = ago(mins - 600);
  };
  // You swapped your Lauryn Hill for marco's Mezzanine, and you've played it since.
  d.cards.push({ id: "c-u-you-lh", owner: "u-you", album_id: BY_KEY["lh-mis"].id, points: 80, genre_score: 80, artist_score: 90, decade_score: 80, note: "", drawing_url: null, note_at: null, made_by: "u-you", for_trade: false, locked_by: null, created_at: ago(20000), acquired_at: null, listened_at: null });
  swap("t-1", "u-you", "u-marco", "lh-mis", "ma-mezz", 4300, "Mezzanine for Miseducation?", true);
  // Your Broadcast for sofi's Linda Perhacs, yesterday. You haven't played it yet.
  swap("t-0", "u-you", "u-sofi", "broadcast-tnmbp", "perhacs-para", 1300, "Broadcast for Parallelograms? You said it was too much for you anyway.", false);
  // An open offer waiting on you.
  d.trades.push({ id: "t-2", from_user: "u-lena", to_user: "u-you", status: "pending", note: "Heaven or Las Vegas for my Gigi Masin? You know you want it.", created_at: ago(25), updated_at: ago(25) });
  const masin = card("u-lena", "masin-wind");
  d.trade_items.push({ trade_id: "t-2", card_id: masin, side: "give" }, { trade_id: "t-2", card_id: card("u-you", "ct-hovl"), side: "get" });
  d.cards.find(c => c.id === masin).locked_by = "t-2";
  const msg = (sender, recipient, body, mins, read = true) => d.messages.push({ id: ++d.seq, sender, recipient, body, created_at: ago(mins), read_at: read ? ago(mins - 1) : null });
  msg("u-you", "u-marco", "Would you take my Lauryn Hill for your Mezzanine?", 4420);
  msg("u-marco", "u-you", "Deal. Send it over and I'll accept.", 4410);
  msg("u-you", "u-marco", "Done, thanks!", 4290);
  msg("u-marco", "u-you", "Enjoy it. Teardrop at night with headphones, trust me.", 4280);
  msg("u-lena", "u-you", "Hey! Sent you an offer for Heaven or Las Vegas. Wind is so good for slow mornings.", 24, false);
  seedLogs(d);
  // Likes on reviews.
  const like = (owner, key, ...fans) => { const c = card(owner, key); fans.forEach((u, i) => d.card_likes.push({ id: "lk-" + (++d.seq), card_id: c, user_id: u, created_at: ago(600 + i * 400) })); };
  like("u-you", "boc-mhtrtc", "u-lena", "u-marco", "u-petra", "u-milo");
  like("u-you", "ct-hovl", "u-lena", "u-milo");
  like("u-you", "dp-ram", "u-petra");
  like("u-you", "kb-hol", "u-lena", "u-luca");
  like("u-marco", "mv-madvillainy", "u-you", "u-omar", "u-kwame");
  like("u-marco", "boc-mhtrtc", "u-petra", "u-you");
  like("u-lena", "takada-ttlg", "u-ayumi", "u-you", "u-sofi");
  like("u-sofi", "triana-patio", "u-ines", "u-lena");
  like("u-sofi", "baier-cg", "u-hana");
  like("u-kwame", "atakak-os", "u-marco", "u-dev");
  like("u-ayumi", "yoshimura-mfnpc", "u-you", "u-lena", "u-petra");
  like("u-noor", "russell-woe", "u-dev");
  like("u-dev", "coltrane-jis", "u-noor", "u-kwame");
  like("u-hana", "duster-strat", "u-milo");
  like("u-petra", "singh-ragas", "u-marco");
  return d;
}

function seedLogs(d) {
  d.song_logs = [];
  const log = (owner, title, artist, hoursAgo, note = "") => d.song_logs.push({ id: "sl-" + (++d.seq), owner, title, artist, note, created_at: new Date(Date.now() - hoursAgo * 36e5).toISOString() });
  log("u-you", "Roygbiv", "Boards of Canada", 2, "Still the best two minutes of synths I know. Played it four times on the bus this morning.");
  log("u-you", "Teardrop", "Massive Attack", 26, "Finally listened to the Mezzanine card I got from marco properly. He was right about headphones at night.");
  log("u-you", "Heaven or Las Vegas", "Cocteau Twins", 50, "I can't understand half the words and I don't care.");
  log("u-you", "Ivy", "Frank Ocean", 98);
  log("u-you", "Only Shallow", "My Bloody Valentine", 150, "That opening snare hit, then the wall of guitar. Loud is the only way.");
  log("u-you", "Instant Crush", "Daft Punk", 220, "Guilty pleasure. The vocoder chorus gets me every time.");
  log("u-you", "Do I Wanna Know?", "Arctic Monkeys", 320);
  log("u-you", "Pink Moon", "Nick Drake", 480, "Rainy Sunday song. Two minutes long and somehow enough.");
  log("u-lena", "Running Up That Hill (A Deal with God)", "Kate Bush", 5, "The drum machine on this still sounds like the future.");
  log("u-lena", "Plantasia", "Mort Garson", 30, "Watering the plants with this on. They seem happier. I seem happier.");
  log("u-lena", "Ever New", "Beverly Glenn-Copeland", 80, "Found this through a trade years ago. Makes me cry in a good way.");
  log("u-lena", "Heaven or Las Vegas", "Cocteau Twins", 200);
  log("u-marco", "Accordion", "Madvillain", 8, "Under two minutes and not a wasted second.");
  log("u-marco", "Money Trees", "Kendrick Lamar", 40);
  log("u-marco", "Glory Box", "Portishead", 120, "Sunday trip-hop rotation, as promised.");
  log("u-sofi", "Malamente", "Rosalía", 3, "The handclaps! Played it for my abuela and she approved.");
  log("u-sofi", "Diamond Day", "Vashti Bunyan", 28);
  log("u-sofi", "Skinny Love", "Bon Iver", 75, "Overplayed maybe, but it was snowing.");
  log("u-sofi", "Fourth of July", "Sufjan Stevens", 170, "Don't listen to this one in public.");
  log("u-sofi", "Dreams", "Fleetwood Mac", 300);
  log("u-petra", "Roygbiv", "Boards of Canada", 12, "Studying how they get that warped tape sound for a beat I'm working on.");
  log("u-milo", "Only Shallow", "My Bloody Valentine", 20);
  log("u-kwame", "Zombie", "Fela Kuti & Afrika 70", 9, "Twelve minutes and I still want more.");
}

/* ---------- storage ---------- */
let mem = null;
const listeners = [];
function load() {
  if (mem) return mem;
  try { mem = JSON.parse(localStorage.getItem(KEY) || "null"); } catch { mem = null; }
  if (!mem || !mem.friendships) mem = seed();
  if (!mem.song_logs) seedLogs(mem);
  if (!mem.card_likes) mem.card_likes = [];
  if (!mem.drawing_history) mem.drawing_history = [];
  return mem;
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(mem)); } catch (e) { console.warn("Preview data is only kept until you reload (browser storage is full or blocked).", e); } }
function notify() { save(); listeners.forEach(fn => { try { fn(); } catch (e) { console.warn(e); } }); }
export function reset() { mem = seed(); save(); }
const me = () => load().session?.user?.id || null;

/* ---------- query builder (the small part of supabase-js the app uses) ---------- */
function visible(table, row, uid) {
  const d = load();
  if (table === "trades") return row.from_user === uid || row.to_user === uid;
  if (table === "trade_items") { const t = d.trades.find(x => x.id === row.trade_id); return !!t && (t.from_user === uid || t.to_user === uid); }
  if (table === "messages") return row.sender === uid || row.recipient === uid;
  if (table === "drawing_history") return row.user_id === uid;
  if (table === "friendships") return row.requester === uid || row.addressee === uid || areFriends(uid, row.requester) || areFriends(uid, row.addressee);
  return true;
}
class Query {
  constructor(t) { this.t = t; this.filters = []; this.kind = "select"; this.sort = null; }
  select() { return this; }
  order(col, o = {}) { this.sort = [col, o.ascending !== false]; return this; }
  limit() { return this; }
  eq(c, v) { this.filters.push(r => r[c] === v); return this; }
  is(c, v) { this.filters.push(r => (r[c] ?? null) === v); return this; }
  insert(o) { this.kind = "insert"; this.payload = o; return this; }
  update(p) { this.kind = "update"; this.payload = p; return this; }
  upsert(rows) { this.kind = "upsert"; this.payload = rows; return this; }
  single() { this.one = true; return this; }
  then(res, rej) { try { res(this.run()); } catch (e) { rej(e); } }
  run() {
    const d = load(), uid = me(), rows = d[this.t];
    if (!uid) return { data: null, error: { message: "Not signed in" } };
    if (this.kind === "select") {
      let out = rows.filter(r => visible(this.t, r, uid) && this.filters.every(f => f(r)));
      if (this.sort) { const [c, asc] = this.sort; out = out.slice().sort((a, b) => (a[c] > b[c] ? 1 : a[c] < b[c] ? -1 : 0) * (asc ? 1 : -1)); }
      return ok(clone(out));
    }
    if (this.kind === "insert") {
      const o = clone(this.payload);
      if (this.t === "profiles") {
        if (o.id !== uid) return { data: null, error: { message: "You can only create your own profile." } };
        if (rows.some(r => r.username.toLowerCase() === String(o.username).toLowerCase())) return { data: null, error: { code: "23505", message: "Username taken" } };
        Object.assign(o, clone(PROFILE_DEFAULTS), { bio: o.bio || "", service: o.service || "spotify", username: o.username, id: o.id, created_at: now(), updated_at: now() });
      }
      if (this.t === "messages") {
        if (!String(o.body || "").trim()) return { data: null, error: { message: "Empty message" } };
        if (!areFriends(uid, o.recipient)) return fail("You can only message friends.");
        Object.assign(o, { id: ++d.seq, sender: uid, created_at: now(), read_at: null });
        setTimeout(() => friendReply(o.recipient, uid), 1600 + Math.random() * 1200);
      }
      rows.push(o); notify();
      return ok(this.one ? clone(o) : [clone(o)]);
    }
    if (this.kind === "update") {
      const allowed = this.t === "profiles" ? (r => r.id === uid) : this.t === "messages" ? (r => r.recipient === uid) : (() => false);
      rows.filter(r => allowed(r) && this.filters.every(f => f(r))).forEach(r => Object.assign(r, clone(this.payload)));
      notify(); return ok(null);
    }
    if (this.kind === "upsert") {
      for (const o of this.payload) { const i = rows.findIndex(r => r.id === o.id); if (i >= 0) rows[i] = { ...rows[i], ...clone(o) }; else rows.push(clone(o)); }
      notify(); return ok(null);
    }
  }
}

/* ---------- rules (the real database will enforce the same ones) ---------- */
const cardById = (id, d = load()) => d.cards.find(c => c.id === id);
const itemsOf = tid => load().trade_items.filter(i => i.trade_id === tid);
const ptsOf = ids => ids.reduce((n, id) => n + (cardById(id)?.points || 0), 0);
const titleOf = id => load().albums.find(a => a.id === cardById(id)?.album_id)?.title || "that one";
const pairOf = (a, b) => load().friendships.find(f => (f.requester === a && f.addressee === b) || (f.requester === b && f.addressee === a));
function areFriends(a, b) { return pairOf(a, b)?.status === "accepted"; }
const validPoints = p => Number.isInteger(p) && p >= 10 && p <= 100;
const validOptional = p => p == null || validPoints(p);
const validDrawing = u => u == null || (typeof u === "string" && /^data:image\/(png|svg\+xml)[;,]/.test(u) && u.length < 600000);

const SCORE_KEYS = ["points", "genre_score", "artist_score", "decade_score"];
function createCards(uid, items) {
  const d = load();
  if (!Array.isArray(items) || !items.length) return fail("Pick at least one album.");
  if (items.length > 50) return fail("You can make up to 50 cards at a time.");
  const held = new Set(d.cards.filter(c => c.owner === uid).map(c => c.album_id));
  for (const it of items) {
    if (!d.albums.some(a => a.id === it.album_id)) return fail("One of those albums couldn't be found.");
    if (held.has(it.album_id)) return fail("You already have a card for one of those albums.");
    if (!validPoints(it.points) || !SCORE_KEYS.slice(1).every(k => validOptional(it[k]))) return fail("Ratings go from half a star to five stars.");
    if (!validDrawing(it.drawing_url)) return fail("That drawing couldn't be saved.");
    held.add(it.album_id);
  }
  const ids = items.map(it => {
    const id = "c-" + (++d.seq);
    d.cards.push({ id, owner: uid, album_id: it.album_id, points: it.points, genre_score: it.genre_score ?? null, artist_score: it.artist_score ?? null, decade_score: it.decade_score ?? null, drawing_url: it.drawing_url || null, drawn_by: it.drawing_url ? uid : null,
      note: String(it.note || "").slice(0, 280), note_at: it.note ? now() : null, made_by: uid, for_trade: !!it.for_trade, locked_by: null, created_at: now(), acquired_at: null, listened_at: null });
    return id;
  });
  notify(); return ok(ids);
}
function updateCard(uid, a) {
  const c = cardById(a.card);
  if (!c || c.owner !== uid) return fail("That card isn't in your binder.");
  if ((a.points !== undefined && !validPoints(a.points)) || SCORE_KEYS.slice(1).some(k => a[k] !== undefined && !validOptional(a[k]))) return fail("Ratings go from half a star to five stars.");
  for (const k of SCORE_KEYS) if (a[k] !== undefined) c[k] = a[k];
  if (a.drawing_url !== undefined) {
    if (!validDrawing(a.drawing_url)) return fail("That drawing couldn't be saved.");
    // You can draw on a card you own if it's blank, or redraw your own drawing.
    if (c.drawing_url && c.drawn_by !== uid) return fail("Someone else's drawing is on this card.");
    if (c.drawing_url && c.drawing_url !== a.drawing_url) load().drawing_history.push({ id: "dh-" + (++load().seq), user_id: uid, album_id: c.album_id, card_id: c.id, drawing_url: c.drawing_url, reason: "replaced", traded_to: null, created_at: c.created_at, archived_at: now() });
    c.drawing_url = a.drawing_url; c.drawn_by = a.drawing_url ? uid : null;
  }
  if (a.note !== undefined) {
    const note = String(a.note || "").slice(0, 280);
    if (note !== c.note) {
      // A rewritten review starts over: its likes were for the old words.
      c.note = note; c.note_at = note ? now() : null;
      const d = load(); d.card_likes = d.card_likes.filter(l => l.card_id !== c.id);
    }
  }
  if (a.for_trade !== undefined) c.for_trade = !!a.for_trade;
  notify(); return ok(null);
}
function cleanLog(a) {
  const title = String(a.title || "").trim().slice(0, 200), artist = String(a.artist || "").trim().slice(0, 200), note = String(a.note || "").trim().slice(0, 500);
  return title && artist ? { title, artist, note } : null;
}
function logSong(uid, a) {
  const v = cleanLog(a); if (!v) return fail("Add the song's title and artist.");
  const d = load(), id = "sl-" + (++d.seq);
  d.song_logs.push({ id, owner: uid, ...v, created_at: now() });
  notify(); return ok(id);
}
function updateSongLog(uid, a) {
  const l = load().song_logs.find(x => x.id === a.log);
  if (!l || l.owner !== uid) return fail("That song isn't in your log.");
  const v = cleanLog(a); if (!v) return fail("Add the song's title and artist.");
  Object.assign(l, v); notify(); return ok(null);
}
function deleteSongLog(uid, a) {
  const d = load(), l = d.song_logs.find(x => x.id === a.log);
  if (!l || l.owner !== uid) return fail("That song isn't in your log.");
  d.song_logs = d.song_logs.filter(x => x !== l); notify(); return ok(null);
}
function likeCard(uid, a) {
  const d = load(), c = cardById(a.card);
  if (!c || !c.note) return fail("That review isn't there any more.");
  if (c.owner === uid) return fail("You can't like your own review.");
  const had = d.card_likes.find(l => l.card_id === c.id && l.user_id === uid);
  if (a.liked === false) { if (had) d.card_likes = d.card_likes.filter(l => l !== had); }
  else if (!had) d.card_likes.push({ id: "lk-" + (++d.seq), card_id: c.id, user_id: uid, created_at: now() });
  notify(); return ok(null);
}
function markListened(uid, a) {
  const c = cardById(a.card);
  if (!c || c.owner !== uid) return fail("That card isn't in your binder.");
  c.listened_at = a.listened === false ? null : (c.listened_at || now());
  notify(); return ok(null);
}
// Sets exactly which of your cards are up for trade. No limit on how many.
function setLookingToTrade(uid, a) {
  const d = load(), ids = new Set(a.cards || []), mine = d.cards.filter(c => c.owner === uid);
  if ([...ids].some(id => !mine.some(c => c.id === id))) return fail("One of those cards isn't in your binder.");
  mine.forEach(c => { c.for_trade = ids.has(c.id); });
  notify(); return ok(null);
}
function removeCard(uid, a) {
  const d = load(), c = cardById(a.card);
  if (!c || c.owner !== uid) return fail("That card isn't in your binder.");
  if (c.locked_by) return fail("That card is promised in a pending trade. Cancel the trade first.");
  d.cards = d.cards.filter(x => x.id !== c.id);
  d.card_likes = d.card_likes.filter(l => l.card_id !== c.id);
  for (const t of d.trades) if (t.status === "pending" && itemsOf(t.id).some(i => i.card_id === c.id)) { t.status = "expired"; t.updated_at = now(); d.cards.forEach(x => { if (x.locked_by === t.id) x.locked_by = null; }); }
  notify(); return ok(null);
}
function sendFriendRequest(uid, a) {
  const d = load(), name = String(a.username || "").trim().toLowerCase();
  const other = d.profiles.find(p => p.username.toLowerCase() === name);
  if (!other) return fail(`Nobody here is called ${a.username}. Check the spelling.`);
  if (other.id === uid) return fail("That's you.");
  const f = pairOf(uid, other.id);
  if (f?.status === "accepted") return fail(`You and ${other.username} are already friends.`);
  if (f && f.requester === uid) return fail(`You already sent ${other.username} a request.`);
  if (f) { f.status = "accepted"; f.responded_at = now(); notify(); return ok("accepted"); }
  d.friendships.push({ id: "f-" + (++d.seq), requester: uid, addressee: other.id, status: "pending", created_at: now(), responded_at: null });
  notify();
  if (SAMPLE_PEOPLE.has(other.id)) setTimeout(() => sampleAccepts(other.id, uid), 2000 + Math.random() * 1500);
  return ok("pending");
}
function respondFriendRequest(uid, a) {
  const d = load(), f = d.friendships.find(x => x.id === a.request);
  if (!f || f.addressee !== uid || f.status !== "pending") return fail("That request isn't open any more.");
  if (a.accept) { f.status = "accepted"; f.responded_at = now(); }
  else d.friendships = d.friendships.filter(x => x !== f);
  notify(); return ok(null);
}
function removeFriend(uid, a) {
  const d = load(), f = pairOf(uid, a.other);
  if (!f) return fail("You're not connected to that person.");
  d.friendships = d.friendships.filter(x => x !== f);
  for (const t of d.trades) if (t.status === "pending" && [t.from_user, t.to_user].includes(uid) && [t.from_user, t.to_user].includes(a.other)) { t.status = "cancelled"; t.updated_at = now(); d.cards.forEach(c => { if (c.locked_by === t.id) c.locked_by = null; }); }
  notify(); return ok(null);
}
function proposeTrade(uid, a) {
  const d = load(), give = a.give || [], want = a.want || [];
  if (a.recipient === uid) return fail("You can't trade with yourself.");
  if (!areFriends(uid, a.recipient)) return fail("You can only trade with friends.");
  if (!give.length || !want.length) return fail("Pick at least one card on each side.");
  if (!give.every(id => { const c = cardById(id); return c && c.owner === uid && !c.locked_by; })) return fail("Some of your cards aren't available. They may be promised in another trade.");
  if (!want.every(id => cardById(id)?.owner === a.recipient)) return fail("They no longer have every card you picked.");
  const theirAlbums = new Set(d.cards.filter(c => c.owner === a.recipient).map(c => c.album_id)), myAlbums = new Set(d.cards.filter(c => c.owner === uid).map(c => c.album_id));
  if (give.some(id => theirAlbums.has(cardById(id).album_id))) return fail("They already have a card for one of the albums you're offering.");
  if (want.some(id => myAlbums.has(cardById(id).album_id))) return fail("You already have a card for one of the albums you're asking for.");
  const giveAlbums = new Set(give.map(id => cardById(id).album_id));
  if (want.some(id => giveAlbums.has(cardById(id).album_id))) return fail("You can't trade a card for the same album.");
  const id = "t-" + (++d.seq);
  d.trades.push({ id, from_user: uid, to_user: a.recipient, status: "pending", note: String(a.note || "").slice(0, 200), created_at: now(), updated_at: now() });
  give.forEach(c => { d.trade_items.push({ trade_id: id, card_id: c, side: "give" }); cardById(c).locked_by = id; });
  want.forEach(c => d.trade_items.push({ trade_id: id, card_id: c, side: "get" }));
  notify();
  if (SAMPLE_PEOPLE.has(a.recipient)) setTimeout(() => sampleDecides(id), 3500 + Math.random() * 2000);
  return ok(id);
}
function acceptTrade(uid, tid) {
  const d = load(), t = d.trades.find(x => x.id === tid);
  if (!t || t.to_user !== uid) return fail("Trade not found.");
  if (t.status !== "pending") return fail("This trade is no longer open.");
  const its = itemsOf(tid), give = its.filter(i => i.side === "give").map(i => i.card_id), want = its.filter(i => i.side === "get").map(i => i.card_id);
  const stale = !give.every(id => { const c = cardById(id); return c && c.owner === t.from_user && c.locked_by === tid; }) || !want.every(id => cardById(id)?.owner === uid);
  if (stale) { t.status = "expired"; t.updated_at = now(); d.cards.forEach(c => { if (c.locked_by === tid) c.locked_by = null; }); notify(); return ok("expired"); }
  if (want.some(id => cardById(id).locked_by)) return fail("A card they asked for is promised in one of your own offers. Cancel that offer first.");
  // Drawings come off traded cards and go into the history of whoever drew them.
  const archive = (c, to) => { if (c.drawing_url) d.drawing_history.push({ id: "dh-" + (++d.seq), user_id: c.drawn_by || c.made_by, album_id: c.album_id, card_id: c.id, drawing_url: c.drawing_url, reason: "traded", traded_to: to, created_at: c.created_at, archived_at: now() }); };
  const fresh = { for_trade: false, note: "", note_at: null, acquired_at: now(), listened_at: null, drawing_url: null, drawn_by: null };
  give.forEach(id => { const c = cardById(id); archive(c, uid); Object.assign(c, fresh, { owner: uid, locked_by: null }); });
  want.forEach(id => { const c = cardById(id); archive(c, t.from_user); Object.assign(c, fresh, { owner: t.from_user }); });
  const movedIds = new Set([...give, ...want]);
  d.card_likes = d.card_likes.filter(l => !movedIds.has(l.card_id));
  t.status = "completed"; t.updated_at = now();
  const moved = new Set([...give, ...want]);
  for (const x of d.trades) if (x.status === "pending" && x.id !== tid && itemsOf(x.id).some(i => moved.has(i.card_id))) { x.status = "expired"; x.updated_at = now(); }
  d.cards.forEach(c => { const lt = c.locked_by && d.trades.find(x => x.id === c.locked_by); if (lt && lt.status !== "pending") c.locked_by = null; });
  notify(); return ok("completed");
}
function closeTrade(uid, tid, action) {
  const d = load(), t = d.trades.find(x => x.id === tid);
  if (!t || (t.from_user !== uid && t.to_user !== uid)) return fail("Trade not found.");
  if (t.status !== "pending") return fail("This trade is no longer open.");
  if (action === "decline" && uid === t.to_user) t.status = "declined";
  else if (action === "cancel" && uid === t.from_user) t.status = "cancelled";
  else return fail("You can't do that to this trade.");
  t.updated_at = now();
  d.cards.forEach(c => { if (c.locked_by === tid) c.locked_by = null; });
  notify(); return ok(null);
}

/* ---------- sample people answer you ---------- */
const SAMPLE_PEOPLE = new Set(["u-lena", "u-marco", "u-sofi", "u-jules", "u-noor", "u-milo", "u-ayumi", "u-kwame", "u-ines", "u-petra", "u-omar", "u-luca", "u-hana", "u-dev"]);
const REPLIES = ["Ha, fair. What else have you been listening to?", "Nice. I've had that on repeat all week.", "Have a look through my binder, maybe something there works for you.", "Send me an offer and I'll look tonight.", "Honestly that's a great record."];
function say(from, to, body) { const d = load(); d.messages.push({ id: ++d.seq, sender: from, recipient: to, body, created_at: now(), read_at: null }); }
function friendReply(friend, you) {
  if (!SAMPLE_PEOPLE.has(friend) || me() !== you || !areFriends(friend, you)) return;
  say(friend, you, REPLIES[Math.floor(Math.random() * REPLIES.length)]); notify();
}
function sampleAccepts(person, you) {
  const f = pairOf(person, you); if (!f || f.status !== "pending") return;
  f.status = "accepted"; f.responded_at = now();
  say(person, you, "Hey! Thanks for the add. Your binder looks good."); notify();
}
function sampleDecides(tid) {
  const d = load(), t = d.trades.find(x => x.id === tid);
  if (!t || t.status !== "pending") return;
  const its = itemsOf(tid), give = its.filter(i => i.side === "give").map(i => i.card_id), want = its.filter(i => i.side === "get").map(i => i.card_id);
  const wantsFav = want.some(id => cardById(id)?.points >= 98);
  if (!wantsFav && ptsOf(give) >= ptsOf(want) - 15) {
    if (acceptTrade(t.to_user, tid).data === "completed") { say(t.to_user, t.from_user, `Done! Enjoy ${titleOf(want[0])}. Tell me what you think.`); notify(); }
  } else {
    closeTrade(t.to_user, tid, "decline");
    say(t.to_user, t.from_user, `I'll pass on that one. I'm pretty attached to ${titleOf(want[0])}.`); notify();
  }
}

/* ---------- music service stand-in ---------- */
export function sessionService() { const u = load().users.find(x => x.id === me()); return ["spotify", "apple", "soundcloud"].includes(u?.identity) ? u.identity : "spotify"; }
export function track(id) {
  for (const [key, name] of Object.entries(SONGS)) if (trackId(key) === id) { const a = BY_KEY[key]; return { name, artist: a.artist, albumId: a.id, genre: a.genre }; }
  return null;
}
const wait = ms => new Promise(r => setTimeout(r, ms));
export async function recentAlbums() {
  await wait(500);
  const r = rng((me() || "x") + ":recent");
  const picks = ALBUMS.map(a => [r(), a]).sort((x, y) => x[0] - y[0]).slice(0, 24).map(([, a]) => ({ album: albumRow(a), plays: 2 + Math.floor(r() * 58) }));
  // The sample account has also been playing the records already in its binder.
  if (me() === "u-you") for (const k of ["boc-mhtrtc", "ct-hovl"]) if (!picks.some(p => p.album.id === BY_KEY[k].id)) picks.push({ album: albumRow(BY_KEY[k]), plays: 40 });
  return picks.sort((x, y) => y.plays - x.plays);
}
// Album search stand-in. The page ranks and spell-checks the results itself, so this returns the whole sample catalog.
export async function searchAlbums() {
  await wait(120);
  return CATALOG.map(albumRow);
}
export async function recentTracks() {
  await wait(300);
  const r = rng((me() || "x") + ":tracks");
  return Object.keys(SONGS).map(k => [r(), k]).sort((x, y) => x[0] - y[0]).slice(0, 15).map(([, k]) => ({ id: trackId(k), name: SONGS[k], artist: BY_KEY[k].artist, albumId: BY_KEY[k].id, genre: BY_KEY[k].genre }));
}

/* ---------- the client ---------- */
export function createDemoClient() {
  load();
  return {
    auth: {
      async getSession() { const s = load().session; return { data: { session: s && load().users.some(u => u.id === s.user.id) ? clone(s) : null } }; },
      async signInWithProvider(provider) {
        const d = load();
        let u = d.users.find(x => x.identity === provider);
        if (!u) { u = { id: "u-" + (++d.seq) + "-" + sid(provider + Date.now()).slice(0, 5), identity: provider }; d.users.push(u); }
        d.session = { user: { id: u.id } }; save(); return { error: null };
      },
      async signOut() { load().session = null; save(); },
      onAuthStateChange() { return { data: { subscription: { unsubscribe() { } } } }; }
    },
    from: t => new Query(t),
    async rpc(name, a) {
      const uid = me(); if (!uid) return fail("You need to be signed in.");
      switch (name) {
        case "create_cards": return createCards(uid, a.items);
        case "update_card": return updateCard(uid, a);
        case "remove_card": return removeCard(uid, a);
        case "send_friend_request": return sendFriendRequest(uid, a);
        case "respond_friend_request": return respondFriendRequest(uid, a);
        case "remove_friend": return removeFriend(uid, a);
        case "propose_trade": return proposeTrade(uid, a);
        case "accept_trade": return acceptTrade(uid, a.trade);
        case "close_trade": return closeTrade(uid, a.trade, a.action);
        case "set_looking_to_trade": return setLookingToTrade(uid, a);
        case "like_card": return likeCard(uid, a);
        case "mark_listened": return markListened(uid, a);
        case "set_card_drawing": return updateCard(uid, { card: a.card, drawing_url: a.drawing_url ?? null });
        case "log_song": return logSong(uid, a);
        case "update_song_log": return updateSongLog(uid, a);
        case "delete_song_log": return deleteSongLog(uid, a);
        default: return fail("Unknown action.");
      }
    },
    channel() { return { on(_e, _f, cb) { if (cb && !listeners.includes(cb)) listeners.push(cb); return this; }, subscribe() { return this; } }; },
    storage: {
      from: () => ({
        async upload(path, blob) {
          const url = await new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.onerror = () => rej(fr.error); fr.readAsDataURL(blob); });
          load().files[path] = url; save(); return { error: null };
        },
        getPublicUrl(path) { return { data: { publicUrl: load().files[path] || "" } }; }
      })
    }
  };
}

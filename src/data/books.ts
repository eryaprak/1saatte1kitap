import type { Book } from '../types';
import {
  fetchChannelVideos,
  getBestThumbnailUrl,
  iso8601DurationToMinutes,
} from '../services/youtubeApi';

// ─── Constants ────────────────────────────────────────────────────────────────

const CHANNEL_ID = 'UCsOLEIWRR81IfPuxBE0FTvw'; // @birsaattebirkitap
const MAX_RESULTS = 50;

// ─── Mock Books (fallback / seed data) ───────────────────────────────────────

export const MOCK_BOOKS: Book[] = [
  {
    id: '1',
    title: 'İlyada',
    author: 'Homeros',
    coverUrl: 'https://picsum.photos/seed/ilyada/300/400',
    summary:
      'Truva Savaşı\'nın son yılında geçen destan, Akhilleus\'un öfkesi ve savaşın trajedisini anlatır.',
    category: 'Klasik',
    durationMinutes: 58,
    youtubeVideoId: '',
    isPremium: false,
    createdAt: '2024-01-01',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  },
  {
    id: '2',
    title: 'Odysseia',
    author: 'Homeros',
    coverUrl: 'https://picsum.photos/seed/odysseia/300/400',
    summary:
      'Truva Savaşı\'ndan sonra evine dönen Odysseus\'un on yıllık macera dolu yolculuğu.',
    category: 'Klasik',
    durationMinutes: 62,
    youtubeVideoId: '',
    isPremium: false,
    createdAt: '2024-01-02',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  },
  {
    id: '3',
    title: 'Manas',
    author: 'Kırgız Halk Destanı',
    coverUrl: 'https://picsum.photos/seed/manas/300/400',
    summary:
      'Kırgız milletinin kahramanı Manas\'ın destansı yaşamını ve savaşlarını anlatan epik şiir.',
    category: 'Destan',
    durationMinutes: 55,
    youtubeVideoId: '',
    isPremium: false,
    createdAt: '2024-01-03',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  },
  {
    id: '4',
    title: 'Oedipus Rex',
    author: 'Sophokles',
    coverUrl: 'https://picsum.photos/seed/oedipus/300/400',
    summary:
      'Kral Oedipus\'un kendi kaderine meydan okumasını ve acı gerçeği keşfedişini anlatan trajedi.',
    category: 'Tiyatro',
    durationMinutes: 48,
    youtubeVideoId: '',
    isPremium: true,
    createdAt: '2024-01-04',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
  },
  {
    id: '5',
    title: 'Medea',
    author: 'Euripides',
    coverUrl: 'https://picsum.photos/seed/medea/300/400',
    summary:
      'Jason tarafından terk edilen büyücü Medea\'nın intikam ve aşkın sınırlarını zorlayan hikayesi.',
    category: 'Tiyatro',
    durationMinutes: 52,
    youtubeVideoId: '',
    isPremium: true,
    createdAt: '2024-01-05',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
  },
  {
    id: '6',
    title: 'Antigone',
    author: 'Sophokles',
    coverUrl: 'https://picsum.photos/seed/antigone/300/400',
    summary:
      'Kardeşini gömmek isteyen Antigone ile devlet yasasını koruyan Kral Kreon arasındaki trajik çatışma.',
    category: 'Tiyatro',
    durationMinutes: 45,
    youtubeVideoId: '',
    isPremium: false,
    createdAt: '2024-01-06',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
  },
  {
    id: '7',
    title: 'Dede Korkut',
    author: 'Oğuz Türkleri',
    coverUrl: 'https://picsum.photos/seed/dedekorkut/300/400',
    summary:
      'Oğuz Türklerinin destansı kahramanlarının hikayelerini ve geleneklerini anlatan efsanevi eser.',
    category: 'Destan',
    durationMinutes: 60,
    youtubeVideoId: '',
    isPremium: false,
    createdAt: '2024-01-07',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
  },
  {
    id: '8',
    title: 'Aeneis',
    author: 'Vergilius',
    coverUrl: 'https://picsum.photos/seed/aeneis/300/400',
    summary:
      'Truvalı kahraman Aeneas\'ın Roma\'yı kurmak için çıktığı zorlu yolculuğu anlatan Latin destanı.',
    category: 'Klasik',
    durationMinutes: 65,
    youtubeVideoId: '',
    isPremium: true,
    createdAt: '2024-01-08',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
  },
  {
    id: '9',
    title: 'Beowulf',
    author: 'Anonim',
    coverUrl: 'https://picsum.photos/seed/beowulf/300/400',
    summary:
      'Eski İngiliz edebiyatının şaheseri Beowulf, Geat kavminden cesur savaşçı Beowulf\'un İskandinav topraklarında yaşanan üç büyük mücadelesini konu alır. Beowulf, Danimarkalı Kral Hrothgar\'ın mead salonunu yıllardır terörize eden ve otuzdan fazla savaşçıyı katleden canavar Grendel\'i tek başına öldürür. Ardından Grendel\'in intikam almaya gelen annesini de denizaltı mağarasında öldürür ve ülkesine kahraman olarak döner. Yıllar sonra kendi ülkesinde kral olan yaşlı Beowulf, bir ejderhaya karşı son savaşını verir. Bu destan, sadakat, cesaret, gurur ve ölümlülük temalarını işleyerek İngiliz edebiyatının temel taşlarından biri olmuştur. MS 700-1000 yılları arasında yazıldığı tahmin edilen bu Eski İngilizce epik şiir, Batı edebiyatının bilinen en eski uzun şiirleri arasında yer alır.',
    category: 'Destan',
    durationMinutes: 58,
    youtubeVideoId: '',
    isPremium: false,
    createdAt: '2024-01-09',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
  },
  {
    id: '10',
    title: 'Kalevala',
    author: 'Elias Lönnrot',
    coverUrl: 'https://picsum.photos/seed/kalevala/300/400',
    summary:
      'Finlandiya\'nın ulusal destanı Kalevala, 1835 yılında Elias Lönnrot tarafından Fin halk şiirlerinden derlenerek oluşturulmuştur. Destan, büyücü Väinämöinen, demirci Ilmarinen ve maceracı Lemminkäinen olmak üzere üç kahramanın hikayelerini anlatır. Merkezi nesne Sampo\'dur; sonsuz bolluk getiren efsanevi bir nesne olan Sampo\'nun peşinde destansı bir mücadele yaşanır. Kalevala, Finlerin dünya yaratılışına dair mitolojisini, şamanizm geleneğini ve doğa ile büyünün iç içe geçtiği bir evreni gözler önüne serer. J.R.R. Tolkien başta olmak üzere pek çok yazara ilham kaynağı olan bu eser, Fin kültürel kimliğinin temel direği sayılmaktadır. 50 şiirden ve yaklaşık 22.795 mısradan oluşan Kalevala, sadece Finlandiya\'nın değil tüm dünya edebiyatının vazgeçilmez başyapıtlarından biridir.',
    category: 'Destan',
    durationMinutes: 60,
    youtubeVideoId: '',
    isPremium: false,
    createdAt: '2024-01-10',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
  },
  {
    id: '11',
    title: 'Şahname',
    author: 'Firdevsi',
    coverUrl: 'https://picsum.photos/seed/sahname/300/400',
    summary:
      'İran\'ın ulusal destanı Şahname (Şahların Kitabı), İranlı şair Ebü\'l-Kasım Firdevsi tarafından yaklaşık 30 yılda tamamlanmış ve MS 1010\'da Gazneli Mahmud\'a sunulmuştur. Yaklaşık 50.000 beyitten oluşan bu eser, İran\'ın mitolojik ve tarihi geçmişini yaratılıştan İslam fethine kadar ayrıntılı biçimde anlatır. Destanın en çarpıcı bölümü, kahraman Rüstem ile oğlu Sohrab arasındaki trajik karşılaşmadır. Sohrab, babasını tanımadan onunla savaşa tutuşur ve ölümcül biçimde yaralanır. Firdevsi\'nin şiirsel ustalığı, Farsça\'yı Arap etkisinden arındıran saf ve güçlü bir üslupla bu destanı yazmış olmasındadır. Şahname, sadece Farsça edebiyatın değil tüm dünya edebiyatının en uzun ve en kapsamlı epik şiirlerinden biri olma özelliğini korumaktadır.',
    category: 'Destan',
    durationMinutes: 65,
    youtubeVideoId: '',
    isPremium: true,
    createdAt: '2024-01-11',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3',
  },
  {
    id: '12',
    title: 'Edda',
    author: 'Snorri Sturluson',
    coverUrl: 'https://picsum.photos/seed/edda/300/400',
    summary:
      'İskandinav mitolojisinin en önemli kaynağı olan Edda, iki ayrı eserden oluşur: Şiirsel Edda ve Nesir Edda. 13. yüzyılda İzlandalı şair ve devlet adamı Snorri Sturluson tarafından derlenen Nesir Edda, Norse tanrıları Odin, Thor ve Loki\'nin hikayelerini, dünyanın yaratılışını ve Ragnarök kehanetini kapsamlı biçimde aktarır. Tanrıların diyarı Asgard, devlerin toprakları ve insanların yaşadığı Midgard arasındaki kozmik mücadeleleri anlatan bu eser, yalnızca edebî bir şaheser değil aynı zamanda antik bir inanç sisteminin belgesidir. Odin\'in hikmeti aramak için gözünden fedakarlık etmesi, Thor\'un çekici Mjolnir ile yaptığı savaşlar ve hilekâr Loki\'nin planları bu destanın en bilinen sahneleri arasındadır. Modern fantezi edebiyatı üzerinde derin iz bırakmıştır.',
    category: 'Efsane',
    durationMinutes: 55,
    youtubeVideoId: '',
    isPremium: false,
    createdAt: '2024-01-12',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3',
  },
  {
    id: '13',
    title: 'Gılgamış Destanı',
    author: 'Sümer Geleneği',
    coverUrl: 'https://picsum.photos/seed/gilgamesh/300/400',
    summary:
      'Gılgamış Destanı, insanlığın bilinen en eski yazılı edebî eseridir. MÖ 2100 yıllarına tarihlenen bu Sümer destanı, Uruk şehrinin yarı tanrı yarı insan kralı Gılgamış\'ın hikayesini anlatır. Gılgamış, vahşi doğada yaşayan Enkidu ile önce savaşır sonra derin bir dostluk kurar. İkili birlikte ölümsüz Humbaba\'yı ve Gök Boğası\'nı öldürür. Enkidu\'nun ölümü Gılgamış\'ı derinden sarsar ve onu ölümsüzlük arayışına iter. Tufan efsanesini de içinde barındıran destan, Gılgamış\'ın denizlerin ötesinde ölümsüzlük otunu bulduğunu ama eve dönerken bir yılan tarafından çalındığını anlatır. Bu destan, dostluk, ölüm korkusu ve ölümsüzlük arayışının evrensel temalarını ilk kez yazılı hale getirmiş olmasıyla insanlık tarihinin dönüm noktası sayılmaktadır.',
    category: 'Efsane',
    durationMinutes: 52,
    youtubeVideoId: '',
    isPremium: false,
    createdAt: '2024-01-13',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  },
  {
    id: '14',
    title: 'Ramayana',
    author: 'Valmiki',
    coverUrl: 'https://picsum.photos/seed/ramayana/300/400',
    summary:
      'Ramayana, Hint edebiyatının ve Hindu geleneğinin temel taşlarından biridir. MÖ 5. ile 4. yüzyıllar arasında yazar Valmiki tarafından kaleme alınan bu Sanskrit destanı, yaklaşık 24.000 beyitten oluşur. Hikaye, Ayodhya Prensi Rama\'nın Lanka\'nın şeytan Kral\'ı Ravana tarafından kaçırılan eşi Sita\'yı kurtarmak için çıktığı destansı yolculuğu anlatır. Rama\'nın sadık kardeşi Lakshmana ve maymun ordusuyla birlikte Ravana\'ya karşı verdiği savaş, iyilik ile kötülüğün büyük karşılaşmasını simgeler. Destan; görev, sadakat, sevgi ve adaletin temsilcisi olarak Rama tipini ortaya koyar. Ramayana yalnızca bir edebi eser değil, Hindistan başta olmak üzere güneydoğu Asya\'nın kültürel, dinî ve sanatsal hayatını şekillendiren yaşayan bir gelenektir.',
    category: 'Destan',
    durationMinutes: 63,
    youtubeVideoId: '',
    isPremium: false,
    createdAt: '2024-01-14',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  },
  {
    id: '15',
    title: 'Mahabharata',
    author: 'Vyasa',
    coverUrl: 'https://picsum.photos/seed/mahabharata/300/400',
    summary:
      'Mahabharata, insanlık tarihinin en uzun destanı olma özelliğini korumaktadır; yaklaşık 200.000 mısra ve 1,8 milyon sözcüğü barındırır. MÖ 3. yüzyıl ile MS 3. yüzyıl arasında oluştuğu tahmin edilen bu Hint destanı, Kurukşetra Savaşı etrafında iki soylu klan olan Pandavalar ve Kuravaların çatışmasını anlatır. Beş Pandava kardeşinin başını çektiği iyilik cephesi, rakip kuzenlere karşı devasa bir savaşa girişir. Destanın içinde yer alan Bhagavad Gita bölümü, savaşın arifesinde kahraman Arjuna\'ya rehberlik eden Tanrı Krişna\'nın öğretilerini aktarır ve bu bölüm başlı başına bir felsefe klasiği sayılmaktadır. Mahabharata; onur, adalet, kader ve insan doğasının karmaşıklığı üzerine derin sorular soran evrensel bir başyapıttır.',
    category: 'Destan',
    durationMinutes: 70,
    youtubeVideoId: '',
    isPremium: true,
    createdAt: '2024-01-15',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  },
  {
    id: '16',
    title: 'Nibelungenlied',
    author: 'Anonim',
    coverUrl: 'https://picsum.photos/seed/nibelungenlied/300/400',
    summary:
      'Nibelungenlied (Nibelunglerin Şarkısı), yaklaşık 1200 yılında kaleme alınan Orta Yüksek Almanca bir epik şiirdir ve Alman edebiyatının temel eserlerinden biri sayılmaktadır. Destan, ejder öldürücü kahraman Siegfried\'in hikayesiyle başlar; Siegfried, ejder Fafnir\'in kanına banarak yenilmez bir zırha kavuşur. Burgundlı prenses Kriemhild ile evlenen Siegfried, karanlık bir komplo sonucunda ihanet yüzünden öldürülür. Destanın ikinci yarısında Kriemhild, kocasının ölümünün intikamını almak için büyük bir yıkıma neden olur. Hun Kral Attila ile evlenen Kriemhild, düzenlediği devasa bir ziyafette kardeşlerini ve Siegfried\'in katillerini tek tek yok ettirir. Eser; intikam, sadakat, ihanet ve gücün yıkıcılığı temalarını işleyen karanlık ve güçlü bir trajedidir.',
    category: 'Destan',
    durationMinutes: 57,
    youtubeVideoId: '',
    isPremium: false,
    createdAt: '2024-01-16',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
  },
  {
    id: '17',
    title: 'Orlando Furioso',
    author: 'Ludovico Ariosto',
    coverUrl: 'https://picsum.photos/seed/orlandofurioso/300/400',
    summary:
      'Orlando Furioso (Çılgın Orlando), İtalyan şair Ludovico Ariosto tarafından 1516\'da ilk baskısı yayımlanan ve 1532\'de nihai şeklini alan Rönesans döneminin en büyük epik şiirlerinden biridir. Kral Şarlman ve şövalyelerinin Müslüman ordularına karşı verdiği savaşı konu alan destan, asıl şöhretini kahraman Orlando\'nun Saraseenli prenses Angelica\'ya duyduğu aşktan ve bu aşkın yol açtığı çılgınlıktan alır. Eser; büyülü silahlar, dev savaşçılar, uçan at Hipogryph ve ay yolculuğu gibi fantastik unsurlarla dolup taşan görkemli bir anlatıdır. Cesaret, aşk, delilik ve onur kavramlarını derinlemesine sorgulayan Orlando Furioso, İtalyan Rönesansının en parlak edebi ürünlerinden biri olarak tarihe geçmiştir.',
    category: 'Klasik',
    durationMinutes: 62,
    youtubeVideoId: '',
    isPremium: true,
    createdAt: '2024-01-17',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
  },
  {
    id: '18',
    title: 'Divan-ı Lügat-it Türk',
    author: 'Kaşgarlı Mahmut',
    coverUrl: 'https://picsum.photos/seed/divanilugatitturk/300/400',
    summary:
      'Divan-ı Lügat-it Türk (Türk Dillerinin Sözlüğü), Kaşgarlı Mahmut tarafından 1072-1074 yılları arasında Bağdat\'ta kaleme alınmıştır. Bu eser, yalnızca bir sözlük değil; Türk dillerinin, kültürünün, tarihinin ve coğrafyasının kapsamlı bir ansiklopedisidir. Kaşgarlı Mahmut, Abbasî Halifesine Türkçeyi öğretmek amacıyla yazdığı bu devasa eserde on binlerce kelimeyi Arapça karşılıklarıyla açıklamış, Türk boylarının atasözlerini, şiirlerini ve efsanelerini kayıt altına almıştır. Eserin içindeki meşhur haritada Kaşgar, Türk dünyasının merkezi olarak gösterilmiştir. Divan-ı Lügat-it Türk, günümüzde Türk kültürünün ve dilinin en temel kaynaklarından biri olarak kabul edilmekte olup tek nüshası İstanbul\'da saklanmaktadır.',
    category: 'Tarih',
    durationMinutes: 55,
    youtubeVideoId: '',
    isPremium: false,
    createdAt: '2024-01-18',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
  },
  {
    id: '19',
    title: 'Kutadgu Bilig',
    author: 'Yusuf Has Hacip',
    coverUrl: 'https://picsum.photos/seed/kutadguilig/300/400',
    summary:
      'Kutadgu Bilig (Mutluluk Veren Bilgi), Yusuf Has Hacip tarafından 1069-1070 yıllarında Karahanlı Türkçesiyle kaleme alınmıştır ve bilinen ilk Türkçe siyasetname özelliği taşımaktadır. Yaklaşık 6.500 beyitten oluşan bu mesnevi, dört sembolik karakterin diyalogu aracılığıyla ideal bir devlet yönetiminin nasıl olması gerektiğini anlatır: Hükümdar Kün Toğdı (Doğu), Vezir Ay Toldı (Bahtiyarlık), Ay Toldı\'nın oğlu Ögdülmiş (Akıl) ve Odgurmış (Kanaat). Eser; adalet, bilgelik, akıl ve kanaatin bir devleti ve insanı nasıl yücelteceğini işler. Gazneli Sultanına sunulan Kutadgu Bilig, Türk-İslam medeniyetinin siyasi felsefe açısından en önemli eserlerinden biri olup Türk düşünce tarihinin temel taşlarından sayılmaktadır.',
    category: 'Felsefe',
    durationMinutes: 58,
    youtubeVideoId: '',
    isPremium: false,
    createdAt: '2024-01-19',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
  },
  {
    id: '20',
    title: 'Küçük Ağa',
    author: 'Tarık Buğra',
    coverUrl: 'https://picsum.photos/seed/kucukaga/300/400',
    summary:
      'Küçük Ağa, Tarık Buğra\'nın 1963 tarihli başyapıtı olup Millî Mücadele yıllarını konu alır. Roman, Anadolu\'nun işgal altındaki ücra bir köyünde görev yapan genç bir imamın hikayesini anlatır. İstanbul\'da yetişmiş, çağdaş düşünceli ama inancında sağlam bir din adamı olan bu imam, önce İngiliz ve Yunan kuvvetlerine sempatiyle yaklaşır; ancak zamanla Anadolu halkının direnişini ve Mustafa Kemal\'in liderliğini kavramaya başlar. İç çatışmalarla dolu bu dönüşüm süreci, romandaki asıl dramatik gerilimi oluşturur. Tarık Buğra, bu eserde Kurtuluş Savaşı\'nı salt bir askerî anlatı olarak değil; insan, inanç ve kimlik üzerine derin bir sorgulama olarak ele almıştır. Türk edebiyatının en önemli tarihî romanlarından biri olarak kabul edilen Küçük Ağa, 1970 yılında TRT ödülüne layık görülmüştür.',
    category: 'Roman',
    durationMinutes: 60,
    youtubeVideoId: '',
    isPremium: false,
    createdAt: '2024-01-20',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
  },
  {
    id: '21',
    title: 'İnce Memed',
    author: 'Yaşar Kemal',
    coverUrl: 'https://picsum.photos/seed/incememed/300/400',
    summary:
      'İnce Memed, Yaşar Kemal\'in 1955\'te yayımlanan ve ona dünya çapında ün kazandıran başyapıtıdır. Roman, Çukurova\'nın dağlık ve ağalık düzeninin hüküm sürdüğü coğrafyasında, zalim ağa Abdi\'nin zulmünden kaçan genç köylü Memed\'in hikayesini anlatır. Memed, sevdiği kızı Hatçe\'yi kurtarmak uğruna ağayı yaralar, dağa çıkar ve zamanla Çukurova halkının efsanevi eşkıyası haline gelir. Eser; yoksulluk, toprak meselesi, adalet arayışı ve halkın özgürlük özlemini şiirsel bir dille aktarır. Yaşar Kemal, Anadolu insanının sesini ve Torosların doğasını bu romanda öylesine canlı biçimde yansıtmıştır ki İnce Memed onlarca dile çevrilmiş, dünya edebiyatının sevilen klasikleri arasına girmiştir. Dördü bulan devam romanlarıyla seriye dönüşen İnce Memed efsanesi, Türk edebiyatının zirve noktalarından biridir.',
    category: 'Roman',
    durationMinutes: 63,
    youtubeVideoId: '',
    isPremium: false,
    createdAt: '2024-01-21',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
  },
  {
    id: '22',
    title: 'Benim Adım Kırmızı',
    author: 'Orhan Pamuk',
    coverUrl: 'https://picsum.photos/seed/benimadimkirmizi/300/400',
    summary:
      'Benim Adım Kırmızı, Orhan Pamuk\'un 1998 yılında yayımlanan ve 2006 Nobel Edebiyat Ödülü\'nü kazanmasının önünü açan başyapıtıdır. Roman, 16. yüzyıl sonu Osmanlı İstanbul\'unda geçer. Padişahın gizli emriyle hazırlanan minyatür kitabının üstadı Zarif Efendi\'nin öldürülmesiyle başlayan hikaye; aşk, sanat, inanç ve kimlik üzerine derin bir soruşturmaya dönüşür. Anlatı, ölüyü de dahil farklı karakterlerin ve hatta nesnelerin perspektifinden kurulmuş çok sesli bir yapıya sahiptir. Doğu sanatı ile Batı resim anlayışının çatışması, taklit ile özgünlük arasındaki gerilim ve bir cinayetin peşinde sürüklenen aşk hikayesi bu romanda iç içe geçer. Pamuk, geleneksel Osmanlı minyatür sanatını modern roman tekniğiyle harmanlayarak eşsiz bir edebi deneyim ortaya koymuştur.',
    category: 'Roman',
    durationMinutes: 66,
    youtubeVideoId: '',
    isPremium: true,
    createdAt: '2024-01-22',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
  },
  {
    id: '23',
    title: 'Aşk',
    author: 'Elif Şafak',
    coverUrl: 'https://picsum.photos/seed/elifsafakask/300/400',
    summary:
      'Aşk, Elif Şafak\'ın 2009\'da yayımlanan ve kısa sürede milyonlarca okuyucuya ulaşan romanıdır. Eser, birbirine paralel ilerleyen iki hikayeyi bir araya getirir: 13. yüzyıl Konya\'sında Mevlana Celaleddin Rumi ile gizemli dervişi Şems-i Tebrizi\'nin derin manevi yolculuğu ve çağdaş Boston\'da yaşayan Ella adlı bir kadının sıkışmış hayatından çıkış arayışı. Rumi\'nin tasavvuf düşüncesi ve Şems\'in aşk felsefesi üzerine kurulu bu roman, aşkı yalnızca romantik bir duygu olarak değil; bireyin kendini aşıp evrene kavuşmasının yolu olarak ele alır. Elif Şafak, Doğu ile Batı arasında köprü kuran bu romanıyla okuyucuyu Anadolu mistisizminin ve Mevlevi geleneğinin derinliklerine taşır. Otuzdan fazla dile çevrilen Aşk, Türk edebiyatının dünyada en çok okunan çağdaş eserlerinden biridir.',
    category: 'Roman',
    durationMinutes: 61,
    youtubeVideoId: '',
    isPremium: true,
    createdAt: '2024-01-23',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3',
  },
];

// ─── YouTube → Book Converter ─────────────────────────────────────────────────

/**
 * Converts a YouTube video into a Book object.
 * audioUrl is left as a placeholder — Step 5 will populate it from the backend.
 */
function videoToBook(video: {
  id: string;
  snippet: {
    title: string;
    description: string;
    thumbnails: Parameters<typeof getBestThumbnailUrl>[0];
    publishedAt: string;
  };
  contentDetails: { duration: string };
}): Book {
  const summary =
    video.snippet.description.length > 200
      ? video.snippet.description.slice(0, 197) + '...'
      : video.snippet.description || 'YouTube kanalından otomatik eklendi.';

  return {
    id: `yt_${video.id}`,
    title: video.snippet.title,
    author: '@birsaattebirkitap',
    coverUrl: getBestThumbnailUrl(video.snippet.thumbnails),
    summary,
    category: 'YouTube',
    durationMinutes: iso8601DurationToMinutes(video.contentDetails.duration),
    youtubeVideoId: video.id,
    isPremium: false,
    createdAt: video.snippet.publishedAt,
    audioUrl: '', // placeholder — Step 5
  };
}

// ─── In-Memory Cache ──────────────────────────────────────────────────────────

let _cachedBooks: Book[] | null = null;
let _lastFetchedAt: number | null = null;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function isCacheValid(): boolean {
  if (_cachedBooks === null || _lastFetchedAt === null) return false;
  return Date.now() - _lastFetchedAt < CACHE_TTL_MS;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Fetches books from the YouTube channel and converts them to Book objects.
 * Throws on network/API errors so callers can handle fallback.
 */
export async function fetchBooksFromYouTube(): Promise<Book[]> {
  const videos = await fetchChannelVideos(CHANNEL_ID, MAX_RESULTS);
  return videos.map(videoToBook);
}

/**
 * Returns the full book list (mock + YouTube), using cache if valid.
 * On failure, returns mock books as fallback.
 */
export async function getBooks(): Promise<Book[]> {
  if (isCacheValid()) {
    return _cachedBooks!;
  }

  try {
    const ytBooks = await fetchBooksFromYouTube();
    const all = [...MOCK_BOOKS, ...ytBooks];
    _cachedBooks = all;
    _lastFetchedAt = Date.now();
    return all;
  } catch (err) {
    console.warn('[Books] YouTube fetch failed, using mock data:', err);
    _cachedBooks = MOCK_BOOKS;
    _lastFetchedAt = Date.now();
    return MOCK_BOOKS;
  }
}

/**
 * Force-refreshes the book list, bypassing the cache.
 */
export async function refreshBooks(): Promise<Book[]> {
  _cachedBooks = null;
  _lastFetchedAt = null;
  return getBooks();
}

/**
 * The full combined list (mock + YouTube), exposed as a named export
 * for any component that needs a synchronous seed before async data loads.
 */
export const ALL_BOOKS: Book[] = MOCK_BOOKS;

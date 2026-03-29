/**
 * quiz-data.js
 * =====================================================
 * Ay ve Uzay hakkında 10 soruluk quiz verisi.
 * =====================================================
 *
 * 
 * Her soru şu yapıya sahip:
 * {
 *   question: "Soru metni",
 *   options: ["A şıkkı", "B şıkkı", "C şıkkı", "D şıkkı"],
 *   correct: 0  // Doğru cevabın index'i (0=A, 1=B, 2=C, 3=D)
 * }
 */

const QUIZ_QUESTIONS = [
  // ==========================================
  // CEVAP: 0 (A ŞIKKI) - Toplam 25 Soru
  // ==========================================
  { question: "Ay'ın Dünya'ya ortalama uzaklığı ne kadardır?", options: ["384,400 km", "584,400 km", "184,400 km", "1,384,400 km"], correct: 0 },
  { question: "Ay'ın karanlık görünen geniş düzlüklerine ne ad verilir?", options: ["Maria (Denizler)", "Krater Dağları", "Okyanuslar", "Vadi"], correct: 0 },
  { question: "Ay'ın çapı yaklaşık ne kadardır?", options: ["3,474 km", "6,371 km", "1,737 km", "12,742 km"], correct: 0 },
  { question: "Ay'da rüzgar olmadığı için astronotların ayak izlerine ne olur?", options: ["Milyonlarca yıl kalır", "Hemen silinir", "Tozla kaplanır", "Uçup gider"], correct: 0 },
  { question: "Ay'ın kütlesi Dünya kütlesinin yaklaşık kaçta biridir?", options: ["1/81", "1/10", "1/4", "1/100"], correct: 0 },
  { question: "Ay'da bir gün (gündoğumundan gündoğumuna) ne kadar sürer?", options: ["29.5 Dünya günü", "24 saat", "14 gün", "365 gün"], correct: 0 },
  { question: "Ay'ın en dış katmanına ne ad verilir?", options: ["Kabuk (Crust)", "Manto", "Çekirdek", "Atmosfer"], correct: 0 },
  { question: "Ay'daki en büyük kraterlerden birinin adı nedir?", options: ["Tycho", "Everest", "Sahara", "Mariana"], correct: 0 },
  { question: "Ay'ın yüzey alanı yaklaşık hangi kıta kadardır?", options: ["Afrika", "Asya", "Avrupa", "Antarktika"], correct: 0 },
  { question: "Ay'da gökyüzü neden her zaman siyah görünür?", options: ["Atmosfer olmadığı için", "Güneş uzak olduğu için", "Ay dönmediği için", "Işığın hızı yavaşladığı için"], correct: 0 },
  { question: "Ay'daki depremlere ne ad verilir?", options: ["Moonquake", "Seismo-Moon", "Ay Sarsıntısı", "Lunar-Tectonics"], correct: 0 },
  { question: "Ay'ın yerçekimi ivmesi yaklaşık kaçtır?", options: ["1.62 m/s²", "9.81 m/s²", "3.71 m/s²", "24.79 m/s²"], correct: 0 },
  { question: "Ay'da bulunan en yaygın kayaç türü hangisidir?", options: ["Bazalt", "Granit", "Kireçtaşı", "Mermer"], correct: 0 },
  { question: "Ay'ın hangi kutbunda buz halinde su olma ihtimali daha yüksektir?", options: ["Güney Kutbu", "Kuzey Kutbu", "Ekvator", "Batı Yarımküre"], correct: 0 },
  { question: "Ay'ın yörüngesi hangi şekildedir?", options: ["Eliptik", "Tam Daire", "Kare", "Doğrusal"], correct: 0 },
  { question: "Dünya'dan Ay'ın en fazla yüzde kaçı gözlemlenebilir?", options: ["%59", "%50", "%41", "%100"], correct: 0 },
  { question: "Ay'ın yaşı yaklaşık kaçtır?", options: ["4.5 Milyar Yıl", "10 Milyar Yıl", "1 Milyar Yıl", "500 Milyon Yıl"], correct: 0 },
  { question: "Ay'ın manyetik alanı hakkında ne söylenebilir?", options: ["Yok denecek kadar zayıftır", "Dünya'dan güçlüdür", "Sabit bir yönü vardır", "Dünya ile aynıdır"], correct: 0 },
  { question: "Ay'ın evrelerinin tamamlanma süresine ne denir?", options: ["Sinodik Ay", "Yıldız Ayı", "Güneş Yılı", "Kameri Hafta"], correct: 0 },
  { question: "Ay'da neden 'hava' olayı gerçekleşmez?", options: ["Atmosfer yoktur", "Yerçekimi çok güçlüdür", "Çok soğuktur", "Güneş ışığı gelmez"], correct: 0 },
  { question: "Ay yüzeyindeki en alçak nokta nerededir?", options: ["Antarktika-Aitken Havzası", "Tycho Krateri", "Sessizlik Denizi", "Kopernik Çukuru"], correct: 0 },
  { question: "Ay'ın Dünya üzerindeki en belirgin etkisi nedir?", options: ["Gelgitler", "Depremler", "Mevsimler", "Volkanik patlamalar"], correct: 0 },
  { question: "Ay'dan Dünya'ya radyo dalgaları yaklaşık kaç saniyede ulaşır?", options: ["1.3 Saniye", "8 Saniye", "1 Dakika", "Anında"], correct: 0 },
  { question: "Ay'ın karanlık yüzünü (arka yüzünü) ilk fotoğraflayan araç hangisidir?", options: ["Luna 3", "Apollo 8", "Sputnik 1", "Voyager 2"], correct: 0 },
  { question: "Ay'ın eksen eğikliği kaç derecedir?", options: ["1.5 Derece", "23.5 Derece", "90 Derece", "0 Derece"], correct: 0 },

  // ==========================================
  // CEVAP: 1 (B ŞIKKI) - Toplam 25 Soru
  // ==========================================
  { question: "Türkiye Uzay Ajansı (TUA) hangi yılda kuruldu?", options: ["2015", "2018", "2020", "2022"], correct: 1 },
  { question: "Uzaya çıkan ilk Türk astronot kimdir?", options: ["Salih Aydın", "Alper Gezeravcı", "Murat Yıldırım", "Kerem Aygün"], correct: 1 },
  { question: "Ay'ın oluşumunu açıklayan en kabul görmüş teori hangisidir?", options: ["Süpernova Teorisi", "Büyük Çarpışma Hipotezi", "Eş Zamanlı Oluşum", "Yakalama Teorisi"], correct: 1 },
  { question: "Ay yüzeyini kaplayan ince, tozlu toprağa ne ad verilir?", options: ["Magma", "Regolit", "Bazalt", "Litosfer"], correct: 1 },
  { question: "Ay'a giden ilk insansız uzay aracı (Luna 2) hangi ülkeye aitti?", options: ["ABD", "Sovyetler Birliği", "Çin", "Hindistan"], correct: 1 },
  { question: "Ay yüzeyinde yürütülen ilk tekerlekli aracın (Rover) adı nedir?", options: ["Curiosity", "Lunokhod 1", "Sojourner", "Perseverance"], correct: 1 },
  { question: "Güneş tutulması hangi Ay evresinde gerçekleşir?", options: ["Dolunay", "Yeni Ay", "Hilal", "Şişkin Ay"], correct: 1 },
  { question: "Dünya ve Ay sistemine genel olarak ne ad verilir?", options: ["Tekli Gezegen", "Çift Gezegen Sistemi", "Yıldız Sistemi", "Galaksi"], correct: 1 },
  { question: "Ay'ın kendi etrafında dönme hızıyla Dünya etrafında dönme hızının eşit olması durumuna ne denir?", options: ["Eş merkezlilik", "Kütleçekim kilidi", "Yörünge sapması", "Açısal momentum"], correct: 1 },
  { question: "TUA'nın logosundaki kırmızı renk neyi temsil eder?", options: ["Mars'ı", "Türk Bayrağı'nı", "Güneş'i", "Enerjiyi"], correct: 1 },
  { question: "Ay'da su keşfi için gönderilen ve 2009'da çarptırılan NASA uydusu hangisidir?", options: ["Hubble", "LCROSS", "New Horizons", "Kepler"], correct: 1 },
  { question: "Ay'ın güney kutbuna yumuşak iniş yapan ilk ülke hangisidir?", options: ["Rusya", "Hindistan", "İsrail", "Japonya"], correct: 1 },
  { question: "Ay tutulması sırasında Ay'ın bakır rengine bürünmesinin sebebi nedir?", options: ["Yüzeyindeki paslanma", "Dünya atmosferinden kırılan ışık", "Güneş'in sönmesi", "Ay'ın sıcaklığının artması"], correct: 1 },
  { question: "Alper Gezeravcı'nın uzay görevi hangi görev adı altında yürütülmüştür?", options: ["Ay Misyonu", "Ax-3", "TUA-1", "Anadolu Yıldızı"], correct: 1 },
  { question: "Ay'da atmosfer olmadığı için ses dalgaları nasıl yayılır?", options: ["Çok hızlı yayılır", "Hiç yayılmaz", "Yankı yaparak yayılır", "Sadece gece yayılır"], correct: 1 },
  { question: "Ay yüzeyinde astronotların boyu neden yaklaşık 3-5 cm uzar?", options: ["Beslenme farkından", "Omurgadaki baskının azalmasından", "Ay'ın radyasyonundan", "Kıyafetlerin sıkmasından"], correct: 1 },
  { question: "Ay'ın en yüksek dağı olan Mons Huygens'in yüksekliği yaklaşık kaç metredir?", options: ["8,848", "4,700", "1,500", "15,000"], correct: 1 },
  { question: "Ay kaç yaşındadır?", options: ["4.5 Milyon Yıl", "4.5 Milyar Yıl", "1 Milyar Yıl", "500 Milyon Yıl"], correct: 1 },
  { question: "Türkiye'nin Ay Araştırma Programı (AYAP-1) kapsamında hedeflediği ilk aşama nedir?", options: ["İnsanlı iniş", "Sert iniş (çarptırma)", "Ay'da üs kurma", "Maden çıkarma"], correct: 1 },
  { question: "Ay'ın evreleri arasındaki süre kaç gündür?", options: ["30", "29.5", "27.3", "14"], correct: 1 },
  { question: "Ay'da bir astronotun ağırlığı Dünya'dakinin ne kadarıdır?", options: ["Yarısı", "Altıda biri", "Dörtte biri", "On katı"], correct: 1 },
  { question: "Ay'ın görünmeyen yüzünü ilk kez hangi astronotlar bizzat gözleriyle gördü?", options: ["Apollo 11 ekibi", "Apollo 8 ekibi", "Apollo 1 ekibi", "Gemini 4 ekibi"], correct: 1 },
  { question: "Hangi gezegenin doğal uydusu yoktur?", options: ["Mars", "Venüs", "Jüpiter", "Neptün"], correct: 1 },
  { question: "Milli Uzay Programı'nın vizyonu kaç yıllık bir süreci kapsar?", options: ["5", "10", "20", "50"], correct: 1 },
  { question: "Ay'ın en geniş düzlüğü (denizi) hangisidir?", options: ["Sessizlik Denizi", "Fırtınalar Okyanusu", "Yağmur Denizi", "Serenlik Denizi"], correct: 1 },

  // ==========================================
  // CEVAP: 2 (C ŞIKKI) - Toplam 25 Soru
  // ==========================================
  { question: "İlk insanın Ay'a ayak basması hangi yılda gerçekleşti?", options: ["1965", "1971", "1969", "1972"], correct: 2 },
  { question: "Apollo 11 göreviyle Ay'a ayak basan ilk astronot kimdir?", options: ["Buzz Aldrin", "Michael Collins", "Neil Armstrong", "John Glenn"], correct: 2 },
  { question: "Ay'ın yerçekimi Dünya'nın yerçekiminin kaçta biri kadardır?", options: ["1/3", "1/4", "1/6", "1/8"], correct: 2 },
  { question: "Ay'ın kendi ekseni etrafında bir tam dönüşü ne kadar sürer?", options: ["24 saat", "14 gün", "27.3 gün", "30 gün"], correct: 2 },
  { question: "Çin'in 2019'da Ay'ın uzak yüzüne inen aracının adı nedir?", options: ["Yutu", "Chang'e 3", "Chang'e 4", "Tianwen"], correct: 2 },
  { question: "Ay'daki en yüksek dağ hangisidir?", options: ["Everest", "Olympus Mons", "Mons Huygens", "Mont Blanc"], correct: 2 },
  { question: "Ay'da su molekülleri ilk kez nerede keşfedilmiştir?", options: ["Ekvatorda", "Bulutlarda", "Kutup kraterlerinde", "Mağaralarda"], correct: 2 },
  { question: "Aşağıdakilerden hangisi Ay'a insan gönderen görev serisidir?", options: ["Voyager", "Sputnik", "Apollo", "Hubble"], correct: 2 },
  { question: "Alper Gezeravcı'nın UUİ'de (ISS) kaldığı süre yaklaşık kaç gündür?", options: ["5", "10", "18", "30"], correct: 2 },
  { question: "Ay'da yürüyen son insan (Apollo 17) kimdir?", options: ["Neil Armstrong", "Buzz Aldrin", "Eugene Cernan", "Alan Shepard"], correct: 2 },
  { question: "Ay yüzeyinde golf topuna vuran astronot kimdir?", options: ["John Young", "Pete Conrad", "Alan Shepard", "Jim Lovell"], correct: 2 },
  { question: "Ay'ın iç yapısında mantodan sonra gelen en iç katman hangisidir?", options: ["Kabuk", "Litosfer", "Çekirdek", "Mezosfer"], correct: 2 },
  { question: "Ay yüzeyindeki kraterlerin çoğu neyin sonucunda oluşmuştur?", options: ["Volkanik patlamalar", "Rüzgar aşınması", "Göktaşı çarpışmaları", "Tektonik hareketler"], correct: 2 },
  { question: "Mavi Ay (Blue Moon) nedir?", options: ["Ay'ın renginin mavi olması", "Ay'ın buzla kaplanması", "Bir ayda gerçekleşen ikinci dolunay", "Ay'ın en parlak hali"], correct: 2 },
  { question: "Ay'ın Dünya'ya en yakın olduğu noktaya ne denir?", options: ["Yeröte (Apogee)", "Günöte", "Yerberi (Perigee)", "Günberi"], correct: 2 },
  { question: "Türkiye'nin ilk yerli ve milli haberleşme uydusu hangisidir?", options: ["Türksat 1A", "Türksat 4A", "Türksat 6A", "Göktürk 2"], correct: 2 },
  { question: "Güneş Sistemi'ndeki en büyük 5. doğal uydu hangisidir?", options: ["Titan", "Ganymede", "Ay", "Europa"], correct: 2 },
  { question: "Ay'daki 'Sessizlik Denizi' (Sea of Tranquility) neden ünlüdür?", options: ["En derin deniz olduğu için", "Su bulunduğu için", "Apollo 11 buraya indiği için", "Sürekli karanlık olduğu için"], correct: 2 },
  { question: "Ay'da gündüz sıcaklığı yaklaşık kaç dereceye ulaşabilir?", options: ["50°C", "80°C", "127°C", "250°C"], correct: 2 },
  { question: "Ay'da atmosfer olmadığı için aşağıdakilerden hangisi gerçekleşmez?", options: ["Gölgelerin oluşması", "Yerçekimi", "Meteorların yanarak yok olması", "Güneş ışığının yansıması"], correct: 2 },
  { question: "Ay'a giden ilk canlı hangisidir?", options: ["Maymun Albert", "Köpek Laika", "Kaplumbağalar (Zond 5)", "İnsan"], correct: 2 },
  { question: "Ay'ın Dünya'dan her zaman aynı yüzünün görülmesine neden olan olay nedir?", options: ["Dünya'nın çekimi", "Ay'ın dönmemesi", "Senkronize dönüş", "Güneş rüzgarları"], correct: 2 },
  { question: "Apollo 13 görevi neden Ay'a inememiştir?", options: ["Yakıt bittiği için", "Yollarını şaşırdıkları için", "Oksijen tankı patladığı için", "Fırtına çıktığı için"], correct: 2 },
  { question: "Dünya ile Ay arasındaki mesafe ışık hızıyla ne kadar sürer?", options: ["0.5 saniye", "8 dakika", "1.3 saniye", "1 saat"], correct: 2 },
  { question: "Ay'ın çekirdeği hangi haldedir?", options: ["Tamamen gaz", "Sadece katı", "Kısmen sıvı", "Tamamen boşluk"], correct: 2 },

  // ==========================================
  // CEVAP: 3 (D ŞIKKI) - Total 25 Soru
  // ==========================================
  { question: "NASA'nın insanları tekrar Ay'a gönderme programının adı nedir?", options: ["Gemini", "Apollo 18", "Horizon", "Artemis"], correct: 3 },
  { question: "Ay'da atmosfer olmadığı için aşağıdakilerden hangisi gerçekleşmez?", options: ["Işık yansıması", "Yerçekimi", "Krater oluşumu", "Ses iletimi"], correct: 3 },
  { question: "Ay'ın çekirdeği ağırlıklı olarak hangi elementten oluşur?", options: ["Altın", "Helyum", "Karbon", "Demir"], correct: 3 },
  { question: "Gelgit olaylarına (Met-Cezir) neden olan temel kuvvet nedir?", options: ["Güneş rüzgarı", "Dünya manyetizması", "Merkezkaç", "Ay kütleçekimi"], correct: 3 },
  { question: "Ay'ın gökyüzünde en parlak olduğu evre hangisidir?", options: ["Yeni Ay", "İlk Dördün", "Son Dördün", "Dolunay"], correct: 3 },
  { question: "Dünya'dan bakıldığında Ay'ın hep aynı yüzünün görülme sebebi nedir?", options: ["Ay'ın dönmemesi", "Dünya'nın hızı", "Güneş ışığı", "Kütleçekim kilidi"], correct: 3 },
  { question: "Ay tutulması sırasında Ay hangi renge bürünebilir?", options: ["Mavi", "Yeşil", "Sarı", "Bakır/Kızıl"], correct: 3 },
  { question: "Ay'a toplamda kaç insan ayak basmıştır?", options: ["1", "6", "24", "12"], correct: 3 },
  { question: "Ay'ın gece sıcaklığı yaklaşık kaç dereceye kadar düşer?", options: ["-50°C", "-100°C", "-150°C", "-173°C"], correct: 3 },
  { question: "Ay'da bir gün yaklaşık kaç Dünya saatine eşittir?", options: ["24", "168", "350", "708"], correct: 3 },
  { question: "Alper Gezeravcı'nın görev yaptığı Uluslararası Uzay İstasyonu (ISS) yerden yaklaşık kaç km yukarıdadır?", options: ["100", "250", "30,000", "400"], correct: 3 },
  { question: "Ay yüzeyinde 'ışınlar' gibi görünen parlak çizgiler neyin kalıntısıdır?", options: ["Donmuş su", "Eski nehirler", "Güneş patlamaları", "Çarpışma kraterlerinden saçılan maddeler"], correct: 3 },
  { question: "Supermoon (Süper Ay) ne zaman gerçekleşir?", options: ["Tutulma olduğunda", "Güneş Ay'a yaklaştığında", "Ay en soğuk olduğunda", "Dolunay evresinde Ay Dünya'ya en yakın olduğunda"], correct: 3 },
  { question: "Hangisi Ay'ın bir evresi değildir?", options: ["İlk Dördün", "Şişkin Ay", "Yeni Ay", "Güneş Ayı"], correct: 3 },
  { question: "Ay'ın kütleçekimi Dünya'nınkine göre ne kadar zayıftır?", options: ["%10", "%50", "%80", "%83"], correct: 3 },
  { question: "Ay'ın Dünya'dan en uzak olduğu noktaya ne denir?", options: ["Yerberi", "Günberi", "Günöte", "Yeröte (Apogee)"], correct: 3 },
  { question: "Türkiye Uzay Ajansı'nın (TUA) resmi web sitesinin uzantısı nedir?", options: ["tua.com", "tua.org", "tua.edu.tr", "tua.gov.tr"], correct: 3 },
  { question: "Milli Uzay Programı'nın hedefleri arasında hangisi yoktur?", options: ["Ay'a sert iniş", "Uzay limanı kurma", "Türk astronot gönderme", "Ay'ı kolonileştirip ülke kurma"], correct: 3 },
  { question: "Ay'ın hacmi Dünya'nın hacminin yaklaşık kaçta biridir?", options: ["1/2", "1/10", "1/25", "1/50"], correct: 3 },
  { question: "Ay'da bayrağın dalgalanıyormuş gibi görünmesinin sebebi nedir?", options: ["Ay'da rüzgar olması", "Güneş rüzgarları", "Statik elektrik", "Bayrağın üst kısmındaki yatay çubuk"], correct: 3 },
  { question: "İlk insanlı Ay yolculuğunda (Apollo 11) yer alıp Ay yüzeyine inmeyen pilot kimdir?", options: ["Neil Armstrong", "Buzz Aldrin", "Alan Shepard", "Michael Collins"], correct: 3 },
  { question: "Ay'ın yerçekimi gelgitler dışında neyi etkiler?", options: ["Dünya'nın şeklini", "Mevsimleri", "Gündüz süresini", "Dünya'nın dönüş hızını yavaşlatır"], correct: 3 },
  { question: "Ay'daki en derin krater yaklaşık kaç km derinliktedir?", options: ["1", "3", "5", "13"], correct: 3 },
  { question: "Türkiye'nin Ay görevi için geliştirdiği hibrit roket sisteminin ismi nedir?", options: ["Göktürk", "Sond-1", "Alperen", "HİS (Hibrit İtki Sistemi)"], correct: 3 },
  { question: "Ay'a son insanlı uçuş hangi yıl yapılmıştır?", options: ["1969", "1990", "2000", "1972"], correct: 3 }
];
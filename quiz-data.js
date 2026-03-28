/**
 * quiz-data.js
 * =====================================================
 * Ay ve Uzay hakkında 10 soruluk quiz verisi.
 * Soruları düzenlemek için bu dosyayı güncelleyebilirsiniz.
 * =====================================================
 *
 * PLACEHOLDER: Kendi sorularınızı eklemek için aşağıdaki
 * QUIZ_QUESTIONS dizisini düzenleyin.
 * Her soru şu yapıya sahip olmalıdır:
 * {
 *   question: "Soru metni",
 *   options: ["A şıkkı", "B şıkkı", "C şıkkı", "D şıkkı"],
 *   correct: 0  // Doğru cevabın index'i (0=A, 1=B, 2=C, 3=D)
 * }
 */

const QUIZ_QUESTIONS = [
  // CEVAP: 0 (A ŞIKKI) - Toplam 8 Soru
  {
    question: "Ay'ın Dünya'ya ortalama uzaklığı ne kadardır?",
    options: ["384,400 km", "584,400 km", "184,400 km", "1,384,400 km"],
    correct: 0
  },
  {
    question: "Ay'ın karanlık görünen geniş düzlüklerine ne ad verilir?",
    options: ["Maria (Denizler)", "Krater Dağları", "Okyanuslar", "Vadi"],
    correct: 0
  },
  {
    question: "Ay'ın çapı yaklaşık ne kadardır?",
    options: ["3,474 km", "6,371 km", "1,737 km", "12,742 km"],
    correct: 0
  },
  {
    question: "Ay'da rüzgar olmadığı için astronotların ayak izlerine ne olur?",
    options: ["Milyonlarca yıl kalır", "Hemen silinir", "Tozla kaplanır", "Uçup gider"],
    correct: 0
  },
  {
    question: "Ay'ın kütlesi Dünya kütlesinin yaklaşık kaçta biridir?",
    options: ["1/81", "1/10", "1/4", "1/100"],
    correct: 0
  },
  {
    question: "Ay'da bir gün (gündoğumundan gündoğumuna) ne kadar sürer?",
    options: ["29.5 Dünya günü", "24 saat", "14 gün", "365 gün"],
    correct: 0
  },
  {
    question: "Ay'ın en dış katmanına ne ad verilir?",
    options: ["Kabuk (Crust)", "Manto", "Çekirdek", "Atmosfer"],
    correct: 0
  },
  {
    question: "Ay'daki en büyük kraterlerden birinin adı nedir?",
    options: ["Tycho", "Everest", "Sahara", "Mariana"],
    correct: 0
  },

  // CEVAP: 1 (B ŞIKKI) - Toplam 8 Soru
  {
    question: "Türkiye Uzay Ajansı (TUA) hangi yılda kuruldu?",
    options: ["2015", "2018", "2020", "2022"],
    correct: 1
  },
  {
    question: "Uzaya çıkan ilk Türk astronot kimdir?",
    options: ["Salih Aydın", "Alper Gezeravcı", "Murat Yıldırım", "Kerem Aygün"],
    correct: 1
  },
  {
    question: "Ay'ın oluşumunu açıklayan en kabul görmüş teori hangisidir?",
    options: ["Süpernova Teorisi", "Büyük Çarpışma Hipotezi", "Eş Zamanlı Oluşum", "Yakalama Teorisi"],
    correct: 1
  },
  {
    question: "Ay yüzeyini kaplayan ince, tozlu toprağa ne ad verilir?",
    options: ["Magma", "Regolit", "Bazalt", "Litosfer"],
    correct: 1
  },
  {
    question: "Ay'a giden ilk insansız uzay aracı (Luna 2) hangi ülkeye aitti?",
    options: ["ABD", "Sovyetler Birliği", "Çin", "Hindistan"],
    correct: 1
  },
  {
    question: "Ay yüzeyinde yürütülen ilk tekerlekli aracın (Rover) adı nedir?",
    options: ["Curiosity", "Lunokhod 1", "Sojourner", "Perseverance"],
    correct: 1
  },
  {
    question: "Güneş tutulması hangi Ay evresinde gerçekleşir?",
    options: ["Dolunay", "Yeni Ay", "Hilal", "Şişkin Ay"],
    correct: 1
  },
  {
    question: "Dünya ve Ay sistemine genel olarak ne ad verilir?",
    options: ["Tekli Gezegen", "Çift Gezegen Sistemi", "Yıldız Sistemi", "Galaksi"],
    correct: 1
  },

  // CEVAP: 2 (C ŞIKKI) - Toplam 8 Soru
  {
    question: "İlk insanın Ay'a ayak basması hangi yılda gerçekleşti?",
    options: ["1965", "1971", "1969", "1972"],
    correct: 2
  },
  {
    question: "Apollo 11 göreviyle Ay'a ayak basan ilk astronot kimdir?",
    options: ["Buzz Aldrin", "Michael Collins", "Neil Armstrong", "John Glenn"],
    correct: 2
  },
  {
    question: "Ay'ın yerçekimi Dünya'nın yerçekiminin kaçta biri kadardır?",
    options: ["1/3", "1/4", "1/6", "1/8"],
    correct: 2
  },
  {
    question: "Ay'ın kendi ekseni etrafında bir tam dönüşü ne kadar sürer?",
    options: ["24 saat", "14 gün", "27.3 gün", "30 gün"],
    correct: 2
  },
  {
    question: "Çin'in 2019'da Ay'ın uzak yüzüne inen aracının adı nedir?",
    options: ["Yutu", "Chang'e 3", "Chang'e 4", "Tianwen"],
    correct: 2
  },
  {
    question: "Ay'daki en yüksek dağ hangisidir?",
    options: ["Everest", "Olympus Mons", "Mons Huygens", "Mont Blanc"],
    correct: 2
  },
  {
    question: "Ay'da su molekülleri ilk kez nerede keşfedilmiştir?",
    options: ["Ekvatorda", "Bulutlarda", "Kutup kraterlerinde", "Mağaralarda"],
    correct: 2
  },
  {
    question: "Aşağıdakilerden hangisi Ay'a insan gönderen görev serisidir?",
    options: ["Voyager", "Sputnik", "Apollo", "Hubble"],
    correct: 2
  },

  // CEVAP: 3 (D ŞIKKI) - Toplam 8 Soru
  {
    question: "NASA'nın insanları tekrar Ay'a gönderme programının adı nedir?",
    options: ["Gemini", "Apollo 18", "Horizon", "Artemis"],
    correct: 3
  },
  {
    question: "Ay'da atmosfer olmadığı için aşağıdakilerden hangisi gerçekleşmez?",
    options: ["Işık yansıması", "Yerçekimi", "Krater oluşumu", "Ses iletimi"],
    correct: 3
  },
  {
    question: "Ay'ın çekirdeği ağırlıklı olarak hangi elementten oluşur?",
    options: ["Altın", "Helyum", "Karbon", "Demir"],
    correct: 3
  },
  {
    question: "Gelgit olaylarına (Met-Cezir) neden olan temel kuvvet nedir?",
    options: ["Güneş rüzgarı", "Dünya manyetizması", "Merkezkaç", "Ay kütleçekimi"],
    correct: 3
  },
  {
    question: "Ay'ın gökyüzünde en parlak olduğu evre hangisidir?",
    options: ["Yeni Ay", "İlk Dördün", "Son Dördün", "Dolunay"],
    correct: 3
  },
  {
    question: "Dünya'dan bakıldığında Ay'ın hep aynı yüzünün görülme sebebi nedir?",
    options: ["Ay'ın dönmemesi", "Dünya'nın hızı", "Güneş ışığı", "Kütleçekim kilidi"],
    correct: 3
  },
  {
    question: "Ay tutulması sırasında Ay hangi renge bürünebilir?",
    options: ["Mavi", "Yeşil", "Sarı", "Bakır/Kızıl"],
    correct: 3
  },
  {
    question: "Ay'a toplamda kaç insan ayak basmıştır?",
    options: ["1", "6", "24", "12"],
    correct: 3
  }
];